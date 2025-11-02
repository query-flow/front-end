import axios from "axios";

const api = axios.create({
  baseURL: "", // agora usando proxy!
});

export default api;
