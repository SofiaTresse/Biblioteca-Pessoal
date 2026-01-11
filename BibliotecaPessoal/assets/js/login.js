// Gerenciamento da página de login
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const lembrarCheckbox = document.getElementById('lembrar');
    
    // Preencher dados salvos se "lembrar-me" estava ativo
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && rememberMe) {
        emailInput.value = savedEmail;
        lembrarCheckbox.checked = true;
    }
    
    // Alternar visibilidade da senha
    togglePasswordBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            senhaInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
    
    // Enviar formulário de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const senha = senhaInput.value;
        const lembrar = lembrarCheckbox.checked;
        
        // Validações
        if (!email || !senha) {
            showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }
        
        if (!Auth.validateEmail(email)) {
            showNotification('Por favor, insira um email válido', 'error');
            emailInput.focus();
            return;
        }
        
        try {
            // Tentar login
            const usuario = Auth.login(email, senha, lembrar);
            
            // Salvar email se "lembrar-me" estiver marcado
            if (lembrar) {
                localStorage.setItem('savedEmail', email);
            } else {
                localStorage.removeItem('savedEmail');
            }
            
            // Mostrar mensagem de sucesso
            showNotification(`Bem-vindo(a), ${usuario.nome}!`, 'success');
            
            // Redirecionar para biblioteca após 1 segundo
            setTimeout(() => {
                window.location.href = 'biblioteca.html';
            }, 1000);
            
        } catch (error) {
            showNotification(error.message, 'error');
            senhaInput.value = '';
            senhaInput.focus();
        }
    });
    
    // Login com Google (simulado)
    document.querySelector('.social-btn.google').addEventListener('click', function() {
        showNotification('Login com Google em desenvolvimento', 'info');
    });
    
    // Login com Facebook (simulado)
    document.querySelector('.social-btn.facebook').addEventListener('click', function() {
        showNotification('Login com Facebook em desenvolvimento', 'info');
    });
    
    // Esqueci a senha
    document.querySelector('.forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = prompt('Digite seu email para recuperar a senha:');
        
        if (email && Auth.validateEmail(email)) {
            try {
                const result = Auth.resetPassword(email);
                showNotification(result.message, 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        } else if (email) {
            showNotification('Email inválido', 'error');
        }
    });
    
    // Função para mostrar notificações
    function showNotification(message, type = 'info') {
        // Remover notificações anteriores
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Ícone baseado no tipo
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        // Adicionar ao body
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remover após 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // Adicionar CSS das notificações
    const notificationCSS = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        background: white;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 350px;
        border-left: 4px solid #2c7be5;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left-color: #00a854;
    }
    
    .notification.success i {
        color: #00a854;
    }
    
    .notification.error {
        border-left-color: #f5222d;
    }
    
    .notification.error i {
        color: #f5222d;
    }
    
    .notification.warning {
        border-left-color: #faad14;
    }
    
    .notification.warning i {
        color: #faad14;
    }
    
    .notification.info {
        border-left-color: #2c7be5;
    }
    
    .notification.info i {
        color: #2c7be5;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification span {
        font-size: 0.95rem;
        line-height: 1.4;
    }
    
    @media (max-width: 768px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            transform: translateY(-150%);
        }
        
        .notification.show {
            transform: translateY(0);
        }
    }
    `;
    
    // Injetar CSS das notificações
    const style = document.createElement('style');
    style.textContent = notificationCSS;
    document.head.appendChild(style);
});