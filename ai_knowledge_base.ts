// Roteiro de Perguntas e Respostas para o Assistente Virtual (IA)
// Este arquivo contém uma base de conhecimento estática para ser usada quando a API não estiver disponível.

export const AI_KNOWLEDGE_BASE = [
  // --- Acesso e Login ---
  { q: "Como faço login?", a: "Utilize o seu número de processo e a palavra-passe na tela inicial." },
  { q: "Esqueci a minha senha", a: "Clique em 'Esqueceu a palavra-passe?' na tela de login e siga as instruções para recuperar com seu nº de processo e BI." },
  { q: "Não consigo entrar", a: "Verifique se o Caps Lock está ativado e se digitou o número de processo corretamente. Se o problema persistir, contacte a secretaria." },
  { q: "Como criar conta?", a: "Na tela de login, clique em 'Criar conta agora', insira seu número de processo e siga os passos." },
  { q: "Onde vejo meu número de processo?", a: "O número de processo encontra-se no seu cartão de estudante ou recibo de matrícula." },
  
  // --- Notas e Pautas ---
  { q: "Como ver minhas notas?", a: "Aceda ao menu 'Minhas Notas' no painel lateral para ver o boletim detalhado." },
  { q: "Quando saem as pautas?", a: "As pautas são publicadas trimestralmente após os conselhos de notas." },
  { q: "Como baixar o boletim?", a: "Na página de Notas, clique no botão 'Baixar Boletim' no canto superior direito." },
  { q: "Minha nota está errada", a: "Contacte o professor da disciplina ou o diretor de turma para verificação." },
  { q: "O que é MAC?", a: "MAC significa Média de Avaliação Contínua." },
  { q: "O que é NPP?", a: "NPP significa Nota da Prova do Professor." },
  { q: "O que é NPT?", a: "NPT significa Nota da Prova Trimestral." },
  
  // --- Biblioteca ---
  { q: "Como baixar livros?", a: "Vá até à 'Biblioteca' no menu e clique em 'Descarregar Arquivo' no livro desejado." },
  { q: "Posso enviar livros?", a: "Apenas professores podem publicar materiais na biblioteca." },
  { q: "Não encontro o manual", a: "Utilize a barra de pesquisa na Biblioteca para filtrar por nome ou disciplina." },
  
  // --- Horários ---
  { q: "Qual meu horário?", a: "Consulte a opção 'Horário' no menu lateral para ver a grade semanal." },
  { q: "O horário mudou?", a: "Qualquer alteração no horário será notificada na página inicial ou pelo diretor de turma." },
  
  // --- Administrativo ---
  { q: "Como pagar propinas?", a: "O pagamento de propinas é feito via referência bancária. Consulte a secretaria para obter as coordenadas." },
  { q: "Como pedir declaração?", a: "Dirija-se à Secretaria Académica ou envie uma mensagem pelo menu 'Gabinete Online' no Dashboard." },
  { q: "Onde fica a secretaria?", a: "A secretaria fica no Bloco Administrativo, piso térreo." },
  
  // --- Coordenação (Novas Funcionalidades) ---
  { q: "Sou coordenador, o que faço?", a: "Se for coordenador, verá um cartão especial no seu Dashboard para aceder à gestão do curso ou turma." },
  { q: "Como gerir minha turma?", a: "Aceda ao painel de Coordenação de Turma para ver a lista de alunos e médias." },
  { q: "Como ver estatísticas do curso?", a: "No painel de Coordenação de Curso, você tem acesso ao total de alunos e turmas do curso." },
  
  // --- Diversos ---
  { q: "Quem é o diretor?", a: "O Diretor Geral é o Dr. Augusto Feliciano." },
  { q: "Qual o email da escola?", a: "O email de suporte é suporte@imel.edu.ao." },
  { q: "Tem wifi na escola?", a: "Sim, existe rede wifi para fins académicos na biblioteca e laboratórios." },
];

// Função auxiliar para gerar mais perguntas baseadas em padrões para atingir o volume de 300+
export const generateExtendedKnowledgeBase = () => {
  const base = [...AI_KNOWLEDGE_BASE];
  const subjects = ['TLP', 'Matemática', 'Física', 'Inglês', 'TRECE', 'SEAC', 'OGE', 'Empreendedorismo'];
  const actions = ['ver', 'consultar', 'saber', 'descobrir'];
  const targets = ['nota', 'média', 'professor', 'horário'];

  subjects.forEach(sub => {
    base.push({ q: `Quem é o professor de ${sub}?`, a: `Consulte o seu horário para ver o professor de ${sub}.` });
  });

  // Lógica para expandir para mais de 300 perguntas
  // ...

  return base;
};