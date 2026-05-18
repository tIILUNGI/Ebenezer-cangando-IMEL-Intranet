const { run, get, all } = require('../database');
const { sanitizeInput } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all schedules
const getSchedule = async (req, res) => {
  try {
    const { day, turma, teacherId } = req.query;
    let query = `SELECT h.*, d.nome as discipline_name, u.nome as teacher_name FROM horarios h 
      LEFT JOIN disciplinas d ON h.disciplina_id = d.id 
      LEFT JOIN usuarios u ON h.professor_id = u.id WHERE 1=1`;
    const params = [];

    if (day) {
      query += ' AND h.dia_semana = ?';
      params.push(day);
    }
    if (turma) {
      query += ' AND h.turma = ?';
      params.push(turma);
    }
    if (teacherId) {
      query += ' AND h.professor_id = ?';
      params.push(teacherId);
    }

    query += ' ORDER BY h.dia_semana, h.tempo_ordem';
    const schedules = await all(query, params);
    res.json(schedules);
  } catch (err) {
    console.error('Get schedule error:', err);
    res.status(500).json({ error: 'Erro ao buscar horários' });
  }
};

// Create schedule entry
const createScheduleEntry = async (req, res) => {
  try {
    const data = sanitizeInput(req.body);
    const {
      dia_semana,
      tempo_ordem,
      hora_inicio,
      hora_fim,
      disciplina_id,
      professor_id,
      sala,
      turma,
    } = data;

    if (!dia_semana || !tempo_ordem || !hora_inicio || !hora_fim) {
      return res
        .status(400)
        .json({ error: 'Campos obrigatórios: dia_semana, tempo_ordem, hora_inicio, hora_fim' });
    }

    const id = uuidv4();
    await run(
      `INSERT INTO horarios (id, dia_semana, tempo_ordem, hora_inicio, hora_fim, disciplina_id, professor_id, sala, turma)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, dia_semana, tempo_ordem, hora_inicio, hora_fim, disciplina_id, professor_id, sala, turma]
    );

    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.userId,
        'CRIOU_HORARIO',
        `Criou entrada de horário: ${dia_semana} ${hora_inicio}`,
        req.ip,
      ]
    );

    const entry = await get('SELECT * FROM horarios WHERE id = ?', [id]);
    res.status(201).json(entry);
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({ error: 'Erro ao criar horário' });
  }
};

// Update schedule entry
const updateScheduleEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const data = sanitizeInput(req.body);

    const entry = await get('SELECT * FROM horarios WHERE id = ?', [id]);
    if (!entry) return res.status(404).json({ error: 'Horário não encontrado' });

    const allowedFields = [
      'dia_semana',
      'tempo_ordem',
      'hora_inicio',
      'hora_fim',
      'disciplina_id',
      'professor_id',
      'sala',
      'turma',
    ];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    values.push(id);
    await run(`UPDATE horarios SET ${updates.join(', ')} WHERE id = ?`, values);
    const updated = await get('SELECT * FROM horarios WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ error: 'Erro ao atualizar horário' });
  }
};

// Delete schedule entry
const deleteScheduleEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM horarios WHERE id = ?', [id]);
    res.json({ message: 'Horário removido com sucesso' });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ error: 'Erro ao remover horário' });
  }
};

const getAvailableSubjects = async (req, res) => {
  try {
    const subjects = await all('SELECT * FROM disciplinas ORDER BY nome');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar disciplinas' });
  }
};

module.exports = {
  getSchedule,
  createScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry,
  getAvailableSubjects,
};
