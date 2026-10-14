const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok && !data.attempt) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.details = data.details;
    throw error;
  }
  return data;
}
export const api = {
  problems: () => request('/problems'),
  problem: id => request(`/problems/${id}`),
  attempts: () => request('/attempts'),
  attempt: id => request(`/attempts/${id}`),
  submit: payload => request('/attempts', { method: 'POST', body: JSON.stringify(payload) }),
  retry: (id, mode) => request(`/attempts/${id}/retry`, { method: 'POST', body: JSON.stringify({ mode }) })
};
