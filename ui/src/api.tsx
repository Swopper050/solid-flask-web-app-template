import axios from "axios";

const api = axios.create({baseURL: "/api", withCredentials: true});
api.defaults.headers.post["Content-Type"] = "application/json"

export default api
