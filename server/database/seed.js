import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { initDatabase } from './init.js';

export async function seedDatabase() {
  await initDatabase();

  console.log('Seeding Green Campus database with realistic data...');

  // Check if data already exists
  const existingUsers = await query.get('SELECT COUNT(*) as count FROM users');
  if (existingUsers && existingUsers.count > 0) {
    console.log(`Database already has ${existingUsers.count} users. Clearing existing data to reseed fresh demo dataset...`);
    await query.exec(`
      DELETE FROM report_updates;
      DELETE FROM reports;
      DELETE FROM users;
      DELETE FROM locations;
    `);
  }

  // 1. Seed Locations
  const locations = [
    { name: 'Main Gate', zone: 'Zone A - Entrance' },
    { name: 'Academic Block', zone: 'Zone B - Academic' },
    { name: 'Library', zone: 'Zone B - Central' },
    { name: 'Canteen', zone: 'Zone C - Amenities' },
    { name: 'Hostel Block A', zone: 'Zone D - Residential' },
    { name: 'Hostel Block B', zone: 'Zone D - Residential' },
    { name: 'Parking Area', zone: 'Zone A - Outer' },
    { name: 'Sports Complex', zone: 'Zone E - Recreation' },
    { name: 'Auditorium', zone: 'Zone B - Central' },
    { name: 'Laboratory Block', zone: 'Zone B - Science & Tech' },
    { name: 'Administrative Block', zone: 'Zone B - Administration' },
    { name: 'Botanical Garden', zone: 'Zone E - Green Zone' }
  ];

  for (const loc of locations) {
    await query.run('INSERT INTO locations (name, zone) VALUES (?, ?)', [loc.name, loc.zone]);
  }

  // 2. Seed Users
  const studentPasswordHash = await bcrypt.hash('student123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const usersList = [
    { name: 'Green Campus Admin', email: 'admin@greencampus.edu', password: adminPasswordHash, role: 'admin', department: 'Campus Facilities & Sustainability Office' },
    { name: 'Facility Manager (Maintenance)', email: 'maintenance@greencampus.edu', password: adminPasswordHash, role: 'admin', department: 'Estate Management Division' },
    { name: 'Aarav Sharma', email: 'aarav@campus.edu', password: studentPasswordHash, role: 'student', department: 'Computer Science & Engineering' },
    { name: 'Priya Singh', email: 'priya.singh@campus.edu', password: studentPasswordHash, role: 'student', department: 'Environmental Studies' },
    { name: 'Rahul Verma', email: 'rahul.v@campus.edu', password: studentPasswordHash, role: 'student', department: 'Mechanical Engineering' },
    { name: 'Ananya Gupta', email: 'ananya.g@campus.edu', password: studentPasswordHash, role: 'student', department: 'Biotechnology' },
    { name: 'Rohan Mehra', email: 'rohan.m@campus.edu', password: studentPasswordHash, role: 'student', department: 'Electrical Engineering' },
    { name: 'Sneha Patel', email: 'sneha.p@campus.edu', password: studentPasswordHash, role: 'student', department: 'Civil Engineering' },
    { name: 'Vikram Malhotra', email: 'vikram.m@campus.edu', password: studentPasswordHash, role: 'student', department: 'Architecture & Design' },
    { name: 'Diya Krishnan', email: 'diya.k@campus.edu', password: studentPasswordHash, role: 'student', department: 'Information Technology' },
    { name: 'Aditya Joshi', email: 'aditya.j@campus.edu', password: studentPasswordHash, role: 'student', department: 'Business Administration' },
    { name: 'Tanvi Nair', email: 'tanvi.n@campus.edu', password: studentPasswordHash, role: 'student', department: 'Chemical Engineering' },
    { name: 'Kabir Sengupta', email: 'kabir.s@campus.edu', password: studentPasswordHash, role: 'student', department: 'Physics & Applied Sciences' },
    { name: 'Neha Deshmukh', email: 'neha.d@campus.edu', password: studentPasswordHash, role: 'student', department: 'Life Sciences' },
    { name: 'Arjun Das', email: 'arjun.d@campus.edu', password: studentPasswordHash, role: 'student', department: 'Robotics & Automation' },
    { name: 'Isha Reddy', email: 'isha.r@campus.edu', password: studentPasswordHash, role: 'student', department: 'Humanities & Social Sciences' }
  ];

  const userIds = [];
  for (const u of usersList) {
    const res = await query.run(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
      [u.name, u.email, u.password, u.role, u.department]
    );
    userIds.push(res.lastID);
  }

  // Realistic sample photography URLs for reports
  const sampleImages = {
    water: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    waterPipe: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    wasteBin: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    litter: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    electricity: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    aircon: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80',
    garden: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    segregation: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'
  };

  // 3. Seed Reports (34 realistic reports)
  const reportsData = [
    {
      code: 'GC-2026-00482',
      userId: userIds[2], // Aarav
      category: 'Water Leakage',
      location: 'Library',
      specificArea: 'Ground Floor Restroom - Washbasin 3',
      description: 'Continuous water drip from the main supply tap below basin #3. Water is pooling near the drainage floor tile, causing slippery conditions.',
      severity: 'Medium',
      image: sampleImages.waterPipe,
      status: 'In Progress',
      assignedTo: 'Campus Plumbing Squad',
      anonymous: 0,
      createdAt: '2026-09-26 10:15:00',
      updates: [
        { status: 'Pending', note: 'Report submitted by student.', by: 'System', at: '2026-09-26 10:15:00' },
        { status: 'Under Review', note: 'Facilities team verified report and tagged priority as Medium.', by: 'Admin Staff', at: '2026-09-26 11:00:00' },
        { status: 'Assigned', note: 'Assigned to Senior Plumber Rajesh K. (Campus Plumbing Squad).', by: 'Facility Manager', at: '2026-09-26 11:30:00' },
        { status: 'In Progress', note: 'Technician on-site with replacement washer and ball valve.', by: 'Rajesh K. (Plumbing)', at: '2026-09-26 14:00:00' }
      ]
    },
    {
      code: 'GC-2026-00481',
      userId: userIds[3], // Priya
      category: 'Waste / Overflowing Bin',
      location: 'Canteen',
      specificArea: 'East Outdoor Dining Courtyard',
      description: 'Three large biodegradable and plastic recycling bins are overflowing after lunch rush. Food packets spilling on the lawn walkway.',
      severity: 'High',
      image: sampleImages.wasteBin,
      status: 'Resolved',
      assignedTo: 'Sanitation Services',
      anonymous: 0,
      createdAt: '2026-09-25 13:45:00',
      updates: [
        { status: 'Pending', note: 'Report submitted by student.', by: 'System', at: '2026-09-25 13:45:00' },
        { status: 'Assigned', note: 'Dispatched afternoon housekeeping squad to clear and sanitize courtyard.', by: 'Facility Manager', at: '2026-09-25 14:10:00' },
        { status: 'Resolved', note: 'Bins cleared, additional 100L sorting bin placed, area washed down and disinfected.', by: 'Sanitation Lead', at: '2026-09-25 15:30:00' }
      ]
    },
    {
      code: 'GC-2026-00480',
      userId: userIds[4], // Rahul
      category: 'Electricity Wastage',
      location: 'Academic Block',
      specificArea: '3rd Floor Lecture Hall 304',
      description: 'All 12 overhead tube lights and 4 ceiling fans were left running continuously while the classroom has been empty for over 3 hours.',
      severity: 'Medium',
      image: sampleImages.electricity,
      status: 'Resolved',
      assignedTo: 'Campus Electrical Squad',
      anonymous: 0,
      createdAt: '2026-09-25 16:20:00',
      updates: [
        { status: 'Pending', note: 'Report submitted.', by: 'System', at: '2026-09-25 16:20:00' },
        { status: 'Resolved', note: 'Duty technician switched off unused units and adjusted smart motion timer in Hall 304.', by: 'Electrical Team', at: '2026-09-25 16:50:00' }
      ]
    },
    {
      code: 'GC-2026-00479',
      userId: userIds[5], // Ananya
      category: 'Green Space / Plants',
      location: 'Botanical Garden',
      specificArea: 'Medicinal Herb Section (Sector 2)',
      description: 'Broken drip irrigation hose spraying high pressure water, washing away topsoil and uprooting several newly planted Tulsi and Aloe saplings.',
      severity: 'High',
      image: sampleImages.garden,
      status: 'In Progress',
      assignedTo: 'Horticulture & Grounds',
      anonymous: 0,
      createdAt: '2026-09-25 09:10:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-25 09:10:00' },
        { status: 'Assigned', note: 'Grounds keeper instructed to isolate water valve.', by: 'Facility Manager', at: '2026-09-25 09:25:00' },
        { status: 'In Progress', note: 'Hose spliced and pressure regulator installed. Re-planting saplings currently in progress.', by: 'Head Groundskeeper', at: '2026-09-25 11:00:00' }
      ]
    },
    {
      code: 'GC-2026-00478',
      userId: userIds[6], // Rohan
      category: 'AC / Appliance Wastage',
      location: 'Laboratory Block',
      specificArea: 'CAD Lab 202',
      description: 'Two split AC units set at 16°C left running over the weekend with doors open.',
      severity: 'Medium',
      image: sampleImages.aircon,
      status: 'Resolved',
      assignedTo: 'Campus Electrical Squad',
      anonymous: 1,
      createdAt: '2026-09-24 18:00:00',
      updates: [
        { status: 'Pending', note: 'Anonymous report submitted.', by: 'System', at: '2026-09-24 18:00:00' },
        { status: 'Resolved', note: 'AC units powered down, lab in-charge reminded of energy policy, temperature default locked to 24°C.', by: 'Admin Staff', at: '2026-09-24 18:35:00' }
      ]
    },
    {
      code: 'GC-2026-00477',
      userId: userIds[7], // Sneha
      category: 'Littering',
      location: 'Hostel Block A',
      specificArea: 'Rear Courtyard & Bike Stand',
      description: 'Discarded plastic bottles, beverage cups, and snack packets scattered along the perimeter hedge.',
      severity: 'Low',
      image: sampleImages.litter,
      status: 'Resolved',
      assignedTo: 'Sanitation Services',
      anonymous: 0,
      createdAt: '2026-09-24 11:30:00',
      updates: [
        { status: 'Pending', note: 'Report received.', by: 'System', at: '2026-09-24 11:30:00' },
        { status: 'Resolved', note: 'Litter cleared and anti-littering reminder board installed near bicycle stands.', by: 'Sanitation Squad', at: '2026-09-24 14:15:00' }
      ]
    },
    {
      code: 'GC-2026-00476',
      userId: userIds[8], // Vikram
      category: 'Waste Segregation',
      location: 'Canteen',
      specificArea: 'Tray Drop Station',
      description: 'Wet food waste is being mixed with dry packaging because the wet waste bin lacks a proper signage label.',
      severity: 'Medium',
      image: sampleImages.segregation,
      status: 'Resolved',
      assignedTo: 'Campus Sustainability Office',
      anonymous: 0,
      createdAt: '2026-09-23 12:45:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-23 12:45:00' },
        { status: 'Resolved', note: 'Installed color-coded bilingual signage (Green for Wet Organic, Blue for Dry Recyclables) above tray returns.', by: 'Green Campus Staff', at: '2026-09-23 16:00:00' }
      ]
    },
    {
      code: 'GC-2026-00475',
      userId: userIds[9], // Diya
      category: 'Water Leakage',
      location: 'Hostel Block B',
      specificArea: 'Rooftop Solar Water Heater Line',
      description: 'Slow leak at the pressure relief valve of the central solar water heating tank. Water trickling down the facade.',
      severity: 'High',
      image: sampleImages.water,
      status: 'In Progress',
      assignedTo: 'Campus Plumbing Squad',
      anonymous: 0,
      createdAt: '2026-09-23 08:30:00',
      updates: [
        { status: 'Pending', note: 'Report received.', by: 'System', at: '2026-09-23 08:30:00' },
        { status: 'Assigned', note: 'Assigned to solar thermal technician team.', by: 'Facility Manager', at: '2026-09-23 09:15:00' },
        { status: 'In Progress', note: 'Valve ordered from manufacturer; temporary bypass installed to prevent water loss.', by: 'Plumbing Lead', at: '2026-09-24 10:00:00' }
      ]
    },
    {
      code: 'GC-2026-00474',
      userId: userIds[10], // Aditya
      category: 'Electricity Wastage',
      location: 'Sports Complex',
      specificArea: 'Outdoor Basketball Court Floodlights',
      description: 'Court 1 high-mast floodlights were on at 11:00 AM on a sunny day.',
      severity: 'Medium',
      image: sampleImages.electricity,
      status: 'Resolved',
      assignedTo: 'Campus Electrical Squad',
      anonymous: 0,
      createdAt: '2026-09-22 11:05:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-22 11:05:00' },
        { status: 'Resolved', note: 'Manual override switch was left engaged by maintenance; timer reset to 6:30 PM activation.', by: 'Electrician Team', at: '2026-09-22 11:45:00' }
      ]
    },
    {
      code: 'GC-2026-00473',
      userId: userIds[11], // Tanvi
      category: 'Waste / Overflowing Bin',
      location: 'Auditorium',
      specificArea: 'Foyer Entrance',
      description: 'Recycling bin overflowing with brochures and coffee cups after annual conference orientation.',
      severity: 'Medium',
      image: sampleImages.wasteBin,
      status: 'Resolved',
      assignedTo: 'Sanitation Services',
      anonymous: 0,
      createdAt: '2026-09-22 17:30:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-22 17:30:00' },
        { status: 'Resolved', note: 'Auditorium foyer cleaned and bins emptied by evening janitorial shift.', by: 'Janitor In-Charge', at: '2026-09-22 18:40:00' }
      ]
    },
    {
      code: 'GC-2026-00472',
      userId: userIds[12], // Kabir
      category: 'Green Space / Plants',
      location: 'Academic Block',
      specificArea: 'North Garden Quadrangle',
      description: 'Lawn sprinkler broken and spraying water directly onto the concrete walkway instead of grass.',
      severity: 'Low',
      image: sampleImages.garden,
      status: 'Resolved',
      assignedTo: 'Horticulture & Grounds',
      anonymous: 0,
      createdAt: '2026-09-21 09:40:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-21 09:40:00' },
        { status: 'Resolved', note: 'Sprinkler head re-aligned and nozzle angle calibrated.', by: 'Grounds Keeper', at: '2026-09-21 11:00:00' }
      ]
    },
    {
      code: 'GC-2026-00471',
      userId: userIds[13], // Neha
      category: 'Water Leakage',
      location: 'Main Gate',
      specificArea: 'Security Booth Water Cooler',
      description: 'Drinking water dispenser tray overflow drain is clogged, causing clean drinking water to spill on the pavement.',
      severity: 'Low',
      image: sampleImages.waterPipe,
      status: 'Resolved',
      assignedTo: 'Campus Plumbing Squad',
      anonymous: 0,
      createdAt: '2026-09-20 14:15:00',
      updates: [
        { status: 'Pending', note: 'Report received.', by: 'System', at: '2026-09-20 14:15:00' },
        { status: 'Resolved', note: 'Drainage pipe cleared of sediment and filter cleaned.', by: 'Maintenance', at: '2026-09-20 15:30:00' }
      ]
    },
    {
      code: 'GC-2026-00470',
      userId: userIds[14], // Arjun
      category: 'Littering',
      location: 'Parking Area',
      specificArea: 'Two-Wheeler Section B',
      description: 'Plastic packaging wrappers and cigarette butts dumped near the solar panel canopy supports.',
      severity: 'Medium',
      image: sampleImages.litter,
      status: 'Under Review',
      assignedTo: 'Estate Management Division',
      anonymous: 1,
      createdAt: '2026-09-26 15:10:00',
      updates: [
        { status: 'Pending', note: 'Report submitted anonymously.', by: 'System', at: '2026-09-26 15:10:00' },
        { status: 'Under Review', note: 'Designated for clean-up schedule and security camera review.', by: 'Admin Staff', at: '2026-09-26 16:00:00' }
      ]
    },
    {
      code: 'GC-2026-00469',
      userId: userIds[15], // Isha
      category: 'Electricity Wastage',
      location: 'Library',
      specificArea: 'Reference Section Stack 4',
      description: 'Lights flickering and buzzing loudly, left on even when stacks are closed for inventory.',
      severity: 'Low',
      image: sampleImages.electricity,
      status: 'Assigned',
      assignedTo: 'Campus Electrical Squad',
      anonymous: 0,
      createdAt: '2026-09-26 12:30:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-26 12:30:00' },
        { status: 'Under Review', note: 'Report verified.', by: 'Admin Staff', at: '2026-09-26 13:00:00' },
        { status: 'Assigned', note: 'Assigned to duty electrician for ballast and LED bulb replacement.', by: 'Facility Manager', at: '2026-09-26 14:10:00' }
      ]
    },
    {
      code: 'GC-2026-00468',
      userId: userIds[2], // Aarav
      category: 'Other',
      location: 'Administrative Block',
      specificArea: 'Records Room AC Exhaust',
      description: 'AC outdoor condenser unit rattling excessively and blowing hot exhaust directly onto an adjacent young ficus tree.',
      severity: 'Medium',
      image: sampleImages.aircon,
      status: 'Pending',
      assignedTo: null,
      anonymous: 0,
      createdAt: '2026-09-26 17:00:00',
      updates: [
        { status: 'Pending', note: 'New report submitted by student. Awaiting admin review.', by: 'System', at: '2026-09-26 17:00:00' }
      ]
    },
    {
      code: 'GC-2026-00467',
      userId: userIds[3], // Priya
      category: 'Waste Segregation',
      location: 'Hostel Block A',
      specificArea: 'Common Room Waste Area',
      description: 'Students are dumping e-waste (dead batteries, cables) into normal trash cans because there is no designated e-waste bin.',
      severity: 'High',
      image: sampleImages.segregation,
      status: 'Assigned',
      assignedTo: 'Sustainability Office',
      anonymous: 0,
      createdAt: '2026-09-26 08:45:00',
      updates: [
        { status: 'Pending', note: 'Report submitted.', by: 'System', at: '2026-09-26 08:45:00' },
        { status: 'Under Review', note: 'High priority tagged due to hazardous battery disposal.', by: 'Admin Staff', at: '2026-09-26 09:15:00' },
        { status: 'Assigned', note: 'E-waste drop box dispatched for installation in Hostel Block A.', by: 'Sustainability Lead', at: '2026-09-26 10:30:00' }
      ]
    },
    {
      code: 'GC-2026-00466',
      userId: userIds[4], // Rahul
      category: 'Water Leakage',
      location: 'Sports Complex',
      specificArea: 'Swimming Pool Pump Room',
      description: 'Minor flange leak on circulating pump #2 pipe connection. Water puddling around electrical conduit.',
      severity: 'High',
      image: sampleImages.waterPipe,
      status: 'Resolved',
      assignedTo: 'Campus Plumbing Squad',
      anonymous: 0,
      createdAt: '2026-09-18 10:00:00',
      updates: [
        { status: 'Pending', note: 'Report submitted.', by: 'System', at: '2026-09-18 10:00:00' },
        { status: 'Resolved', note: 'Gasket replaced, flange bolts torqued to spec, electrical conduit re-sealed.', by: 'Senior Technician', at: '2026-09-18 13:40:00' }
      ]
    },
    {
      code: 'GC-2026-00465',
      userId: userIds[5], // Ananya
      category: 'Green Space / Plants',
      location: 'Main Gate',
      specificArea: 'Bougainvillea Trellis along boundary wall',
      description: 'Heavy wind loosened trellis wire, branches sagging onto pedestrian footpath and thorns catching on passersby.',
      severity: 'Medium',
      image: sampleImages.garden,
      status: 'Resolved',
      assignedTo: 'Horticulture & Grounds',
      anonymous: 0,
      createdAt: '2026-09-17 14:00:00',
      updates: [
        { status: 'Pending', note: 'Report received.', by: 'System', at: '2026-09-17 14:00:00' },
        { status: 'Resolved', note: 'Trellis wire re-anchored, branches trimmed safely above 8 feet clearance.', by: 'Grounds Team', at: '2026-09-17 16:30:00' }
      ]
    },
    {
      code: 'GC-2026-00464',
      userId: userIds[6], // Rohan
      category: 'Electricity Wastage',
      location: 'Auditorium',
      specificArea: 'Stage Backstage Dressing Rooms',
      description: 'All 6 vanity mirrors and high wattage floodlights were left powered on overnight following drama club rehearsal.',
      severity: 'Medium',
      image: sampleImages.electricity,
      status: 'Resolved',
      assignedTo: 'Campus Electrical Squad',
      anonymous: 0,
      createdAt: '2026-09-16 08:30:00',
      updates: [
        { status: 'Pending', note: 'Report received.', by: 'System', at: '2026-09-16 08:30:00' },
        { status: 'Resolved', note: 'Auditorium master switch toggled. Keycard-linked power cutoff scheduled for installation.', by: 'Electrical Staff', at: '2026-09-16 09:20:00' }
      ]
    },
    {
      code: 'GC-2026-00463',
      userId: userIds[7], // Sneha
      category: 'Waste / Overflowing Bin',
      location: 'Laboratory Block',
      specificArea: 'Chemistry Dept Chemical Wash Area',
      description: 'Broken glass disposal bin is full to the brim. Need specialized collection for hazard safety.',
      severity: 'High',
      image: sampleImages.wasteBin,
      status: 'Resolved',
      assignedTo: 'Safety & Sanitation',
      anonymous: 0,
      createdAt: '2026-09-15 15:45:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-15 15:45:00' },
        { status: 'Resolved', note: 'Lab safety officer collected sharps and broken glassware container for safe incineration.', by: 'Safety Officer', at: '2026-09-15 17:00:00' }
      ]
    },
    {
      code: 'GC-2026-00462',
      userId: userIds[8], // Vikram
      category: 'Water Leakage',
      location: 'Canteen',
      specificArea: 'Dishwashing area overhead valve',
      description: 'Hot water valve leaking steady stream into floor drain. Large amount of thermal energy and water lost.',
      severity: 'High',
      image: sampleImages.waterPipe,
      status: 'Resolved',
      assignedTo: 'Campus Plumbing Squad',
      anonymous: 0,
      createdAt: '2026-09-14 11:20:00',
      updates: [
        { status: 'Pending', note: 'Report received.', by: 'System', at: '2026-09-14 11:20:00' },
        { status: 'Resolved', note: 'High temp ceramic cartridge replaced in hot water manifold.', by: 'Plumbing Team', at: '2026-09-14 13:15:00' }
      ]
    },
    {
      code: 'GC-2026-00461',
      userId: userIds[9], // Diya
      category: 'Littering',
      location: 'Sports Complex',
      specificArea: 'Spectator Bleachers (Cricket Oval)',
      description: 'Hundreds of plastic beverage pouches and food wrappers left under bleachers after inter-college sports meet.',
      severity: 'Medium',
      image: sampleImages.litter,
      status: 'Resolved',
      assignedTo: 'Sanitation Services',
      anonymous: 0,
      createdAt: '2026-09-12 16:30:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-12 16:30:00' },
        { status: 'Resolved', note: 'Special cleanliness drive organized. 45 kg of plastics segregated and diverted to recycling vendor.', by: 'Sanitation Squad', at: '2026-09-13 10:00:00' }
      ]
    },
    {
      code: 'GC-2026-00460',
      userId: userIds[10], // Aditya
      category: 'Electricity Wastage',
      location: 'Hostel Block B',
      specificArea: 'Corridor Lighting - 2nd Floor',
      description: 'Daylight sensor broken; corridor tube lights remaining on 24 hours a day despite abundant window natural light.',
      severity: 'Low',
      image: sampleImages.electricity,
      status: 'Resolved',
      assignedTo: 'Campus Electrical Squad',
      anonymous: 0,
      createdAt: '2026-09-10 13:00:00',
      updates: [
        { status: 'Pending', note: 'Report received.', by: 'System', at: '2026-09-10 13:00:00' },
        { status: 'Resolved', note: 'Photocell sensor replaced with astronomical timer switch.', by: 'Electrician', at: '2026-09-11 11:30:00' }
      ]
    },
    {
      code: 'GC-2026-00459',
      userId: userIds[11], // Tanvi
      category: 'Green Space / Plants',
      location: 'Administrative Block',
      specificArea: 'Perimeter Hedge near Visitor Parking',
      description: 'Several ornamental ficus bushes damaged and trampled by vehicles overshooting curb stops.',
      severity: 'Low',
      image: sampleImages.garden,
      status: 'Resolved',
      assignedTo: 'Horticulture & Grounds',
      anonymous: 0,
      createdAt: '2026-09-08 10:15:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-08 10:15:00' },
        { status: 'Resolved', note: 'Rubber wheel stoppers installed on curb and replanted 8 new hedge bushes.', by: 'Grounds Team', at: '2026-09-09 14:00:00' }
      ]
    },
    {
      code: 'GC-2026-00458',
      userId: userIds[12], // Kabir
      category: 'Water Leakage',
      location: 'Academic Block',
      specificArea: 'Basement R.O. Water Purification Plant',
      description: 'Water leaking around the reject water discharge tube; clean brine spilling onto cellar floor.',
      severity: 'Medium',
      image: sampleImages.waterPipe,
      status: 'Resolved',
      assignedTo: 'Campus Plumbing Squad',
      anonymous: 0,
      createdAt: '2026-09-05 14:40:00',
      updates: [
        { status: 'Pending', note: 'Report received.', by: 'System', at: '2026-09-05 14:40:00' },
        { status: 'Resolved', note: 'Reject water tube routed directly to campus garden rainwater harvesting percolation pit.', by: 'Estate Plumber', at: '2026-09-06 12:00:00' }
      ]
    },
    {
      code: 'GC-2026-00457',
      userId: userIds[13], // Neha
      category: 'Waste / Overflowing Bin',
      location: 'Library',
      specificArea: 'Study Hall Entrance',
      description: 'Coffee cups and juice cartons piled on top of small bin.',
      severity: 'Low',
      image: sampleImages.wasteBin,
      status: 'Resolved',
      assignedTo: 'Sanitation Services',
      anonymous: 0,
      createdAt: '2026-09-02 11:30:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-09-02 11:30:00' },
        { status: 'Resolved', note: 'Bin emptied and twin-compartment bin installed for dry recyclables.', by: 'Housekeeping', at: '2026-09-02 12:45:00' }
      ]
    },
    {
      code: 'GC-2026-00456',
      userId: userIds[14], // Arjun
      category: 'AC / Appliance Wastage',
      location: 'Sports Complex',
      specificArea: 'Squash Court Viewing Gallery',
      description: 'Split AC left running when courts are locked during morning exams.',
      severity: 'Low',
      image: sampleImages.aircon,
      status: 'Resolved',
      assignedTo: 'Campus Electrical Squad',
      anonymous: 1,
      createdAt: '2026-08-28 09:15:00',
      updates: [
        { status: 'Pending', note: 'Anonymous report submitted.', by: 'System', at: '2026-08-28 09:15:00' },
        { status: 'Resolved', note: 'AC isolated and staff instructed to keep off outside operating hours.', by: 'Sports Admin', at: '2026-08-28 10:10:00' }
      ]
    },
    {
      code: 'GC-2026-00455',
      userId: userIds[15], // Isha
      category: 'Waste Segregation',
      location: 'Academic Block',
      specificArea: 'Faculty Lounge 1st Floor',
      description: 'Single bin used for both confidential paper and food leftovers.',
      severity: 'Low',
      image: sampleImages.segregation,
      status: 'Resolved',
      assignedTo: 'Sustainability Office',
      anonymous: 0,
      createdAt: '2026-08-22 15:00:00',
      updates: [
        { status: 'Pending', note: 'Report submitted.', by: 'System', at: '2026-08-22 15:00:00' },
        { status: 'Resolved', note: 'Separate secure paper shredding bin and compostable bin placed in faculty lounge.', by: 'Green Campus Staff', at: '2026-08-23 11:00:00' }
      ]
    },
    {
      code: 'GC-2026-00454',
      userId: userIds[2], // Aarav
      category: 'Water Leakage',
      location: 'Botanical Garden',
      specificArea: 'Main Pond Fountain Supply',
      description: 'Underground PVC coupling fractured, causing water to bubble up through the lawn grass.',
      severity: 'High',
      image: sampleImages.water,
      status: 'Resolved',
      assignedTo: 'Campus Plumbing Squad',
      anonymous: 0,
      createdAt: '2026-08-15 10:30:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-08-15 10:30:00' },
        { status: 'Resolved', note: 'Excavated section, replaced PVC elbow with high-durability brass union, restored lawn turf.', by: 'Plumbing Squad', at: '2026-08-16 16:00:00' }
      ]
    },
    {
      code: 'GC-2026-00453',
      userId: userIds[3], // Priya
      category: 'Other',
      location: 'Parking Area',
      specificArea: 'Electric Vehicle Charging Station',
      description: 'EV charger cable damaged with outer rubber insulation torn, exposing inner wire braid.',
      severity: 'High',
      image: sampleImages.electricity,
      status: 'Resolved',
      assignedTo: 'Campus Electrical Squad',
      anonymous: 0,
      createdAt: '2026-08-05 13:40:00',
      updates: [
        { status: 'Pending', note: 'Report logged.', by: 'System', at: '2026-08-05 13:40:00' },
        { status: 'Resolved', note: 'Charger cable replaced with heavy duty industrial armored cable. Tested safety cutoffs.', by: 'Electrical Engineer', at: '2026-08-06 14:00:00' }
      ]
    }
  ];

  for (const rep of reportsData) {
    const reportRes = await query.run(`
      INSERT INTO reports (
        report_code, user_id, category, location, specific_area,
        description, severity, image_url, status, assigned_to,
        anonymous, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      rep.code,
      rep.userId,
      rep.category,
      rep.location,
      rep.specificArea,
      rep.description,
      rep.severity,
      rep.image,
      rep.status,
      rep.assignedTo,
      rep.anonymous,
      rep.createdAt,
      rep.createdAt
    ]);

    const reportId = reportRes.lastID;

    // Seed updates
    if (rep.updates && rep.updates.length > 0) {
      for (const upd of rep.updates) {
        await query.run(`
          INSERT INTO report_updates (report_id, status, note, updated_by, created_at)
          VALUES (?, ?, ?, ?, ?)
        `, [
          reportId,
          upd.status,
          upd.note,
          upd.by,
          upd.at
        ]);
      }
    }
  }

  console.log(`Seeding complete! Added ${usersList.length} users and ${reportsData.length} realistic campus reports.`);
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('Seed finished successfully.');
    process.exit(0);
  }).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
