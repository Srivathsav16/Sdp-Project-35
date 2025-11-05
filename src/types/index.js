// User interface
export const createUser = (id, name, email, role, avatar = null) => ({
  id,
  name,
  email,
  role,
  avatar
});

// Project interface
export const createProject = (id, title, description, teacherId, teacherName, createdAt, deadline, status = 'active', tasks = []) => ({
  id,
  title,
  description,
  teacherId,
  teacherName,
  createdAt,
  deadline,
  status,
  tasks
});

// Task interface
export const createTask = (id, projectId, title, description, assignedTo, assignedToNames, status = 'pending', createdAt, deadline = null, submission = null) => ({
  id,
  projectId,
  title,
  description,
  assignedTo,
  assignedToNames,
  status,
  createdAt,
  deadline,
  submission
});

// Task Submission interface
export const createTaskSubmission = (id, taskId, studentId, studentName, fileName, fileUrl, submittedAt, comments = null, score = null, resubmissionRequired = false) => ({
  id,
  taskId,
  studentId,
  studentName,
  fileName,
  fileUrl,
  submittedAt,
  comments,
  score,
  resubmissionRequired
});

// Auth Context interface
export const createAuthContext = (user, login, logout, signup, isLoading, getStudents, getStudentsByTeacher, allUsers) => ({
  user,
  login,
  logout,
  signup,
  isLoading,
  getStudents,
  getStudentsByTeacher,
  allUsers
});
