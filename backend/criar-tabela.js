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

    db.query(`CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_nome VARCHAR(150) NOT NULL,
        cliente_email VARCHAR(150),
        cliente_telefone VARCHAR(20),
        cliente_cep VARCHAR(10),
        cliente_endereco VARCHAR(300),
        itens JSON NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        frete_tipo VARCHAR(20),
        frete_valor DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        pagamento VARCHAR(30),
        status VARCHAR(30) DEFAULT 'pendente',
        observacao TEXT,
        criado_em DATETIME DEFAULT NOW(),
        atualizado_em DATETIME DEFAULT NOW() ON UPDATE NOW()
    )`, (err) => {
        if (err) console.error('Erro:', err);
        else console.log('Tabela pedidos criada!');
        db.end();
    });
});