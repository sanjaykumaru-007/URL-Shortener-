export const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;
  let baseUrl = apiUrl.replace(/\/api\/?$/, '');

  // If the app is running with a localhost backend URL but the page is accessed via a LAN host,
  // preserve the page host so QR scans from another device are more likely to work.
  if (baseUrl.includes('localhost') && window.location.hostname !== 'localhost') {
    baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
  }

  return baseUrl;
};

export const buildShortUrl = (shortCode) => `${getBackendBaseUrl()}/r/${shortCode}`;

export const isLocalhostBackend = () => {
  const apiUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;
  return apiUrl.includes('localhost');
};
