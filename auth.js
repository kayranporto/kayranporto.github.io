/**
 * Autenticação local (navegador).
 * Ideal para GitHub Pages — para produção com muitos usuários, use um backend.
 */
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
        if (!session) return null;
        if (session.role === 'admin') {
            return {
                id: 'admin',
                name: 'Administrador',
                email: session.email,
                phone: CONFIG?.phoneDisplay || '',
                address: '',
                cep: '',
                role: 'admin'
            };
        }
        return this.getUsers().find(u => u.id === session.userId) || null;
    },

    async login(email, password, remember = false) {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password) {
            return { ok: false, message: 'Preencha e-mail e senha.' };
        }

        const admin = CONFIG?.auth?.admin;
        if (admin && normalizedEmail === admin.email.toLowerCase()) {
            const hash = await this.hashPassword(password);
            const adminHash = await this.hashPassword(admin.password);
            if (hash === adminHash) {
                const session = {
                    email: admin.email,
                    role: 'admin',
                    expiresAt: remember ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null
                };
                this.setSession(session, remember);
                return { ok: true };
            }
            return { ok: false, message: 'E-mail ou senha incorretos.' };
        }

        const users = this.getUsers();
        const user = users.find(u => u.email === normalizedEmail);
        if (!user) {
            return { ok: false, message: 'Conta não encontrada. Crie seu cadastro.' };
        }

        const hash = await this.hashPassword(password);
        if (user.passwordHash !== hash) {
            return { ok: false, message: 'E-mail ou senha incorretos.' };
        }

        const session = {
            userId: user.id,
            email: user.email,
            role: 'customer',
            expiresAt: remember ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null
        };
        this.setSession(session, remember);
        return { ok: true };
    },

    async register({ name, email, phone, password, confirmPassword }) {
        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const phoneDigits = phone.replace(/\D/g, '');

        if (!trimmedName || trimmedName.length < 2) {
            return { ok: false, message: 'Informe seu nome completo.' };
        }
        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return { ok: false, message: 'Informe um e-mail válido.' };
        }
        if (phoneDigits.length < 10) {
            return { ok: false, message: 'Informe um telefone válido.' };
        }
        if (!password || password.length < 6) {
            return { ok: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
        }
        if (password !== confirmPassword) {
            return { ok: false, message: 'As senhas não coincidem.' };
        }

        const adminEmail = CONFIG?.auth?.admin?.email?.toLowerCase();
        if (adminEmail && normalizedEmail === adminEmail) {
            return { ok: false, message: 'Este e-mail não pode ser usado para cadastro.' };
        }

        const users = this.getUsers();
        if (users.some(u => u.email === normalizedEmail)) {
            return { ok: false, message: 'Este e-mail já está cadastrado. Faça login.' };
        }

        const user = {
            id: `u_${Date.now()}`,
            name: trimmedName,
            email: normalizedEmail,
            phone,
            passwordHash: await this.hashPassword(password),
            address: '',
            cep: '',
            createdAt: new Date().toISOString()
        };

        users.push(user);
        this.saveUsers(users);

        this.setSession({
            userId: user.id,
            email: user.email,
            role: 'customer',
            expiresAt: null
        }, false);

        return { ok: true };
    },

    logout() {
        this.clearSession();
        this.updateHeaderUI();
        this.renderAccountSection();
        this.prefillCheckout();
    },

    updateProfile(data) {
        const session = this.getSession();
        if (!session || session.role === 'admin') return;

        const users = this.getUsers();
        const index = users.findIndex(u => u.id === session.userId);
        if (index === -1) return;

        users[index] = { ...users[index], ...data };
        this.saveUsers(users);
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

        this.updateProfile({
            phone: order.phone || user.phone,
            address: order.address || user.address,
            cep: order.cep || user.cep
        });
    },

    prefillCheckout() {
        const user = this.getCurrentUser();
        const nameEl = document.getElementById('customerName');
        const phoneEl = document.getElementById('customerPhone');
        const addressEl = document.getElementById('customerAddress');
        const cepEl = document.getElementById('customerCep');

        if (!user || user.role === 'admin') {
            return;
        }

        if (nameEl && user.name) nameEl.value = user.name;
        if (phoneEl && user.phone) phoneEl.value = user.phone;
        if (addressEl && user.address) addressEl.value = user.address;
        if (cepEl && user.cep) cepEl.value = user.cep;
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

    updateHeaderUI() {
        const session = this.getSession();
        const user = this.getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        const userNameEl = document.getElementById('userMenuName');
        const navConta = document.getElementById('navConta');

        if (session && user) {
            loginBtn?.setAttribute('hidden', '');
            userMenu?.removeAttribute('hidden');
            if (userNameEl) {
                const firstName = user.name.split(' ')[0];
                userNameEl.textContent = firstName;
            }
            navConta?.classList.remove('nav-conta-hidden');
        } else {
            loginBtn?.removeAttribute('hidden');
            userMenu?.setAttribute('hidden', '');
            navConta?.classList.add('nav-conta-hidden');
        }
    },

    renderAccountSection() {
        const guest = document.getElementById('accountGuest');
        const logged = document.getElementById('accountLogged');
        const user = this.getCurrentUser();

        if (!guest || !logged) return;

        if (!user) {
            guest.hidden = false;
            logged.hidden = true;
            return;
        }

        guest.hidden = true;
        logged.hidden = false;

        document.getElementById('accountName').textContent = user.name;
        document.getElementById('accountEmail').textContent = user.email;
        document.getElementById('profileName').value = user.name;
        document.getElementById('profilePhone').value = user.phone || '';
        document.getElementById('profileAddress').value = user.address || '';
        document.getElementById('profileCep').value = user.cep || '';

        const ordersList = document.getElementById('ordersList');
        const ordersEmpty = document.getElementById('ordersEmpty');
        const orders = this.getOrders();

        if (!ordersList) return;

        if (orders.length === 0) {
            ordersList.innerHTML = '';
            if (ordersEmpty) ordersEmpty.hidden = false;
            return;
        }

        if (ordersEmpty) ordersEmpty.hidden = true;
        ordersList.innerHTML = orders.map(order => {
            const date = new Date(order.date).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const itemsPreview = order.items
                ?.map(i => `${i.quantity}x ${i.name}`)
                .slice(0, 3)
                .join(', ') || '';
            const more = (order.items?.length || 0) > 3 ? '…' : '';

            return `
                <article class="order-card">
                    <div class="order-card-header">
                        <span class="order-date"><i class="fas fa-calendar-alt"></i> ${date}</span>
                        <span class="order-total">${typeof formatMoney === 'function' ? formatMoney(order.total) : `R$ ${order.total}`}</span>
                    </div>
                    <p class="order-items">${itemsPreview}${more}</p>
                    <p class="order-payment"><i class="fas fa-wallet"></i> ${order.payment || '—'}</p>
                </article>
            `;
        }).join('');
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
};

window.Auth = Auth;
