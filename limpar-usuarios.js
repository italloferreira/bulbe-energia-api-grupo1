const db = require('./src/data/db'); const i = db.prepare('DELETE FROM usuarios').run(); console.log('Apagados:', i.changes); 
