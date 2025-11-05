export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  deadline: string;
  status: 'active' | 'completed' | 'archived';
  tasks: Task[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string[];
  assignedToNames: string[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  deadline?: string;
  submission?: TaskSubmission;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  fileName: string;
  fileUrl: string;
  submittedAt: string;
  comments?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'teacher' | 'student') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
