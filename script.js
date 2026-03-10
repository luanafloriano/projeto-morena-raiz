// script.js
class CatalogoVirtual {
    constructor() {
        this.produtos = this.carregarDoLocalStorage();
        this.produtosFiltrados = [...this.produtos];
        this.carrinho = this.carregarCarrinho();
        this.telefoneWhatsApp = '48996727239'; // ALTERE PARA SEU TELEFONE
        this.init();
    }

    init() {
        this.configurarEventos();
        this.renderizarCatalogo();
        this.atualizarContadorCarrinho();
        console.log('Catálogo Virtual iniciado!');
    }

    carregarDoLocalStorage() {
        const produtosSalvos = localStorage.getItem('produtos');
        if (produtosSalvos) {
            return JSON.parse(produtosSalvos);
        } else {
            // Produtos de exemplo para teste
            return [
                {
                    id: 1,
                    nome: "Vestido Floral Elegante",
                    preco: 189.90,
                    categoria: "vestido",
                    tamanhos: ["P", "M", "G"],
                    descricao: "Vestido midi com estampa floral, perfeito para eventos especiais.",
                    imagem: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
                    cores: ["Rosa", "Azul", "Verde"],
                    material: "Viscose"
                },
                {
                    id: 2,
                    nome: "Blusa de Seda Premium",
                    preco: 129.90,
                    categoria: "blusa",
                    tamanhos: ["P", "M", "G", "GG"],
                    descricao: "Blusa em seda natural com corte moderno e confortável.",
                    imagem: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop",
                    cores: ["Branco", "Preto", "Marrom"],
                    material: "Seda"
                }
            ];
        }
    }

   configurarEventos() {
    // Filtro de busca (exemplo básico)
    const campoBusca = document.getElementById('busca');
    if (campoBusca) {
        campoBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            this.produtosFiltrados = this.produtos.filter(p =>
                p.nome.toLowerCase().includes(termo)
            );
            this.renderizarCatalogo();
        });
    }
}

// Fecha a classe
}

// Inicializa o catálogo
document.addEventListener('DOMContentLoaded', () => {
    new CatalogoVirtual();
});
