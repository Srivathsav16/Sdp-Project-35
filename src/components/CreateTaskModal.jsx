import React, { useState } from 'react';
import { X, Calendar, FileText, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const CreateTaskModal = ({ project, onClose, onSubmit }) => {
  const { getStudentsByTeacher } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [],
    deadline: '',
    status: 'pending'
  });

  // Get students available for this teacher
  const availableStudents = getStudentsByTeacher(project.teacherId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.assignedTo.length > 0) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(studentId)
        ? prev.assignedTo.filter(id => id !== studentId)
        : [...prev.assignedTo, studentId]
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Task to {project.title}</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">
              <FileText size={16} />
              Task Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Database Schema Design"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe the task requirements and deliverables..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Users size={16} />
              Assign to Students
            </label>
            <div className="student-selection">
              {availableStudents.length === 0 ? (
                <p className="no-students">No students available. Students need to sign up first.</p>
              ) : (
                availableStudents.map(student => (
                  <label key={student.id} className="student-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                    />
                    <span>{student.name} ({student.email})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">
              <Calendar size={16} />
              Deadline (Optional)
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Initial Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
