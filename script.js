// =============================================
// MORENA RAIZ — script.js v4
// Sistema de frete integrado ao carrinho
// =============================================

class MorenaRaiz {

    constructor() {
        this.TELEFONE    = '48996727239'; // ← seu número (só números)
        this.CEP_ORIGEM  = '88702060';    // ← CEP da loja (Tubarão-SC)
        this.FRETE_GRATIS = 300;          // ← valor mínimo para frete grátis

        this.produtos  = this._loadProdutos();
        this.carrinho  = this._loadCarrinho();
        this._filters  = { cat: '', size: '', sort: '' };
        this._frete    = null; // { tipo, valor, prazo, cep }

        this._bindCart();
        this._updateDot();
    }

    // ─────────── STORAGE ───────────
    _loadProdutos() {
        try {
            const s = localStorage.getItem('mr_produtos');
            if (s) return JSON.parse(s);
        } catch(_) {}

        // produtos de exemplo — substitua pelos seus
        return [
            { id:1, nome:'Vestido Linho Botões',      preco:219.90, precoDe:null,   cat:'vestido',   tams:'P, M, G',          cores:'Off White, Bege',          material:'Linho',    desc:'Vestido midi em linho com detalhes em botões forrados. Caimento elegante para o dia a dia.', img:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&h=930&fit=crop', novo:true  },
            { id:2, nome:'Blusa Ampla Viscose',        preco:119.90, precoDe:null,   cat:'blusa',     tams:'P, M, G, GG',      cores:'Preto, Branco, Terracota', material:'Viscose',  desc:'Blusa ampla com manga longa e caimento fluido. Perfeita para looks casuais e formais.', img:'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=700&h=930&fit=crop', novo:false },
            { id:3, nome:'Calça Wide Leg Crepe',       preco:189.90, precoDe:239.90, cat:'calca',     tams:'P, M, G, GG, PLUS',cores:'Preto, Caramelo',          material:'Crepe',    desc:'Calça wide leg de crepe com cintura alta e caimento impecável.',                        img:'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=700&h=930&fit=crop', novo:false },
            { id:4, nome:'Saia Midi Franzida',         preco:149.90, precoDe:null,   cat:'saias',     tams:'P, M, G',          cores:'Verde, Rosa Seco, Azul',   material:'Algodão',  desc:'Saia midi com franzido na cintura e detalhe em camadas. Romântica e versátil.',         img:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&h=930&fit=crop', novo:true  },
            { id:5, nome:'Conjunto Cropped + Saia',    preco:289.90, precoDe:349.90, cat:'sale',      tams:'P, M, G',          cores:'Lilás, Branco',            material:'Malha',    desc:'Conjunto cropped com decote quadrado e saia midi. Ideal para ocasiões especiais.',      img:'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&h=930&fit=crop', novo:false },
            { id:6, nome:'Top Ombro a Ombro',          preco:89.90,  precoDe:null,   cat:'blusa',     tams:'P, M, G',          cores:'Branco, Preto, Vinho',     material:'Ribana',   desc:'Top ombro a ombro em ribana com alça regulável. Básico que combina com tudo.',         img:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=700&h=930&fit=crop', novo:false },
            { id:7, nome:'Vestido Floral Midi',        preco:259.90, precoDe:null,   cat:'vestido',   tams:'P, M, G, GG',      cores:'Azul Floral, Rosa Floral', material:'Viscose',  desc:'Vestido midi com estampa floral exclusiva. Caimento levinho e feminino.',              img:'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&h=930&fit=crop', novo:true  },
            { id:8, nome:'Shorts Alfaiataria',         preco:139.90, precoDe:179.90, cat:'sale',      tams:'P, M, G',          cores:'Bege, Preto',              material:'Alfaiataria', desc:'Shorts de alfaiataria com pregas frontais. Elegante e confortável.',               img:'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=700&h=930&fit=crop', novo:false },
        ];
    }

    _loadCarrinho() {
        try {
            const s = localStorage.getItem('mr_carrinho');
            if (s) return JSON.parse(s);
        } catch(_) {}
        return [];
    }

    _saveCarrinho() {
        localStorage.setItem('mr_carrinho', JSON.stringify(this.carrinho));
    }

    // ─────────── FILTROS / RENDER ───────────
    setFilter(key, val) {
        this._filters[key] = val;
        this.renderCatalog();
    }

    _getFiltered() {
        let list = [...this.produtos];
        if (this._filters.cat)  list = list.filter(p => p.cat === this._filters.cat);
        if (this._filters.size) list = list.filter(p => p.tams && p.tams.includes(this._filters.size));
        if (this._filters.sort === 'asc')  list.sort((a,b) => a.preco - b.preco);
        if (this._filters.sort === 'desc') list.sort((a,b) => b.preco - a.preco);
        if (this._filters.sort === 'new')  list = list.filter(p=>p.novo).concat(list.filter(p=>!p.novo));
        return list;
    }

    renderCatalog() {
        const el = document.getElementById('catalog');
        if (!el) return;

        const list = this._getFiltered();
        const lbl  = document.getElementById('count-label');
        if (lbl) lbl.textContent = `${list.length} peça${list.length !== 1 ? 's' : ''}`;

        if (!list.length) {
            el.innerHTML = `<div class="cat-empty"><i class="fas fa-search" style="font-size:1.5rem;color:var(--sand)"></i><p style="color:var(--muted)">Nenhuma peça encontrada</p></div>`;
            return;
        }

        el.innerHTML = list.map((p, i) => {
            const tams  = p.tams ? p.tams.split(',').map(t=>t.trim()) : [];
            const isSale = p.precoDe && p.precoDe > p.preco;
            const badge  = isSale
                ? `<span class="prod-badge sale">Sale</span>`
                : p.novo ? `<span class="prod-badge novo">Novo</span>` : '';

            return `
            <a class="prod-card" href="produto.html?id=${p.id}" style="animation-delay:${Math.min(i,8)*.05}s">
                <div class="prod-img-wrap">
                    <img class="prod-img" src="${p.img||''}" alt="${p.nome}" loading="lazy"
                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22530%22><rect fill=%22%23F4F1EE%22 width=%22400%22 height=%22530%22/></svg>'">
                    ${badge}
                    <button class="prod-quick" onclick="event.preventDefault();event.stopPropagation();app.addToCart(${p.id})">
                        <i class="fas fa-shopping-bag"></i> Adicionar
                    </button>
                </div>
                <div class="prod-info">
                    <h3 class="prod-nome">${p.nome}</h3>
                    <div class="prod-precos">
                        ${isSale ? `<span class="prod-preco-de">R$ ${p.precoDe.toFixed(2).replace('.',',')}</span>` : ''}
                        <span class="prod-preco${isSale?' sale':''}">R$ ${p.preco.toFixed(2).replace('.',',')}</span>
                    </div>
                    ${tams.length ? `<div class="prod-tams">${tams.map(t=>`<span class="prod-tam">${t}</span>`).join('')}</div>` : ''}
                </div>
            </a>`;
        }).join('');
    }

    catLabel(c) {
        return { lancamento:'Lançamento', vestido:'Vestido', blusa:'Blusa', calca:'Calça', saias:'Saia', shorts:'Shorts', fitness:'Fitness', acessorio:'Acessório', sale:'Sale' }[c] || c || '';
    }

    // ─────────── CARRINHO ───────────
   addToCart(id, tam='', cor='') {
    const p = this.produtos.find(x => x.id === id);
    if (!p) return;
    // Chave única por produto+tamanho+cor
    const key = `${id}_${tam}_${cor}`;
    const ex = this.carrinho.find(x => x._key === key);
    if (ex) ex.qtd++;
    else this.carrinho.push({ ...p, qtd: 1, tam, cor, _key: key });
    this._saveCarrinho();
    this._updateDot();
    this.toast(`${p.nome} adicionado!`);
    this._frete = null;
}
  removeFromCart(key) {
    this.carrinho = this.carrinho.filter(x => x._key !== key);
    this._saveCarrinho();
    this._updateDot();
    this._frete = null;
    this._renderCart();
}

changeQty(key, d) {
    const item = this.carrinho.find(x => x._key === key);
    if (!item) return;
    item.qtd += d;
    if (item.qtd <= 0) { this.removeFromCart(key); return; }
    this._saveCarrinho();
    this._updateDot();
    this._frete = null;
    this._renderCart();
}

    _subTotal() {
        return this.carrinho.reduce((s,x) => s + x.preco * x.qtd, 0);
    }

    _updateDot() {
        const total = this.carrinho.reduce((s,x) => s + x.qtd, 0);
        const dot   = document.getElementById('cart-dot');
        if (dot) dot.style.display = total ? 'block' : 'none';
    }

    _renderCart() {
        const body = document.getElementById('cart-body');
        const foot = document.getElementById('cart-foot');
        if (!body) return;

        if (!this.carrinho.length) {
            body.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Seu pedido está vazio</p><small style="color:var(--muted);font-size:12px">Adicione peças para enviar pelo WhatsApp</small></div>`;
            if (foot) foot.style.display = 'none';
            return;
        }

        if (foot) foot.style.display = 'flex';

        body.innerHTML = this.carrinho.map(item => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.img||''}" alt="${item.nome}"
                    onerror="this.style.background='var(--light)'">
                <div class="cart-item-info">
                    <p class="cart-item-nome">${item.nome}</p>
                    <p class="cart-item-cat">${item.tam ? `Tam: ${item.tam}` : ''}${item.tam && item.cor ? ' · ' : ''}${item.cor ? `Cor: ${item.cor}` : ''}</p>
                    <p class="cart-item-cat">${this.catLabel(item.cat)}</p>
                    <p class="cart-item-preco">R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</p>
                    <div class="cart-qty">
    <button onclick="app.changeQty('${item._key}',-1)"><i class="fas fa-minus"></i></button>
    <span>${item.qtd}</span>
    <button onclick="app.changeQty('${item._key}',1)"><i class="fas fa-plus"></i></button>
</div>
                </div>
                <button class="cart-item-del" onclick="app.removeFromCart('${item._key}')"><i class="fas fa-trash"></i></button>
            </div>`).join('');

        this._renderFreteSection();
        this._renderTotais();
    }

    // ─────────── SEÇÃO DE FRETE NO CARRINHO ───────────
    _renderFreteSection() {
        const foot = document.getElementById('cart-foot');
        if (!foot) return;

        // Remove seção existente para recriar
        const old = document.getElementById('frete-section');
        if (old) old.remove();

        const sub = this._subTotal();
        const freteGratis = sub >= this.FRETE_GRATIS;

        const section = document.createElement('div');
        section.id = 'frete-section';
        section.style.cssText = 'padding: 1rem 1.25rem; border-top: 1px solid var(--border); background: var(--off);';

        if (freteGratis) {
            section.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;background:#dcfce7;border-radius:4px;margin-bottom:0.5rem">
                    <i class="fas fa-check-circle" style="color:#16a34a;font-size:0.9rem"></i>
                    <span style="font-size:12px;color:#15803d;font-weight:500">Parabéns! Seu pedido tem <strong>frete grátis</strong> 🎉</span>
                </div>
                <div style="display:flex;gap:0.5rem">
                    <input id="cep-input" type="text" maxlength="9" placeholder="Digite seu CEP para ver o prazo"
                        style="flex:1;border:1px solid var(--border);border-radius:3px;padding:0.55rem 0.75rem;font-size:13px;font-family:inherit;background:var(--white)">
                    <button onclick="app.calcularFrete()" 
                        style="background:var(--dark);color:#fff;border:none;padding:0.55rem 1rem;border-radius:3px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:inherit">
                        Ver prazo
                    </button>
                </div>
                <div id="frete-resultado" style="margin-top:0.5rem"></div>`;
        } else {
            const faltam = this.FRETE_GRATIS - sub;
            section.innerHTML = `
                <div style="margin-bottom:0.75rem">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem">
                        <span style="font-size:11px;color:var(--muted)">Frete grátis acima de R$ ${this.FRETE_GRATIS.toFixed(0)}</span>
                        <span style="font-size:11px;color:var(--muted)">Faltam R$ ${faltam.toFixed(2).replace('.',',')}</span>
                    </div>
                    <div style="height:4px;background:var(--border);border-radius:4px;overflow:hidden">
                        <div style="height:100%;width:${Math.min((sub/this.FRETE_GRATIS)*100,100)}%;background:var(--tan);border-radius:4px;transition:width 0.4s"></div>
                    </div>
                </div>
                <div style="display:flex;gap:0.5rem;align-items:center">
                    <input id="cep-input" type="text" maxlength="9" placeholder="Calcular frete — ex: 01310-100"
                        style="flex:1;border:1px solid var(--border);border-radius:3px;padding:0.55rem 0.75rem;font-size:13px;font-family:inherit;background:var(--white)"
                        oninput="app._maskCep(this)">
                    <button onclick="app.calcularFrete()"
                        style="background:var(--dark);color:#fff;border:none;padding:0.55rem 1rem;border-radius:3px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:inherit">
                        Calcular
                    </button>
                </div>
                <div id="frete-resultado" style="margin-top:0.5rem"></div>
                <div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border)">
                    <button onclick="app.selecionarRetirada()"
                        style="width:100%;background:none;border:1px dashed var(--border);padding:0.55rem;border-radius:3px;font-size:12px;color:var(--muted);cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:all 0.2s"
                        onmouseover="this.style.borderColor='var(--dark)';this.style.color='var(--dark)'"
                        onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">
                        <i class="fas fa-store"></i> Retirar na loja — Tubarão/SC
                    </button>
                </div>`;
        }

        // Insere antes do rodapé (botões)
        foot.insertBefore(section, foot.firstChild);

        // Se já tem frete calculado, mostra resultado
        if (this._frete) this._mostrarResultadoFrete(this._frete);
    }

    _renderTotais() {
        const tot = document.getElementById('cart-total');
        const freteEl = document.getElementById('cart-frete-val');
        if (!tot) return;

        const sub = this._subTotal();
        const freteGratis = sub >= this.FRETE_GRATIS;
        const valorFrete = freteGratis ? 0 : (this._frete?.tipo !== 'retirada' ? (this._frete?.valor || null) : 0);

        if (valorFrete !== null) {
            const total = sub + valorFrete;
            tot.textContent = total.toFixed(2).replace('.', ',');
        } else {
            tot.textContent = sub.toFixed(2).replace('.', ',');
        }
    }

    _maskCep(input) {
        let v = input.value.replace(/\D/g,'');
        if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
        input.value = v;
    }

    // ─────────── CÁLCULO DE FRETE ───────────
    async calcularFrete() {
        const input = document.getElementById('cep-input');
        const resultado = document.getElementById('frete-resultado');
        if (!input || !resultado) return;

        const cep = input.value.replace(/\D/g,'');
        if (cep.length !== 8) {
            resultado.innerHTML = `<p style="font-size:12px;color:var(--red)"><i class="fas fa-exclamation-circle"></i> Digite um CEP válido com 8 números.</p>`;
            return;
        }

        resultado.innerHTML = `<p style="font-size:12px;color:var(--muted)"><i class="fas fa-circle-notch fa-spin"></i> Calculando...</p>`;

        try {
            // 1. Busca dados do CEP
            const viaCep = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(r=>r.json());
            if (viaCep.erro) throw new Error('CEP não encontrado');

            // 2. Calcula peso total estimado (300g por peça)
            const qtdTotal = this.carrinho.reduce((s,x) => s + x.qtd, 0);
            const pesoGramas = qtdTotal * 300;

            // 3. Calcula frete pela tabela dos Correios
            const { pac, sedex } = this._tabelaCorreios(viaCep.uf, pesoGramas);

            this._frete = { cep, cidade: viaCep.localidade, uf: viaCep.uf, tipo: null, valor: null };
            this._mostrarOpcoesEntrega(pac, sedex, viaCep);

        } catch(e) {
            resultado.innerHTML = `<p style="font-size:12px;color:var(--red)"><i class="fas fa-exclamation-circle"></i> ${e.message === 'CEP não encontrado' ? 'CEP não encontrado. Verifique e tente novamente.' : 'Erro ao calcular. Tente novamente.'}</p>`;
        }
    }

    _mostrarOpcoesEntrega(pac, sedex, viaCep) {
        const resultado = document.getElementById('frete-resultado');
        if (!resultado) return;

        const sub = this._subTotal();
        const freteGratis = sub >= this.FRETE_GRATIS;

        resultado.innerHTML = `
            <p style="font-size:11px;color:var(--muted);margin-bottom:0.5rem">
                <i class="fas fa-map-marker-alt"></i> ${viaCep.localidade} - ${viaCep.uf}
            </p>
            ${freteGratis ? `
            <div style="display:flex;flex-direction:column;gap:0.4rem">
                <label style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;border:2px solid #16a34a;border-radius:4px;cursor:pointer;background:#f0fdf4" onclick="app.selecionarFrete('pac',0,${pac.prazo})">
                    <input type="radio" name="frete-op" style="accent-color:var(--dark)">
                    <div style="flex:1">
                        <p style="font-size:12px;font-weight:600">PAC</p>
                        <p style="font-size:11px;color:#15803d">🎉 Grátis · ${pac.prazo} dias úteis</p>
                    </div>
                </label>
                <label style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:4px;cursor:pointer" onclick="app.selecionarFrete('sedex',${sedex.valor},${sedex.prazo})">
                    <input type="radio" name="frete-op" style="accent-color:var(--dark)">
                    <div style="flex:1">
                        <p style="font-size:12px;font-weight:600">SEDEX</p>
                        <p style="font-size:11px;color:var(--muted)">R$ ${sedex.valor.toFixed(2).replace('.',',')} · ${sedex.prazo} dias úteis</p>
                    </div>
                </label>
            </div>` : `
            <div style="display:flex;flex-direction:column;gap:0.4rem">
                <label style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:4px;cursor:pointer" onclick="app.selecionarFrete('pac',${pac.valor},${pac.prazo})">
                    <input type="radio" name="frete-op" style="accent-color:var(--dark)">
                    <div style="flex:1">
                        <p style="font-size:12px;font-weight:600">PAC</p>
                        <p style="font-size:11px;color:var(--muted)">R$ ${pac.valor.toFixed(2).replace('.',',')} · ${pac.prazo} dias úteis</p>
                    </div>
                </label>
                <label style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:4px;cursor:pointer" onclick="app.selecionarFrete('sedex',${sedex.valor},${sedex.prazo})">
                    <input type="radio" name="frete-op" style="accent-color:var(--dark)">
                    <div style="flex:1">
                        <p style="font-size:12px;font-weight:600">SEDEX</p>
                        <p style="font-size:11px;color:var(--muted)">R$ ${sedex.valor.toFixed(2).replace('.',',')} · ${sedex.prazo} dias úteis</p>
                    </div>
                </label>
            </div>`}`;
    }

    selecionarFrete(tipo, valor, prazo) {
        this._frete = { ...this._frete, tipo, valor, prazo };
        this._renderTotais();

        // Destaca a opção selecionada
        document.querySelectorAll('[name="frete-op"]').forEach((r, i) => {
            const label = r.closest('label');
            if (r.checked) {
                label.style.border = '2px solid var(--dark)';
                label.style.background = 'var(--off)';
            } else {
                label.style.border = '1px solid var(--border)';
                label.style.background = '';
            }
        });

        const nomes = { pac: 'PAC', sedex: 'SEDEX' };
        const valorStr = valor === 0 ? 'Grátis' : `R$ ${valor.toFixed(2).replace('.',',')}`;
        this.toast(`${nomes[tipo]} selecionado — ${valorStr}`);
    }

    selecionarRetirada() {
        this._frete = { tipo: 'retirada', valor: 0, prazo: null };
        this._renderTotais();

        const resultado = document.getElementById('frete-resultado');
        if (resultado) {
            resultado.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;background:var(--cream);border-radius:4px;border:2px solid var(--dark)">
                    <i class="fas fa-store" style="color:var(--dark)"></i>
                    <div>
                        <p style="font-size:12px;font-weight:600">Retirada na loja</p>
                        <p style="font-size:11px;color:var(--muted)">Tubarão - SC · Combinar horário pelo WhatsApp</p>
                    </div>
                </div>`;
        }
        this.toast('Retirada na loja selecionada!');
    }

    _mostrarResultadoFrete(frete) {
        if (!frete || !frete.tipo) return;
        const resultado = document.getElementById('frete-resultado');
        if (!resultado) return;

        if (frete.tipo === 'retirada') {
            resultado.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;background:var(--cream);border-radius:4px;border:2px solid var(--dark)">
                    <i class="fas fa-store" style="color:var(--dark)"></i>
                    <div>
                        <p style="font-size:12px;font-weight:600">Retirada na loja</p>
                        <p style="font-size:11px;color:var(--muted)">Tubarão - SC</p>
                    </div>
                </div>`;
        }
    }

    // ─────────── TABELA DOS CORREIOS ───────────
    // Valores aproximados PAC/SEDEX por região, peso até 500g
    // Baseado na tabela vigente dos Correios (2024-2025)
    _tabelaCorreios(uf, pesoGramas) {
        const peso = Math.ceil(pesoGramas / 100) * 100; // arredonda p/ 100g

        // Regiões por UF
        const regioes = {
            SC: 'sul', RS: 'sul', PR: 'sul',
            SP: 'sudeste', RJ: 'sudeste', MG: 'sudeste', ES: 'sudeste',
            MT: 'centroOeste', MS: 'centroOeste', GO: 'centroOeste', DF: 'centroOeste',
            BA: 'nordeste', SE: 'nordeste', AL: 'nordeste', PE: 'nordeste',
            PB: 'nordeste', RN: 'nordeste', CE: 'nordeste', PI: 'nordeste', MA: 'nordeste',
            PA: 'norte', AM: 'norte', RO: 'norte', AC: 'norte', RR: 'norte', AP: 'norte', TO: 'norte',
        };

        const regiao = regioes[uf] || 'sudeste';

        // Tabela: [pac_valor, pac_prazo, sedex_valor, sedex_prazo]
        // Valores em R$ para pacote de moda leve (até 500g, 16x11x2cm)
        const tabela = {
            sul:        { pac: [15.90,  5], sedex: [28.90,  2] },
            sudeste:    { pac: [17.90,  7], sedex: [32.90,  2] },
            centroOeste:{ pac: [20.90,  8], sedex: [37.90,  3] },
            nordeste:   { pac: [23.90, 10], sedex: [44.90,  4] },
            norte:      { pac: [27.90, 14], sedex: [54.90,  6] },
        };

        // Adicional por peso extra (acima de 300g)
        const adicionalPeso = peso > 300 ? Math.ceil((peso - 300) / 100) * 1.50 : 0;

        const t = tabela[regiao];
        return {
            pac:   { valor: t.pac[0]   + adicionalPeso, prazo: t.pac[1]   },
            sedex: { valor: t.sedex[0] + adicionalPeso, prazo: t.sedex[1] },
        };
    }

    // ─────────── ABERTURA DO CARRINHO ───────────
    openCart() {
        this._renderCart();
        document.getElementById('cart-drawer')?.classList.add('open');
        document.getElementById('overlay-cart')?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        document.getElementById('cart-drawer')?.classList.remove('open');
        document.getElementById('overlay-cart')?.classList.remove('active');
        document.body.style.overflow = '';
    }

    _bindCart() {
        document.getElementById('btn-cart')?.addEventListener('click', () => this.openCart());
        document.getElementById('btn-cart-close')?.addEventListener('click', () => this.closeCart());
        document.getElementById('overlay-cart')?.addEventListener('click', () => this.closeCart());

        document.getElementById('btn-whatsapp')?.addEventListener('click', () => this._sendWhatsApp());
        document.getElementById('btn-clear')?.addEventListener('click', () => {
            if (confirm('Limpar todo o pedido?')) {
                this.carrinho = [];
                this._frete = null;
                this._saveCarrinho();
                this._updateDot();
                this._renderCart();
            }
        });
    }

   // ─────────── WHATSAPP ───────────
_sendWhatsApp() {
    if (!this.carrinho.length) { this.toast('Adicione produtos primeiro!'); return; }
    window.location.href = 'checkout.html';
}

    // ─────────── TOAST ───────────
    toast(msg) {
        const el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
    }
}