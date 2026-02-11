import { useState, useEffect } from 'react';
import { 
  getTasksForAssignee,
  getTasksForCreator,
  getStatuses, 
  getPriorities, 
  updateTaskStatus, 
  updateTaskPriority 
} from '../api/userApi';
import CreateTaskModal from '../components/CreateTaskModel';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  const { theme, currentTheme, changeTheme, themes } = useTheme();
  const [user, setUser] = useState({ username: 'User', email: 'no-email', id: null });
  const [assigneeTasks, setAssigneeTasks] = useState([]);
  const [creatorTasks, setCreatorTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [cancelledTasks, setCancelledTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('assignee');
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (storedUser) {
      setUser(storedUser);
      
      if (storedUser.id) {
        fetchAssigneeTasks(storedUser.id);
        fetchCreatorTasks(storedUser.id);
        fetchCompletedTasks(storedUser.id);
        fetchCancelledTasks(storedUser.id);
      }
    }
    
    fetchStatuses();
    fetchPriorities();
  }, []);
  
  const fetchAssigneeTasks = async (userId) => {
    try {
      const response = await getTasksForAssignee(userId, 0, 10);
      setAssigneeTasks(response.data.content || []);
    } catch (error) {
      console.error("❌ Assignee error:", error);
      setAssigneeTasks([]);
    }
  };
  
  const fetchCreatorTasks = async (userId) => {
    try {
      const response = await getTasksForCreator(userId, 0, 10);
      setCreatorTasks(response.data.content || []);
    } catch (error) {
      console.error("❌ Creator error:", error);
      setCreatorTasks([]);
    }
  };

  const fetchCompletedTasks = async (userId) => {
    try {
      // Получаем все задачи пользователя
      const assigneeResponse = await getTasksForAssignee(userId, 0, 100);
      const creatorResponse = await getTasksForCreator(userId, 0, 100);
      
      const allTasks = [
        ...(assigneeResponse.data.content || []),
        ...(creatorResponse.data.content || [])
      ];
      
      // Фильтруем только выполненные задачи (DONE)
      const completed = allTasks.filter(task => task.status === 'DONE');
      
      // Убираем дубликаты по ID
      const uniqueCompleted = Array.from(
        new Map(completed.map(task => [task.id, task])).values()
      );
      
      setCompletedTasks(uniqueCompleted);
    } catch (error) {
      console.error("❌ Completed tasks error:", error);
      setCompletedTasks([]);
    }
  };

  const fetchCancelledTasks = async (userId) => {
    try {
      // Получаем все задачи пользователя
      const assigneeResponse = await getTasksForAssignee(userId, 0, 100);
      const creatorResponse = await getTasksForCreator(userId, 0, 100);
      
      const allTasks = [
        ...(assigneeResponse.data.content || []),
        ...(creatorResponse.data.content || [])
      ];
      
      // Фильтруем только отмененные задачи (CANCELLED)
      const cancelled = allTasks.filter(task => task.status === 'CANCELLED');
      
      // Убираем дубликаты по ID
      const uniqueCancelled = Array.from(
        new Map(cancelled.map(task => [task.id, task])).values()
      );
      
      setCancelledTasks(uniqueCancelled);
    } catch (error) {
      console.error("❌ Cancelled tasks error:", error);
      setCancelledTasks([]);
    }
  };

  const handleTaskCreated = () => {
    if (user.id) {
      fetchAssigneeTasks(user.id);
      fetchCreatorTasks(user.id);
      fetchCompletedTasks(user.id);
      fetchCancelledTasks(user.id);
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
        setPriorities(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
      }
    } catch (error) {
      console.error("Failed to fetch priorities", error);
      setPriorities(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
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
      setCompletedTasks(completedTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      setCancelledTasks(cancelledTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      // Refresh completed and cancelled tasks if status changed
      if (newStatus === 'DONE' || newStatus === 'CANCELLED' || 
          completedTasks.some(t => t.id === taskId) ||
          cancelledTasks.some(t => t.id === taskId)) {
        if (user.id) {
          fetchCompletedTasks(user.id);
          fetchCancelledTasks(user.id);
        }
      }
      
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
      setCompletedTasks(completedTasks.map(task => 
        task.id === taskId ? { ...task, priority: newPriority } : task
      ));
      setCancelledTasks(cancelledTasks.map(task => 
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

  const getPriorityHeaderColor = (priority) => {
    const colors = {
      'CRITICAL': 'bg-purple-600',
      'HIGH': 'bg-red-500',
      'MEDIUM': 'bg-yellow-500',
      'LOW': 'bg-cyan-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'CRITICAL': '🟣',
      'HIGH': '🔴',
      'MEDIUM': '🟡',
      'LOW': '🔵'
    };
    return icons[priority] || '⚪';
  };

  const activeTasks = activeTab === 'assignee' ? assigneeTasks : 
                      activeTab === 'creator' ? creatorTasks : 
                      activeTab === 'completed' ? completedTasks : 
                      cancelledTasks;

  const getTasksByPriority = (priority) => {
    return activeTasks.filter(task => task.priority === priority);
  };

  const getActivePriorities = () => {
    return priorities.filter(priority => getTasksByPriority(priority).length > 0);
  };

  const TaskCard = ({ task }) => (
    <div className={`${theme.isDark ? theme.cardBg : 'bg-white'} border ${theme.isDark ? theme.borderColor : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className={`text-sm font-semibold ${theme.isDark ? theme.textPrimary : 'text-gray-900'} flex-1`}>
          {task.title}
        </h4>
        {task.status && (
          editingTaskId === task.id && editingField === 'status' ? (
            <select
              className={`text-xs px-2 py-1 rounded-full border focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 ${theme.isDark ? 'bg-gray-700 text-white' : ''}`}
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
              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)} cursor-pointer hover:opacity-80 transition`}
            >
              {task.status.replace('_', ' ')}
            </button>
          )
        )}
      </div>
      
      {task.description && (
        <p className={`text-xs ${theme.isDark ? theme.textSecondary : 'text-gray-600'} mb-3 line-clamp-2`}>
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs items-center mb-3">
        {task.priority && (
          editingTaskId === task.id && editingField === 'priority' ? (
            <select
              className={`text-sm px-2 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 ${theme.isDark ? 'bg-gray-700 text-white' : ''}`}
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
              className="text-base hover:scale-110 transition cursor-pointer"
              title={`Priority: ${task.priority}`}
            >
              {getPriorityIcon(task.priority)}
            </button>
          )
        )}
        
        {task.dueDate && (
          <span className={`${theme.isDark ? theme.textSecondary : 'text-gray-500'} flex items-center gap-1`}>
            <span>📅</span>
            {new Date(task.dueDate).toLocaleDateString('ru-RU', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        )}
        {task.project && (
          <span className={`${theme.isDark ? theme.textSecondary : 'text-gray-500'} flex items-center gap-1`}>
            <span>🏷️</span>
            {task.project}
          </span>
        )}
      </div>

      {/* Quick Action Buttons */}
      {task.status !== 'DONE' && task.status !== 'CANCELLED' && (
        <div className="flex gap-2 pt-2 border-t ${theme.isDark ? theme.borderColor : 'border-gray-200'}">
          <button
            onClick={() => handleStatusChange(task.id, 'DONE')}
            className="flex-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded text-xs font-medium transition flex items-center justify-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Done
          </button>
          <button
            onClick={() => handleStatusChange(task.id, 'CANCELLED')}
            className="flex-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium transition flex items-center justify-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const BoardView = () => {
    const activePriorities = getActivePriorities();
    
    if (activePriorities.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className={`${theme.isDark ? theme.textSecondary : 'text-gray-500'} text-lg`}>No tasks yet</p>
        </div>
      );
    }

    return (
      <div className={`grid grid-cols-1 ${activePriorities.length === 1 ? 'md:grid-cols-1' : activePriorities.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        {activePriorities.map(priority => {
          const tasksInColumn = getTasksByPriority(priority);
          return (
            <div key={priority} className="flex flex-col">
              <div className={`${getPriorityHeaderColor(priority)} text-white px-4 py-3 rounded-t-xl flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getPriorityIcon(priority)}</span>
                  <h3 className="font-semibold text-sm">{priority}</h3>
                </div>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {tasksInColumn.length}
                </span>
              </div>
              <div className={`${theme.isDark ? 'bg-gray-900' : 'bg-gray-50'} rounded-b-xl p-3 flex-1 min-h-[500px] space-y-3`}>
                {tasksInColumn.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const TaskList = ({ tasks }) => {
    if (tasks.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className={`${theme.isDark ? theme.textSecondary : 'text-gray-500'} text-lg`}>No tasks yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id || index}
            className={`group border ${theme.isDark ? `${theme.cardBg} ${theme.borderColor}` : 'border-gray-200'} rounded-xl p-6 hover:shadow-lg hover:border-${theme.accent}-300 transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {task.priority && (
                    editingTaskId === task.id && editingField === 'priority' ? (
                      <select
                        className={`text-lg px-2 py-1 rounded border border-${theme.accent}-300 focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 ${theme.isDark ? 'bg-gray-700 text-white' : ''}`}
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
                      >
                        {getPriorityIcon(task.priority)}
                      </button>
                    )
                  )}
                  
                  <h4 className={`text-xl font-semibold ${theme.isDark ? theme.textPrimary : 'text-gray-900'} group-hover:text-${theme.accent}-600 transition`}>
                    {task.title}
                  </h4>
                </div>
                
                <p className={`${theme.isDark ? theme.textSecondary : 'text-gray-600'} mb-4 leading-relaxed`}>
                  {task.description}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {task.status && (
                    editingTaskId === task.id && editingField === 'status' ? (
                      <select
                        className={`px-3 py-1 rounded-full text-sm font-medium border border-${theme.accent}-300 focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 ${theme.isDark ? 'bg-gray-700 text-white' : ''}`}
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
                      >
                        {task.status.replace('_', ' ')}
                      </button>
                    )
                  )}
                  
                  {task.dueDate && (
                    <span className={`text-sm ${theme.isDark ? theme.textSecondary : 'text-gray-500'} flex items-center gap-1`}>
                      <span>📅</span>
                      {new Date(task.dueDate).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  )}

                  {task.project && (
                    <span className={`text-sm ${theme.isDark ? theme.textSecondary : 'text-gray-500'} flex items-center gap-1`}>
                      <span>🏷️</span>
                      {task.project}
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
    <div className={`h-screen bg-gradient-to-br ${theme.gradient} flex overflow-hidden`}>
      {/* Левое боковое меню */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} ${theme.sidebarBg} shadow-xl transition-all duration-300 h-full z-40 overflow-y-auto flex-shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Хедер сайдбара */}
          <div className={`p-4 border-b ${theme.isDark ? theme.borderColor : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${theme.primary} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className={`text-lg font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    TaskHub
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 ${theme.isDark ? theme.hoverBg : 'hover:bg-gray-100'} rounded-lg transition`}
              >
                <svg className={`w-5 h-5 ${theme.isDark ? 'text-gray-400' : 'text-gray-600'} transition-transform ${!isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Навигация */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('assignee')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'assignee' 
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg` 
                  : `${theme.isDark ? `${theme.textSecondary} ${theme.hoverBg}` : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium">My Tasks</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === 'assignee' ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {assigneeTasks.length}
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('creator')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'creator' 
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg` 
                  : `${theme.isDark ? `${theme.textSecondary} ${theme.hoverBg}` : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium">Created</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === 'creator' ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {creatorTasks.length}
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'completed' 
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg` 
                  : `${theme.isDark ? `${theme.textSecondary} ${theme.hoverBg}` : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium">Completed</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === 'completed' ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {completedTasks.length}
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cancelled')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'cancelled' 
                  ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg` 
                  : `${theme.isDark ? `${theme.textSecondary} ${theme.hoverBg}` : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isSidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium">Cancelled</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === 'cancelled' ? 'bg-white/20' : 'bg-gray-200'}`}>
                    {cancelledTasks.length}
                  </span>
                </div>
              )}
            </button>

            <div className={`pt-4 border-t ${theme.isDark ? theme.borderColor : 'border-gray-200'} mt-4`}>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${theme.secondary} text-white rounded-lg hover:shadow-lg transition`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {isSidebarOpen && <span className="font-medium">New Task</span>}
              </button>
            </div>

            {/* Переключатель тем */}
            {isSidebarOpen && (
              <div className={`pt-4 mt-4 border-t ${theme.isDark ? theme.borderColor : 'border-gray-200'}`}>
                <div className="relative">
                  <button
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${theme.isDark ? theme.hoverBg : 'hover:bg-gray-100'} rounded-lg transition`}
                  >
                    <span className="text-xl">{themes[currentTheme].icon}</span>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>Theme</p>
                      <p className={`text-xs ${theme.isDark ? theme.textSecondary : 'text-gray-500'}`}>{themes[currentTheme].name}</p>
                    </div>
                    <svg className={`w-4 h-4 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isThemeMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsThemeMenuOpen(false)} />
                      <div className={`absolute left-0 right-0 mt-2 ${theme.isDark ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-2xl border ${theme.isDark ? theme.borderColor : 'border-gray-200'} py-2 z-20 max-h-96 overflow-y-auto`}>
                        <div className={`px-4 py-2 border-b ${theme.isDark ? theme.borderColor : 'border-gray-200'}`}>
                          <p className={`text-xs font-semibold ${theme.isDark ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Select Theme</p>
                        </div>
                        {Object.entries(themes).map(([key, themeOption]) => (
                          <button
                            key={key}
                            onClick={() => {
                              changeTheme(key);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left ${theme.isDark ? theme.hoverBg : 'hover:bg-gray-50'} transition flex items-center gap-3 ${currentTheme === key ? `bg-gradient-to-r ${themeOption.primary} text-white` : ''}`}
                          >
                            <span className="text-2xl">{themeOption.icon}</span>
                            <span className={`font-medium ${currentTheme === key ? 'text-white' : theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>
                              {themeOption.name}
                            </span>
                            {currentTheme === key && (
                              <svg className="w-5 h-5 ml-auto text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {isSidebarOpen && (
              <div className={`pt-4 mt-4 border-t ${theme.isDark ? theme.borderColor : 'border-gray-200'}`}>
                <h3 className={`px-4 text-xs font-semibold ${theme.isDark ? 'text-gray-500' : 'text-gray-500'} uppercase mb-2`}>Statistics</h3>
                <div className="space-y-2">
                  <div className={`px-4 py-2 ${theme.isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={theme.isDark ? theme.textSecondary : 'text-gray-600'}>Total Tasks</span>
                      <span className={`font-bold ${theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>{assigneeTasks.length + creatorTasks.length}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 bg-${theme.accent}-50 rounded-lg`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`text-${theme.accent}-600`}>Assigned</span>
                      <span className={`font-bold text-${theme.accent}-900`}>{assigneeTasks.length}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 bg-purple-50 rounded-lg`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-600">Created</span>
                      <span className="font-bold text-purple-900">{creatorTasks.length}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 bg-green-50 rounded-lg`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">Completed</span>
                      <span className="font-bold text-green-900">{completedTasks.length}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 bg-red-50 rounded-lg`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600">Cancelled</span>
                      <span className="font-bold text-red-900">{cancelledTasks.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Основной контент */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden`}>
        <nav className={`${theme.navbarBg} backdrop-blur-md shadow-sm z-30 flex-shrink-0`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className={`text-2xl font-bold ${theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>
                {activeTab === 'assignee' ? 'My Tasks' : 
                 activeTab === 'creator' ? 'Created by Me' : 
                 activeTab === 'completed' ? 'Completed Tasks' : 
                 'Cancelled Tasks'}
              </h1>
              
              <div className="flex items-center gap-3">
                <div className={`flex ${theme.isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${viewMode === 'list' ? `${theme.isDark ? 'bg-gray-600' : 'bg-white'} text-${theme.accent}-600 shadow` : theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('board')}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${viewMode === 'board' ? `${theme.isDark ? 'bg-gray-600' : 'bg-white'} text-${theme.accent}-600 shadow` : theme.isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    Board
                  </button>
                </div>
                
                <span className={`px-4 py-2 bg-${theme.accent}-100 text-${theme.accent}-800 rounded-full font-semibold`}>
                  {activeTasks.length} {activeTasks.length === 1 ? 'Task' : 'Tasks'}
                </span>

                {/* User Profile in Navbar */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 ${theme.isDark ? theme.hoverBg : 'hover:bg-gray-100'} rounded-lg transition`}
                  >
                    <div className={`w-8 h-8 bg-gradient-to-r ${theme.primary} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className={`text-sm font-semibold ${theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>{}</p>
                    </div>
                    <svg className={`w-4 h-4 ${theme.isDark ? 'text-gray-400' : 'text-gray-500'} transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                      <div className={`absolute right-0 top-full mt-2 w-64 ${theme.isDark ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-2xl border ${theme.isDark ? theme.borderColor : 'border-gray-200'} py-2 z-50`}>
                        <div className={`px-4 py-3 border-b ${theme.isDark ? theme.borderColor : 'border-gray-200'}`}>
                          <p className={`text-sm ${theme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>Signed in as</p>
                          <p className={`text-sm font-semibold ${theme.isDark ? theme.textPrimary : 'text-gray-900'} truncate`}>{user.username}</p>
                          <p className={`text-xs ${theme.isDark ? theme.textSecondary : 'text-gray-500'} truncate`}>{user.email}</p>
                        </div>
                        <div className="py-2">
                          <button onClick={() => setIsProfileMenuOpen(false)} className={`w-full px-4 py-2 text-left text-sm ${theme.isDark ? `${theme.textPrimary} ${theme.hoverBg}` : 'text-gray-700 hover:bg-gray-100'} flex items-center gap-3`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Settings
                          </button>
                        </div>
                        <div className={`border-t ${theme.isDark ? theme.borderColor : 'border-gray-200'} my-2`}></div>
                        <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }} className={`w-full px-4 py-2 text-left text-sm text-red-600 ${theme.isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} flex items-center gap-3`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <section className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className={`${theme.isDark ? theme.cardBg : 'bg-white'} rounded-2xl shadow-xl p-8`}>
              {viewMode === 'board' ? <BoardView /> : <TaskList tasks={activeTasks} />}
            </div>
          </div>
        </section>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        userId={user.id}
      />
    </div>
  );
}
