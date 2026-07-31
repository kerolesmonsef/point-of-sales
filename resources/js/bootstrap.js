import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ponytail: __() resolves from backend-shared translations (hydrated in app.jsx); falls back to the key itself
window.__translations = window.__translations || {};
window.__ = (key) => window.__translations?.[key] ?? key;
