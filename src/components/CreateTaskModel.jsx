import { useState, useEffect } from 'react';
import { createTask, getStatuses, getPriorities } from '../api/userApi';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'NEW',
    priority: 'MEDIUM',
    dueDate: '',
    project: '',  // ✅ Изменено с category на project
    assigneeId: userId,
    creatorId: userId
  });
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchStatuses();
      fetchPriorities();
    }
  }, [isOpen]);

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
    } catch (error) {
      console.error("Failed to fetch statuses", error);
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
        setPriorities(['LOW', 'MEDIUM', 'HIGH']);
      }
    } catch (error) {
      console.error("Failed to fetch priorities", error);
      setPriorities(['LOW', 'MEDIUM', 'HIGH']);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ ИСПРАВЛЕНО: Правильное форматирование данных
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        // ✅ Преобразуем дату в формат LocalDateTime (yyyy-MM-ddTHH:mm:ss)
        dueDate: formData.dueDate ? `${formData.dueDate}T23:59:59` : null,
        project: formData.project || null,  // ✅ Изменено с category
        assigneeId: userId,
        creatorId: userId
      };

      console.log("Creating task with data:", taskData);
      const response = await createTask(taskData);
      console.log("Task created successfully:", response);
      
      // Очистить форму
      setFormData({
        title: '',
        description: '',
        status: 'NEW',
        priority: 'MEDIUM',
        dueDate: '',
        project: '',
        assigneeId: userId,
        creatorId: userId
      });

      onTaskCreated && onTaskCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || err.response?.data || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Enter task description"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date and Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project
              </label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Website Redesign"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
