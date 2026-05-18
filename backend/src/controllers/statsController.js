const { run, get, all } = require('../database');

const getAcademicStats = async (req, res) => {
  try {
    const approvalData = [];
    const classes = ['10ª Classe', '11ª Classe', '12ª Classe', '13ª Classe'];

    for (const className of classes) {
      const totalByClass = await all(
        `SELECT COUNT(*) as total, 
         SUM(CASE WHEN p.media >= 10 THEN 1 ELSE 0 END) as aprovados,
         SUM(CASE WHEN p.media < 10 OR p.media IS NULL THEN 1 ELSE 0 END) as reprovados
         FROM pautas p 
         JOIN usuarios u ON p.aluno_id = u.id 
         WHERE u.turma LIKE ? AND p.trimestre = 1`,
        [`%${className.split('ª')[0]}%`]
      );

      approvalData.push({
        name: className,
        aprovados: totalByClass[0].aprovados || 0,
        reprovados: totalByClass[0].reprovados || 0,
        total: totalByClass[0].total || 0,
      });
    }

    // Course ranking
    const ranking = await all(
      `SELECT u.turma as curso, COUNT(*) as total_alunos,
       AVG(p.media) as media_geral,
       SUM(CASE WHEN p.media >= 10 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as taxa_aprovacao
       FROM pautas p
       JOIN usuarios u ON p.aluno_id = u.id
       WHERE p.trimestre = 1
       GROUP BY u.turma
       ORDER BY media_geral DESC`
    );

    // Top courses manually for demo (enhanced with real data if available)
    const topCourses =
      ranking.length > 0
        ? ranking.map((r, i) => ({
            rank: i + 1,
            curso: r.curso,
            perc: Math.round(r.taxa_aprovacao || 0),
            students: r.total_alunos,
          }))
        : [
            { rank: 1, curso: 'Contabilidade', perc: 94, students: 450 },
            { rank: 2, curso: 'Gestão Empresarial', perc: 88, students: 620 },
            { rank: 3, curso: 'Economia Política', perc: 82, students: 510 },
            { rank: 4, curso: 'Informática de Gestão', perc: 75, students: 380 },
          ];

    // Discipline with lowest performance
    const declineAlert = await all(
      `SELECT d.nome as discipline, AVG(p.media) as avg_media 
       FROM pautas p JOIN disciplinas d ON p.disciplina_id = d.id 
       WHERE p.trimestre = 1 GROUP BY d.nome ORDER BY avg_media ASC LIMIT 1`
    );

    res.json({ approvalData, topCourses, declineAlert: declineAlert[0] || null });
  } catch (err) {
    console.error('Academic stats error:', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

const getKPIs = async (req, res) => {
  try {
    const totalStudents = await get('SELECT COUNT(*) as count FROM usuarios WHERE role = "Aluno"');
    const totalTeachers = await get(
      'SELECT COUNT(*) as count FROM usuarios WHERE role = "Professor"'
    );
    const totalUsers = await get('SELECT COUNT(*) as count FROM usuarios');
    const activeUsers = await get('SELECT COUNT(*) as count FROM usuarios WHERE is_active = 1');
    const avgPassRate = await get(`SELECT AVG(media) as avg FROM pautas WHERE trimestre = 1`);
    const totalLogs = await get('SELECT COUNT(*) as count FROM logs_auditoria');
    const recentLogs = await all(`SELECT * FROM logs_auditoria ORDER BY timestamp DESC LIMIT 5`);

    res.json({
      totalStudents: totalStudents.count,
      totalTeachers: totalTeachers.count,
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      avgPassRate: avgPassRate.avg ? Math.round(avgPassRate.avg * 100) / 100 : 0,
      totalLogs: totalLogs.count,
      recentLogs,
    });
  } catch (err) {
    console.error('KPIs error:', err);
    res.status(500).json({ error: 'Erro ao buscar KPIs' });
  }
};

module.exports = { getAcademicStats, getKPIs };
