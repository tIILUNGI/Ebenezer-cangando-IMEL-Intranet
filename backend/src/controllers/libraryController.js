const { run, get, all } = require('../database');
const { sanitizeInput } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const getLibrary = async (req, res) => {
  try {
    const { subject, type, search } = req.query;
    let query = `SELECT b.*, u.nome as author_name, d.nome as discipline_name FROM biblioteca b 
      LEFT JOIN usuarios u ON b.autor_id = u.id 
      LEFT JOIN disciplinas d ON b.disciplina_id = d.id WHERE 1=1`;
    const params = [];

    if (subject) {
      query += ' AND b.disciplina_id = ?';
      params.push(subject);
    }
    if (type) {
      query += ' AND b.tipo = ?';
      params.push(type);
    }
    if (search) {
      query += ' AND (b.titulo LIKE ? OR b.titulo LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY b.data_upload DESC';
    const items = await all(query, params);
    res.json(items);
  } catch (err) {
    console.error('Get library error:', err);
    res.status(500).json({ error: 'Erro ao buscar biblioteca' });
  }
};

const uploadResource = async (req, res) => {
  try {
    const { title, subject, type, size, turmaTarget } = sanitizeInput(req.body);
    const file = req.file;

    if (!title || !subject || !type || !file) {
      return res.status(400).json({ error: 'Título, disciplina, tipo e arquivo são obrigatórios' });
    }

    if (file.size > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'Arquivo muito grande. Máximo 10MB' });
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'application/zip',
      'application/x-zip-compressed',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
    }

    const id = uuidv4();
    const ext = path.extname(file.originalname);
    const fileName = `${id}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, file.buffer);

    await run(
      `INSERT INTO biblioteca (id, titulo, disciplina_id, tipo, url_ficheiro, autor_id, tamanho, turma_target)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        subject,
        type,
        `/uploads/${fileName}`,
        req.userId,
        `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        turmaTarget || 'Todas',
      ]
    );

    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.userId,
        'ADICIONOU_ARQUIVO',
        `Adicionou arquivo: ${title} (${type})`,
        req.ip,
      ]
    );

    const item = await get('SELECT * FROM biblioteca WHERE id = ?', [id]);
    res.status(201).json(item);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
  }
};

const incrementDownload = async (req, res) => {
  try {
    const { id } = req.params;
    await run('UPDATE biblioteca SET downloads = downloads + 1 WHERE id = ?', [id]);
    res.json({ message: 'Download registrado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar download' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await get('SELECT url_ficheiro FROM biblioteca WHERE id = ?', [id]);
    if (!item) return res.status(404).json({ error: 'Recurso não encontrado' });

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, path.basename(item.url_ficheiro));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await run('DELETE FROM biblioteca WHERE id = ?', [id]);
    res.json({ message: 'Recurso removido com sucesso' });
  } catch (err) {
    console.error('Delete resource error:', err);
    res.status(500).json({ error: 'Erro ao remover recurso' });
  }
};

module.exports = { getLibrary, uploadResource, incrementDownload, deleteResource };
