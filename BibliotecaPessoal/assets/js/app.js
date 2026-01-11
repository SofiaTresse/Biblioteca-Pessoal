const API_AUTH = './backend/routes/auth.php';
const API_LIVROS = './backend/routes/livros.php';

async function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const res = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (data.success || data.sucess) {
        document.getElementById('loginBox').classList.add('hidden');
        document.getElementById('appBox').classList.remove('hidden');
        carregarLivros();
    } else {
        alert(data.message);
    }
}

async function logout() {
    await fetch(API_AUTH + '?logout=1');
    location.reload();
}

async function carregarLivros() {
    const res = await fetch(API_LIVROS);
    const livros = await res.json();

    const lista = document.getElementById('listaLivros');
    lista.innerHTML = '';

    livros.forEach(livro => {
        lista.innerHTML += `
            <div class="livro">
                <strong>${livro.titulo}</strong><br>
                Autor: ${livro.autor}<br>
                Status:
                <select onchange="mudarStatus(${livro.id}, this.value)">
                    <option value="nao_lido" ${livro.status_leitura === 'nao_lido' ? 'selected' : ''}>Não lido</option>
                    <option value="lendo" ${livro.status_leitura === 'lendo' ? 'selected' : ''}>Lendo</option>
                    <option value="lido" ${livro.status_leitura === 'lido' ? 'selected' : ''}>Lido</option>
                </select>
            </div>
        `;
    });
}

async function adicionarLivro() {
    const dados = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        ano_publicacao: document.getElementById('ano').value,
        descricao: document.getElementById('descricao').value
    };

    await fetch(API_LIVROS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    carregarLivros();
}

async function mudarStatus(livro_id, status) {
    await fetch(API_LIVROS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id, status })
    });
}
