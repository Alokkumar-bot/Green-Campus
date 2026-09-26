const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Green Campus End-to-End System Tests ---');

  // 1. Health check
  console.log('\n[1] Testing Backend Health Check...');
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('Health Response:', health.status, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Student Login
  console.log('\n[2] Testing Student Login (aarav@campus.edu)...');
  const studentLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'aarav@campus.edu', password: 'student123' });
  console.log('Student Login Response:', studentLogin.status, studentLogin.data.user?.name, 'Role:', studentLogin.data.user?.role);
  if (studentLogin.status !== 200) throw new Error('Student login failed');
  const studentToken = studentLogin.data.token;

  // 3. Admin Login
  console.log('\n[3] Testing Admin Login (admin@greencampus.edu)...');
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@greencampus.edu', password: 'admin123' });
  console.log('Admin Login Response:', adminLogin.status, adminLogin.data.user?.name, 'Role:', adminLogin.data.user?.role);
  if (adminLogin.status !== 200) throw new Error('Admin login failed');
  const adminToken = adminLogin.data.token;

  // 4. Create New Report
  console.log('\n[4] Submitting New Campus Issue Report...');
  const newReportRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    }
  }, {
    category: 'Water Leakage',
    location: 'Library',
    specificArea: '2nd Floor Drinking Water Station',
    description: 'Continuous water valve leakage dripping onto the wooden reading floor, creating slippery hazard.',
    severity: 'High',
    anonymous: false
  });
  console.log('Report Submission Response:', newReportRes.status, 'Generated Code:', newReportRes.data.reportCode);
  if (newReportRes.status !== 201) throw new Error('Report submission failed');
  const reportCode = newReportRes.data.reportCode;
  const newReportId = newReportRes.data.report.id;

  // 5. Track Newly Created Report by Code
  console.log(`\n[5] Tracking Report by Code (${reportCode})...`);
  const trackRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/track/${reportCode}`,
    method: 'GET'
  });
  console.log('Track Response Status:', trackRes.status);
  console.log('Tracked Report Category:', trackRes.data.report?.category);
  console.log('Tracked Report Location:', trackRes.data.report?.location);
  console.log('Tracked Timeline Updates Count:', trackRes.data.report?.updates?.length);
  if (trackRes.status !== 200) throw new Error('Tracking failed');

  // 6. Public Community Reports List & Filtering
  console.log('\n[6] Fetching Community Reports (filtering for Water Leakage)...');
  const commRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports?category=Water%20Leakage&limit=5',
    method: 'GET'
  });
  console.log('Community Reports Count for Water Leakage:', commRes.data.reports?.length, 'Total:', commRes.data.pagination?.total);
  if (commRes.status !== 200) throw new Error('Community reports fetch failed');

  // 7. Admin Status Update & Squad Assignment
  console.log(`\n[7] Admin updating status for report #${newReportId} to "In Progress"...`);
  const updateRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/reports/${newReportId}/status`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    status: 'In Progress',
    assignedTo: 'Campus Plumbing Squad',
    note: 'Plumbing technician dispatched with replacement ball-valve and teflon tape.'
  });
  console.log('Admin Update Response:', updateRes.status, updateRes.data.message);
  if (updateRes.status !== 200) throw new Error('Admin status update failed');

  // 8. Re-track report to verify updated timeline
  console.log('\n[8] Re-checking Timeline for updated notes and status...');
  const reTrackRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/track/${reportCode}`,
    method: 'GET'
  });
  console.log('Current Status:', reTrackRes.data.report?.status);
  console.log('Assigned Squad:', reTrackRes.data.report?.assigned_to);
  console.log('Latest Timeline Note:', reTrackRes.data.report?.updates[reTrackRes.data.report.updates.length - 1]?.note);
  if (reTrackRes.data.report?.status !== 'In Progress') throw new Error('Status was not updated to In Progress');

  // 9. Impact Statistics Live DB Verification
  console.log('\n[9] Checking Campus Sustainability Impact Statistics from DB...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/impact/summary',
    method: 'GET'
  });
  console.log('Impact Total Reports:', statsRes.data.stats?.total);
  console.log('Impact Resolved:', statsRes.data.stats?.resolved);
  console.log('Impact Resolution Rate:', statsRes.data.stats?.resolutionRate + '%');
  console.log('Impact Diverted Waste:', statsRes.data.stats?.wasteDivertedKg + ' kg');
  console.log('Impact Water Conserved:', statsRes.data.stats?.waterSavedLiters + ' L');
  if (statsRes.status !== 200) throw new Error('Impact stats failed');

  // 10. Frontend Dev Server Check (port 3000)
  console.log('\n[10] Testing Frontend HTTP response at http://localhost:3000/...');
  const frontendRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  });
  console.log('Frontend HTTP Status:', frontendRes.status);
  if (frontendRes.status !== 200) throw new Error('Frontend dev server failed');

  console.log('\n======================================================');
  console.log(' ALL 10 END-TO-END VALIDATION TESTS PASSED CLEANLY! ');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('\nTest execution failed:', err);
  process.exit(1);
});
