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

    db.query(`CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(50),
        tamanhos VARCHAR(100),
        cores VARCHAR(150),
        material VARCHAR(100),
        descricao TEXT,
        imagem VARCHAR(500),
        destaque TINYINT(1) DEFAULT 0,
        ativo TINYINT(1) DEFAULT 1,
        criado_em DATETIME DEFAULT NOW()
    )`, (err) => {
        if (err) { console.error('Erro ao criar tabela:', err); }
        else { console.log('Tabela criada com sucesso!'); }
        db.end();
    });
});