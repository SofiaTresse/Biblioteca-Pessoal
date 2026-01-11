// Variáveis globais
let usuarioLogado = null;
let livros = JSON.parse(localStorage.getItem('livros')) || [];

// Função para alternar visibilidade da senha no login
function toggleLoginPassword() {
    const senhaInput = document.getElementById('senha');
    const icon = document.querySelector('.toggle-password i');
    
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        senhaInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Sistema de avaliação por estrelas
function initRatingSystem() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('nota');
    const ratingText = document.getElementById('ratingText');
    
    const ratingTexts = {
        0: "Não avaliado",
        1: "Muito ruim",
        2: "Ruim",
        3: "Regular",
        4: "Bom",
        5: "Excelente"
    };
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            ratingInput.value = value;
            ratingText.textContent = ratingTexts[value];
            
            // Atualizar estrelas visuais
            stars.forEach((s, index) => {
                if (index < value) {
                    s.innerHTML = '<i class="fas fa-star"></i>';
                    s.classList.add('active');
                } else {
                    s.innerHTML = '<i class="far fa-star"></i>';
                    s.classList.remove('active');
                }
            });
        });
        
        // Efeito hover
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            stars.forEach((s, index) => {
                if (index < value) {
                    s.innerHTML = '<i class="fas fa-star"></i>';
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            const currentRating = parseInt(ratingInput.value);
            stars.forEach((s, index) => {
                if (index >= currentRating) {
                    s.innerHTML = '<i class="far fa-star"></i>';
                }
            });
        });
    });
}

// Função de login
function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    // Validação básica
    if (!email || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Verificar se é o usuário cadastrado
    const usuarioCadastrado = JSON.parse(localStorage.getItem('usuarioCadastrado'));
    
    if (usuarioCadastrado && usuarioCadastrado.email === email) {
        // Em um sistema real, verificar hash da senha
        usuarioLogado = usuarioCadastrado;
        
        // Mostrar app e esconder login
        document.getElementById('loginBox').classList.add('hidden');
        document.getElementById('appBox').classList.remove('hidden');
        
        // Atualizar informações do usuário
        document.getElementById('userName').textContent = usuarioLogado.nome;
        document.getElementById('userEmail').textContent = usuarioLogado.email;
        
        // Carregar livros
        carregarLivros();
        atualizarEstatisticas();
    } else {
        alert('E-mail ou senha incorretos!');
    }
}

// Função de logout
function logout() {
    usuarioLogado = null;
    document.getElementById('loginBox').classList.remove('hidden');
    document.getElementById('appBox').classList.add('hidden');
    document.getElementById('email').value = '';
    document.getElementById('senha').value = '';
}

// Função para adicionar livro
function adicionarLivro() {
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const ano = document.getElementById('ano').value;
    const descricao = document.getElementById('descricao').value;
    const categoria = document.getElementById('categoria').value;
    const paginas = document.getElementById('paginas').value;
    const nota = document.getElementById('nota').value;
    
    if (!titulo || !autor) {
        alert('Por favor, preencha pelo menos título e autor!');
        return;
    }
    
    const novoLivro = {
        id: Date.now(),
        titulo,
        autor,
        ano: ano || null,
        descricao: descricao || '',
        categoria: categoria || 'outro',
        paginas: paginas || null,
        nota: parseInt(nota) || 0,
        dataAdicao: new Date().toISOString()
    };
    
    livros.push(novoLivro);
    salvarLivros();
    carregarLivros();
    atualizarEstatisticas();
    limparFormulario();
    
    // Mostrar feedback visual
    showNotification('Livro adicionado com sucesso!', 'success');
}

