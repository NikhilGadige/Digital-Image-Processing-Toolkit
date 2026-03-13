const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

function buildApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
}

function createFriendlyNetworkError() {
  return new Error(
    `Failed to fetch from API (${API_BASE}). Ensure backend is running and reachable ` +
      `at ${API_BASE}, and VITE_API_BASE_URL is correct.`,
  );
}

export async function checkApiHealth() {
  try {
    const response = await fetch(buildApiUrl('/api/health'));
    if (!response.ok) return false;
    const payload = await response.json();
    return payload.status === 'ok';
  } catch {
    return false;
  }
}

export async function processWithApi(endpoint, file, params = {}) {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  let response;
  try {
    response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw createFriendlyNetworkError();
  }

  if (!response.ok) {
    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch {
      bodyText = '';
    }
    throw new Error(`API request failed (${response.status}). ${bodyText || 'Check backend logs.'}`);
  }

  return response.json();
}
