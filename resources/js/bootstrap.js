import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ponytail: pass-through __() — English key is its own value until real lookup wired
window.__ = (key) => key;
