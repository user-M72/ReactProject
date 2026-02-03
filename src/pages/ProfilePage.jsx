import { useState, useEffect } from 'react';
import { 
  getTasksForAssignee,
  getTasksForCreator,
  getStatuses, 
  getPriorities, 
  updateTaskStatus, 
  updateTaskPriority 
} from '../api/userApi';
import CreateTaskModal from '../components/CreateTaskModel'; // ✅ Добавьте импорт

export default function ProfilePage() {
  const [user, setUser] = useState({ username: 'User', email: 'no-email', id: null });
  const [assigneeTasks, setAssigneeTasks] = useState([]);
  const [creatorTasks, setCreatorTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('assignee');
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // ✅ Добавлено

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log("1️⃣ USER FROM LOCALSTORAGE:", storedUser);
    
    if (storedUser) {
      setUser(storedUser);
      
      if (storedUser.id) {
        console.log("2️⃣ USER HAS ID:", storedUser.id);
        fetchAssigneeTasks(storedUser.id);
        fetchCreatorTasks(storedUser.id);
      } else {
        console.error("❌ USER ID IS MISSING!");
      }
    } else {
      console.error("❌ NO USER IN LOCALSTORAGE!");
    }
    
    fetchStatuses();
    fetchPriorities();
  }, []);
  
  const fetchAssigneeTasks = async (userId) => {
    try {
      console.log("3️⃣ Fetching assignee tasks for:", userId);
      const response = await getTasksForAssignee(userId, 0, 10);
      console.log("4️⃣ Assignee response:", response.data);
      setAssigneeTasks(response.data.content || []);
    } catch (error) {
      console.error("❌ Assignee error:", error);
      setAssigneeTasks([]);
    }
  };
  
  const fetchCreatorTasks = async (userId) => {
    try {
      console.log("5️⃣ Fetching creator tasks for:", userId);
      const response = await getTasksForCreator(userId, 0, 10);
      console.log("6️⃣ Creator response:", response.data);
      setCreatorTasks(response.data.content || []);
    } catch (error) {
      console.error("❌ Creator error:", error);
      setCreatorTasks([]);
    }
  };

  // ✅ ДОБАВЛЕНО: Обновление после создания задачи
  const handleTaskCreated = () => {
    if (user.id) {
      fetchAssigneeTasks(user.id);
      fetchCreatorTasks(user.id);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getStatuses();
      
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
      
      setAssigneeTasks(assigneeTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      setCreatorTasks(creatorTasks.map(task => 
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
      
      setAssigneeTasks(assigneeTasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      ));
      setCreatorTasks(creatorTasks.map(task => 
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

  const activeTasks = activeTab === 'assignee' ? assigneeTasks : creatorTasks;

  const TaskList = ({ tasks }) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg">No tasks yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id || index}
            className="group border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
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
    );
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

        {/* Tasks Section with Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ✅ ОБНОВЛЕНО: Добавлена кнопка создания */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('assignee')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'assignee'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Assigned to Me ({assigneeTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('creator')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'creator'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Created by Me ({creatorTasks.length})
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                {activeTasks.length} {activeTasks.length === 1 ? 'Task' : 'Tasks'}
              </span>
              {/* ✅ ДОБАВЛЕНА кнопка создания задачи */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                New Task
              </button>
            </div>
          </div>

          <TaskList tasks={activeTasks} />
        </div>
      </section>

      {/* ✅ ДОБАВЛЕНО: Модальное окно создания задачи */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        userId={user.id}
      />
    </div>
  );
}