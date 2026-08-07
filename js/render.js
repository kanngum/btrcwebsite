/* ================================================
   BTRC - Shared Data Fetching & Rendering Helpers
   Attempts to load from the BTRC API. If the API is
   unavailable (static hosting), falls back to
   bundled data in js/data.js.
   ================================================ */
window.BTRCStore = (function() {
  const API_BASE = '/api';

  // Detect if running under the Node server (api available)
  async function apiAvailable() {
    try {
      const res = await fetch(API_BASE + '/health', { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async function getCollection(name) {
    if (await apiAvailable()) {
      try {
        const res = await fetch(API_BASE + '/' + name);
        if (res.ok) return await res.json();
      } catch (e) { /* fallback */ }
    }
    // Fallback: prefer admin-edited data from localStorage (same key admin panel uses),
    // otherwise use bundled data in js/data.js.
    try {
      const stored = localStorage.getItem('btrc_admin_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed[name]) && parsed[name].length > 0) {
          return parsed[name];
        }
      }
    } catch (e) { /* ignore corrupt storage */ }
    const data = window.BTRC_DATA || {};
    return data[name] || [];
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function imageTag(src, alt) {
    if (!src) {
      return '<span>' + (alt || 'Image') + '</span>';
    }
    return '<img src="' + src + '" alt="' + (alt || '') + '" loading="lazy">';
  }

  return {
    apiAvailable,
    getCollection,
    formatDate,
    imageTag
  };
})();
