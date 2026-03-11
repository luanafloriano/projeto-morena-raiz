this.API = 'https://balanced-expression-production.up.railway.app';
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
  if (err) { console.error('Erro ao conectar no banco:', err); return; }
  console.log('Conectado ao MySQL!');
});

// ── PRODUTOS ──

app.get('/produtos', (req, res) => {
  db.query('SELECT * FROM produtos WHERE ativo = 1 ORDER BY criado_em DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

app.get('/produtos/destaque', (req, res) => {
  db.query('SELECT * FROM produtos WHERE ativo = 1 AND destaque = 1 ORDER BY criado_em DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

// IMPORTANTE: /produtos/todos deve vir ANTES de /produtos/:id
app.get('/produtos/todos', (req, res) => {
  db.query('SELECT * FROM produtos ORDER BY criado_em DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(results);
  });
});

app.get('/produtos/:id', (req, res) => {
  db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (results.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(results[0]);
  });
});

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

app.put('/produtos/:id', (req, res) => {
  const { nome, preco, categoria, tamanhos, cores, material, descricao, imagem, destaque, ativo, estoque } = req.body;
  db.query(
    'UPDATE produtos SET nome=?, preco=?, categoria=?, tamanhos=?, cores=?, material=?, descricao=?, imagem=?, destaque=?, ativo=?, estoque=? WHERE id=?',
    [nome, preco, categoria, tamanhos, cores, material, descricao, imagem, destaque, ativo, estoque ? JSON.stringify(estoque) : null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ mensagem: 'Produto atualizado!' });
    }
  );
});

app.delete('/produtos/:id', (req, res) => {
  db.query('DELETE FROM produtos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Produto deletado!' });
  });
});

// ── PEDIDOS ──

app.post('/pedidos', (req, res) => {
  const { cliente_nome, cliente_email, cliente_telefone, cliente_cep, cliente_endereco, itens, subtotal, frete_tipo, frete_valor, total, pagamento, observacao } = req.body;
  db.query(
    'INSERT INTO pedidos (cliente_nome, cliente_email, cliente_telefone, cliente_cep, cliente_endereco, itens, subtotal, frete_tipo, frete_valor, total, pagamento, observacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [cliente_nome, cliente_email, cliente_telefone, cliente_cep, cliente_endereco, JSON.stringify(itens), subtotal, frete_tipo, frete_valor || 0, total, pagamento, observacao],
    (err, result) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: result.insertId, mensagem: 'Pedido criado!' });
    }
  );
});

app.get('/pedidos', (req, res) => {
  db.query('SELECT * FROM pedidos ORDER BY criado_em DESC', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    results.forEach(p => { try { p.itens = JSON.parse(p.itens); } catch(_) {} });
    res.json(results);
  });
});

app.get('/pedidos/:id', (req, res) => {
  db.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!results.length) return res.status(404).json({ erro: 'Pedido não encontrado' });
    try { results[0].itens = JSON.parse(results[0].itens); } catch(_) {}
    res.json(results[0]);
  });
});

app.patch('/pedidos/:id/status', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Status atualizado!' });
  });
});

// ── CONFIGURAÇÕES ──

app.get('/configuracoes', (req, res) => {
  db.query('SELECT * FROM configuracoes', (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    const config = {};
    results.forEach(r => config[r.chave] = r.valor);
    res.json(config);
  });
});

app.post('/configuracoes', (req, res) => {
  const entries = Object.entries(req.body);
  if (!entries.length) return res.json({ mensagem: 'Nada para salvar.' });
  const values = entries.map(([k, v]) => [k, v]);
  db.query(
    'INSERT INTO configuracoes (chave, valor) VALUES ? ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
    [values],
    (err) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ mensagem: 'Configurações salvas!' });
    }
  );
});
// Baixar estoque após pedido
app.patch('/produtos/:id/estoque', (req, res) => {
  const { tamanho, quantidade } = req.body;
  db.query('SELECT estoque FROM produtos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!results.length) return res.status(404).json({ erro: 'Produto não encontrado' });

    let estoque = {};
    try { estoque = JSON.parse(results[0].estoque || '{}'); } catch(_) {}

    if (tamanho) {
      estoque[tamanho] = Math.max(0, (estoque[tamanho] || 0) - (quantidade || 1));
    }

    db.query('UPDATE produtos SET estoque = ? WHERE id = ?', [JSON.stringify(estoque), req.params.id], (err) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ mensagem: 'Estoque atualizado!', estoque });
    });
  });
});
// Buscar estoque de um produto
app.get('/produtos/:id/estoque', (req, res) => {
  db.query('SELECT estoque FROM produtos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!results.length) return res.status(404).json({ erro: 'Produto não encontrado' });
    let estoque = {};
    try { estoque = JSON.parse(results[0].estoque || '{}'); } catch(_) {}
    res.json(estoque);
  });
});

// Baixar estoque após pedido confirmado
app.patch('/produtos/:id/estoque', (req, res) => {
  const { sku, quantidade } = req.body;
  db.query('SELECT estoque FROM produtos WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!results.length) return res.status(404).json({ erro: 'Produto não encontrado' });
    let estoque = {};
    try { estoque = JSON.parse(results[0].estoque || '{}'); } catch(_) {}
    if (sku) {
      const atual = estoque[sku] || 0;
      if (atual < (quantidade || 1)) return res.status(400).json({ erro: 'Estoque insuficiente' });
      estoque[sku] = atual - (quantidade || 1);
    }
    db.query('UPDATE produtos SET estoque = ? WHERE id = ?', [JSON.stringify(estoque), req.params.id], (err) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ mensagem: 'Estoque atualizado!', estoque });
    });
  });
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 3001}`);
});