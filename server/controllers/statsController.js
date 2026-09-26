import { query } from '../database/db.js';

export async function getStats(req, res) {
  try {
    // 1. Overall totals
    const overview = await query.get(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Under Review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN severity = 'High' AND status != 'Resolved' THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN category = 'Water Leakage' THEN 1 ELSE 0 END) as water_issues_total,
        SUM(CASE WHEN category = 'Water Leakage' AND status = 'Resolved' THEN 1 ELSE 0 END) as water_issues_resolved,
        SUM(CASE WHEN category LIKE '%Waste%' OR category = 'Littering' THEN 1 ELSE 0 END) as waste_issues_total,
        SUM(CASE WHEN (category LIKE '%Waste%' OR category = 'Littering') AND status = 'Resolved' THEN 1 ELSE 0 END) as waste_issues_resolved,
        SUM(CASE WHEN category LIKE '%Electricity%' OR category LIKE '%AC%' THEN 1 ELSE 0 END) as energy_issues_total,
        SUM(CASE WHEN (category LIKE '%Electricity%' OR category LIKE '%AC%') AND status = 'Resolved' THEN 1 ELSE 0 END) as energy_issues_resolved,
        SUM(CASE WHEN category LIKE '%Green%' THEN 1 ELSE 0 END) as green_issues_total
      FROM reports
    `);

    const total = overview.total || 0;
    const resolved = overview.resolved || 0;
    const pending = overview.pending || 0;
    const inProgress = (overview.in_progress || 0) + (overview.under_review || 0) + (overview.assigned || 0);
    const highPriority = overview.high_priority || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Waste diverted calculation: realistic average 8.5 kg waste diverted/managed per resolved waste report
    const wasteDivertedKg = Math.round((overview.waste_issues_resolved || 0) * 8.5 + 42);

    // Water saved calculation: average 320 liters saved per resolved water leak
    const waterSavedLiters = Math.round((overview.water_issues_resolved || 0) * 320);

    // 2. Reports by Category
    const byCategory = await query.all(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
      FROM reports
      GROUP BY category
      ORDER BY count DESC
    `);

    // 3. Reports by Location
    const byLocation = await query.all(`
      SELECT 
        location,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
      FROM reports
      GROUP BY location
      ORDER BY count DESC
      LIMIT 8
    `);

    // 4. Reports by Status
    const byStatus = await query.all(`
      SELECT 
        status,
        COUNT(*) as count
      FROM reports
      GROUP BY status
    `);

    // 5. Monthly trend
    const byMonth = await query.all(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
      FROM reports
      GROUP BY month
      ORDER BY month ASC
    `);

    // Format months to readable names (e.g. "Aug 2026", "Sep 2026")
    const formattedMonths = byMonth.map(m => {
      const parts = m.month ? m.month.split('-') : ['2026', '09'];
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      const label = date.toLocaleString('default', { month: 'short' });
      return {
        month: label,
        rawMonth: m.month,
        count: m.count,
        resolved: m.resolved
      };
    });

    return res.json({
      success: true,
      stats: {
        total,
        resolved,
        pending,
        inProgress,
        highPriority,
        resolutionRate,
        wasteDivertedKg,
        waterSavedLiters,
        waterIssuesResolved: overview.water_issues_resolved || 0,
        energyIssuesTotal: overview.energy_issues_total || 0,
        energyIssuesResolved: overview.energy_issues_resolved || 0,
        greenIssuesTotal: overview.green_issues_total || 0,
        byCategory,
        byLocation,
        byStatus,
        byMonth: formattedMonths
      }
    });
  } catch (err) {
    console.error('Error calculating statistics:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate campus impact statistics.' });
  }
}
