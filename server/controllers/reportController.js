import { query } from '../database/db.js';

// Helper to generate next unique report code e.g. GC-2026-00483
async function generateReportCode() {
  const currentYear = new Date().getFullYear();
  const rows = await query.all(
    "SELECT report_code FROM reports WHERE report_code LIKE ?",
    [`GC-${currentYear}-%`]
  );

  let maxNum = 482;
  for (const r of rows) {
    if (r.report_code) {
      const parts = r.report_code.split('-');
      if (parts.length === 3) {
        const val = parseInt(parts[2], 10);
        if (!isNaN(val) && val > maxNum) {
          maxNum = val;
        }
      }
    }
  }

  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(5, '0');
  return `GC-${currentYear}-${paddedNum}`;
}

export async function createReport(req, res) {
  try {
    const { category, location, specificArea, description, severity, anonymous } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Please select an issue category.' });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a campus location.' });
    }

    if (!description || !description.trim() || description.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a clear description of the issue (at least 10 characters).' });
    }

    const validSeverities = ['Low', 'Medium', 'High'];
    const chosenSeverity = validSeverities.includes(severity) ? severity : 'Medium';
    const isAnonymous = anonymous === 'true' || anonymous === true || anonymous === 1 ? 1 : 0;
    const userId = req.user ? req.user.id : null;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const reportCode = await generateReportCode();

    const insertResult = await query.run(`
      INSERT INTO reports (
        report_code, user_id, category, location, specific_area,
        description, severity, image_url, status, anonymous,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, datetime('now'), datetime('now'))
    `, [
      reportCode,
      userId,
      category.trim(),
      location.trim(),
      specificArea ? specificArea.trim() : null,
      description.trim(),
      chosenSeverity,
      imageUrl,
      isAnonymous
    ]);

    const reportId = insertResult.lastID;

    // Create initial timeline event
    await query.run(`
      INSERT INTO report_updates (report_id, status, note, updated_by, created_at)
      VALUES (?, 'Pending', 'Report submitted successfully into Green Campus system.', 'System', datetime('now'))
    `, [reportId]);

    const newReport = await query.get('SELECT * FROM reports WHERE id = ?', [reportId]);

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for helping us maintain a greener campus.',
      reportCode,
      report: newReport
    });
  } catch (err) {
    console.error('Error creating report:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong while submitting the report. Please try again.' });
  }
}

export async function getReports(req, res) {
  try {
    const { category, status, location, search, page = 1, limit = 12 } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (category && category !== 'All') {
      conditions.push('r.category = ?');
      params.push(category);
    }

    if (status && status !== 'All') {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (location && location !== 'All') {
      conditions.push('r.location = ?');
      params.push(location);
    }

    if (search && search.trim()) {
      conditions.push('(r.report_code LIKE ? OR r.description LIKE ? OR r.location LIKE ? OR r.specific_area LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countRow = await query.get(`
      SELECT COUNT(*) as total
      FROM reports r
      ${whereClause}
    `, params);

    const total = countRow ? countRow.total : 0;

    // Data query with masked student name if anonymous
    const reports = await query.all(`
      SELECT 
        r.id,
        r.report_code,
        r.category,
        r.location,
        r.specific_area,
        r.description,
        r.severity,
        r.image_url,
        r.status,
        r.assigned_to,
        r.anonymous,
        r.created_at,
        r.updated_at,
        CASE 
          WHEN r.anonymous = 1 THEN 'Anonymous Student'
          WHEN u.name IS NOT NULL THEN u.name
          ELSE 'Campus Community Member'
        END as reporter_name,
        CASE
          WHEN r.anonymous = 1 THEN 'Hidden'
          WHEN u.department IS NOT NULL THEN u.department
          ELSE 'Student'
        END as reporter_department
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit, 10), offset]);

    return res.json({
      success: true,
      reports,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
}

export async function getReportByCode(req, res) {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Report code is required.' });
    }

    const report = await query.get(`
      SELECT 
        r.*,
        CASE 
          WHEN r.anonymous = 1 THEN 'Anonymous Student'
          WHEN u.name IS NOT NULL THEN u.name
          ELSE 'Campus Community Member'
        END as reporter_name,
        CASE 
          WHEN r.anonymous = 1 THEN 'Hidden'
          WHEN u.department IS NOT NULL THEN u.department
          ELSE 'General'
        END as reporter_department
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE UPPER(r.report_code) = UPPER(?)
    `, [code.trim()]);

    if (!report) {
      return res.status(404).json({ success: false, message: `Report with ID "${code}" was not found. Please verify the code and try again.` });
    }

    // Fetch timeline updates
    const updates = await query.all(`
      SELECT id, status, note, updated_by, created_at
      FROM report_updates
      WHERE report_id = ?
      ORDER BY created_at ASC
    `, [report.id]);

    return res.json({
      success: true,
      report: {
        ...report,
        updates
      }
    });
  } catch (err) {
    console.error('Error fetching report by code:', err);
    return res.status(500).json({ success: false, message: 'Failed to load report tracking information.' });
  }
}

export async function getMyReports(req, res) {
  try {
    const userId = req.user.id;

    const reports = await query.all(`
      SELECT 
        r.*,
        (SELECT COUNT(*) FROM report_updates ru WHERE ru.report_id = r.id) as updates_count,
        (SELECT note FROM report_updates ru WHERE ru.report_id = r.id ORDER BY ru.created_at DESC LIMIT 1) as latest_note
      FROM reports r
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    return res.json({
      success: true,
      reports
    });
  } catch (err) {
    console.error('Error fetching user reports:', err);
    return res.status(500).json({ success: false, message: 'Failed to load your reports.' });
  }
}

export async function getLocations(req, res) {
  try {
    const locations = await query.all('SELECT id, name, zone FROM locations ORDER BY name ASC');
    return res.json({
      success: true,
      locations
    });
  } catch (err) {
    console.error('Error fetching locations:', err);
    return res.status(500).json({ success: false, message: 'Failed to load campus locations.' });
  }
}
