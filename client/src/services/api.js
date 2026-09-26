const API_BASE = '/api';

export function getStoredToken() {
  return localStorage.getItem('gc_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('gc_token', token);
  } else {
    localStorage.removeItem('gc_token');
  }
}

export function getStoredUser() {
  const user = localStorage.getItem('gc_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('gc_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('gc_user');
  }
}

export function clearAuth() {
  localStorage.removeItem('gc_token');
  localStorage.removeItem('gc_user');
}

async function request(endpoint, options = {}) {
  const headers = options.headers || {};
  const token = getStoredToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({ success: false, message: 'Server returned non-JSON response.' }));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Reports
  createReport: (formData) => request('/reports', { method: 'POST', body: formData }),
  getReports: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    return request(`/reports?${query.toString()}`, { method: 'GET' });
  },
  getReportByCode: (code) => request(`/reports/track/${encodeURIComponent(code)}`, { method: 'GET' }),
  getMyReports: () => request('/reports/my/list', { method: 'GET' }),
  getLocations: () => request('/reports/locations', { method: 'GET' }),

  // Stats
  getStats: () => request('/impact/summary', { method: 'GET' }),

  // Admin
  getAdminReports: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, val);
    });
    return request(`/admin/reports?${query.toString()}`, { method: 'GET' });
  },
  getAdminReportDetails: (id) => request(`/admin/reports/${id}`, { method: 'GET' }),
  updateReportStatus: (id, payload) => request(`/admin/reports/${id}/status`, { method: 'PATCH', body: payload }),
  deleteReport: (id) => request(`/admin/reports/${id}`, { method: 'DELETE' })
};

export default api;
