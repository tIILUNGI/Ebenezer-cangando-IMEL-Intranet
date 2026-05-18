const { run, get, all } = require('../database');

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, user } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT l.*, u.nome as user_name FROM logs_auditoria l LEFT JOIN usuarios u ON l.usuario_id = u.id WHERE 1=1`;
    const params = [];

    if (action) {
      query += ' AND l.acao LIKE ?';
      params.push(`%${action}%`);
    }
    if (user) {
      query += ' AND u.nome LIKE ?';
      params.push(`%${user}%`);
    }

    query += ' ORDER BY l.timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const logs = await all(query, params);
    const totalResult = await all('SELECT COUNT(*) as total FROM logs_auditoria');
    const total = totalResult[0] ? totalResult[0].total : 0;

    res.json({
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Get audit logs error:', err);
    res.status(500).json({ error: 'Erro ao buscar logs de auditoria' });
  }
};

const exportAuditLogs = async (req, res) => {
  try {
    const logs = await all('SELECT * FROM logs_auditoria ORDER BY timestamp DESC');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    );
    const header = 'ID;Utilizador;Ação;Módulo;Alvo;Detalhes;IP;Data/Hora\n';
    const rows = logs
      .map((l) =>
        [
          l.id,
          l.usuario_id,
          l.acao,
          l.modulo || '',
          l.alvo_id || '',
          l.detalhes || '',
          l.ip_endereco || '',
          l.timestamp,
        ].join(';')
      )
      .join('\n');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao exportar logs' });
  }
};

module.exports = { getAuditLogs, exportAuditLogs };
