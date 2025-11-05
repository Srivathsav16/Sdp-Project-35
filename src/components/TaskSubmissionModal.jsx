import React, { useState } from 'react';
import { X, Upload, FileText, MessageSquare } from 'lucide-react';
import { createTaskSubmission } from '../types';
import { useAuth } from '../contexts/AuthContext.jsx';

const TaskSubmissionModal = ({ task, project, onClose, onSubmit }) => {
  const { user } = useAuth();
  const isResubmission = task.submission?.resubmissionRequired || false;
  const [formData, setFormData] = useState({
    fileName: '',
    fileUrl: '',
    comments: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.fileName && formData.fileUrl) {
      const submission = createTaskSubmission(
        isResubmission ? task.submission.id : Date.now().toString(),
        task.id,
        user.id,
        user.name,
        formData.fileName,
        formData.fileUrl,
        new Date().toISOString(),
        formData.comments || null,
        task.submission?.score || null,
        false // Clear resubmission required when resubmitting
      );
      onSubmit(submission);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        setFormData(prev => ({
          ...prev,
          fileName: file.name,
          // Store as data URL so it can be viewed without a backend
          fileUrl: typeof dataUrl === 'string' ? dataUrl : ''
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isResubmission ? 'Resubmit' : 'Submit'} Task: {task.title}</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="task-info">
            <h3>Project: {project.title}</h3>
            <p><strong>Task:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description}</p>
            {task.deadline && (
              <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleString()}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="file">
                <Upload size={16} />
                Upload File
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileUpload}
                className="file-input"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                required
              />
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar"></div>
                  <span>Uploading...</span>
                </div>
              )}
              {formData.fileName && !isUploading && (
                <div className="file-preview">
                  <FileText size={16} />
                  <span>{formData.fileName}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="comments">
                <MessageSquare size={16} />
                Comments (Optional)
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Add any additional comments about your submission..."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={!formData.fileName || isUploading}
              >
                <Upload size={16} />
                {isResubmission ? 'Resubmit Task' : 'Submit Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskSubmissionModal;
