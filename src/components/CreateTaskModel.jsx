import { useState, useEffect } from 'react';
import { createTask, getStatuses, getPriorities } from '../api/userApi';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, userId }) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'NEW',
    priority: 'MEDIUM',
    dueDate: '',
    project: '',
  });

  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Assignee state
  const [assignToSelf, setAssignToSelf] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      fetchStatuses();
      fetchPriorities();
      setFormData({ title: '', description: '', status: 'NEW', priority: 'MEDIUM', dueDate: '', project: '' });
      setAssignToSelf(true);
      setSelectedAssignee(null);
      setSearchQuery('');
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Поиск пользователей с debounce 400ms
  useEffect(() => {
    if (!assignToSelf && searchQuery.trim().length >= 2) {
      const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          const response = await axios.get(`${API_BASE}/api/users/v1`);
          const filtered = (response.data || []).filter(u =>
            u.id !== userId &&
            (u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setSearchResults(filtered.slice(0, 5));
        } catch (err) {
          console.error('User search error:', err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, assignToSelf, userId]);

  const fetchStatuses = async () => {
    try {
      const response = await getStatuses();
      if (Array.isArray(response.data)) {
        setStatuses(response.data);
      } else if (response.data && typeof response.data === 'object') {
        setStatuses(Object.values(response.data));
      } else {
        setStatuses(['NEW', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']);
      }
    } catch {
      setStatuses(['NEW', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']);
    }
  };

  const fetchPriorities = async () => {
    try {
      const response = await getPriorities();
      if (Array.isArray(response.data)) {
        setPriorities(response.data);
      } else if (response.data && typeof response.data === 'object') {
        setPriorities(Object.values(response.data));
      } else {
        setPriorities(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
      }
    } catch {
      setPriorities(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Title is required'); return; }
    if (!assignToSelf && !selectedAssignee) { setError('Please select an assignee'); return; }

    setLoading(true);
    setError(null);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? `${formData.dueDate}T23:59:59` : null,
        project: formData.project || null,
        assigneeId: assignToSelf ? userId : selectedAssignee.id,
        creatorId: userId,
      };

      await createTask(taskData);
      onTaskCreated && onTaskCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
    theme.isDark ? `${theme.borderColor} bg-gray-700 ${theme.textPrimary}` : 'border-gray-300 bg-white text-gray-900'
  }`;
  const labelClass = `block text-sm font-semibold mb-2 ${theme.isDark ? theme.textPrimary : 'text-gray-700'}`;

  const priorityIcon = { LOW: '🔵', MEDIUM: '🟡', HIGH: '🔴', CRITICAL: '🟣' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme.isDark ? theme.cardBg : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>

        {/* Header */}
        <div className={`sticky top-0 ${theme.isDark ? theme.cardBg : 'bg-white'} border-b ${theme.isDark ? theme.borderColor : 'border-gray-200'} px-6 py-4 flex justify-between items-center rounded-t-2xl`}>
          <h2 className={`text-2xl font-bold ${theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>Create New Task</h2>
          <button onClick={onClose} className={`${theme.isDark ? theme.hoverBg : 'hover:bg-gray-100'} rounded-lg w-8 h-8 flex items-center justify-center text-2xl font-bold ${theme.isDark ? 'text-gray-400' : 'text-gray-500'} transition`}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Title */}
          <div>
            <label className={labelClass}>Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputClass} placeholder="Enter task title" />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className={`${inputClass} resize-none`} placeholder="Enter task description" />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                {statuses.filter(s => s !== 'DONE' && s !== 'CANCELLED').map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priorityIcon[priority] || '⚪'} {priority}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date + Project */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Project</label>
              <input type="text" name="project" value={formData.project} onChange={handleChange} className={inputClass} placeholder="e.g., Website Redesign" />
            </div>
          </div>

          {/* ===== ASSIGNEE SECTION ===== */}
          <div className={`pt-4 border-t ${theme.isDark ? theme.borderColor : 'border-gray-200'}`}>
            <label className={`${labelClass} mb-3`}>Assign To</label>

            {/* Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => { setAssignToSelf(true); setSelectedAssignee(null); setSearchQuery(''); setSearchResults([]); }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition border ${
                  assignToSelf
                    ? `bg-gradient-to-r ${theme.primary} text-white border-transparent shadow-md`
                    : `${theme.isDark ? `${theme.borderColor} ${theme.textSecondary}` : 'border-gray-300 text-gray-600'} hover:bg-gray-50`
                }`}
              >
                👤 Myself
              </button>
              <button
                type="button"
                onClick={() => setAssignToSelf(false)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition border ${
                  !assignToSelf
                    ? `bg-gradient-to-r ${theme.primary} text-white border-transparent shadow-md`
                    : `${theme.isDark ? `${theme.borderColor} ${theme.textSecondary}` : 'border-gray-300 text-gray-600'} hover:bg-gray-50`
                }`}
              >
                👥 Another User
              </button>
            </div>

            {/* Search */}
            {!assignToSelf && (
              <div className="relative">
                {selectedAssignee ? (
                  // Выбранный исполнитель
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${theme.isDark ? `bg-gray-700 ${theme.borderColor}` : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 bg-gradient-to-r ${theme.primary} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold">{selectedAssignee.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>{selectedAssignee.username}</p>
                        <p className={`text-xs ${theme.isDark ? theme.textSecondary : 'text-gray-500'}`}>{selectedAssignee.email}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setSelectedAssignee(null); setSearchQuery(''); }} className="text-gray-400 hover:text-red-500 transition p-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Search Input */}
                    <div className="relative">
                      <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by username or email..."
                        className={`${inputClass} pl-10 pr-10`}
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-3.5">
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Dropdown results */}
                    {searchResults.length > 0 && (
                      <div className={`absolute left-0 right-0 mt-1 ${theme.isDark ? 'bg-gray-700' : 'bg-white'} border ${theme.isDark ? theme.borderColor : 'border-gray-200'} rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto`}>
                        {searchResults.map(u => (
                          <button key={u.id} type="button" onClick={() => { setSelectedAssignee(u); setSearchQuery(''); setSearchResults([]); }} className={`w-full flex items-center gap-3 px-4 py-3 ${theme.isDark ? theme.hoverBg : 'hover:bg-gray-50'} transition text-left`}>
                            <div className={`w-8 h-8 bg-gradient-to-r ${theme.primary} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white font-bold text-sm">{u.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${theme.isDark ? theme.textPrimary : 'text-gray-900'}`}>{u.username}</p>
                              <p className={`text-xs ${theme.isDark ? theme.textSecondary : 'text-gray-500'}`}>{u.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <p className={`text-xs mt-2 px-1 ${theme.isDark ? theme.textSecondary : 'text-gray-500'}`}>No users found for "{searchQuery}"</p>
                    )}
                    {searchQuery.length < 2 && (
                      <p className={`text-xs mt-2 px-1 ${theme.isDark ? 'text-gray-500' : 'text-gray-400'}`}>Type at least 2 characters to search</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={`flex-1 px-6 py-3 border ${theme.isDark ? `${theme.borderColor} ${theme.textSecondary}` : 'border-gray-300 text-gray-700'} rounded-xl font-semibold hover:bg-gray-50 transition`}>
              Cancel
            </button>
            <button type="submit" disabled={loading || (!assignToSelf && !selectedAssignee)} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
