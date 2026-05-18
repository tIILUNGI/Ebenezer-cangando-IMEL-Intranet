export enum UserRole {
  ALUNO = 'Aluno',
  PROFESSOR = 'Professor',
  ADMIN = 'Administrador',
  DIRETOR = 'Diretor',
  ENCARREGADO = 'Encarregado',
}

export interface User {
  id: string;
  name: string;
  processNumber: string;
  role: UserRole;
  password?: string;
  email?: string;
  phone?: string;
  bi?: string;
  avatar?: string;
  turma?: string;
  isActive?: boolean;
  studentIds?: string[];
  notificationPrefs?: {
    email: boolean;
    browser: boolean;
    grades: boolean;
  };
  coordinatorType?: 'curso' | 'turma' | null;
  coordinatedEntity?: string;
}

export interface QuarterGrades {
  mac: number | null;
  npp: number | null;
  npt: number | null;
  average: number | null;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  t1: QuarterGrades;
  t2: QuarterGrades;
  t3: QuarterGrades;
  faltas: number;
  teacherId: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'announcement' | 'grade' | 'system';
  read: boolean;
  timestamp: string;
  targetAudience?: UserRole.ALUNO | UserRole.PROFESSOR | 'Todos';
  authorName?: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  subject: string;
  type: 'PDF' | 'DOC' | 'VIDEO' | 'ZIP';
  author: string;
  authorId: string;
  date: string;
  size?: string;
  fileName?: string;
  mimeType?: string;
  dataUrl?: string;
  fileUrl?: string;
  downloads?: number;
  turmaTarget?: string;
}

export interface Message {
  id: string;
  fromId: string;
  from: string;
  toId: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface SidebarItem {
  icon: any;
  label: string;
  path: string;
  roles: UserRole[];
}

export interface SystemSettings {
  schoolName: string;
  schoolAcronym: string;
  primaryColor: string;
  secondaryColor: string;
  version: string;
}

export interface ClassSchedule {
  id: string;
  day: string;
  time: string;
  subject: string;
  room: string;
  turma: string;
  teacherId: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface AIInsight {
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}
