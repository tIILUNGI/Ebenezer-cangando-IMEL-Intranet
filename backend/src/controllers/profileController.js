const { run, get, all } = require('../database');
const { sanitizeInput } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

const getProfile = async (req, res) => {
  try {
    const user = await get(
      'SELECT id, nome, processo, role, email, turma, avatar_url, telefone, bi, coordinator_type, coordinated_entity FROM usuarios WHERE id = ?',
      [req.user.userId]
    );
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const data = sanitizeInput(req.body);
    const userId = req.user.userId;

    const allowedFields = ['nome', 'email', 'telefone', 'bi'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    // Check email uniqueness if email is being updated
    if (data.email) {
      const existing = await get('SELECT id FROM usuarios WHERE email = ? AND id != ?', [
        data.email,
        userId,
      ]);
      if (existing) return res.status(409).json({ error: 'Email já está em uso' });
    }

    values.push(userId);
    await run(`UPDATE usuarios SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`, [
      ...values,
      new Date().toISOString(),
    ]);

    const updated = await get(
      'SELECT id, nome, processo, role, email, turma, avatar_url, telefone, bi FROM usuarios WHERE id = ?',
      [userId]
    );
    res.json(updated);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

const exportProfileData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await get('SELECT * FROM usuarios WHERE id = ?', [userId]);
    const grades = await all('SELECT * FROM pautas WHERE aluno_id = ?', [userId]);
    const auditLogs = await all('SELECT * FROM logs_auditoria WHERE usuario_id = ?', [userId]);

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dados_pessoais_${user.processo || user.id}_${new Date().toISOString().split('T')[0]}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(22).text('Dados do Perfil - IMEL', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Instituto Médio de Economia de Luanda`, { align: 'center' });
    doc.moveDown(1);

    // Add a separator line
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // User Info Section
    doc.fontSize(18).text('Informações Pessoais', { underline: true });
    doc.moveDown(0.5);
    
    const userInfo = [
      { label: 'Nome:', value: user.nome },
      { label: 'Processo:', value: user.processo },
      { label: 'Role (Função):', value: user.role },
      { label: 'Email:', value: user.email || 'Não informado' },
      { label: 'Turma:', value: user.turma || 'Não informado' },
      { label: 'Telefone:', value: user.telefone || 'Não informado' },
      { label: 'BI/NIF:', value: user.bi || 'Não informado' },
      { label: 'Status:', value: user.status || 'Ativo' },
      { label: 'Último Login:', value: user.ultimo_login ? new Date(user.ultimo_login).toLocaleString() : 'Nunca' },
      { label: 'Data de Criação:', value: user.created_at ? new Date(user.created_at).toLocaleString() : 'Não informado' }
    ];

    userInfo.forEach(info => {
      doc.fontSize(12)
        .text(`${info.label} ${info.value}`, { continued: true })
        .moveDown(0.3);
    });

    doc.moveDown(1);

    // Academic Records Section (only for students)
    if (user.role === 'Aluno' && grades.length > 0) {
      doc.fontSize(18).text('Registros Acadêmicos', { underline: true });
      doc.moveDown(0.5);
      
      // Group grades by disciplina for better organization
      const gradesByDisciplina = {};
      grades.forEach(grade => {
        if (!gradesByDisciplina[grade.disciplina_id]) {
          gradesByDisciplina[grade.disciplina_id] = [];
        }
        gradesByDisciplina[grade.disciplina_id].push(grade);
      });

      let hasGrades = false;
      for (const [disciplinaId, disciplinaGrades] of Object.entries(gradesByDisciplina)) {
        // We don't have discipline names in this query, but we can show the ID
        doc.fontSize(14).text(`Disciplina ID: ${disciplinaId}`, { underline: true });
        doc.moveDown(0.3);
        
        disciplinaGrades.forEach((grade, index) => {
          hasGrades = true;
          doc.fontSize(11)
            .text(`Trimestre ${grade.trimestre}:`, { continued: true })
            .text(` MAC: ${grade.mac || 0} | NPP: ${grade.npp || 0} | NPT: ${grade.npt || 0} | Média: ${grade.media || 0} | Faltas: ${grade.faltas || 0}`)
            .moveDown(0.2);
        });
        doc.moveDown(0.5);
      }

      if (!hasGrades) {
        doc.fontSize(12).text('Nenhum registro acadêmico disponível.').moveDown();
      }
    } else if (user.role === 'Aluno') {
      doc.fontSize(18).text('Registros Acadêmicos', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text('Nenhum registro acadêmico encontrado.').moveDown();
    }

    doc.moveDown(1);

    // Audit Logs Section
    if (auditLogs.length > 0) {
      doc.fontSize(18).text('Logs de Auditoria', { underline: true });
      doc.moveDown(0.5);
      
      auditLogs.forEach((log, index) => {
        doc.fontSize(12)
          .text(`${index + 1}.`, { continued: true })
          .text(` Ação: ${log.acao || 'Não especificada'}`)
          .moveDown(0.2);
          
        if (log.modulo) {
          doc.fontSize(11)
            .text(`   Módulo: ${log.modulo}`)
            .moveDown(0.1);
        }
        
        if (log.detalhes) {
          doc.fontSize(11)
            .text(`   Detalhes: ${log.detalhes}`)
            .moveDown(0.1);
        }
        
        doc.fontSize(11)
          .text(`   Data/Hora: ${new Date(log.timestamp).toLocaleString()}`)
          .moveDown(0.5);
      });
    } else {
      doc.fontSize(18).text('Logs de Auditoria', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text('Nenhum log de auditoria encontrado.').moveDown();
    }

    // Footer
    doc.moveDown(1);
    doc.fontSize(10)
      .text(`Exportado em: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(0.5);
    doc.fontSize(8)
      .text(`Sistema de Gestão Academica - IMEL v3.1.0`, { align: 'center' });

    // Finalize the PDF
    doc.end();
  } catch (err) {
    console.error('Erro ao exportar dados para PDF:', err);
    res.status(500).json({ error: 'Erro ao exportar dados para PDF' });
  }
};

module.exports = { getProfile, updateProfile, exportProfileData };
