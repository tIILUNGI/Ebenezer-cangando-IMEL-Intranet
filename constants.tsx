import { 
  LayoutDashboard, Users, ClipboardList, Calendar, FileText, MessageSquare, 
  Settings, BarChart3, Palette, Activity, FileStack,
  BookOpen, Zap, Globe, ShieldAlert,
  User as UserIcon, Clock
} from 'lucide-react';
import { UserRole, SidebarItem, Grade, ClassSchedule, User } from './types';

export const DEFAULT_PRIMARY_COLOR = '#003366'; 
export const DEFAULT_SECONDARY_COLOR = '#FFD700'; 
export const DEFAULT_SCHOOL_NAME = 'Instituto Médio de Economia de Luanda';
export const DEFAULT_SCHOOL_ACRONYM = 'Intra IMEL';

const generateUniqueMockStudents = (): User[] => {
  const students: User[] = [];
  const names = [
    "Alexandre Alfredo Tumbo", "Antonio Quissanga", "Pedro Afonso", "Maria Diniz", "António Costa", 
    "Beatriz Silva", "Carlos Jorge", "Daniela Bento", "Edgar Neto", "Feliciana Cruz",
    "Gabriel Luamba", "Helena Paulo", "Igor Gomes", "Janeth Faria", "Kevin Santos",
    "Lurdes Mendes", "Manuel Diogo", "Nádia Rocha", "Osvaldo Jamba", "Patrícia Lima",
    "Quintino Vaz", "Rosa Mateus", "Sérgio Vunge", "Teresa Gunga", "Uíge Manuel",
    "Valter Nery", "Wilson Cabaça", "Xavier Tchipenda", "Yuri Boy", "Zuleica Graça",
    "Alberto Kiala", "Branca de Neve", "Custódio Mateus", "Diogo Cão", "Evaristo Costa"
  ];

  names.forEach((name, index) => {
    students.push({
      id: `std-${index + 1}`,
      name: name,
      processNumber: `aluno${index + 1}123`,
      role: UserRole.ALUNO,
      turma: 'I12B (Inf. Gestão)',
      password: `aluno${index + 1}123`,
      isActive: false
    });
  });
  return students;
};

export const TEST_USERS: User[] = [
  ...generateUniqueMockStudents(),
  { id: '2', name: 'Eduardo Zamith', processNumber: 'professor123', role: UserRole.PROFESSOR, password: 'professor123', isActive: true }, 
  { id: '3', name: 'Ebenezer Vilola', processNumber: 'admin123', role: UserRole.ADMIN, password: 'admin123', isActive: true },
  { id: '4', name: 'Lizandro Sony', processNumber: 'diretor123', role: UserRole.DIRETOR, password: 'diretor123', isActive: true },
  { id: '5', name: 'Rita José', processNumber: 'encarregado123', role: UserRole.ENCARREGADO, studentIds: ['std-1', 'std-2'], password: 'encarregado123', isActive: false },
  { id: 'sec-1', name: 'António Quissanga', processNumber: 'secretaria123', role: UserRole.ADMIN, password: 'secretaria123', isActive: true, turma: 'I12B (Inf. Gestão)' }
];

