const { run, get, all } = require('../database');
const { sanitizeInput } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get grades for current student or all grades (teacher/admin)
const getGrades = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.userRole;

    let grades;
    if (role === 'Aluno' || role === 'Encarregado') {
      // For students and guardians, only their grades
      const studentId = role === 'Aluno' ? userId : req.user.dependentStudentId || userId;
      grades = await all(
        `SELECT p.*, u.nome as student_name, d.nome as discipline_name 
         FROM pautas p 
         JOIN usuarios u ON p.aluno_id = u.id 
         JOIN disciplinas d ON p.disciplina_id = d.id 
         WHERE p.aluno_id = ? ORDER BY d.nome, p.trimestre`,
        [studentId]
      );
    } else if (role === 'Professor') {
      const teacherGrades = await all(
        `SELECT p.*, u.nome as student_name, d.nome as discipline_name 
         FROM pautas p 
         JOIN usuarios u ON p.aluno_id = u.id 
         JOIN disciplinas d ON p.disciplina_id = d.id 
         WHERE p.professor_id = ? ORDER BY d.nome, p.trimestre`,
        [userId]
      );
      grades = teacherGrades;
    } else {
      grades = await all(
        `SELECT p.*, u.nome as student_name, d.nome as discipline_name 
         FROM pautas p 
         JOIN usuarios u ON p.aluno_id = u.id 
         JOIN disciplinas d ON p.disciplina_id = d.id 
         ORDER BY u.nome, d.nome`
      );
    }

    res.json(grades);
  } catch (err) {
    console.error('Get grades error:', err);
    res.status(500).json({ error: 'Erro ao buscar notas' });
  }
};

// Update grade
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const data = sanitizeInput(req.body);
    const { mac, npp, npt, faltas, trimestre } = data;

    const grade = await get('SELECT * FROM pautas WHERE id = ?', [id]);
    if (!grade) return res.status(404).json({ error: 'Nota não encontrada' });

    // Verify teacher can only edit their own grades
    if (req.user.userRole === 'Professor' && grade.professor_id !== req.user.userId) {
      return res.status(403).json({ error: 'Sem permissão para alterar notas deste aluno' });
    }

    const updates = [];
    const values = [];

    if (mac !== undefined) {
      updates.push('mac = ?');
      values.push(mac);
    }
    if (npp !== undefined) {
      updates.push('npp = ?');
      values.push(npp);
    }
    if (npt !== undefined) {
      updates.push('npt = ?');
      values.push(npt);
    }
    if (faltas !== undefined) {
      updates.push('faltas = ?');
      values.push(faltas);
    }

    // Auto-calculate average
    const currentGrade = grade;
    const finalMac = mac !== undefined ? mac : currentGrade.mac;
    const finalNpp = npp !== undefined ? npp : currentGrade.npp;
    const finalNpt = npt !== undefined ? npt : currentGrade.npt;
    const vals = [finalMac, finalNpp, finalNpt].filter((v) => v !== null && v !== undefined);
    const media =
      vals.length > 0
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100
        : null;
    updates.push('media = ?');
    values.push(media);

    values.push(new Date().toISOString(), req.user.userId, id);
    await run(
      `UPDATE pautas SET ${updates.join(', ')}, data_lancamento = ?, ultima_edicao_por = ? WHERE id = ?`,
      values
    );

    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.user.userId,
        'ALTEROU_NOTA',
        `Nota ${id} atualizada por ${req.user.name}`,
        req.ip,
      ]
    );

    const updated = await get('SELECT * FROM pautas WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Update grade error:', err);
    res.status(500).json({ error: 'Erro ao atualizar nota' });
  }
};

// Get student grades by student ID (for coordinators)
const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const grades = await all(
      `SELECT p.*, d.nome as discipline_name FROM pautas p 
       JOIN disciplinas d ON p.disciplina_id = d.id 
       WHERE p.aluno_id = ? ORDER BY p.trimestre, d.nome`,
      [studentId]
    );
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notas do aluno' });
  }
};

module.exports = { getGrades, updateGrade, getStudentGrades };
