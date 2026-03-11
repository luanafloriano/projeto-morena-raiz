require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar no banco:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

/// Listar produtos ativos
app.get('/produtos', (req, res) => {
  db.query('SELECT * FROM produtos WHERE ativo = 1 ORDER BY criado_em DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Listar produtos em destaque (página inicial)
app.get('/produtos/destaque', (req, res) => {
  db.query('SELECT * FROM produtos WHERE ativo = 1 AND destaque = 1 ORDER BY criado_em DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// Buscar um produto por id
app.get('/produtos/:id', (req, res) => {
  db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (results.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(results[0]);
  });
});

// Cadastrar produto
app.post('/produtos', (req, res) => {
  const { nome, preco, categoria, tamanhos, cores, material, descricao, imagem, destaque, ativo } = req.body;
  db.query(
    'INSERT INTO produtos (nome, preco, categoria, tamanhos, cores, material, descricao, imagem, destaque, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, preco, categoria, tamanhos, cores, material, descricao, imagem, destaque ?? 0, ativo ?? 1],
    (err, result) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: result.insertId, mensagem: 'Produto cadastrado!' });
    }
  );
});

// Atualizar produto (ativo/destaque/etc)
app.put('/produtos/:id', (req, res) => {
  const { nome, preco, categoria, tamanhos, cores, material, descricao, imagem, destaque, ativo } = req.body;
  db.query(
    'UPDATE produtos SET nome=?, preco=?, categoria=?, tamanhos=?, cores=?, material=?, descricao=?, imagem=?, destaque=?, ativo=? WHERE id=?',
    [nome, preco, categoria, tamanhos, cores, material, descricao, imagem, destaque, ativo, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ mensagem: 'Produto atualizado!' });
    }
  );
});

// Deletar produto
app.delete('/produtos/:id', (req, res) => {
  db.query('DELETE FROM produtos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Produto deletado!' });
  });

  // Listar TODOS os produtos (para o admin)
app.get('/produtos/todos', (req, res) => {
  db.query('SELECT * FROM produtos ORDER BY criado_em DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
}); 

});
app.listen(process.env.PORT || 3001, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT || 3001}`);
});

