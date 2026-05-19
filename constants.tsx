import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Palette,
  Activity,
  FileStack,
  BookOpen,
  Zap,
  Globe,
  ShieldAlert,
  User as UserIcon,
  Clock,
  Megaphone,
  HelpCircle,
} from 'lucide-react';
import { UserRole, SidebarItem, Grade, ClassSchedule, User } from './types';

export const DEFAULT_PRIMARY_COLOR = '#003366';
export const DEFAULT_SECONDARY_COLOR = '#FFD700';
export const DEFAULT_SCHOOL_NAME = 'Instituto Médio de Economia de Luanda';
export const DEFAULT_SCHOOL_ACRONYM = 'Intra IMEL';

const generateUniqueMockStudents = (): User[] => {
  const students: User[] = [];
  const names = [
    'Alexandre Alfredo Tumbo',
    'Antonio Quissanga',
    'Pedro Afonso',
    'Maria Diniz',
    'António Costa',
    'Beatriz Silva',
    'Carlos Jorge',
    'Daniela Bento',
    'Edgar Neto',
    'Feliciana Cruz',
    'Gabriel Luamba',
    'Helena Paulo',
    'Igor Gomes',
    'Janeth Faria',
    'Kevin Santos',
    'Lurdes Mendes',
    'Manuel Diogo',
    'Nádia Rocha',
    'Osvaldo Jamba',
    'Patrícia Lima',
    'Quintino Vaz',
    'Rosa Mateus',
    'Sérgio Vunge',
    'Teresa Gunga',
    'Uíge Manuel',
    'Valter Nery',
    'Wilson Cabaça',
    'Xavier Tchipenda',
    'Yuri Boy',
    'Zuleica Graça',
    'Alberto Kiala',
    'Branca de Neve',
    'Custódio Mateus',
    'Diogo Cão',
    'Evaristo Costa',
  ];

  const contabNames = [
    'Fernanda Kiala',
    'Gelson Neto',
    'Heloísa Paulo',
    'Ivan Santos',
    'Jéssica Tchipenda',
    'Amanda Sanda',
    'Paulo Domingos',
    'Lúcia Abdalla',
  ];

  const comunicaNames = [
    'Kélsia Muanda',
    'Lúcio Costa',
    'Márcia Sebastião',
    'Nelo Vunge',
    'Orlando Gunga',
    'Patrícia Machado',
    'Ricardo Tito',
    'Beatriz dos Santos',
  ];

  names.forEach((name, index) => {
    students.push({
      id: `std-${index + 1}`,
      name: name,
      processNumber: `aluno${index + 1}123`,
      role: UserRole.ALUNO,
      turma: 'I12B (Inf. Gestão)',
      password: `aluno${index + 1}123`,
      isActive: true,
    });
  });

  contabNames.forEach((name, index) => {
    students.push({
      id: `std-c12a-${index + 1}`,
      name,
      processNumber: `contab${index + 1}123`,
      role: UserRole.ALUNO,
      turma: 'C12A (Contabilidade)',
      password: `contab${index + 1}123`,
      isActive: true,
    });
  });

  comunicaNames.forEach((name, index) => {
    students.push({
      id: `std-c12b-${index + 1}`,
      name,
      processNumber: `comunica${index + 1}123`,
      role: UserRole.ALUNO,
      turma: 'C12B (Comunicação Social)',
      password: `comunica${index + 1}123`,
      isActive: true,
    });
  });

  return students;
};

