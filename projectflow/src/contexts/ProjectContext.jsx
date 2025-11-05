import React, { createContext, useContext, useState } from 'react';
import { createProject, createTask, createTaskSubmission } from '../types';

const ProjectContext = createContext(undefined);

// Initial projects (empty for new users)
const initialProjects = [];

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(initialProjects);

  const addProject = (projectData) => {
    const newProject = createProject(
      Date.now().toString(),
      projectData.title,
      projectData.description,
      projectData.teacherId,
      projectData.teacherName,
      new Date().toISOString(),
      projectData.deadline,
      projectData.status,
      []
    );
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const addTask = (projectId, taskData, studentNames = []) => {
    const newTask = createTask(
      Date.now().toString(),
      projectId,
      taskData.title,
      taskData.description,
      taskData.assignedTo,
      studentNames, // Use provided student names
      taskData.status,
      new Date().toISOString(),
      taskData.deadline
    );
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
  };

  const updateTask = (projectId, taskId, updates) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task => 
              task.id === taskId ? { ...task, ...updates } : task
            )
          }
        : project
    ));
  };

  const submitTask = (projectId, taskId, submission) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task => 
              task.id === taskId 
                ? { ...task, submission, status: 'completed' }
                : task
            )
          }
        : project
    ));
  };

  const getProjectsByTeacher = (teacherId) => {
    return projects.filter(project => project.teacherId === teacherId);
  };

  const getProjectsByStudent = (studentId) => {
    return projects.filter(project => 
      project.tasks.some(task => task.assignedTo.includes(studentId))
    );
  };

  const getTasksByStudent = (studentId) => {
    const result = [];
    projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.assignedTo.includes(studentId)) {
          result.push({ project, task });
        }
      });
    });
    return result;
  };

  const contextValue = {
    projects,
    createProject: addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    submitTask,
    getProjectsByTeacher,
    getProjectsByStudent,
    getTasksByStudent
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
