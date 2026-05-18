import api, {
  usersAPI,
  gradesAPI,
  scheduleAPI,
  libraryAPI,
  messagesAPI,
  notificationsAPI,
  statsAPI,
  profileAPI,
  auditAPI,
  settingsAPI,
} from './client';

// Users
export const fetchUsers = () => usersAPI.getAll();
export const fetchUser = (id: string) => usersAPI.getById(id);
export const createUser = (data: unknown) => usersAPI.create(data);
export const updateUser = (id: string, data: unknown) => usersAPI.update(id, data);
export const deleteUser = (id: string) => usersAPI.delete(id);
export const changePassword = (data: unknown) => usersAPI.changePassword(data);
export const exportUsersCSV = () => usersAPI.exportCSV();

// Grades
export const fetchGrades = (params?: unknown) => gradesAPI.get(params);
export const fetchStudentGrades = (studentId: string) => gradesAPI.getStudentGrades(studentId);
export const updateGrade = (id: string, data: unknown) => gradesAPI.update(id, data);

// Schedule
export const fetchSchedule = (params?: unknown) => scheduleAPI.get(params);
export const fetchSubjects = () => scheduleAPI.getSubjects();
export const createScheduleEntry = (data: unknown) => scheduleAPI.create(data);
export const updateScheduleEntry = (id: string, data: unknown) => scheduleAPI.update(id, data);
export const deleteScheduleEntry = (id: string) => scheduleAPI.delete(id);

// Library
export const fetchLibrary = (params?: unknown) => libraryAPI.get(params);
export const uploadLibraryResource = (formData: FormData) => libraryAPI.upload(formData);
export const incrementLibraryDownload = (id: string) => libraryAPI.incrementDownload(id);
export const deleteLibraryResource = (id: string) => libraryAPI.delete(id);

// Messages
export const fetchMessages = () => messagesAPI.getInbox();
export const sendMessage = (data: unknown) => messagesAPI.send(data);
export const fetchContacts = () => messagesAPI.getContacts();
export const fetchConversations = () => messagesAPI.getConversations();
export const markMessageRead = (id: string) => messagesAPI.markRead(id);

// Notifications
export const fetchNotifications = () => notificationsAPI.get();
export const markNotificationRead = (id: string) => notificationsAPI.markRead(id);
export const clearNotifications = () => notificationsAPI.clear();
export const createAnnouncement = (data: unknown) => notificationsAPI.createAnnouncement(data);

// Stats
export const fetchAcademicStats = () => statsAPI.getAcademicStats();
export const fetchKPIs = () => statsAPI.getKPIs();

// Profile
export const fetchProfile = () => profileAPI.getProfile();
export const updateProfile = (data: unknown) => profileAPI.updateProfile(data);
export const exportProfileData = () => profileAPI.exportData();

// Audit
export const fetchAuditLogs = (params?: unknown) => auditAPI.get(params);
export const exportAuditLogs = () => auditAPI.export();

// Settings
export const updateSettings = (data: unknown) => settingsAPI.update(data);

// Auth re-exports
export {
  login,
  logout,
  refreshAuthToken,
  getCurrentUser,
  isAuthenticated,
  register,
  forgotPassword,
  resetPassword,
} from './auth';

export default {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  exportUsersCSV,
  fetchGrades,
  fetchStudentGrades,
  updateGrade,
  fetchSchedule,
  fetchSubjects,
  createScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry,
  fetchLibrary,
  uploadLibraryResource,
  incrementLibraryDownload,
  deleteLibraryResource,
  fetchMessages,
  sendMessage,
  fetchContacts,
  fetchConversations,
  markMessageRead,
  fetchNotifications,
  markNotificationRead,
  clearNotifications,
  createAnnouncement,
  fetchAcademicStats,
  fetchKPIs,
  fetchProfile,
  updateProfile,
  exportProfileData,
  fetchAuditLogs,
  exportAuditLogs,
  updateSettings,
};