export const TEST_USERS: User[] = [
  ...generateUniqueMockStudents(),
  {
    id: '2',
    name: 'Eduardo Zamith',
    processNumber: 'professor123',
    role: UserRole.PROFESSOR,
    password: 'professor123',
    isActive: true,
    turma: 'I12B (Inf. Gestão)', // Existing professor for Informática de Gestão
  },
  {
    id: '3',
    name: 'Ebenezer Vilola',
    processNumber: 'admin123',
    role: UserRole.ADMIN,
    password: 'admin123',
    isActive: true,
  },
  {
    id: '4',
    name: 'Lizandro Sony',
    processNumber: 'diretor123',
    role: UserRole.DIRETOR,
    password: 'diretor123',
    isActive: true,
  },
  {
    id: '5',
    name: 'Rita José',
    processNumber: 'encarregado123',
    role: UserRole.ENCARREGADO,
    studentIds: ['std-1', 'std-2'],
    password: 'encarregado123',
    isActive: true,
  },
  {
    id: 'sec-1',
    name: 'António Quissanga',
    processNumber: 'secretaria123',
    role: UserRole.ADMIN,
    password: 'secretaria123',
    isActive: true,
    turma: 'I12B (Inf. Gestão)',
  },
  // Professor for Contabilidade
  {
    id: '6',
    name: 'Carlos Contabilidade',
    processNumber: 'contabilidade123',
    role: UserRole.PROFESSOR,
    password: 'contabilidade123',
    isActive: true,
    turma: 'C12A (Contabilidade)',
  },
  // Professor for Comunicação Social
  {
    id: '7',
    name: 'Maria Comunicação',
    processNumber: 'comunicacao123',
    role: UserRole.PROFESSOR,
    password: 'comunicacao123',
    isActive: true,
    turma: 'C12B (Comunicação Social)',
  },
  // Encarregado for Contabilidade (C12A)
  {
    id: 'enc-c12a-1',
    name: 'Manuel da Conta',
    processNumber: 'enc_c12a_1',
    role: UserRole.ENCARREGADO,
    studentIds: ['std-c12a-1', 'std-c12a-2', 'std-c12a-3'],
    password: 'enc_c12a_1',
    isActive: true,
  },
  // Encarregado for Comunicação Social (C12B)
  {
    id: 'enc-c12b-1',
    name: 'Sofia Media',
    processNumber: 'enc_c12b_1',
    role: UserRole.ENCARREGADO,
    studentIds: ['std-c12b-1', 'std-c12b-2', 'std-c12b-3'],
    password: 'enc_c12b_1',
    isActive: true,
  },
  // ─── Teachers extra ─────────────────────────────────────────────────────
  {
    id: 'tch-1',
    name: 'Fernanda Guimarães',
    processNumber: 'contab2_prof',
    role: UserRole.PROFESSOR,
    password: 'contab2_prof',
    isActive: true,
    turma: 'C12A (Contabilidade)',
  },
  {
    id: 'tch-2',
    name: 'Rui Manuel',
    processNumber: 'comunic2_prof',
    role: UserRole.PROFESSOR,
    password: 'comunic2_prof',
    isActive: true,
    turma: 'C12B (Comunicação Social)',
  },
  {
    id: 'tch-3',
    name: 'Ana Macedo',
    processNumber: 'gest2_prof',
    role: UserRole.PROFESSOR,
    password: 'gest2_prof',
    isActive: true,
    turma: 'I12B (Inf. Gestão)',
  },
  // ─── Encarregados extra ────────────────────────────────────────────────
  {
    id: 'enc-2',
    name: 'Pedro António',
    processNumber: 'enc_c12a_2',
    role: UserRole.ENCARREGADO,
    studentIds: ['std-c12a-6', 'std-c12a-7'],
    password: 'enc_c12a_2',
    isActive: true,
  },
  {
    id: 'enc-3',
    name: 'Catarina Lima',
    processNumber: 'enc_c12b_2',
    role: UserRole.ENCARREGADO,
    studentIds: ['std-c12b-6', 'std-c12b-7'],
    password: 'enc_c12b_2',
    isActive: true,
  },
  {
    id: 'enc-4',
    name: 'José Muanda',
    processNumber: 'enc_ig_1',
    role: UserRole.ENCARREGADO,
    studentIds: ['std-1', 'std-3', 'std-5'],
    password: 'enc_ig_1',
    isActive: true,
  },
];

/** Turmas registadas no sistema. Nova turma deve ser adicionada aqui primeiro
    e no formulário de Gestão de Contas o campo Turma passa下拉 para ela aparecer. */
export const KNOWN_TURMAS = [
  'I12B (Inf. Gestão)',
  'C12A (Contabilidade)',
  'C12B (Comunicação Social)',
] as const;

