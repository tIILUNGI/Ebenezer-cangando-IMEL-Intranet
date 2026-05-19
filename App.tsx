import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import {
  User,
  UserRole,
  Grade,
  ClassSchedule,
  LibraryResource,
  Message,
  SystemSettings,
  AuditLog,
  Notification,
} from './types';
import { DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR, TEST_USERS, MOCK_GRADES, MOCK_SCHEDULE, DEMO_LIBRARY, DEMO_ANNOUNCEMENTS } from './constants';
import {
  login as apiLogin,
  logout as apiLogout,
  isAuthenticated as apiIsAuthenticated,
  getCurrentUser as apiGetCurrentUser,
  register as apiRegister,
} from './src/api/auth';
import {
  fetchUsers,
  fetchGrades,
  fetchSchedule,
  fetchLibrary,
  fetchNotifications,
  fetchKPIs,
  fetchAuditLogs,
  fetchMessages,
  updateGrade as apiUpdateGrade,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
  createScheduleEntry as apiCreateScheduleEntry,
  updateScheduleEntry as apiUpdateScheduleEntry,
  deleteScheduleEntry as apiDeleteScheduleEntry,
  sendMessage as apiSendMessage,
  uploadLibraryResource as apiUploadLibraryResource,
  deleteLibraryResource as apiDeleteLibraryResource,
  createAnnouncement as apiCreateAnnouncement,
} from './src/api/index';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import GradesPage from './pages/GradesPage';
import GradingPage from './pages/GradingPage';
import SchedulePage from './pages/SchedulePage';
import LibraryPage from './pages/LibraryPage';
import MessagesPage from './pages/MessagesPage';
import BrandingPage from './pages/BrandingPage';
import ProfilePage from './pages/ProfilePage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AIChatWidget from './components/AIChatWidget';
import AcademicStatsPage from './pages/AcademicStatsPage';
import TeacherMonitoringPage from './pages/TeacherMonitoringPage';
import AuditLogsPage from './pages/AuditLogsPage';
import InstitutionalPage from './pages/InstitutionalPage';
import AttendancePage from './pages/AttendancePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SupportPage from './pages/SupportPage';
import CourseCoordinatorPage from './pages/CourseCoordinatorPage';
import ClassCoordinatorPage from './pages/ClassCoordinatorPage';
import AvisosPage from './pages/AvisosPage';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';

