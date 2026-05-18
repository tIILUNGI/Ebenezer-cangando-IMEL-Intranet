const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { run, get } = require('../database');

router.use(authMiddleware);

// Get settings (public for authenticated users)
router.get('/', async (req, res) => {
  try {
    const settings = await get('SELECT * FROM settings WHERE id = 1');
    if (!settings) {
      // Create default settings
      const defaults = {
        id: 1,
        schoolName: 'Instituto Médio de Economia de Luanda',
        schoolAcronym: 'Intra IMEL',
        primaryColor: '#003366',
        secondaryColor: '#FFD700',
        version: '3.1.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await run(
        `INSERT INTO settings (id, schoolName, schoolAcronym, primaryColor, secondaryColor, version) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          1,
          defaults.schoolName,
          defaults.schoolAcronym,
          defaults.primaryColor,
          defaults.secondaryColor,
          defaults.version,
        ]
      );
      return res.json(defaults);
    }
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// Update settings (admin/director only)
router.put('/', roleMiddleware('Administrador', 'Diretor'), async (req, res) => {
  try {
    const { schoolName, schoolAcronym, primaryColor, secondaryColor, version } = req.body;
    const allowedFields = [
      'schoolName',
      'schoolAcronym',
      'primaryColor',
      'secondaryColor',
      'version',
    ];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    values.push(new Date().toISOString(), 1);
    await run(`UPDATE settings SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`, values);

    await run(
      'INSERT INTO logs_auditoria (id, usuario_id, acao, detalhes, ip_endereco) VALUES (?, ?, ?, ?, ?)',
      [
        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        req.userId,
        'ALTEROU_SETTINGS',
        'Atualizou configurações do sistema',
        req.ip,
      ]
    );

    const updated = await get('SELECT * FROM settings WHERE id = 1');
    res.json(updated);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

module.exports = router;
