import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:3000/api/", // Replace with your API base URL
});
// const navigate = useNavigate();

// Request interceptor
api.interceptors.request.use((config) => {
  // Modify the request config here (e.g., add headers, authentication tokens)
  // api.defaults.headers['Access-Control-Allow-Origin'] = '*';
  const userData = JSON.parse(localStorage.getItem("token"));
  // ** If token is present add it to request's Authorization Header
  if (userData?.token) {
    if (config.headers) {
      config.headers["Authorization"] = `Bearer ${userData.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);

export default api;

