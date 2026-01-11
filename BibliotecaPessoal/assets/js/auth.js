// Sistema de Autenticação
const Auth = {
    // Usuário atual
    currentUser: null,
    
    // Inicializar sistema de autenticação
    init: function() {
        this.loadCurrentUser();
        this.checkAutoLogin();
    },
    
    // Carregar usuário atual do localStorage
    loadCurrentUser: function() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    },
    
    // Verificar login automático
    checkAutoLogin: function() {
        if (this.isLoggedIn() && localStorage.getItem('rememberMe') === 'true') {
            // Redirecionar para biblioteca se já estiver logado
            if (window.location.pathname.includes('index.html') || 
                window.location.pathname === '/' ||
                window.location.pathname.includes('cadastro.html')) {
                window.location.href = 'biblioteca.html';
            }
        }
    },
    
    // Fazer login
    login: function(email, password, remember = false) {
        // Em um sistema real, isso seria uma chamada API
        // Para demonstração, vamos usar localStorage
        
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.email === email);
        
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }
        
        // Em um sistema real, comparar hash da senha
        if (usuario.senha !== password) {
            throw new Error('Senha incorreta');
        }
        
        // Salvar usuário atual
        this.currentUser = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            dataNascimento: usuario.dataNascimento,
            bio: usuario.bio
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('rememberMe', remember.toString());
        
        return this.currentUser;
    },
    
    // Fazer logout
    logout: function() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Se não quiser lembrar, remover também o rememberMe
        if (localStorage.getItem('rememberMe') === 'false') {
            localStorage.removeItem('rememberMe');
        }
        
        // Redirecionar para login
        window.location.href = 'index.html';
    },
    
    // Cadastrar novo usuário
    register: function(userData) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        
        // Verificar se email já existe
        if (usuarios.some(u => u.email === userData.email)) {
            throw new Error('Este email já está cadastrado');
        }
        
        // Criar novo usuário
        const novoUsuario = {
            id: Date.now(),
            ...userData,
            dataCadastro: new Date().toISOString()
        };
        
        usuarios.push(novoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        return novoUsuario;
    },
    
    // Verificar se usuário está logado
    isLoggedIn: function() {
        return this.currentUser !== null;
    },
    
    // Obter usuário atual
    getCurrentUser: function() {
        return this.currentUser;
    },
    
    // Verificar força da senha
    checkPasswordStrength: function(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return {
            score: strength,
            level: strength === 0 ? 'muito_fraca' : 
                   strength === 1 ? 'fraca' : 
                   strength === 2 ? 'media' : 
                   strength === 3 ? 'forte' : 'muito_forte'
        };
    },
    
    // Validar email
    validateEmail: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // Resetar senha (simulado)
    resetPassword: function(email) {
        // Em um sistema real, enviar email de recuperação
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.email === email);
        
        if (!usuario) {
            throw new Error('Email não encontrado');
        }
        
        // Aqui normalmente enviaríamos um email com link de recuperação
        // Para demo, apenas retornamos sucesso
        return {
            success: true,
            message: 'Email de recuperação enviado'
        };
    }
};

// Inicializar auth quando o script carregar
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});