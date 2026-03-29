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

    db.query(`
        CREATE TABLE IF NOT EXISTS slides (
            id         INT PRIMARY KEY AUTO_INCREMENT,
            imagem_url VARCHAR(500) NOT NULL,
            titulo     VARCHAR(255),
            link       VARCHAR(500),
            ordem      INT DEFAULT 0,
            ativo      TINYINT(1) DEFAULT 1,
            criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Erro:', err.message);
        else console.log('Tabela slides criada com sucesso!');
        db.end();
    });
});