// ===================== DATABASE CONTEXT =====================
interface DatabaseContextType {
  users: User[];
  grades: Grade[];
  schedules: ClassSchedule[];
  library: LibraryResource[];
  messages: Message[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  // mutations
  updateGrade: (id: string, updates: Partial<Grade>, updatedBy: string) => Promise<void>;
  replaceGrades: (grades: Grade[]) => void;
  replaceSchedules: (schedules: ClassSchedule[]) => void;
  replaceLibrary: (library: LibraryResource[]) => void;
  replaceMessages: (messages: Message[]) => void;
  replaceUsers: (users: User[]) => void;
  replaceAuditLogs: (logs: AuditLog[]) => void;
  addUser: (user: Omit<User, 'id'>, createdBy: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>, updatedBy: string) => Promise<void>;
  deleteUser: (id: string, deletedBy: string) => Promise<void>;
  sendMessage: (toId: string, content: string) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  addLibraryResource: (resource: Omit<LibraryResource, 'id' | 'date'>) => Promise<void>;
  incrementLibraryDownloads: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  addAuditLog: (user: string, action: string, target: string, details: string) => void;
  addSchedule: (schedule: Omit<ClassSchedule, 'id'>, createdBy: string) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<ClassSchedule>, updatedBy: string) => Promise<void>;
  deleteSchedule: (id: string, deletedBy: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);
export const useDatabase = () => useContext(DatabaseContext)!;

const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('imel_db_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [grades, setGrades] = useState<Grade[]>(() => {
    try {
      const stored = localStorage.getItem('imel_db_grades');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [schedules, setSchedules] = useState<ClassSchedule[]>(() => {
    try {
      const stored = localStorage.getItem('imel_db_schedules');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const stored = localStorage.getItem('imel_db_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('imel_db_notifs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [library, setLibrary] = useState<LibraryResource[]>(() => {
    try {
      const stored = localStorage.getItem('imel_db_library');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem('imel_db_messages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isOnline, setIsOnline] = useState(true);

  // Try to fetch from API, fallback to localStorage
  // Axios returns { data: T, status, ... } — we unwrap .data before storing / returning
  const fetchFromAPI = async <T extends unknown>(
    fn: () => Promise<{ data: T }>,
    fallback: T,
    key: string
  ): Promise<T> => {
    try {
      const resp = await fn();
      const payload = resp.data;
      if (Array.isArray(payload) && payload.length === 0) {
        const stored = localStorage.getItem(key);
        if (stored && JSON.parse(stored).length > 0) {
          console.warn(`Backend returned empty array for ${key}, retaining populated local storage.`);
          return JSON.parse(stored) as T;
        }
      }
      localStorage.setItem(key, JSON.stringify(payload));
      return payload;
    } catch (err) {
      console.warn(`API fetch failed for ${key}, using fallback`);
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : fallback;
    }
  };

  // Detect backend server availability on first mount (2s timeout, probe the health endpoint)
  const [serverReachable, setServerReachable] = useState(() => {
    const cached = localStorage.getItem('imel_server_reachable');
    if (cached !== null) {
      return cached === 'true';
    }
    return true; // Default assume reachable until proven otherwise
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      try {
        const r = await fetch('http://localhost:5000/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!cancelled) {
          const reachable = r.ok;
          setServerReachable(reachable);
          localStorage.setItem('imel_server_reachable', reachable ? 'true' : 'false');
        }
      } catch {
        clearTimeout(timeoutId);
        if (!cancelled) {
          setServerReachable(false);
          localStorage.setItem('imel_server_reachable', 'false');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshData = async () => {
    const usersResult = serverReachable
      ? await fetchFromAPI(fetchUsers, TEST_USERS, 'imel_db_users')
      : JSON.parse(localStorage.getItem('imel_db_users') || JSON.stringify(TEST_USERS));
    const gradesResult = serverReachable
      ? await fetchFromAPI(fetchGrades, MOCK_GRADES, 'imel_db_grades')
      : JSON.parse(localStorage.getItem('imel_db_grades') || JSON.stringify(MOCK_GRADES));
    const schedulesResult = serverReachable
      ? await fetchFromAPI(fetchSchedule, MOCK_SCHEDULE, 'imel_db_schedules')
      : JSON.parse(localStorage.getItem('imel_db_schedules') || JSON.stringify(MOCK_SCHEDULE));
    const notificationsResult = serverReachable
      ? await fetchFromAPI(fetchNotifications, DEMO_ANNOUNCEMENTS, 'imel_db_notifs')
      : JSON.parse(localStorage.getItem('imel_db_notifs') || JSON.stringify(DEMO_ANNOUNCEMENTS));
    const libraryResult = serverReachable
      ? await fetchFromAPI(fetchLibrary, DEMO_LIBRARY, 'imel_db_library')
      : JSON.parse(localStorage.getItem('imel_db_library') || JSON.stringify(DEMO_LIBRARY));
    const messagesResult = serverReachable
      ? await fetchFromAPI(fetchMessages, [], 'imel_db_messages')
      : JSON.parse(localStorage.getItem('imel_db_messages') || '[]');
    const auditLogsResult = serverReachable
      ? await fetchFromAPI(fetchAuditLogs, [], 'imel_db_logs')
      : JSON.parse(localStorage.getItem('imel_db_logs') || '[]');

    setUsers(usersResult);
    setGrades(gradesResult);
    setSchedules(schedulesResult);
    setNotifications(notificationsResult);
    setLibrary(libraryResult);
    setMessages(messagesResult);
    setAuditLogs(auditLogsResult);
  };

  useEffect(() => {
    // ── Local-first seed: if localStorage is empty, write mock data immediately
    const seedLocalData = () => {
      try {
        const storedUsers = localStorage.getItem('imel_db_users');
        if (!storedUsers || JSON.parse(storedUsers).length === 0) {
          localStorage.setItem('imel_db_users', JSON.stringify(TEST_USERS));
          setUsers(TEST_USERS);
        }
        const storedGrades = localStorage.getItem('imel_db_grades');
        if (!storedGrades || JSON.parse(storedGrades).length === 0) {
          localStorage.setItem('imel_db_grades', JSON.stringify(MOCK_GRADES));
          setGrades(MOCK_GRADES);
        }
        const storedSchedules = localStorage.getItem('imel_db_schedules');
        if (!storedSchedules || JSON.parse(storedSchedules).length === 0) {
          localStorage.setItem('imel_db_schedules', JSON.stringify(MOCK_SCHEDULE));
          setSchedules(MOCK_SCHEDULE);
        }
      } catch (err) {
console.warn('Error in seeding local data:', err);
      }
      // Ensure DEMO_LIBRARY and DEMO_ANNOUNCEMENTS are always seeded
      const storedLibrary = localStorage.getItem('imel_db_library');
      if (!storedLibrary || JSON.parse(storedLibrary).length === 0) {
        localStorage.setItem('imel_db_library', JSON.stringify(DEMO_LIBRARY));
        setLibrary(DEMO_LIBRARY);
      }
      const storedNotifs = localStorage.getItem('imel_db_notifs');
      if (!storedNotifs || JSON.parse(storedNotifs).length === 0) {
        localStorage.setItem('imel_db_notifs', JSON.stringify(DEMO_ANNOUNCEMENTS));
      }
      if (!localStorage.getItem('imel_db_messages')) {
        localStorage.setItem('imel_db_messages', JSON.stringify([]));
      }
      if (!localStorage.getItem('imel_db_logs')) {
        localStorage.setItem('imel_db_logs', JSON.stringify([]));
      }
    };
    seedLocalData();

    refreshData();

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('imel_db_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('imel_db_grades', JSON.stringify(grades));
  }, [grades]);
  useEffect(() => {
    localStorage.setItem('imel_db_schedules', JSON.stringify(schedules));
  }, [schedules]);
  useEffect(() => {
    localStorage.setItem('imel_db_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('imel_db_notifs', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('imel_db_library', JSON.stringify(library));
  }, [library]);
  useEffect(() => {
    localStorage.setItem('imel_db_messages', JSON.stringify(messages));
  }, [messages]);

  const addAuditLog = (user: string, action: string, target: string, details: string) => {
    const entry: AuditLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user,
      action,
      target,
      details,
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs((prev) => [entry, ...prev].slice(0, 500));
  };

  const addNotification = async (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 20));

    try {
      await apiCreateAnnouncement({
        titulo: notif.title,
        mensagem: notif.message,
        tipo: notif.type === 'message' ? 'Mensagem' : 'Aviso',
        target_audience: notif.targetAudience || 'Todos',
        author_name: notif.authorName || 'Sistema',
      });
    } catch (err) {
      console.warn('Failed to sync notification to backend, kept local:', err);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => setNotifications([]);

  const addLibraryResource = async (resource: Omit<LibraryResource, 'id' | 'date'>) => {
    const newRes: LibraryResource = {
      ...resource,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      downloads: 0,
    };
    setLibrary((prev) => [newRes, ...prev]);
    addAuditLog(
      resource.author || 'Sistema',
      'ADICIONOU_ARQUIVO',
      newRes.title,
      `${newRes.subject} (${newRes.type})`
    );

    try {
      const formData = new FormData();
      formData.append('titulo', resource.title);
      formData.append('tipo', resource.type);
      formData.append('url_ficheiro', resource.fileUrl || '');
      formData.append('tamanho', resource.size || '0 KB');
      formData.append('turma_target', resource.subject || 'Todas');
      await apiUploadLibraryResource(formData);
    } catch (err) {
      console.warn('Failed to sync library resource to backend, kept local:', err);
    }
  };

  const incrementLibraryDownloads = async (id: string) => {
    setLibrary((prev) =>
      prev.map((r) => (r.id === id ? { ...r, downloads: (r.downloads || 0) + 1 } : r))
    );
    try {
      await apiUpdateUser(id, { downloads: 1 });
    } catch {
      /* ignore */
    }
  };

  const updateGrade = async (id: string, updates: Partial<Grade>, updatedBy: string) => {
    setGrades((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, ...updates, updatedAt: new Date().toLocaleDateString(), updatedBy }
          : g
      )
    );
    addAuditLog(
      updatedBy,
      'ALTEROU_NOTA',
      grades.find((g) => g.id === id)?.studentName || '?',
      grades.find((g) => g.id === id)?.subject || '?'
    );

    try {
      await apiUpdateGrade(id, updates);
    } catch (err) {
      console.warn('Failed to update grade in backend, kept local change:', err);
    }
  };

  const addUser = async (userData: Omit<User, 'id'>, createdBy: string) => {
    const newId = `usr-${Date.now()}`;
    const newUser = { ...userData, id: newId };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog(createdBy, 'CRIOU_USUARIO', userData.name, userData.processNumber);

    try {
      await apiCreateUser(newUser);
    } catch (err) {
      console.warn('Failed to create user in backend, kept local:', err);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>, updatedBy: string) => {
    const userTarget = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (userTarget)
      addAuditLog(updatedBy, 'ALTEROU_USUARIO', userTarget.name, Object.keys(updates).join(', '));

    try {
      await apiUpdateUser(id, updates);
    } catch (err) {
      console.warn('Failed to update user in backend, kept local:', err);
    }
  };

  const deleteUser = async (id: string, deletedBy: string) => {
    const userTarget = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (userTarget)
      addAuditLog(deletedBy, 'REMOVEU_USUARIO', userTarget.name, userTarget.processNumber);

    try {
      await apiDeleteUser(id);
    } catch (err) {
      console.warn('Failed to delete user in backend, kept local:', err);
    }
  };

  const sendMessage = async (toId: string, content: string) => {
    const user = JSON.parse(localStorage.getItem('imel_user') || '{}') as User;
    const target = users.find((u) => u.id === toId);
    if (!target) return;

    // ── Professor scope: can only message students from their own classes ──
    if (user.role === UserRole.PROFESSOR) {
      if (target.role !== UserRole.ALUNO) return;
      // Collect classes this teacher has taught (from existing messages)
      const teacherClasses = new Set<string>();
      messages.forEach((m: Message) => {
        if (m.fromId === user.id || m.toId === user.id) {
          const peer =
            users.find((u) => u.id === (m.fromId === user.id ? m.toId : m.fromId)) ||
            null;
          if (peer?.turma) teacherClasses.add(peer.turma);
        }
      });
      // If no prior conversation yet, block — professor can't cold-message new classes
      if (teacherClasses.size > 0 && target.turma && !teacherClasses.has(target.turma)) {
        console.warn('Professor tried to message student outside their class:', target.name);
        return;
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      fromId: user.id || '0',
      from: user.name || 'Sistema',
      toId: target.id,
      to: target.name,
      content,
      timestamp: new Date().toLocaleString(),
      read: false,
    };
    setMessages((prev) => [newMessage, ...prev]);
    addNotification({
      title: 'Nova mensagem',
      message: `${user.name} enviou mensagem para ${target.name}.`,
      type: 'message',
    });
    addAuditLog(user.name || 'Sistema', 'ENVIOU_MENSAGEM', target.name, content.slice(0, 80));

    try {
      await apiSendMessage({
        remetente_id: user.id,
        destinatario_id: target.id,
        conteudo: content,
        assunto: 'Mensagem Direta',
      });
    } catch (err) {
      console.warn('Failed to send message in backend, kept local:', err);
    }
  };

  const markMessageRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const addSchedule = async (schedule: Omit<ClassSchedule, 'id'>, createdBy: string) => {
    const newId = `sch-${Date.now()}`;
    const newSchedule = { ...schedule, id: newId };
    setSchedules((prev) => [newSchedule, ...prev]);
    addAuditLog(createdBy, 'CRIOU_HORARIO', schedule.subject, `${schedule.day} - ${schedule.time}`);

    try {
      await apiCreateScheduleEntry(newSchedule);
    } catch (err) {
      console.warn('Failed to create schedule entry in backend, kept local:', err);
    }
  };

  const updateSchedule = async (id: string, updates: Partial<ClassSchedule>, updatedBy: string) => {
    const scheduleTarget = schedules.find((s) => s.id === id);
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    if (scheduleTarget)
      addAuditLog(updatedBy, 'ALTEROU_HORARIO', scheduleTarget.subject, Object.keys(updates).join(', '));

    try {
      await apiUpdateScheduleEntry(id, updates);
    } catch (err) {
      console.warn('Failed to update schedule entry in backend, kept local:', err);
    }
  };

  const deleteSchedule = async (id: string, deletedBy: string) => {
    const scheduleTarget = schedules.find((s) => s.id === id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    if (scheduleTarget)
      addAuditLog(deletedBy, 'REMOVEU_HORARIO', scheduleTarget.subject, `${scheduleTarget.day} - ${scheduleTarget.time}`);

    try {
      await apiDeleteScheduleEntry(id);
    } catch (err) {
      console.warn('Failed to delete schedule entry in backend, kept local:', err);
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        users,
        grades,
        schedules,
        library,
        messages,
        auditLogs,
        notifications,
        updateGrade,
        replaceGrades: (g) => setGrades(g),
        replaceSchedules: (s) => setSchedules(s),
        replaceLibrary: (l) => setLibrary(l),
        replaceMessages: (m) => setMessages(m),
        replaceUsers: (u) => setUsers(u),
        replaceAuditLogs: (l) => setAuditLogs(l),
        addUser,
        updateUser,
        deleteUser,
        sendMessage,
        markMessageRead,
        addNotification,
        markNotificationRead,
        clearNotifications,
        addLibraryResource,
        incrementLibraryDownloads,
        refreshData,
        addAuditLog,
        addSchedule,
        updateSchedule,
        deleteSchedule,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

// ===================== AUTH CONTEXT =====================
interface AuthContextType {
  user: User | null;
  activeStudent: User | null;
  setActiveStudentId: (id: string) => void;
  login: (process: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => useContext(AuthContext)!;

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('imel_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeStudentId, setActiveStudentId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('imel_user');
      if (saved) {
        const parsedUser = JSON.parse(saved);
        if (parsedUser.role === UserRole.ENCARREGADO && parsedUser.studentIds?.length > 0)
          return parsedUser.studentIds[0];
        else if (parsedUser.role === UserRole.ALUNO)
          return parsedUser.id;
      }
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { users } = useDatabase();

  useEffect(() => {
    if (user && users.length > 0) {
      const dbUser = users.find((u) => u.id === user.id);
      if (dbUser) {
        setUser(dbUser);
        localStorage.setItem('imel_user', JSON.stringify(dbUser));
      }
    }
  }, [users]);

  const login = async (process: string, pass: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const data = await apiLogin(process, pass);
      const userData = data.user;

      setUser(userData);

      if (userData.role === UserRole.ENCARREGADO && userData.studentIds?.length > 0)
        setActiveStudentId(userData.studentIds[0]);
      else if (userData.role === UserRole.ALUNO) setActiveStudentId(userData.id);

      return true;
    } catch (err: any) {
      console.error('Error logging in:', err);
      setError(err.response?.data?.error || err.message || 'Credenciais inválidas');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout().catch(() => {});
    localStorage.removeItem('imel_user');
    localStorage.removeItem('imel_token');
    localStorage.removeItem('imel_refresh_token');
    localStorage.removeItem('imel_active_student');
    setUser(null);
    setActiveStudentId(null);
  };

  const activeStudent = useMemo(
    () => (activeStudentId ? users.find((u) => u.id === activeStudentId) || null : null),
    [activeStudentId, users]
  );

  return (
    <AuthContext.Provider
      value={{ user, activeStudent, setActiveStudentId, login, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===================== SETTINGS CONTEXT =====================
const SettingsContext = createContext<any>(undefined);
export const useSettings = () => useContext(SettingsContext)!;
const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('imel_theme') as any) || 'light'
  );
  const [lang, setLang] = useState<'pt' | 'en'>(
    () => (localStorage.getItem('imel_lang') as any) || 'pt'
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('imel_theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('imel_lang', lang);
  }, [lang]);
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const toggleLang = () => setLang((prev) => (prev === 'pt' ? 'en' : 'pt'));
  const t = (key: string) => (translations['pt'] as any)[key] || key;
  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

// ===================== SYSTEM ADMIN CONTEXT =====================
const SystemAdminContext = createContext<any>(undefined);
export const useSystemAdmin = () => useContext(SystemAdminContext)!;
const SystemAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('imel_system_settings');
    if (saved) return JSON.parse(saved);
    return {
      schoolName: 'Instituto Médio de Economia de Luanda',
      schoolAcronym: 'Intra IMEL',
      primaryColor: DEFAULT_PRIMARY_COLOR,
      secondaryColor: DEFAULT_SECONDARY_COLOR,
      version: '3.1.0',
    };
  });
  useEffect(() => {
    localStorage.setItem('imel_system_settings', JSON.stringify(settings));
    document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', settings.secondaryColor);
    document.title = `${settings.schoolAcronym} - SIG Escolar`;
  }, [settings]);
  return (
    <SystemAdminContext.Provider
      value={{ settings, updateSettings: (n: any) => setSettings((p) => ({ ...p, ...n })) }}
    >
      {children}
    </SystemAdminContext.Provider>
  );
};

// ===================== APP SHELL =====================
const AppShell: React.FC = () => {
  const { user, error } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { notifications } = useDatabase();

  useEffect(() => {
    if (!user) return;
    const hasUnread = notifications.some(
      (n) =>
        !n.read &&
        n.type === 'announcement' &&
        (n.targetAudience === user.role || n.targetAudience === 'Todos')
    );
    if (hasUnread) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});
    }
  }, [user, notifications]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
       <div
         className={`flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} ml-0 w-full min-w-0 flex-1 min-h-0`}
       >
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 animate-fade w-full min-w-0 max-w-[2000px] mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm font-bold flex items-center gap-2">
              <span>⚠️</span> {error}
              <button
                onClick={() => {
                  const { setError } = require('./App');
                  setError(null);
                }}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notas" element={<GradesPage />} />
            <Route path="/frequencia" element={<AttendancePage />} />
            <Route path="/gestao-notas" element={<GradingPage />} />
            <Route path="/horario" element={<SchedulePage />} />
            <Route path="/biblioteca" element={<LibraryPage />} />
            <Route path="/mensagens" element={<MessagesPage />} />
            <Route path="/stats" element={<AcademicStatsPage />} />
            <Route path="/direcao/professores" element={<TeacherMonitoringPage />} />
            <Route path="/direcao/alunos" element={<UserManagementPage mode="alunos" />} />
            <Route path="/direcao/auditoria" element={<AuditLogsPage />} />
            <Route path="/direcao/institucional" element={<InstitutionalPage />} />
            <Route path="/direcao/relatorios" element={<AcademicStatsPage />} />
            <Route path="/admin/usuarios" element={<UserManagementPage />} />
            <Route path="/admin/branding" element={<BrandingPage />} />
            <Route path="/coordenacao/curso" element={<CourseCoordinatorPage />} />
            <Route path="/coordenacao/turma" element={<ClassCoordinatorPage />} />
            <Route path="/avisos" element={<AvisosPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/ajuda" element={<HelpPage />} />
            <Route path="/suporte" element={<SupportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <AIChatWidget />
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <SystemAdminProvider>
    <SettingsProvider>
      <DatabaseProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
              <Route path="/registrar" element={<CreateAccountPage />} />
              <Route path="/termos" element={<TermsPage />} />
              <Route path="/privacidade" element={<PrivacyPage />} />
              <Route path="/suporte" element={<SupportPage />} />
              <Route path="/*" element={<AppShell />} />
            </Routes>
          </Router>
        </AuthProvider>
      </DatabaseProvider>
    </SettingsProvider>
  </SystemAdminProvider>
);

export default App;

const translations = {
  pt: {
    dashboard_student: 'Painel do Aluno',
    dashboard_teacher: 'Painel Docente',
    dashboard_guardian: 'Portal do Encarregado',
    dashboard_director: 'Direcção Geral',
    dashboard_admin: 'Administração',
    my_grades: 'Minhas Notas',
    guardian_grades: 'Notas do Educando',
    my_attendance: 'Minha Assiduidade',
    guardian_attendance: 'Faltas do Educando',
    my_schedule: 'Horário de Aulas',
    guardian_schedule: 'Horário Escolar',
    my_resources: 'Recursos Didácticos',
    guardian_resources: 'Materiais de Apoio',
    my_history: 'Histórico Escolar',
    guardian_history: 'Percurso Académico',
    grading_sheet: 'Pauta de Avaliação',
    teacher_schedule: 'Horário Docente',
    content_mgmt: 'Gestão de Conteúdos',
    academic_analysis: 'Análise Estatística',
    pedagogic_control: 'Controlo Pedagógico',
    enrollment_mgmt: 'Gestão de Alunos',
    inst_structure: 'Estrutura Escolar',
    mgmt_maps: 'Mapas de Gestão',
    security_logs: 'Registos de Auditoria',
    access_accounts: 'Contas de Acesso',
    visual_id: 'Identidade Visual',
    sys_audit: 'Auditoria do Sistema',
    communication: 'Comunicação',
    config: 'Configurações',
    logout: 'Sair do Sistema',
    welcome: 'Bem-vindo',
    search: 'Pesquisar...',
    login_btn: 'LOGIN',
    login_title: 'Acesso ao Sistema',
    login_subtitle: 'Insira as suas credenciais para aceder ao Intra IMEL.',
    process_number: 'Número de Processo',
    password: 'Palavra-passe',
    forgot_password: 'Esqueci a minha senha',
    create_account: 'Não tem conta? Criar conta',
    start_now: 'Aceder à Plataforma',
    features: 'Funcionalidades',
    location: 'Localização',
    find_us: 'Onde Estamos',
    demo: 'Visão Geral',
    contact_form_title: 'Contacte-nos',
    contact_form_subtitle: 'Para questões técnicas ou administrativas, envie-nos uma mensagem.',
    name_label: 'Nome Completo',
    email_label: 'Endereço de E-mail',
    message_label: 'Assunto / Mensagem',
    send_message_btn: 'ENVIAR MENSAGEM',
    advantages_title: 'Vantagens do Intra IMEL',
    why_use_title: 'Porquê utilizar o sistema?',
    advantage_1: 'Centralização de Dados',
    advantage_2: 'Comunicação Directa',
    advantage_3: 'Monitorização',
    advantage_4: 'Eficiência',
    advantage_5: 'Transparência',
    advantage_6: 'Segurança',
    why_text:
      'O Intra IMEL é a plataforma digital oficial do Instituto Médio de Economia de Luanda, proporcionando acesso centralizado a informações académicas, recursos didácticos e serviços administrativos.',
    nav_features: 'Funcionalidades',
    nav_advantages: 'Vantagens',
    nav_location: 'Localização',
    login_with: 'Entrar com',
    student: 'Aluno',
    teacher: 'Professor',
    guardian: 'Encarregado',
    director: 'Diretor',
    admin: 'Administrador',
    footer_text: '© {year} {school}. Todos os direitos reservados.',
  },
};
