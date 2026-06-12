/**
 * Autenticação local (navegador).
 * Ideal para GitHub Pages — para produção com muitos usuários, use um backend.
 */
import { supabase } from './supabase.js';

const Auth = {
    SESSION_KEY: 'imperio_session',
    USERS_KEY: 'imperio_users',

    async hashPassword(password) {
        const data = new TextEncoder().encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    getUsers() {
        try {
            const raw = localStorage.getItem(this.USERS_KEY);
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    },

    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    getSession() {
        try {
            const raw = sessionStorage.getItem(this.SESSION_KEY) || localStorage.getItem(this.SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);
            if (session.expiresAt && Date.now() > session.expiresAt) {
                this.clearSession();
                return null;
            }
            return session;
        } catch {
            return null;
        }
    },

    setSession(session, remember = false) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(this.SESSION_KEY, JSON.stringify(session));
        const other = remember ? sessionStorage : localStorage;
        other.removeItem(this.SESSION_KEY);
    },

    clearSession() {
        sessionStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_KEY);
    },

    isLoggedIn() {
        return !!this.getSession();
    },

    getCurrentUser() {
        const session = this.getSession();

        if (!session) {
            return null;
        }

        return {
            id: session.userId,
            name: session.name || '',
            email: session.email || '',
            phone: session.phone || '',
            role: session.role || 'customer'
        };
    },

    async login(email, password, remember = false) {

        const emailNormalizado = email.trim().toLowerCase();

        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select(`
            id,
            nome,
            email,
            senha_hash,
            telefone,
            tipo_usuario,
            ativo
        `)
            .eq('email', emailNormalizado)
            .eq('ativo', true)
            .maybeSingle();

        if (error) {
            console.error(error);

            return {
                ok: false,
                message: 'Erro ao consultar usuário.'
            };
        }

        if (!usuario) {
            return {
                ok: false,
                message: 'Usuário não encontrado.'
            };
        }

        const senhaHash = await this.hashPassword(password);

        console.log('HASH DIGITADO:', senhaHash);
        console.log('HASH BANCO:', usuario.senha_hash);

        if (!usuario.senha_hash) {
            return {
                ok: false,
                message: 'Usuário sem senha cadastrada.'
            };
        }

        if (senhaHash !== usuario.senha_hash) {
            return {
                ok: false,
                message: 'Senha incorreta.'
            };
        }

        this.setSession({
            userId: usuario.id,
            name: usuario.nome,
            email: usuario.email,
            phone: usuario.telefone,
            role: usuario.tipo_usuario,
            expiresAt: remember
                ? Date.now() + (30 * 24 * 60 * 60 * 1000)
                : null
        }, remember);

        return {
            ok: true
        };
    },

    async register({
        name,
        email,
        phone,
        password,
        confirmPassword
    }) {

        if (password !== confirmPassword) {
            return {
                ok: false,
                message: 'As senhas não coincidem.'
            };
        }

        const emailNormalizado = email.trim().toLowerCase();

        const { data: existente } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', emailNormalizado)
            .maybeSingle();

        if (existente) {
            return {
                ok: false,
                message: 'Este e-mail já está cadastrado.'
            };
        }

        const senhaHash = await this.hashPassword(password);

        const { error } = await supabase
            .from('usuarios')
            .insert({
                nome: name,
                email: emailNormalizado,
                telefone: phone,
                senha_hash: senhaHash,
                tipo_usuario: 'cliente',
                ativo: true
            });

        if (error) {
            return {
                ok: false,
                message: error.message
            };
        }

        return {
            ok: true
        };
    },

    logout() {
        this.clearSession();
        this.updateHeaderUI();
        this.renderAccountSection();
        this.prefillCheckout();
        window.updateReviewFormState?.();
    },

    async updateProfile(data) {

        const session = this.getSession();

        if (!session) {
            return;
        }

        await supabase
            .from('usuarios')
            .update({
                nome: data.name,
                telefone: data.phone,
                atualizado_em: new Date().toISOString()
            })
            .eq('id', session.userId);
    },

    getOrdersKey(userId) {
        return `imperio_orders_${userId}`;
    },

    getOrders() {
        const user = this.getCurrentUser();
        if (!user || user.role === 'admin') return [];

        try {
            const raw = localStorage.getItem(this.getOrdersKey(user.id));
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list.sort((a, b) => b.id - a.id) : [];
        } catch {
            return [];
        }
    },

    saveOrder(order) {
        const user = this.getCurrentUser();
        if (!user || user.role === 'admin') return;

        const orders = this.getOrders();
        orders.unshift({
            id: Date.now(),
            date: new Date().toISOString(),
            ...order
        });
        localStorage.setItem(this.getOrdersKey(user.id), JSON.stringify(orders.slice(0, 50)));

        // Salvar também no novo sistema de status de pedidos
        if (typeof OrderStatus !== 'undefined') {
            OrderStatus.createOrder(user.id, order);
        }

        this.updateProfile({
            phone: order.phone || user.phone,
            address: order.address || user.address,
            cep: order.cep || user.cep
        });
    },

    async prefillCheckout() {
        const user = await this.getCurrentUser();

        if (!user) return;

        const nameEl = document.getElementById('customerName');
        const phoneEl = document.getElementById('customerPhone');

        if (nameEl) nameEl.value = user.name || '';
        if (phoneEl) phoneEl.value = user.phone || '';
    },

    openLoginModal(tab = 'login') {
        const modal = document.getElementById('loginModal');
        const overlay = document.getElementById('overlay');
        if (!modal || !overlay) return;

        this.switchAuthTab(tab);
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('loginEmail')?.focus();
    },

    closeLoginModal() {
        document.getElementById('loginModal')?.classList.remove('active');
        const checkoutOpen = document.getElementById('checkoutModal')?.classList.contains('active');
        const cartOpen = document.getElementById('cartSidebar')?.classList.contains('open');
        if (!checkoutOpen && !cartOpen) {
            document.getElementById('overlay')?.classList.remove('active');
            document.body.style.overflow = '';
        }
        this.clearAuthErrors();
    },

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(btn => {
            const isActive = btn.dataset.tab === tab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });
        document.getElementById('loginPanel').hidden = tab !== 'login';
        document.getElementById('registerPanel').hidden = tab !== 'register';
    },

    clearAuthErrors() {
        document.getElementById('authError')?.classList.remove('show');
        document.querySelectorAll('.auth-form input').forEach(i => i.classList.remove('error'));
    },

    showAuthError(message) {
        const el = document.getElementById('authError');
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
    },

    async updateHeaderUI() {
        const session = this.getSession();
        const user = await this.getCurrentUser();

        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userNameEl = document.getElementById('userMenuName');
        const navConta = document.getElementById('navConta');

        if (session && user) {
            loginBtn?.setAttribute('hidden', '');
            userMenu?.removeAttribute('hidden');

            if (userNameEl) {
                const firstName = (user.name || 'Usuário').split(' ')[0];
                userNameEl.textContent = firstName;
            }

            navConta?.classList.remove('nav-conta-hidden');
        } else {
            loginBtn?.removeAttribute('hidden');
            userMenu?.setAttribute('hidden', '');
            navConta?.classList.add('nav-conta-hidden');
        }
    },

    async renderAccountSection() {
        const guest = document.getElementById('accountGuest');
        const logged = document.getElementById('accountLogged');

        const user = await this.getCurrentUser();

        if (!guest || !logged) return;

        if (!user) {
            guest.hidden = false;
            logged.hidden = true;
            return;
        }

        guest.hidden = true;
        logged.hidden = false;

        document.getElementById('accountName').textContent = user.name || '';
        document.getElementById('accountEmail').textContent = user.email || '';

        document.getElementById('profileName').value = user.name || '';
        document.getElementById('profilePhone').value = user.phone || '';
    },

    async handleLoginSubmit(e) {
        e.preventDefault();
        this.clearAuthErrors();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('loginRemember')?.checked;

        const result = await this.login(email, password, remember);
        if (!result.ok) {
            this.showAuthError(result.message);
            return;
        }

        this.closeLoginModal();
        this.updateHeaderUI();
        this.renderAccountSection();
        this.prefillCheckout();
        window.updateReviewFormState?.();
        document.getElementById('loginForm')?.reset();
    },

    async handleRegisterSubmit(e) {
        e.preventDefault();
        this.clearAuthErrors();

        const result = await this.register({
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            password: document.getElementById('registerPassword').value,
            confirmPassword: document.getElementById('registerPasswordConfirm').value
        });

        if (!result.ok) {
            this.showAuthError(result.message);
            return;
        }

        this.closeLoginModal();
        this.updateHeaderUI();
        this.renderAccountSection();
        this.prefillCheckout();
        window.updateReviewFormState?.();
        document.getElementById('registerForm')?.reset();
    },

    handleProfileSubmit(e) {
        e.preventDefault();
        const user = this.getCurrentUser();
        if (!user || user.role === 'admin') return;

        this.updateProfile({
            name: document.getElementById('profileName').value.trim(),
            phone: document.getElementById('profilePhone').value.trim(),
            address: document.getElementById('profileAddress').value.trim(),
            cep: document.getElementById('profileCep').value.trim()
        });

        this.updateHeaderUI();
        this.renderAccountSection();
        this.prefillCheckout();

        const msg = document.getElementById('profileSavedMsg');
        if (msg) {
            msg.classList.add('show');
            setTimeout(() => msg.classList.remove('show'), 3000);
        }
    },

    init() {
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.addEventListener('click', () => this.switchAuthTab(btn.dataset.tab));
        });

        document.getElementById('loginForm')?.addEventListener('submit', e => this.handleLoginSubmit(e));
        document.getElementById('registerForm')?.addEventListener('submit', e => this.handleRegisterSubmit(e));
        document.getElementById('profileForm')?.addEventListener('submit', e => this.handleProfileSubmit(e));

        document.getElementById('loginBtn')?.addEventListener('click', () => this.openLoginModal('login'));
        document.getElementById('accountLoginBtn')?.addEventListener('click', () => this.openLoginModal('login'));
        document.getElementById('accountRegisterBtn')?.addEventListener('click', () => this.openLoginModal('register'));

        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('userMenuBtn')?.addEventListener('click', () => {
            document.getElementById('userMenuDropdown')?.classList.toggle('open');
        });

        document.getElementById('closeLoginModal')?.addEventListener('click', () => this.closeLoginModal());

        document.getElementById('registerPhone')?.addEventListener('input', e => {
            if (typeof maskPhone === 'function') maskPhone(e.target);
        });
        document.getElementById('profilePhone')?.addEventListener('input', e => {
            if (typeof maskPhone === 'function') maskPhone(e.target);
        });
        document.getElementById('profileCep')?.addEventListener('input', e => {
            if (typeof maskCep === 'function') maskCep(e.target);
        });

        document.addEventListener('click', e => {
            const menu = document.getElementById('userMenu');
            if (menu && !menu.contains(e.target)) {
                document.getElementById('userMenuDropdown')?.classList.remove('open');
            }
        });

        this.updateHeaderUI();
        this.renderAccountSection();
        this.prefillCheckout();
    }
}

window.Auth = Auth;