export const SIDEBAR_LINKS: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Painel do Aluno', path: '/dashboard', roles: [UserRole.ALUNO] },
  { icon: FileText, label: 'Minhas Notas', path: '/notas', roles: [UserRole.ALUNO] },
  { icon: Clock, label: 'Minha Assiduidade', path: '/frequencia', roles: [UserRole.ALUNO] },
  {
    icon: Calendar,
    label: 'Horário de Aulas',
    path: '/horario',
    roles: [UserRole.ALUNO, UserRole.PROFESSOR],
  },

  {
    icon: LayoutDashboard,
    label: 'Painel Docente',
    path: '/dashboard',
    roles: [UserRole.PROFESSOR],
  },
  {
    icon: ClipboardList,
    label: 'Lançar Notas',
    path: '/gestao-notas',
    roles: [UserRole.PROFESSOR],
  },

  {
    icon: LayoutDashboard,
    label: 'Portal do Encarregado',
    path: '/dashboard',
    roles: [UserRole.ENCARREGADO],
  },
  { icon: FileText, label: 'Notas do Educando', path: '/notas', roles: [UserRole.ENCARREGADO] },

  {
    icon: LayoutDashboard,
    label: 'Gabinete Estratégico',
    path: '/dashboard',
    roles: [UserRole.DIRETOR],
  },
  { icon: BarChart3, label: 'Análise de Desempenho', path: '/stats', roles: [UserRole.DIRETOR] },
  {
    icon: Activity,
    label: 'Controlo Pedagógico',
    path: '/direcao/professores',
    roles: [UserRole.DIRETOR],
  },
  {
    icon: Users,
    label: 'Gestão de Matrículas',
    path: '/direcao/alunos',
    roles: [UserRole.DIRETOR],
  },
  {
    icon: Globe,
    label: 'Estrutura Escolar',
    path: '/direcao/institucional',
    roles: [UserRole.DIRETOR],
  },
  {
    icon: FileStack,
    label: 'Mapas Gerenciais',
    path: '/direcao/relatorios',
    roles: [UserRole.DIRETOR],
  },
  {
    icon: ShieldAlert,
    label: 'Logs de Segurança',
    path: '/direcao/auditoria',
    roles: [UserRole.DIRETOR, UserRole.ADMIN],
  },

  { icon: Zap, label: 'Consola de Gestão', path: '/dashboard', roles: [UserRole.ADMIN] },
  { icon: Users, label: 'Contas de Acesso', path: '/admin/usuarios', roles: [UserRole.ADMIN] },
  { icon: Palette, label: 'Identidade Visual', path: '/admin/branding', roles: [UserRole.ADMIN] },

  {
    icon: UserIcon,
    label: 'Meu Perfil',
    path: '/perfil',
    roles: [UserRole.ALUNO, UserRole.PROFESSOR, UserRole.ENCARREGADO, UserRole.DIRETOR],
  },
  {
    icon: Settings,
    label: 'Definições do Sistema',
    path: '/admin/branding',
    roles: [UserRole.ADMIN],
  },

  {
    icon: BookOpen,
    label: 'Biblioteca Digital',
    path: '/biblioteca',
    roles: Object.values(UserRole),
  },
  { icon: Megaphone, label: 'Mural de Avisos', path: '/avisos', roles: Object.values(UserRole) },
  { icon: MessageSquare, label: 'Comunicação', path: '/mensagens', roles: Object.values(UserRole) },
  { icon: HelpCircle, label: 'Ajuda (FAQ)', path: '/ajuda', roles: Object.values(UserRole) },
];

