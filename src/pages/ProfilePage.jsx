import { useState, useEffect } from 'react';
import { 
  getTasks, 
  getStatuses, 
  getPriorities, 
  updateTaskStatus, 
  updateTaskPriority 
} from '../api/userApi';

export default function ProfilePage() {
  const [user, setUser] = useState({ username: 'User', email: 'no-email' });
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'status' или 'priority'

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
    fetchTasks();
    fetchStatuses();
    fetchPriorities();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await getTasks(0, 10);
      setTasks(response.data.content);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getStatuses();
      console.log("Statuses response:", response.data);
      
      // Если приходит объект enum, преобразуем его в массив
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        const statusArray = Object.values(response.data);
        setStatuses(statusArray);
      } else if (Array.isArray(response.data)) {
        setStatuses(response.data);
      } else {
        setStatuses(['NEW', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']);
      }
    } catch (error) {
      console.error("Failed to fetch statuses", error);
      setStatuses(['NEW', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await getPriorities();
      console.log("Priorities response:", response.data);
      
      // Если приходит объект enum, преобразуем его в массив
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        const priorityArray = Object.values(response.data);
        setPriorities(priorityArray);
      } else if (Array.isArray(response.data)) {
        setPriorities(response.data);
      } else {
        setPriorities(['LOW', 'MEDIUM', 'HIGH']);
      }
    } catch (error) {
      console.error("Failed to fetch priorities", error);
      setPriorities(['LOW', 'MEDIUM', 'HIGH']);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      setEditingTaskId(null);
      setEditingField(null);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Не удалось обновить статус");
    }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    try {
      await updateTaskPriority(taskId, newPriority);
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      ));
      
      setEditingTaskId(null);
      setEditingField(null);
    } catch (error) {
      console.error("Failed to update priority", error);
      alert("Не удалось обновить приоритет");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'NEW': 'bg-purple-100 text-purple-800 border-purple-200',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800 border-blue-200',
      'REVIEW': 'bg-orange-100 text-orange-800 border-orange-200',
      'DONE': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'HIGH': '🔴',
      'MEDIUM': '🟡',
      'LOW': '🟢'
    };
    return icons[priority] || '⚪';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': 'bg-red-100 text-red-800 border-red-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'LOW': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskHub
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <span className="text-gray-700 font-medium">My Profile</span>
              <button
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-gray-600 text-lg">{user.email}</p>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">My Tasks</h3>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
              {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={task.id || index}
                  className="group border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Приоритет с возможностью редактирования */}
                        {task.priority && (
                          editingTaskId === task.id && editingField === 'priority' ? (
                            <select
                              className="text-lg px-2 py-1 rounded border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={task.priority}
                              onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                              onBlur={() => {
                                setEditingTaskId(null);
                                setEditingField(null);
                              }}
                              autoFocus
                            >
                              {priorities.map(priority => (
                                <option key={priority} value={priority}>
                                  {getPriorityIcon(priority)} {priority}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setEditingField('priority');
                              }}
                              className="text-xl hover:scale-110 transition cursor-pointer"
                              title="Кликните для изменения приоритета"
                            >
                              {getPriorityIcon(task.priority)}
                            </button>
                          )
                        )}
                        
                        <h4 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                          {task.title}
                        </h4>
                      </div>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Статус с возможностью редактирования */}
                        {task.status && (
                          editingTaskId === task.id && editingField === 'status' ? (
                            <select
                              className="px-3 py-1 rounded-full text-sm font-medium border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              onBlur={() => {
                                setEditingTaskId(null);
                                setEditingField(null);
                              }}
                              autoFocus
                            >
                              {statuses.map(status => (
                                <option key={status} value={status}>
                                  {status.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setEditingField('status');
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)} hover:opacity-80 transition cursor-pointer`}
                              title="Кликните для изменения статуса"
                            >
                              {task.status.replace('_', ' ')}
                            </button>
                          )
                        )}
                        
                        {task.dueDate && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <span>📅</span>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}

                        {task.category && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <span>🏷️</span>
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}