// Função para carregar e exibir livros
function carregarLivros() {
    const listaLivros = document.getElementById('listaLivros');
    const emptyState = document.getElementById('emptyState');
    const busca = document.getElementById('buscaLivro').value.toLowerCase();
    const ordenacao = document.getElementById('filtroOrdenacao').value;
    
    // Filtrar livros
    let livrosFiltrados = livros.filter(livro => {
        if (!busca) return true;
        
        return livro.titulo.toLowerCase().includes(busca) ||
               livro.autor.toLowerCase().includes(busca) ||
               (livro.ano && livro.ano.toString().includes(busca)) ||
               livro.descricao.toLowerCase().includes(busca);
    });
    
    // Ordenar livros
    livrosFiltrados.sort((a, b) => {
        switch(ordenacao) {
            case 'titulo':
                return a.titulo.localeCompare(b.titulo);
            case 'autor':
                return a.autor.localeCompare(b.autor);
            case 'ano':
                return (b.ano || 0) - (a.ano || 0);
            case 'recente':
                return new Date(b.dataAdicao) - new Date(a.dataAdicao);
            default:
                return 0;
        }
    });
    
    // Atualizar contador
    document.getElementById('contadorLivros').textContent = livrosFiltrados.length;
    
    // Se não houver livros, mostrar estado vazio
    if (livrosFiltrados.length === 0) {
        listaLivros.innerHTML = '';
        emptyState.classList.remove('hidden');
        listaLivros.appendChild(emptyState);
        return;
    }
    
    emptyState.classList.add('hidden');
    listaLivros.innerHTML = '';
    
    // Gerar HTML dos livros
    livrosFiltrados.forEach(livro => {
        const livroElement = document.createElement('div');
        livroElement.className = 'livro-item';
        livroElement.innerHTML = `
            <div class="livro-header">
                <h3 class="livro-titulo">${livro.titulo}</h3>
                <span class="livro-categoria">${getCategoriaLabel(livro.categoria)}</span>
            </div>
            <div class="livro-meta">
                <span><i class="fas fa-user-edit"></i> ${livro.autor}</span>
                ${livro.ano ? `<span><i class="fas fa-calendar-alt"></i> ${livro.ano}</span>` : ''}
                ${livro.paginas ? `<span><i class="fas fa-file-alt"></i> ${livro.paginas} páginas</span>` : ''}
                ${livro.nota > 0 ? `<span><i class="fas fa-star"></i> ${livro.nota}/5</span>` : ''}
            </div>
            ${livro.descricao ? `<p class="livro-descricao">${livro.descricao}</p>` : ''}
            <div class="livro-actions">
                <button class="btn-action" onclick="editarLivro(${livro.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action delete" onclick="removerLivro(${livro.id})">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        listaLivros.appendChild(livroElement);
    });
}

// Função para atualizar estatísticas
function atualizarEstatisticas() {
    document.getElementById('totalLivros').textContent = livros.length;
    
    // Contar autores únicos
    const autoresUnicos = [...new Set(livros.map(l => l.autor))];
    document.getElementById('totalAutores').textContent = autoresUnicos.length;
    
    // Último ano de publicação
    const anos = livros.map(l => l.ano).filter(a => a);
    const ultimoAno = anos.length > 0 ? Math.max(...anos) : '-';
    document.getElementById('ultimoAno').textContent = ultimoAno;
}

// Função para remover livro
function removerLivro(id) {
    if (confirm('Tem certeza que deseja remover este livro?')) {
        livros = livros.filter(livro => livro.id !== id);
        salvarLivros();
        carregarLivros();
        atualizarEstatisticas();
        showNotification('Livro removido com sucesso!', 'success');
    }
}

// Função para editar livro
function editarLivro(id) {
    const livro = livros.find(l => l.id === id);
    if (!livro) return;
    
    // Preencher formulário com dados do livro
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('ano').value = livro.ano || '';
    document.getElementById('descricao').value = livro.descricao || '';
    document.getElementById('categoria').value = livro.categoria || 'outro';
    document.getElementById('paginas').value = livro.paginas || '';
    document.getElementById('nota').value = livro.nota || 0;
    
    // Atualizar estrelas visuais
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('ratingText');
    const ratingTexts = {
        0: "Não avaliado",
        1: "Muito ruim",
        2: "Ruim",
        3: "Regular",
        4: "Bom",
        5: "Excelente"
    };
    
    stars.forEach((star, index) => {
        if (index < livro.nota) {
            star.innerHTML = '<i class="fas fa-star"></i>';
            star.classList.add('active');
        } else {
            star.innerHTML = '<i class="far fa-star"></i>';
            star.classList.remove('active');
        }
    });
    
    ratingText.textContent = ratingTexts[livro.nota] || "Não avaliado";
    
    // Remover livro para substituição
    livros = livros.filter(l => l.id !== id);
    
    // Rolar para o formulário
    document.getElementById('titulo').focus();
    showNotification('Preencha o formulário e clique em Salvar para atualizar o livro.', 'info');
}

// Função para ordenar livros
function ordenarLivros() {
    carregarLivros();
}

// Função para limpar busca
function limparBusca() {
    document.getElementById('buscaLivro').value = '';
    carregarLivros();
}

// Função para limpar formulário
function limparFormulario() {
    document.getElementById('titulo').value = '';
    document.getElementById('autor').value = '';
    document.getElementById('ano').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('paginas').value = '';
    document.getElementById('nota').value = '0';
    
    // Resetar estrelas
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.innerHTML = '<i class="far fa-star"></i>';
        star.classList.remove('active');
    });
    document.getElementById('ratingText').textContent = 'Não avaliado';
    
    showNotification('Formulário limpo!', 'info');
}

// Funções auxiliares
function salvarLivros() {
    localStorage.setItem('livros', JSON.stringify(livros));
}

function getCategoriaLabel(categoria) {
    const categorias = {
        'ficcao': 'Ficção',
        'nao-ficcao': 'Não-Ficção',
        'biografia': 'Biografia',
        'tecnologia': 'Tecnologia',
        'literatura': 'Literatura',
        'outro': 'Outro'
    };
    return categorias[categoria] || categoria;
}

function showNotification(message, type) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Contador de caracteres da descrição
function initDescricaoCounter() {
    const descricao = document.getElementById('descricao');
    const charCount = document.querySelector('.char-count');
    
    if (descricao && charCount) {
        descricao.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = `${count}/500 caracteres`;
            
            if (count > 450) {
                charCount.style.color = '#c45a5a';
            } else if (count > 400) {
                charCount.style.color = '#d2691e';
            } else {
                charCount.style.color = '#666666';
            }
            
            if (count > 500) {
                this.value = this.value.substring(0, 500);
                charCount.textContent = '500/500 caracteres';
                charCount.style.color = '#c45a5a';
            }
        });
    }
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há usuário logado (simulação)
    const usuarioCadastrado = JSON.parse(localStorage.getItem('usuarioCadastrado'));
    if (usuarioCadastrado && localStorage.getItem('usuarioLembrado') === 'true') {
        document.getElementById('email').value = usuarioCadastrado.email;
        document.getElementById('lembrar').checked = true;
    }
    
    // Inicializar sistemas
    initRatingSystem();
    initDescricaoCounter();
    
    // Configurar lembrança de login
    const lembrarCheckbox = document.getElementById('lembrar');
    if (lembrarCheckbox) {
        lembrarCheckbox.addEventListener('change', function() {
            localStorage.setItem('usuarioLembrado', this.checked);
        });
    }
});

// Adicione este CSS para notificações:
const notificationCSS = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 10px;
    background: white;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1000;
    transform: translateX(150%);
    transition: transform 0.3s ease;
    border-left: 4px solid var(--vinho);
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-left-color: #2a7a2a;
}

.notification.success i {
    color: #2a7a2a;
}

.notification.info {
    border-left-color: #2c7be5;
}

.notification.info i {
    color: #2c7be5;
}
`;

// Adicionar CSS das notificações ao documento
const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);