const generateMockGrades = (): Grade[] => {
  const allGrades: Grade[] = [];

  const infGestaoSubjects = [
    { name: 'TLP', teacherId: '2' },
    { name: 'TRECE (Redes)', teacherId: '2' },
    { name: 'Sistemas de Info.', teacherId: '99' },
    { name: 'Matemática', teacherId: '98' },
    { name: 'Inglês Técnico', teacherId: '96' },
    { name: 'IAG', teacherId: '97' },
    { name: 'Empreendedorismo', teacherId: '97' },
    { name: 'Inglês Técnico II', teacherId: '95' },
    { name: 'OAE', teacherId: '2' },
    { name: 'PT', teacherId: '94' },
  ];

  const contabilidadeSubjects = [
    { name: 'Contabilidade Geral', teacherId: '6' },
    { name: 'Contabilidade Fiscal', teacherId: '6' },
    { name: 'Contabilidade de Gestão', teacherId: '6' },
    { name: 'Matemática Financeira', teacherId: '98' },
    { name: 'Economia', teacherId: '97' },
    { name: 'Direito Comercial', teacherId: '99' },
    { name: 'Inglês Técnico', teacherId: '96' },
    { name: 'Empreendedorismo', teacherId: '97' },
    { name: 'Estatística', teacherId: '95' },
    { name: 'Informática Aplicada', teacherId: '2' },
  ];

  const comunicacaoSubjects = [
    { name: 'Jornalismo', teacherId: '7' },
    { name: 'Comunicação Organizacional', teacherId: '7' },
    { name: 'Produção Audiovisual', teacherId: '7' },
    { name: 'Publicidade e Marketing', teacherId: '99' },
    { name: 'Língua Portuguesa', teacherId: '98' },
    { name: 'Inglês Técnico', teacherId: '96' },
    { name: 'Psicologia da Comunicação', teacherId: '97' },
    { name: 'Empreendedorismo', teacherId: '97' },
    { name: 'Design Gráfico', teacherId: '2' },
    { name: 'Ética e Deontologia', teacherId: '95' },
  ];

  const allStudents = generateUniqueMockStudents();
  const infGestaoStudents = allStudents.slice(0, 35);
  const c12aStudents = allStudents.slice(35, 43);   // 8 students (Contabilidade)
  const c12bStudents = allStudents.slice(43, 51);   // 8 students (Comunicação Social)

  const addGradesFor = (students: User[], subjects: { name: string; teacherId: string }[]) => {
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
          t3: { mac: null, npp: null, npt: null, average: null },
        });
      });
    });
  };

  addGradesFor(infGestaoStudents, infGestaoSubjects);
  addGradesFor(c12aStudents, contabilidadeSubjects);
  addGradesFor(c12bStudents, comunicacaoSubjects);

  return allGrades;
};

export const MOCK_GRADES: Grade[] = generateMockGrades();

const times = ['07:30 - 09:00', '09:15 - 10:45', '11:00 - 12:30', '12:45 - 14:15'];
const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const classScheduleConfigs = [
  {
    turma: 'I12B',
    teacherBase: '2',
    subjectsPool: [
      'Matemática', 'TLP (Teoria)', 'TRECE (Redes)',
      'Língua Portuguesa', 'SI (Gestão)', 'OGE',
      'Inglês Técnico', 'TLP (Prática)', 'TRECE (Prática)',
      'Educação Física', 'Empreendedorismo', 'PAPE',
    ],
    rooms: ['Sala 24', 'Lab 03'],
  },
  {
    turma: 'C12A',
    teacherBase: '6',
    subjectsPool: [
      'Contabilidade Geral', 'Contabilidade Fiscal', 'Contabilidade de Gestão',
      'Matemática Financeira', 'Economia', 'Direito Comercial',
      'Inglês Técnico', 'Empreendedorismo', 'Estatística', 'Informática Aplicada',
    ],
    rooms: ['Sala 11', 'Sala 12'],
  },
  {
    turma: 'C12B',
    teacherBase: '7',
    subjectsPool: [
      'Jornalismo', 'Comunicação Organizacional', 'Produção Audiovisual',
      'Publicidade e Marketing', 'Língua Portuguesa', 'Inglês Técnico',
      'Psicologia da Comunicação', 'Empreendedorismo', 'Design Gráfico', 'Ética e Deontologia',
    ],
    rooms: ['Sala 21', 'Sala 22'],
  },
];

const generateFullSchedule = (): ClassSchedule[] => {
  const schedule: ClassSchedule[] = [];
  let idCounter = 0;

  classScheduleConfigs.forEach((cfg) => {
    days.forEach((day) => {
      times.forEach((time) => {
        const randomSub = cfg.subjectsPool[Math.floor(Math.random() * cfg.subjectsPool.length)];
        schedule.push({
          id: `sch-${idCounter++}`,
          day,
          time,
          subject: randomSub,
          room: cfg.rooms[Math.floor(Math.random() * cfg.rooms.length)],
          turma: cfg.turma,
          teacherId: cfg.teacherBase,
        });
      });
    });
  });

  return schedule;
};

