// Central API base URL - works for both local dev and production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default API_URL;
