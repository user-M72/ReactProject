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

export default function ProfilePage() {
  const [user, setUser] = useState({ username: 'User', email: 'no-email', id: null });
  const [assigneeTasks, setAssigneeTasks] = useState([]);
  const [creatorTasks, setCreatorTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('assignee');
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (storedUser) {
      setUser(storedUser);
      
      if (storedUser.id) {
        fetchAssigneeTasks(storedUser.id);
        fetchCreatorTasks(storedUser.id);
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

  const getPriorityHeaderColor = (priority) => {
    const colors = {
      'CRITICAL': 'bg-purple-600',
      'HIGH': 'bg-red-500',
      'MEDIUM': 'bg-yellow-500',
      'LOW': 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'CRITICAL': '🟣',
      'HIGH': '🔴',
      'MEDIUM': '🟡',
      'LOW': '🟢'
    };
    return icons[priority] || '⚪';
  };

  const activeTasks = activeTab === 'assignee' ? assigneeTasks : creatorTasks;

  const getTasksByPriority = (priority) => {
    return activeTasks.filter(task => task.priority === priority);
  };

  // ✅ Получаем только приоритеты с задачами
  const getActivePriorities = () => {
    return priorities.filter(priority => getTasksByPriority(priority).length > 0);
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900 flex-1">
          {task.title}
        </h4>
        {task.status && (
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        )}
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        {task.dueDate && (
          <span className="text-gray-500 flex items-center gap-1">
            <span>📅</span>
            {new Date(task.dueDate).toLocaleDateString('ru-RU', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        )}
        {task.project && (
          <span className="text-gray-500 flex items-center gap-1">
            <span>🏷️</span>
            {task.project}
          </span>
        )}
      </div>
    </div>
  );

  // ✅ Показываем только колонки с задачами
  const BoardView = () => {
    const activePriorities = getActivePriorities();
    
    if (activePriorities.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg">No tasks yet</p>
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
              <div className="bg-gray-50 rounded-b-xl p-3 flex-1 min-h-[500px] space-y-3">
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
                      >
                        {task.status.replace('_', ' ')}
                      </button>
                    )
                  )}
                  
                  {task.dueDate && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <span>📅</span>
                      {new Date(task.dueDate).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  )}

                  {task.project && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
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
            
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden md:block text-gray-700 font-medium">{user.username}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <button onClick={() => setIsProfileMenuOpen(false)} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      <button onClick={() => { setIsProfileMenuOpen(false); setActiveTab('assignee'); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Tasks
                      </button>
                      <button onClick={() => { setIsProfileMenuOpen(false); setIsCreateModalOpen(true); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Task
                      </button>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
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
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-gray-600 text-lg">{user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('assignee')}
                className={`px-6 py-3 font-medium transition ${activeTab === 'assignee' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Assigned to Me ({assigneeTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('creator')}
                className={`px-6 py-3 font-medium transition ${activeTab === 'creator' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Created by Me ({creatorTasks.length})
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('board')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${viewMode === 'board' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}
                >
                  Board
                </button>
              </div>
              
              <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                {activeTasks.length} {activeTasks.length === 1 ? 'Task' : 'Tasks'}
              </span>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                New Task
              </button>
            </div>
          </div>

          {viewMode === 'board' ? <BoardView /> : <TaskList tasks={activeTasks} />}
        </div>
      </section>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        userId={user.id}
      />
    </div>
  );
}