import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const registerUser = (data) => {
  return api.post("/api/users/v1/register", data);
};

export const loginUser = (data) => {
    return api.post("/api/users/v1/login", data);
  };

export const getTasks = (page, size) => {
  return api.get("/api/task/v1",  {
    params: { page, size }
  });
};