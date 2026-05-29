// ——— Configuração da loja (edite aqui) ———
const CONFIG = {
    storeName: 'Império Delivery',
    whatsapp: '5511999999999',
    phoneDisplay: '(11) 99999-9999',
    minOrder: 25,
    deliveryFee: 5,
    hours: {
        // 0 = domingo, 1 = segunda, ...
        0: { open: 18, close: 22 },
        1: { open: 18, close: 23 },
        2: { open: 18, close: 23 },
        3: { open: 18, close: 23 },
        4: { open: 18, close: 23 },
        5: { open: 18, close: 24 },
        6: { open: 18, close: 24 }
    },
    payment: {
        pixKey: 'contato@imperiodelivery.com',
        pixHolder: 'Império Delivery',
        pixType: 'E-mail' // E-mail, CPF, CNPJ ou Telefone
    },
    auth: {
        admin: {
            email: 'admin@imperiodelivery.com',
            password: 'admin123'
        }
    }
};

const products = [
    { id: 1, name: 'Hambúrguer Artesanal', category: 'hamburguer', price: 28.90, description: 'Pão brioche, carne 180g, queijo cheddar, bacon e molho especial', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', badge: 'Mais Vendido' },
    { id: 2, name: 'Hambúrguer Duplo', category: 'hamburguer', price: 38.90, description: 'Dois hambúrgueres 180g, queijo duplo, bacon e molho especial', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', badge: 'Novo' },
    { id: 3, name: 'Pizza Calabresa', category: 'pizza', price: 45.00, description: 'Molho de tomate, mussarela, calabresa e cebola', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', badge: null },
    { id: 4, name: 'Pizza Pepperoni', category: 'pizza', price: 52.00, description: 'Molho de tomate, mussarela e pepperoni importado', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400', badge: 'Popular', promoPrice: 44.90 },
    { id: 5, name: 'Pizza Marguerita', category: 'pizza', price: 42.00, description: 'Molho de tomate, mussarela de búfala, manjericão fresco', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', badge: null },
    { id: 6, name: 'Coca-Cola 2L', category: 'bebida', price: 12.00, description: 'Refrigerante Coca-Cola garrafa 2 litros', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', badge: null },
    { id: 7, name: 'Suco Natural', category: 'bebida', price: 8.90, description: 'Suco de laranja ou limão natural 500ml', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', badge: 'Natural' },
    { id: 8, name: 'Milkshake', category: 'sobremesa', price: 15.90, description: 'Milkshake de chocolate, morango ou baunilha 400ml', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', badge: null },
    { id: 9, name: 'Sundae', category: 'sobremesa', price: 9.90, description: 'Sorvete de creme com calda de chocolate', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', badge: null },
    { id: 10, name: 'Combo Família', category: 'combo', price: 89.90, description: '2 hambúrgueres + 1 pizza média + 2 refrigerantes 2L', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', badge: 'Economize', promoPrice: 79.90 },
    { id: 11, name: 'Combo Casal', category: 'combo', price: 59.90, description: '1 hambúrguer + 1 pizza média + 1 refrigerante 2L', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', badge: null, promoPrice: 49.90 },
    { id: 12, name: 'Batata Frita', category: 'hamburguer', price: 18.90, description: 'Batata frita crocante com cheddar e bacon', image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400', badge: 'Acompanhamento' }
];

let cart = [];
let currentCategory = 'todos';
let searchQuery = '';

const paymentState = {
    method: null,
    needsChange: null,
    changeFor: '',
    cardType: null
};

const CATEGORY_NAMES = {
    hamburguer: 'Hambúrguer',
    pizza: 'Pizza',
    bebida: 'Bebida',
    sobremesa: 'Sobremesa',
    combo: 'Combo'
};

function formatMoney(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getEffectivePrice(product) {
    return product.promoPrice ?? product.price;
}

function getCategoryName(cat) {
    return CATEGORY_NAMES[cat] || cat;
}

function getWhatsAppUrl(message) {
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${CONFIG.whatsapp}${text}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ——— Persistência do carrinho ———
function saveCart() {
    try {
        localStorage.setItem('imperio_cart', JSON.stringify(cart));
    } catch (_) { /* quota ou modo privado */ }
}

function loadCart() {
    try {
        const saved = localStorage.getItem('imperio_cart');
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;
        cart = parsed.filter(item =>
            products.some(p => p.id === item.id)
        ).map(item => {
            const product = products.find(p => p.id === item.id);
            return { ...product, quantity: Math.max(1, item.quantity || 1) };
        });
    } catch (_) {
        cart = [];
    }
}

// ——— Status da loja ———
function updateStoreStatus() {
    const el = document.getElementById('storeStatus');
    if (!el) return;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const schedule = CONFIG.hours[day];

    if (!schedule) {
        el.textContent = 'Consulte nosso horário';
        el.className = 'store-status';
        return;
    }

    const isOpen = hour >= schedule.open && hour < schedule.close;
    el.className = `store-status ${isOpen ? 'open' : 'closed'}`;
    el.textContent = isOpen
        ? 'Aberto agora — faça seu pedido!'
        : `Fechado — abrimos às ${schedule.open}h`;
}

// ——— Promoções ———
function renderPromotions() {
    const grid = document.getElementById('promoGrid');
    if (!grid) return;

    const promos = products.filter(p => p.promoPrice != null);
    if (promos.length === 0) {
        grid.innerHTML = '<p class="empty-promo">Nenhuma promoção ativa no momento. Confira o cardápio!</p>';
        return;
    }

    grid.innerHTML = promos.map(product => `
        <article class="promo-card">
            <span class="promo-badge">${escapeHtml(product.badge || 'Oferta')}</span>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description)}</p>
            <div class="promo-footer">
                <div class="promo-price">
                    <del>${formatMoney(product.price)}</del>
                    ${formatMoney(product.promoPrice)}
                </div>
                <button type="button" class="promo-btn" onclick="addToCart(${product.id}, true)">
                    Pedir
                </button>
            </div>
        </article>
    `).join('');
}

// ——— Produtos ———
function getFilteredProducts() {
    let list = currentCategory === 'todos'
        ? [...products]
        : products.filter(p => p.category === currentCategory);

    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        list = list.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            getCategoryName(p.category).toLowerCase().includes(q)
        );
    }
    return list;
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('emptyState');
    if (!grid) return;

    const filtered = getFilteredProducts();

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.hidden = false;
        return;
    }

    if (empty) empty.hidden = true;

    grid.innerHTML = filtered.map(product => {
        const price = getEffectivePrice(product);
        const hasPromo = product.promoPrice != null;
        return `
        <article class="product-card" data-category="${product.category}">
            ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ''}
            <div class="product-image-wrap">
                <img src="${product.image}" alt="${escapeHtml(product.name)}" class="product-image" loading="lazy" onerror="this.onerror=null;this.src='logo.png'">
            </div>
            <div class="product-info">
                <p class="product-category">${escapeHtml(getCategoryName(product.category))}</p>
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <p class="product-description">${escapeHtml(product.description)}</p>
                <div class="product-footer">
                    <div class="product-price">
                        ${hasPromo ? `<span style="font-size:0.85rem;color:var(--gray);text-decoration:line-through;margin-right:6px;">${formatMoney(product.price)}</span>` : ''}
                        ${formatMoney(price)}
                    </div>
                    <button type="button" class="add-btn" onclick="addToCart(${product.id})" aria-label="Adicionar ${product.name} ao carrinho">
                        <i class="fas fa-plus" aria-hidden="true"></i>
                        <span class="add-btn-text">Adicionar</span>
                    </button>
                </div>
            </div>
        </article>
    `;
    }).join('');
}

function filterCategory(category, btn) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    renderProducts();
}

// ——— Carrinho ———
function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + getEffectivePrice(item) * item.quantity, 0);
}

function getCartTotal() {
    const subtotal = getCartSubtotal();
    if (subtotal === 0) return 0;
    return subtotal + CONFIG.deliveryFee;
}

function meetsMinimum() {
    return getCartSubtotal() >= CONFIG.minOrder;
}

function addToCart(productId, openCartAfter) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCart();
    showSuccessMessage();

    if (openCartAfter) openCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartSubtotalRow = document.getElementById('cartSubtotalRow');
    const deliveryFeeEl = document.getElementById('deliveryFee');
    const cartMinimum = document.getElementById('cartMinimum');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const mobileCartCount = document.getElementById('mobileCartCount');
    const mobileCartTotal = document.getElementById('mobileCartTotal');
    const mobileBar = document.getElementById('mobileCartBar');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = getCartSubtotal();
    const total = getCartTotal();
    const minimumOk = meetsMinimum();

    if (cartCount) cartCount.textContent = totalItems;
    if (mobileCartCount) mobileCartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = formatMoney(total);
    if (mobileCartTotal) mobileCartTotal.textContent = formatMoney(total);
    if (cartSubtotal) cartSubtotal.textContent = formatMoney(subtotal);
    if (cartSubtotalRow) cartSubtotalRow.hidden = cart.length === 0;
    if (deliveryFeeEl) deliveryFeeEl.textContent = cart.length ? formatMoney(CONFIG.deliveryFee) : '—';

    if (cartMinimum) {
        if (cart.length === 0) {
            cartMinimum.textContent = '';
            cartMinimum.classList.remove('warning');
        } else if (!minimumOk) {
            const falta = CONFIG.minOrder - subtotal;
            cartMinimum.textContent = `Faltam ${formatMoney(falta)} para o pedido mínimo de ${formatMoney(CONFIG.minOrder)}`;
            cartMinimum.classList.add('warning');
        } else {
            cartMinimum.textContent = 'Pedido mínimo atingido';
            cartMinimum.classList.remove('warning');
        }
    }

    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0 || !minimumOk;
    }

    if (mobileBar) {
        const showBar = cart.length > 0;
        document.body.classList.toggle('cart-bar-visible', showBar);
    }

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-basket"></i>
                <h4>Seu carrinho está vazio</h4>
                <p>Adicione itens deliciosos ao seu pedido!</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => {
            const unit = getEffectivePrice(item);
            const lineTotal = unit * item.quantity;
            return `
            <div class="cart-item">
                <img src="${item.image}" alt="" width="64" height="64" loading="lazy" onerror="this.onerror=null;this.src='logo.png'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">${formatMoney(lineTotal)}</div>
                </div>
                <div class="cart-item-actions">
                    <button type="button" class="qty-btn" onclick="updateQuantity(${item.id}, -1)" aria-label="Diminuir quantidade">−</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button type="button" class="qty-btn" onclick="updateQuantity(${item.id}, 1)" aria-label="Aumentar quantidade">+</button>
                    <button type="button" class="remove-item" onclick="removeItem(${item.id})" aria-label="Remover item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
    updateCart();
}

function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
}

function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (!sidebar || !overlay) return;
    document.getElementById('checkoutModal')?.classList.remove('active');
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (!sidebar || !overlay) return;
    const isOpen = sidebar.classList.toggle('open');
    overlay.classList.toggle('active', isOpen);
    if (!isOpen) {
        document.getElementById('checkoutModal')?.classList.remove('active');
    }
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

function showSuccessMessage() {
    const msg = document.getElementById('successMessage');
    if (!msg) return;
    msg.classList.add('show');
    clearTimeout(showSuccessMessage._timer);
    showSuccessMessage._timer = setTimeout(() => msg.classList.remove('show'), 2800);
}

function openCheckout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    if (!meetsMinimum()) {
        alert(`O pedido mínimo é ${formatMoney(CONFIG.minOrder)}. Adicione mais itens.`);
        return;
    }
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('checkoutModal');
    if (!sidebar || !overlay || !modal) return;

    sidebar.classList.remove('open');
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    updatePaymentOrderTotal();
    if (typeof Auth !== 'undefined') Auth.prefillCheckout();
    document.getElementById('customerName')?.focus();
}

function closeCheckout() {
    document.getElementById('checkoutModal')?.classList.remove('active');
    document.getElementById('overlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

function updatePaymentOrderTotal() {
    const el = document.getElementById('paymentOrderTotal');
    if (el) el.textContent = formatMoney(getCartTotal());
}

function hideAllPaymentDetails() {
    ['paymentDetailsCash', 'paymentDetailsCard', 'paymentDetailsPix'].forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.hidden = true;
    });
}

function selectPaymentMethod(method) {
    paymentState.method = method;
    paymentState.needsChange = null;
    paymentState.cardType = null;

    document.querySelectorAll('.payment-method').forEach(btn => {
        const isSelected = btn.dataset.method === method;
        btn.classList.toggle('selected', isSelected);
        btn.setAttribute('aria-pressed', isSelected);
    });
    document.getElementById('paymentMethods')?.classList.remove('error');

    hideAllPaymentDetails();
    clearPaymentChipSelection();

    if (method === 'dinheiro') {
        document.getElementById('paymentDetailsCash').hidden = false;
        document.getElementById('changeAmountGroup').hidden = true;
        const changeInput = document.getElementById('changeFor');
        if (changeInput) changeInput.value = '';
    } else if (method === 'cartao') {
        document.getElementById('paymentDetailsCard').hidden = false;
    } else if (method === 'pix') {
        document.getElementById('paymentDetailsPix').hidden = false;
    }
}

function clearPaymentChipSelection() {
    document.querySelectorAll('.payment-chip').forEach(chip => {
        chip.classList.remove('selected', 'error');
    });
}

function selectNeedsChange(needsChange) {
    paymentState.needsChange = needsChange;
    document.querySelectorAll('[data-needs-change]').forEach(chip => {
        chip.classList.toggle('selected', chip.dataset.needsChange === needsChange);
        chip.classList.remove('error');
    });

    const changeGroup = document.getElementById('changeAmountGroup');
    const changeInput = document.getElementById('changeFor');
    if (needsChange === 'sim') {
        changeGroup.hidden = false;
        changeInput?.focus();
    } else {
        changeGroup.hidden = true;
        if (changeInput) changeInput.value = '';
        paymentState.changeFor = '';
    }
}

function selectCardType(cardType) {
    paymentState.cardType = cardType;
    document.querySelectorAll('[data-card]').forEach(chip => {
        chip.classList.toggle('selected', chip.dataset.card === cardType);
        chip.classList.remove('error');
    });
}

function getPaymentSummary() {
    if (!paymentState.method) return '';

    if (paymentState.method === 'dinheiro') {
        let text = 'Dinheiro na entrega';
        if (paymentState.needsChange === 'nao') {
            text += ' (sem troco)';
        } else if (paymentState.needsChange === 'sim' && paymentState.changeFor) {
            text += ` — troco para ${paymentState.changeFor}`;
        }
        return text;
    }

    if (paymentState.method === 'cartao') {
        const tipo = paymentState.cardType === 'debito' ? 'Débito' : 'Crédito';
        return `Cartão ${tipo} na entrega`;
    }

    if (paymentState.method === 'pix') {
        return `PIX (${CONFIG.payment.pixType}: ${CONFIG.payment.pixKey})`;
    }

    return '';
}

function validatePayment() {
    const methodsEl = document.getElementById('paymentMethods');
    methodsEl?.classList.remove('error');
    document.getElementById('changeFor')?.classList.remove('error');
    document.querySelectorAll('.payment-chip').forEach(chip => chip.classList.remove('error'));

    if (!paymentState.method) {
        methodsEl?.classList.add('error');
        return 'Escolha uma forma de pagamento.';
    }

    if (paymentState.method === 'dinheiro') {
        if (!paymentState.needsChange) {
            document.querySelector('[data-needs-change="sim"]')?.classList.add('error');
            document.querySelector('[data-needs-change="nao"]')?.classList.add('error');
            return 'Informe se precisa de troco.';
        }
        if (paymentState.needsChange === 'sim') {
            const changeInput = document.getElementById('changeFor');
            const changeValue = parseMoney(changeInput?.value || '');
            const total = getCartTotal();
            if (!changeValue || changeValue <= total) {
                changeInput?.classList.add('error');
                return `O valor para troco deve ser maior que o total (${formatMoney(total)}).`;
            }
            paymentState.changeFor = changeInput.value.trim();
        }
    }

    if (paymentState.method === 'cartao' && !paymentState.cardType) {
        document.querySelectorAll('[data-card]').forEach(chip => chip.classList.add('error'));
        return 'Selecione débito ou crédito.';
    }

    return null;
}

function parseMoney(value) {
    const normalized = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
}

function maskMoney(input) {
    let digits = input.value.replace(/\D/g, '');
    if (!digits) {
        input.value = '';
        return;
    }
    const cents = parseInt(digits, 10);
    const reais = cents / 100;
    input.value = formatMoney(reais);
}

function resetPaymentForm() {
    paymentState.method = null;
    paymentState.needsChange = null;
    paymentState.changeFor = '';
    paymentState.cardType = null;

    document.querySelectorAll('.payment-method').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
    });
    document.getElementById('paymentMethods')?.classList.remove('error');
    hideAllPaymentDetails();
    clearPaymentChipSelection();

    const changeInput = document.getElementById('changeFor');
    if (changeInput) changeInput.value = '';
    document.getElementById('changeAmountGroup').hidden = true;
}

async function copyPixKey() {
    const key = CONFIG.payment.pixKey;
    const btn = document.getElementById('copyPixBtn');
    try {
        await navigator.clipboard.writeText(key);
        if (btn) {
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copiado!';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copiar';
            }, 2000);
        }
    } catch (_) {
        alert(`Chave PIX: ${key}`);
    }
}

function initPayment() {
    const pixKeyEl = document.getElementById('pixKeyDisplay');
    const pixHolderEl = document.getElementById('pixHolderDisplay');
    if (pixKeyEl) pixKeyEl.textContent = CONFIG.payment.pixKey;
    if (pixHolderEl) pixHolderEl.textContent = `${CONFIG.payment.pixHolder} · ${CONFIG.payment.pixType}`;

    document.querySelectorAll('.payment-method').forEach(btn => {
        btn.addEventListener('click', () => selectPaymentMethod(btn.dataset.method));
    });

    document.querySelectorAll('[data-needs-change]').forEach(chip => {
        chip.addEventListener('click', () => selectNeedsChange(chip.dataset.needsChange));
    });

    document.querySelectorAll('[data-card]').forEach(chip => {
        chip.addEventListener('click', () => selectCardType(chip.dataset.card));
    });

    document.getElementById('changeFor')?.addEventListener('input', e => maskMoney(e.target));
    document.getElementById('copyPixBtn')?.addEventListener('click', copyPixKey);
}

function closeAll() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('checkoutModal')?.classList.remove('active');
    document.getElementById('loginModal')?.classList.remove('active');
    document.getElementById('overlay')?.classList.remove('active');
    document.body.style.overflow = '';
    if (typeof Auth !== 'undefined') Auth.clearAuthErrors?.();
}

function sendOrder() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const cep = document.getElementById('customerCep').value.trim();
    const notes = document.getElementById('orderNotes').value.trim();
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(inp => inp.classList.remove('error'));

    const phoneDigits = phone.replace(/\D/g, '');
    if (!name || phoneDigits.length < 10 || !address) {
        if (!name) document.getElementById('customerName').classList.add('error');
        if (phoneDigits.length < 10) document.getElementById('customerPhone').classList.add('error');
        if (!address) document.getElementById('customerAddress').classList.add('error');
        alert('Preencha nome, telefone válido e endereço.');
        return;
    }

    const paymentError = validatePayment();
    if (paymentError) {
        alert(paymentError);
        return;
    }

    const subtotal = getCartSubtotal();
    const total = getCartTotal();
    const paymentSummary = getPaymentSummary();

    let message = `*NOVO PEDIDO - ${CONFIG.storeName.toUpperCase()}*\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Telefone:* ${phone}\n`;
    message += `*Endereço:* ${address}\n`;
    if (cep) message += `*CEP:* ${cep}\n`;
    message += `*Pagamento:* ${paymentSummary}\n`;
    message += `\n*ITENS:*\n━━━━━━━━━━━━━━━━━\n`;

    cart.forEach(item => {
        const unit = getEffectivePrice(item);
        const lineTotal = unit * item.quantity;
        message += `• ${item.quantity}x ${item.name}\n  ${formatMoney(lineTotal)}\n`;
    });

    message += `━━━━━━━━━━━━━━━━━\n`;
    message += `Subtotal: ${formatMoney(subtotal)}\n`;
    message += `Entrega: ${formatMoney(CONFIG.deliveryFee)}\n`;
    message += `*TOTAL: ${formatMoney(total)}*\n`;
    if (notes) message += `\n*Observações:* ${notes}`;

    window.open(getWhatsAppUrl(message), '_blank');

    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
        Auth.saveOrder({
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: getEffectivePrice(item)
            })),
            total,
            payment: paymentSummary,
            phone,
            address,
            cep
        });
        Auth.renderAccountSection();
    }

    cart = [];
    saveCart();
    updateCart();
    closeCheckout();

    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerCep').value = '';
    document.getElementById('orderNotes').value = '';
    resetPaymentForm();
}

// ——— CEP (ViaCEP) ———
async function fetchAddressByCep(cep) {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (data.erro) return;

        const addressEl = document.getElementById('customerAddress');
        const parts = [data.logradouro, data.bairro, data.localidade && `${data.localidade}/${data.uf}`]
            .filter(Boolean);
        if (addressEl && parts.length) {
            addressEl.value = parts.join(', ') + (addressEl.value.includes(',') ? '' : ' — nº, compl.');
        }
    } catch (_) { /* rede ou CEP inválido */ }
}

function maskPhone(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
        input.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
        input.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
        input.value = `(${v}`;
    } else {
        input.value = '';
    }
}

function maskCep(input) {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    input.value = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
}

// ——— Menu mobile e navegação ———
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
        toggle.querySelector('i').className = open ? 'fas fa-times' : 'fas fa-bars';
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.querySelector('i').className = 'fas fa-bars';
        });
    });
}

function initNavHighlight() {
    const sectionIds = ['inicio', 'promocoes', 'cardapio', 'conta', 'sobre', 'contato'];
    const links = document.querySelectorAll('nav a[data-nav]');

    function setActive(id) {
        links.forEach(a => a.classList.toggle('active', a.dataset.nav === id));
    }

    const observer = new IntersectionObserver(entries => {
        const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
            setActive(visible[0].target.id);
        }
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15] });

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });

    setActive('inicio');
}

function initSearch() {
    const input = document.getElementById('productSearch');
    const clearBtn = document.getElementById('searchClear');
    if (!input) return;

    input.addEventListener('input', () => {
        searchQuery = input.value;
        if (clearBtn) clearBtn.hidden = !searchQuery;
        renderProducts();
    });

    clearBtn?.addEventListener('click', () => {
        input.value = '';
        searchQuery = '';
        clearBtn.hidden = true;
        renderProducts();
        input.focus();
    });
}

function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 24);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

function initWhatsAppLinks() {
    const msg = `Olá! Gostaria de fazer um pedido no ${CONFIG.storeName}.`;
    const url = getWhatsAppUrl(msg);

    const float = document.getElementById('whatsappFloat');
    const footer = document.getElementById('footerWhatsapp');
    const hero = document.getElementById('heroWhatsapp');
    [float, footer, hero].forEach(el => {
        if (!el) return;
        el.href = url;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    });

    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.href = `tel:+${CONFIG.whatsapp}`;
        const span = link.querySelector('.hide-mobile');
        if (span) {
            span.textContent = CONFIG.phoneDisplay;
        } else if (!link.querySelector('i')) {
            link.textContent = CONFIG.phoneDisplay;
        }
    });
}

// Funções usadas no HTML (onclick)
window.filterCategory = filterCategory;
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.closeAll = closeAll;
window.sendOrder = sendOrder;
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateStoreStatus();
    renderPromotions();
    renderProducts();
    updateCart();
    initMobileMenu();
    initNavHighlight();
    initHeaderScroll();
    initSearch();
    initWhatsAppLinks();
    initPayment();
    if (typeof Auth !== 'undefined') Auth.init();

    document.getElementById('customerPhone')?.addEventListener('input', e => maskPhone(e.target));
    document.getElementById('customerCep')?.addEventListener('input', e => maskCep(e.target));
    document.getElementById('customerCep')?.addEventListener('blur', e => fetchAddressByCep(e.target.value));

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAll();
    });
});
