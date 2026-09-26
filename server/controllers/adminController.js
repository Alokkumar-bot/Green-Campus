import { query } from '../database/db.js';

export async function getAdminReports(req, res) {
  try {
    const { category, status, location, severity, search, page = 1, limit = 20 } = req.query;

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

    if (severity && severity !== 'All') {
      conditions.push('r.severity = ?');
      params.push(severity);
    }

    if (search && search.trim()) {
      conditions.push('(r.report_code LIKE ? OR r.description LIKE ? OR r.location LIKE ? OR u.name LIKE ? OR u.email LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await query.get(`
      SELECT COUNT(*) as total
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
    `, params);

    const total = countRow ? countRow.total : 0;

    const reports = await query.all(`
      SELECT 
        r.*,
        u.name as reporter_name,
        u.email as reporter_email,
        u.department as reporter_department,
        (SELECT COUNT(*) FROM report_updates ru WHERE ru.report_id = r.id) as updates_count
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY 
        CASE r.severity 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
        END ASC,
        r.created_at DESC
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
    console.error('Error in admin getReports:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin reports list.' });
  }
}

export async function getAdminReportDetails(req, res) {
  try {
    const { id } = req.params;

    const report = await query.get(`
      SELECT 
        r.*,
        u.name as reporter_name,
        u.email as reporter_email,
        u.department as reporter_department
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ? OR r.report_code = ?
    `, [id, id]);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

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
    console.error('Error fetching admin report details:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch report details.' });
  }
}

export async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note, assignedTo } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const existingReport = await query.get('SELECT * FROM reports WHERE id = ? OR report_code = ?', [id, id]);
    if (!existingReport) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const reportId = existingReport.id;
    const updatedBy = req.user ? `${req.user.name} (${req.user.role === 'admin' ? 'Admin' : 'Staff'})` : 'Admin Staff';
    const resolutionNote = note && note.trim() ? note.trim() : `Status updated to ${status}.`;

    // Update report
    await query.run(`
      UPDATE reports
      SET 
        status = ?,
        assigned_to = COALESCE(?, assigned_to),
        updated_at = datetime('now')
      WHERE id = ?
    `, [status, assignedTo ? assignedTo.trim() : null, reportId]);

    // Insert timeline update record
    await query.run(`
      INSERT INTO report_updates (report_id, status, note, updated_by, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [reportId, status, resolutionNote, updatedBy]);

    const updatedReport = await query.get('SELECT * FROM reports WHERE id = ?', [reportId]);
    const updates = await query.all('SELECT * FROM report_updates WHERE report_id = ? ORDER BY created_at ASC', [reportId]);

    return res.json({
      success: true,
      message: `Report ${updatedReport.report_code} updated to ${status}.`,
      report: {
        ...updatedReport,
        updates
      }
    });
  } catch (err) {
    console.error('Error updating report status:', err);
    return res.status(500).json({ success: false, message: 'Failed to update report status.' });
  }
}

export async function deleteReport(req, res) {
  try {
    const { id } = req.params;

    const report = await query.get('SELECT id, report_code FROM reports WHERE id = ? OR report_code = ?', [id, id]);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    await query.run('DELETE FROM report_updates WHERE report_id = ?', [report.id]);
    await query.run('DELETE FROM reports WHERE id = ?', [report.id]);

    return res.json({
      success: true,
      message: `Report ${report.report_code} has been successfully deleted.`
    });
  } catch (err) {
    console.error('Error deleting report:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete report.' });
  }
}
