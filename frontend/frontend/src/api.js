export const API_URL = 'https://amusic333-production.up.railway.app';

export const apiUrl = (path) => {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return `${API_URL}${path}`;
};
