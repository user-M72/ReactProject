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

  export const getTasksForAssignee = (userId, page, size) => {
    return api.get(`/api/task/v1/assignee/${userId}`, {  // ✅ Убрана двойная "s"
      params: { page, size }
    });
  };

// ✅ НОВОЕ: Получить задачи по creator (создателю)
export const getTasksForCreator = (userId, page, size) => {
  return api.get(`/api/task/v1/creator/${userId}`, {
    params: { page, size }
  });
};

// Получить все доступные статусы
export const getStatuses = () => {
  return api.get("/api/task/v1/statuses");
};

// Получить все доступные приоритеты
export const getPriorities = () => {
  return api.get("/api/task/v1/priorityStatuses");
};

// Обновить статус задачи
export const updateTaskStatus = (taskId, status) => {
  return api.patch(`/api/task/v1/${taskId}/status`, { status });
};

// Обновить приоритет задачи
export const updateTaskPriority = (taskId, priority) => {
  return api.patch(`/api/task/v1/${taskId}/priority`, { priority });
};

// Дополнительно: полное обновление задачи (если понадобится)
export const updateTask = (taskId, data) => {
  return api.put(`/api/task/v1/${taskId}`, data);
};

// Дополнительно: удаление задачи (если понадобится)
export const deleteTask = (taskId) => {
  return api.delete(`/api/task/v1/${taskId}`);
};

// Дополнительно: создание новой задачи (если понадобится)
export const createTask = (data) => {
  return api.post("/api/task/v1", data);
};