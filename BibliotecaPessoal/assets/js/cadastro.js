// Sistema de Cadastro
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const cadastroForm = document.getElementById('cadastroForm');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const bioInput = document.getElementById('bio');
    const charCount = document.querySelector('.char-count');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text span');
    const senhaMatch = document.getElementById('senhaMatch');
    const successModal = document.getElementById('successModal');
    const dataNascimentoInput = document.getElementById('dataNascimento');
    
    // Configurar data máxima (hoje) para data de nascimento
    const hoje = new Date().toISOString().split('T')[0];
    dataNascimentoInput.max = hoje;
    
    // Configurar data padrão (18 anos atrás)
    const dataPadrao = new Date();
    dataPadrao.setFullYear(dataPadrao.getFullYear() - 18);
    dataNascimentoInput.value = dataPadrao.toISOString().split('T')[0];
    
    // Alternar visibilidade da senha
    window.togglePassword = function(fieldId) {
        const field = document.getElementById(fieldId);
        const icon = field.nextElementSibling.querySelector('i');
        
        if (field.type === 'password') {
            field.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            field.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };
    
    // Verificar força da senha
    function checkPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return strength;
    }
    
    // Atualizar indicador de força da senha
    function updatePasswordStrength() {
        const password = senhaInput.value;
        const strength = checkPasswordStrength(password);
        const width = (strength / 4) * 100;
        
        strengthBar.style.width = `${width}%`;
        
        let text, color;
        switch(strength) {
            case 0:
                text = "muito fraca";
                color = "#c45a5a";
                break;
            case 1:
                text = "fraca";
                color = "#c45a5a";
                break;
            case 2:
                text = "média";
                color = "#d2691e";
                break;
            case 3:
                text = "forte";
                color = "#2d5016";
                break;
            case 4:
                text = "muito forte";
                color = "#2a7a2a";
                break;
            default:
                text = "fraca";
                color = "#c45a5a";
        }
        
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }
    
    // Verificar se as senhas coincidem
    function checkPasswordMatch() {
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;
        
        if (confirmarSenha === '') {
            senhaMatch.textContent = '';
            senhaMatch.className = 'validation-message';
            return;
        }
        
        if (senha === confirmarSenha) {
            senhaMatch.textContent = '✓ As senhas coincidem';
            senhaMatch.className = 'validation-message success';
            confirmarSenhaInput.classList.add('valid');
            confirmarSenhaInput.classList.remove('invalid');
        } else {
            senhaMatch.textContent = '✗ As senhas não coincidem';
            senhaMatch.className = 'validation-message error';
            confirmarSenhaInput.classList.add('invalid');
            confirmarSenhaInput.classList.remove('valid');
        }
    }
    
    // Contar caracteres da biografia
    function updateBioCharCount() {
        const count = bioInput.value.length;
        charCount.textContent = `${count}/200 caracteres`;
        
        if (count > 190) {
            charCount.style.color = '#c45a5a';
        } else if (count > 150) {
            charCount.style.color = '#d2691e';
        } else {
            charCount.style.color = '#666666';
        }
    }
    
    // Limitar caracteres da biografia
    function limitBioChars() {
        if (bioInput.value.length > 200) {
            bioInput.value = bioInput.value.substring(0, 200);
            updateBioCharCount();
        }
    }
    
    // Mostrar modal de sucesso
    function showSuccessModal() {
        successModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // Redirecionar para login
    window.redirectToLogin = function() {
        window.location.href = 'index.html';
    };
    
    // Função principal de cadastro
    window.cadastrar = function(event) {
        event.preventDefault();
        
        // Coletar dados do formulário
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const dataNascimento = document.getElementById('dataNascimento').value;
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;
        const bio = bioInput.value.trim();
        const termos = document.getElementById('termos').checked;
        
        // Validações
        if (!nome || !email || !dataNascimento || !senha || !confirmarSenha) {
            showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        if (!Auth.validateEmail(email)) {
            showNotification('Por favor, insira um email válido', 'error');
            document.getElementById('email').focus();
            return;
        }
        
        if (senha !== confirmarSenha) {
            showNotification('As senhas não coincidem', 'error');
            senhaInput.focus();
            return;
        }
        
        if (senha.length < 6) {
            showNotification('A senha deve ter no mínimo 6 caracteres', 'error');
            senhaInput.focus();
            return;
        }
        
        if (!termos) {
            showNotification('Você deve aceitar os termos de uso', 'error');
            return;
        }
        
        // Verificar idade mínima (13 anos)
        const nascimento = new Date(dataNascimento);
        const hoje = new Date();
        const idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        
        if (idade < 13 || (idade === 13 && mes < 0)) {
            showNotification('Você deve ter pelo menos 13 anos para se cadastrar', 'error');
            return;
        }
        
        try {
            // Registrar usuário
            const usuario = Auth.register({
                nome,
                email,
                dataNascimento,
                senha, // Em um sistema real, isso seria hash
                bio
            });
            
            // Mostrar modal de sucesso
            showSuccessModal();
            
            // Opcional: Login automático após cadastro
            // Auth.login(email, senha, false);
            
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    // Event Listeners
    senhaInput.addEventListener('input', function() {
        updatePasswordStrength();
        checkPasswordMatch();
    });
    
    confirmarSenhaInput.addEventListener('input', checkPasswordMatch);
    
    bioInput.addEventListener('input', function() {
        limitBioChars();
        updateBioCharCount();
    });
    
    // Inicializar contador de caracteres
    updateBioCharCount();
    
    // Função para mostrar notificações (mesma do login)
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
    
    // Adicionar CSS das notificações se não existir
    if (!document.querySelector('style[data-notifications]')) {
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
        
        const style = document.createElement('style');
        style.setAttribute('data-notifications', '');
        style.textContent = notificationCSS;
        document.head.appendChild(style);
    }
});