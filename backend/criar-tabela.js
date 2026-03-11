require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'b68ue1o7p60ueuosakyt-mysql.services.clever-cloud.com',
    port: 3306,
    user: 'ugzvbuueqtemkxcx',
    password: '0Hr6sM7QBUU1jX3b5ub1',
    database: 'b68ue1o7p60ueuosakyt'
});

db.connect(err => {
    if (err) { console.error('Erro:', err); return; }
    console.log('Conectado!');

    db.query(`ALTER TABLE produtos ADD COLUMN estoque JSON`, (err) => {
        if (err) console.error('Erro:', err.message);
        else console.log('Coluna estoque adicionada!');
        db.end();
    });
});