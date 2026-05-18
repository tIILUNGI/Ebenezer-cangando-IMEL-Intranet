const { db, run, all } = require('./database');

const migrate = async () => {
  console.log('🔄 Iniciando migração do banco de dados...');

  const tables = await all(`SELECT name FROM sqlite_master WHERE type='table'`);
  const tableNames = tables.map((t) => t.name);
  console.log(`📊 Tabelas existentes: ${tableNames.join(', ')}`);

  // Create tables if not exist (already handled in database.js)
  // Run additional migrations here for future schema changes

  console.log('✅ Migração concluída com sucesso!');
  process.exit(0);
};

migrate();