export const SIDEBAR_LINKS: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Painel do Aluno', path: '/dashboard', roles: [UserRole.ALUNO] },
  { icon: FileText, label: 'Minhas Notas', path: '/notas', roles: [UserRole.ALUNO] },
  { icon: Clock, label: 'Minha Assiduidade', path: '/frequencia', roles: [UserRole.ALUNO] },
  { icon: Calendar, label: 'Horário de Aulas', path: '/horario', roles: [UserRole.ALUNO, UserRole.PROFESSOR] },
  
  { icon: LayoutDashboard, label: 'Painel Docente', path: '/dashboard', roles: [UserRole.PROFESSOR] },
  { icon: ClipboardList, label: 'Lançar Notas', path: '/gestao-notas', roles: [UserRole.PROFESSOR] },
  
  { icon: LayoutDashboard, label: 'Portal do Encarregado', path: '/dashboard', roles: [UserRole.ENCARREGADO] },
  { icon: FileText, label: 'Notas do Educando', path: '/notas', roles: [UserRole.ENCARREGADO] },
  
  { icon: LayoutDashboard, label: 'Gabinete Estratégico', path: '/dashboard', roles: [UserRole.DIRETOR] },
  { icon: BarChart3, label: 'Análise de Desempenho', path: '/stats', roles: [UserRole.DIRETOR] },
  { icon: Activity, label: 'Controlo Pedagógico', path: '/direcao/professores', roles: [UserRole.DIRETOR] },
  { icon: Users, label: 'Gestão de Matrículas', path: '/direcao/alunos', roles: [UserRole.DIRETOR] },
  { icon: Globe, label: 'Estrutura Escolar', path: '/direcao/institucional', roles: [UserRole.DIRETOR] },
  { icon: FileStack, label: 'Mapas Gerenciais', path: '/direcao/relatorios', roles: [UserRole.DIRETOR] },
  { icon: ShieldAlert, label: 'Logs de Segurança', path: '/direcao/auditoria', roles: [UserRole.DIRETOR, UserRole.ADMIN] },

  { icon: Zap, label: 'Consola de Gestão', path: '/dashboard', roles: [UserRole.ADMIN] },
  { icon: Users, label: 'Contas de Acesso', path: '/admin/usuarios', roles: [UserRole.ADMIN] },
  { icon: Palette, label: 'Identidade Visual', path: '/admin/branding', roles: [UserRole.ADMIN] },
  
  { icon: UserIcon, label: 'Meu Perfil', path: '/perfil', roles: [UserRole.ALUNO, UserRole.PROFESSOR, UserRole.ENCARREGADO, UserRole.DIRETOR] },
  { icon: Settings, label: 'Definições do Sistema', path: '/admin/branding', roles: [UserRole.ADMIN] },

  { icon: BookOpen, label: 'Biblioteca Digital', path: '/biblioteca', roles: Object.values(UserRole) },
  { icon: MessageSquare, label: 'Comunicação', path: '/mensagens', roles: Object.values(UserRole) },
];

const generateMockGrades = (): Grade[] => {
  const allGrades: Grade[] = [];
  const subjects = [
    { name: 'TLP', teacherId: '2' },
    { name: 'TRECE (Redes)', teacherId: '2' },
    { name: 'Sistemas de Info.', teacherId: '99' },
    { name: 'Matemática', teacherId: '98' },
    { name: 'Inglês Técnico', teacherId: '96' },
    { name: 'IAG', teacherId: '97' },
    { name: 'Empreendedorismo', teacherId: '97' },
    { name: 'Inglês Técnico', teacherId: '95' },
    { name: 'OAE', teacherId: '2' },
    { name: 'PT', teacherId: '94' }
  ];

  const students = generateUniqueMockStudents();

  students.forEach((student) => {
    subjects.forEach((subject, sIdx) => {
      const mac = 10 + Math.floor(Math.random() * 8);
      const npp = 10 + Math.floor(Math.random() * 8);
      const npt = 10 + Math.floor(Math.random() * 8);
      const avg = Math.round((mac + npp + npt) / 3);

      allGrades.push({
        id: `g-${student.id}-${sIdx}`,
        studentId: student.id,
        studentName: student.name,
        subject: subject.name,
        faltas: Math.floor(Math.random() * 3),
        teacherId: subject.teacherId,
        t1: { mac, npp, npt, average: avg },
        t2: { mac: null, npp: null, npt: null, average: null },
        t3: { mac: null, npp: null, npt: null, average: null }
      });
    });
  });

  return allGrades;
};

export const MOCK_GRADES: Grade[] = generateMockGrades();

const times = ['07:30 - 09:00', '09:15 - 10:45', '11:00 - 12:30', '12:45 - 14:15'];
const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const generateFullSchedule = (): ClassSchedule[] => {
  const schedule: ClassSchedule[] = [];
  const subjectsPool = [
    'Matemática', 'TLP (Teoria)', 'TRECE (Redes)', 'Língua Portuguesa', 
    'SI (Gestão)', 'OGE', 'Inglês Técnico', 'TLP (Prática)', 
    'TRECE (Prática)', 'Educação Física', 'Empreendedorismo', 'PAPE'
  ];

  days.forEach(day => {
    times.forEach((time, tIdx) => {
      const randomSub = subjectsPool[Math.floor(Math.random() * subjectsPool.length)];
      schedule.push({
        id: `sch-${day}-${tIdx}`,
        day,
        time,
        subject: randomSub,
        room: tIdx % 2 === 0 ? 'Sala 24' : 'Lab 03',
        turma: 'I12B',
        teacherId: randomSub.includes('TLP') || randomSub.includes('TRECE') ? '2' : '99'
      });
    });
  });
  return schedule;
};

export const MOCK_SCHEDULE: ClassSchedule[] = generateFullSchedule();




