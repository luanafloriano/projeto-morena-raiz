// =============================================
// MORENA RAIZ — script.js v3
// Compartilhado entre index.html e produto.html
// =============================================

class MorenaRaiz {

    constructor() {
        this.TELEFONE = '48996727239'; // ← seu número (só números)

        this.produtos  = this._loadProdutos();
        this.carrinho  = this._loadCarrinho();
        this._filters  = { cat: '', size: '', sort: '' };

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
    addToCart(id) {
        const p = this.produtos.find(x => x.id === id);
        if (!p) return;
        const ex = this.carrinho.find(x => x.id === id);
        if (ex) ex.qtd++;
        else     this.carrinho.push({ ...p, qtd: 1 });
        this._saveCarrinho();
        this._updateDot();
        this.toast(`${p.nome} adicionado!`);
    }

    removeFromCart(id) {
        this.carrinho = this.carrinho.filter(x => x.id !== id);
        this._saveCarrinho();
        this._updateDot();
        this._renderCart();
    }

    changeQty(id, d) {
        const item = this.carrinho.find(x => x.id === id);
        if (!item) return;
        item.qtd += d;
        if (item.qtd <= 0) { this.removeFromCart(id); return; }
        this._saveCarrinho();
        this._updateDot();
        this._renderCart();
    }

    _updateDot() {
        const total = this.carrinho.reduce((s,x) => s + x.qtd, 0);
        const dot   = document.getElementById('cart-dot');
        if (dot) dot.style.display = total ? 'block' : 'none';
    }

    _renderCart() {
        const body = document.getElementById('cart-body');
        const foot = document.getElementById('cart-foot');
        const tot  = document.getElementById('cart-total');
        if (!body) return;

        if (!this.carrinho.length) {
            body.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Seu pedido está vazio</p><small style="color:var(--muted);font-size:12px">Adicione peças para enviar pelo WhatsApp</small></div>`;
            if (foot) foot.style.display = 'none';
            return;
        }

        if (foot) foot.style.display = 'flex';

        const sum = this.carrinho.reduce((s,x) => s + x.preco * x.qtd, 0);
        if (tot) tot.textContent = sum.toFixed(2).replace('.', ',');

        body.innerHTML = this.carrinho.map(item => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.img||''}" alt="${item.nome}"
                    onerror="this.style.background='var(--light)'">
                <div class="cart-item-info">
                    <p class="cart-item-nome">${item.nome}</p>
                    <p class="cart-item-cat">${this.catLabel(item.cat)}</p>
                    <p class="cart-item-preco">R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</p>
                    <div class="cart-qty">
                        <button onclick="app.changeQty(${item.id},-1)"><i class="fas fa-minus"></i></button>
                        <span>${item.qtd}</span>
                        <button onclick="app.changeQty(${item.id},1)"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <button class="cart-item-del" onclick="app.removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
            </div>`).join('');
    }

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
                this._saveCarrinho();
                this._updateDot();
                this._renderCart();
            }
        });
    }

    _sendWhatsApp() {
        if (!this.carrinho.length) { this.toast('Adicione produtos primeiro!'); return; }
        const sum = this.carrinho.reduce((s,x) => s + x.preco * x.qtd, 0);
        let msg = '🌿 *Olá! Gostaria de fazer um pedido:*\n\n';
        this.carrinho.forEach(x => {
            msg += `▪ *${x.nome}*\n  Qtd: ${x.qtd}  ·  R$ ${(x.preco * x.qtd).toFixed(2).replace('.',',')}\n\n`;
        });
        msg += `━━━━━━━━━━━━━━━\n💰 *Total: R$ ${sum.toFixed(2).replace('.',',')}*`;
        window.open(`https://wa.me/55${this.TELEFONE}?text=${encodeURIComponent(msg)}`, '_blank');
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