export const MOCK_SCHEDULE: ClassSchedule[] = generateFullSchedule();

// Demo library resources
export const DEMO_LIBRARY: any[] = [
  {
    id: 'lib-1',
    title: 'Manual de TLP - Teoria dos Sistemas Lineares',
    subject: 'TLP',
    type: 'PDF',
    size: '2.4MB',
    fileName: 'manual-tlp.pdf',
    dataUrl: '',
    author: 'Prof. Eduardo Zamith',
    downloads: 45,
    date: '2024-01-15',
    turmaTarget: 'Todas',
  },
  {
    id: 'lib-2',
    title: 'Redes de Computadores - Guia Prático',
    subject: 'TRECE (Redes)',
    type: 'PDF',
    size: '3.1MB',
    fileName: 'redes-guia.pdf',
    dataUrl: '',
    author: 'Prof. Eduardo Zamith',
    downloads: 38,
    date: '2024-01-20',
    turmaTarget: 'Todas',
  },
  {
    id: 'lib-3',
    title: 'Contabilidade Geral - Apostila Completa',
    subject: 'Contabilidade Geral',
    type: 'PDF',
    size: '4.2MB',
    fileName: 'contabilidade-apostila.pdf',
    dataUrl: '',
    author: 'Prof. Carlos Contabilidade',
    downloads: 52,
    date: '2024-01-10',
    turmaTarget: 'Todas',
  },
  {
    id: 'lib-4',
    title: 'Jornalismo e Comunicação - Manual do Aluno',
    subject: 'Jornalismo',
    type: 'PDF',
    size: '2.8MB',
    fileName: 'jornalismo-manual.pdf',
    dataUrl: '',
    author: 'Prof. Maria Comunicação',
    downloads: 29,
    date: '2024-01-18',
    turmaTarget: 'Todas',
  },
  {
    id: 'lib-5',
    title: 'Normas ABNT para Trabalhos Acadêmicos',
    subject: 'Geral',
    type: 'PDF',
    size: '1.5MB',
    fileName: 'normas-abnt.pdf',
    dataUrl: '',
    author: 'Direção do IMEL',
    downloads: 78,
    date: '2024-01-05',
    turmaTarget: 'Todas',
  },
];

// Demo announcements
export const DEMO_ANNOUNCEMENTS: any[] = [
  {
    id: 'aviso-pap-1',
    title: 'Calendário Oficial das Defesas da PAP',
    message: 'Atenção a todos! O calendário oficial das defesas da Prova de Aptidão Profissional (PAP) já foi publicado. As defesas terão início no dia 15 de Junho. Verifiquem o vosso horário junto à coordenação do curso e garantam que todos os projetos estejam finalizados.',
    authorName: 'Admin do Sistema',
    timestamp: new Date().toISOString(),
    read: false,
    targetAudience: 'Todos',
    type: 'announcement',
  },
  {
    id: 'aviso-1',
    title: 'Reunião Geral de Pais e Encarregados',
    message: 'Será realizada reunião nos dias 25 e 26 de maio. Todos os encarregados estão convidados a participar.',
    authorName: 'Direção',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    read: false,
    targetAudience: 'Aluno',
    type: 'announcement',
  },
  {
    id: 'aviso-2',
    title: 'Início das Aulas de Recursos',
    message: 'A partir de 1 de junho iniciamos as aulas de recuperação para alunos com notas abaixo de 10.',
    authorName: 'Prof. Eduardo Zamith',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false,
    targetAudience: 'Aluno',
    type: 'announcement',
  },
  {
    id: 'aviso-3',
    title: 'Prazo para Levantamento de Certificados',
    message: 'O prazo para levantamento de certificados de conclusão do ensino médio termina em 30 de junho.',
    authorName: 'Secretaria',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    targetAudience: 'Aluno',
    type: 'announcement',
  },
];
