const db = require('./src/data/db'); const u = db.prepare('SELECT id, nome, email FROM usuarios').all(); console.table(u); console.log('Total:', u.length); 
