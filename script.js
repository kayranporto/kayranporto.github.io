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
let favorites = [];
let currentCategory = 'todos';
let searchQuery = '';
let appliedCoupon = null;

const paymentState = {
    method: null,
    needsChange: null,
    changeFor: '',
    cardType: null,
    pixConfirmed: false
};

const REVIEW_KEY = 'imperio_reviews';
const FAVORITES_KEY = 'imperio_favorites';
const COUPON_KEY = 'imperio_coupon';

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

// ——— Persistência de favoritos ———
function saveFavorites() {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (_) { /* quota ou modo privado */ }
}

function loadFavorites() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return;
        favorites = parsed.filter(id => products.some(p => p.id === id));
    } catch (_) {
        favorites = [];
    }
}

function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }
    saveFavorites();
    renderProducts();
}

// ——— Cupons de desconto ———
const COUPONS = {
    'DESCONTO10': { type: 'percent', value: 10, description: '10% de desconto' },
    'DESCONTO20': { type: 'percent', value: 20, description: '20% de desconto' },
    'FRETE5': { type: 'frete', value: 5, description: 'Frete grátis' },
    'WELCOME': { type: 'percent', value: 15, description: '15% de desconto - Bem-vindo!' },
    'IMPERIO2024': { type: 'percent', value: 25, description: '25% de desconto' }
};

function saveCoupon() {
    try {
        if (appliedCoupon) {
            localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
        } else {
            localStorage.removeItem(COUPON_KEY);
        }
    } catch (_) { /* quota ou modo privado */ }
}

function loadCoupon() {
    try {
        const saved = localStorage.getItem(COUPON_KEY);
        if (saved) {
            appliedCoupon = JSON.parse(saved);
        }
    } catch (_) {
        appliedCoupon = null;
    }
}

function applyCoupon() {
    const input = document.getElementById('couponInput');
    const message = document.getElementById('couponMessage');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        message?.classList.remove('show');
        return;
    }

    if (!COUPONS[code]) {
        message.textContent = '❌ Cupom inválido ou expirado';
        message.classList.add('show', 'error');
        setTimeout(() => message.classList.remove('show'), 4000);
        return;
    }

    appliedCoupon = { code, ...COUPONS[code] };
    saveCoupon();
    input.value = '';
    updateCouponDisplay();
    updateCart();

    message.textContent = '✅ Cupom aplicado com sucesso!';
    message.classList.add('show', 'success');
    setTimeout(() => message.classList.remove('show'), 3000);
}

function removeCoupon() {
    appliedCoupon = null;
    saveCoupon();
    updateCouponDisplay();
    updateCart();
}

function updateCouponDisplay() {
    const couponInput = document.getElementById('couponInput');
    const couponActive = document.getElementById('couponActive');
    const couponActiveCode = document.getElementById('couponActiveCode');
    const couponActiveDiscount = document.getElementById('couponActiveDiscount');

    if (appliedCoupon) {
        if (couponInput) couponInput.value = '';
        if (couponActive) couponActive.hidden = false;
        if (couponActiveCode) couponActiveCode.textContent = appliedCoupon.code;
        if (couponActiveDiscount) {
            if (appliedCoupon.type === 'percent') {
                couponActiveDiscount.textContent = `${appliedCoupon.value}% de desconto`;
            } else {
                couponActiveDiscount.textContent = `Frete grátis`;
            }
        }
    } else {
        if (couponActive) couponActive.hidden = true;
    }
}

function getCouponDiscount() {
    if (!appliedCoupon || cart.length === 0) return 0;
    
    const subtotal = getCartSubtotal();
    if (appliedCoupon.type === 'percent') {
        return subtotal * (appliedCoupon.value / 100);
    }
    return 0;
}

function getDeliveryFee() {
    if (!appliedCoupon || appliedCoupon.type !== 'frete') {
        return CONFIG.deliveryFee;
    }
    return 0;
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
        const isFavorite = favorites.includes(product.id);
        return `
        <article class="product-card" data-category="${product.category}">
            ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ''}
            <button type="button" class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${product.id})" aria-label="${isFavorite ? 'Remover' : 'Adicionar'} ${product.name} dos favoritos">
                <i class="fas fa-heart"></i>
            </button>
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
    
    const discount = getCouponDiscount();
    const deliveryFee = getDeliveryFee();
    const total = subtotal - discount + deliveryFee;
    
    return Math.max(0, total);
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
    const couponSection = document.getElementById('couponSection');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = getCartSubtotal();
    const discount = getCouponDiscount();
    const deliveryFee = getDeliveryFee();
    const total = getCartTotal();
    const minimumOk = meetsMinimum();

    if (cartCount) cartCount.textContent = totalItems;
    if (mobileCartCount) mobileCartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = formatMoney(total);
    if (mobileCartTotal) mobileCartTotal.textContent = formatMoney(total);
    if (cartSubtotal) cartSubtotal.textContent = formatMoney(subtotal);
    if (cartSubtotalRow) cartSubtotalRow.hidden = cart.length === 0;
    if (deliveryFeeEl) deliveryFeeEl.textContent = cart.length ? formatMoney(deliveryFee) : '—';
    
    if (couponSection) couponSection.hidden = cart.length === 0;

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
    
    // Atualizar resumo de pagamento (se existir)
    const subtotal = getCartSubtotal();
    const discount = getCouponDiscount();
    const deliveryFee = getDeliveryFee();
    const total = getCartTotal();
    
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryDiscount = document.getElementById('summaryDiscount');
    const summaryDelivery = document.getElementById('summaryDelivery');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);
    
    if (summaryDiscount) {
        const discountRow = summaryDiscount.parentElement;
        if (discount > 0) {
            discountRow.hidden = false;
            summaryDiscount.textContent = `-${formatMoney(discount)}`;
        } else {
            discountRow.hidden = true;
        }
    }
    
    if (summaryDelivery) summaryDelivery.textContent = formatMoney(cart.length ? deliveryFee : 0);
    if (summaryTotal) summaryTotal.textContent = formatMoney(total);
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
        // Gerar QR Code automaticamente
        setTimeout(() => generatePixQrCode(), 300);
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
        let text = `PIX (${CONFIG.payment.pixType}: ${CONFIG.payment.pixKey})`;
        if (paymentState.pixConfirmed) {
            text += ' ✅ Confirmado';
        }
        return text;
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
    paymentState.pixConfirmed = false;

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

    // Reset PIX
    const pixCheckbox = document.getElementById('pixConfirmCheckbox');
    if (pixCheckbox) pixCheckbox.checked = false;
    const pixConfirmBtn = document.getElementById('pixConfirmBtn');
    if (pixConfirmBtn) {
        pixConfirmBtn.disabled = true;
        pixConfirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Pagamento';
    }
    const pixTimer = document.getElementById('pixTimer');
    if (pixTimer) pixTimer.hidden = true;
    const pixQrContainer = document.getElementById('pixQrContainer');
    if (pixQrContainer) pixQrContainer.innerHTML = '';
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
                btn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i> Copiar Chave';
            }, 2000);
        }
    } catch (_) {
        alert(`Chave PIX: ${key}`);
    }
}

// ——— PIX Automático ———
function generatePixQrCode() {
    const container = document.getElementById('pixQrContainer');
    if (!container) return;

    // Limpar container anterior
    container.innerHTML = '';

    try {
        // Gerar dados PIX com valor do pedido
        const amount = getCartTotal().toFixed(2).replace('.', '');
        
        // Criar código PIX (formato simplificado para demonstração)
        const pixCode = `00020126580014br.gov.bcb.pix0136${CONFIG.payment.pixKey}5204000052040000530398654061${amount}5802BR5913${CONFIG.payment.pixHolder.slice(0, 25).padEnd(25, ' ')}6009SAO PAULO62410503***63041D3A`;

        // Usar API de QR Code para gerar a imagem
        // Usando QR Server que é gratuito e confiável
        const qrImageUrl = encodeURIComponent(pixCode);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${qrImageUrl}&bgcolor=FAFAF9&color=1C1917`;

        // Criar elemento de imagem
        const img = document.createElement('img');
        img.src = qrUrl;
        img.alt = 'QR Code PIX';
        img.style.borderRadius = '12px';
        img.style.boxShadow = '0 4px 16px rgba(28, 25, 23, 0.15)';
        img.style.backgroundColor = 'var(--white)';
        img.style.padding = '8px';
        img.style.border = '1px solid var(--border)';
        
        // Adicionar tratamento de erro
        img.onerror = () => {
            container.innerHTML = '<p style="color: var(--primary); text-align: center;">Erro ao carregar QR Code</p>';
        };

        container.appendChild(img);

        // Mostrar timer
        const timerEl = document.getElementById('pixTimer');
        if (timerEl) timerEl.hidden = false;

        // Iniciar timer
        startPixTimer();

        return true;
    } catch (e) {
        console.error('Erro ao gerar QR Code:', e);
        container.innerHTML = '<p style="color: var(--primary); text-align: center;">Erro ao gerar QR Code</p>';
        return false;
    }
}

function startPixTimer(minutes = 10) {
    const timerText = document.getElementById('pixTimerText');
    if (!timerText) return;

    let timeLeft = minutes * 60; // em segundos

    const updateTimer = () => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerText.textContent = `Expira em: ${mins}:${secs.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('pixTimer').hidden = true;
            document.getElementById('pixQrContainer').innerHTML = '<p style="color: var(--gray);">QR Code expirou. Selecione PIX novamente.</p>';
            return;
        }
        timeLeft--;
    };

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function downloadPixQr() {
    const canvas = document.querySelector('#pixQrContainer canvas');
    if (!canvas) {
        alert('Gere o QR Code primeiro');
        return;
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `pix-qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Feedback visual
    const btn = document.getElementById('downloadPixQr');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Baixado!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-download"></i> Baixar QR Code';
        }, 2000);
    }
}

function confirmPixPayment() {
    const checkbox = document.getElementById('pixConfirmCheckbox');
    const btn = document.getElementById('pixConfirmBtn');

    if (checkbox && checkbox.checked) {
        // Simular confirmação - em produção, verificaria com backend
        btn.classList.add('loading');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

        setTimeout(() => {
            // Marcar PIX como confirmado
            paymentState.pixConfirmed = true;

            // Mostrar mensagem de sucesso
            const msg = document.createElement('div');
            msg.className = 'success-message show';
            msg.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <div>
                    <h4>✅ Pagamento PIX confirmado!</h4>
                    <p>Seu pedido será processado em breve.</p>
                </div>
            `;
            document.body.appendChild(msg);

            setTimeout(() => {
                msg.classList.remove('show');
                setTimeout(() => msg.remove(), 300);
            }, 3000);

            btn.classList.remove('loading');
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Pagamento Confirmado';
        }, 1500);
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

    // PIX Automático
    document.getElementById('downloadPixQr')?.addEventListener('click', downloadPixQr);
    document.getElementById('pixConfirmCheckbox')?.addEventListener('change', (e) => {
        document.getElementById('pixConfirmBtn').disabled = !e.target.checked;
    });
    document.getElementById('pixConfirmBtn')?.addEventListener('click', confirmPixPayment);
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
    const discount = getCouponDiscount();
    const deliveryFee = getDeliveryFee();
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
    if (discount > 0) {
        message += `Desconto (${appliedCoupon.code}): -${formatMoney(discount)}\n`;
    }
    message += `Entrega: ${formatMoney(deliveryFee)}\n`;
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
            cep,
            coupon: appliedCoupon ? appliedCoupon.code : null,
            discount: discount
        });
        Auth.renderAccountSection();
    }

    cart = [];
    appliedCoupon = null;
    saveCart();
    saveCoupon();
    updateCart();
    updateCouponDisplay();
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

function getReviews() {
    try {
        const raw = localStorage.getItem(REVIEW_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function saveReview(review) {
    const reviews = getReviews();
    reviews.unshift(review);
    try {
        localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews.slice(0, 100)));
    } catch (_) { }
}

function getReviewAverage() {
    const reviews = getReviews();
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
}

function formatReviewDate(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function selectReviewStars(value) {
    const buttons = document.querySelectorAll('#starsInput .star-btn');
    buttons.forEach(btn => {
        const btnValue = Number(btn.dataset.value);
        btn.classList.toggle('active', btnValue <= value);
    });
    document.getElementById('reviewRating').value = value;
}

function updateReviewFormState() {
    const note = document.getElementById('reviewFormNote');
    const submitButton = document.querySelector('#reviewForm button[type="submit"]');
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    if (!note || !submitButton) return;

    if (user) {
        note.textContent = `Avaliação será enviada como ${user.name.split(' ')[0]}.`;
        submitButton.removeAttribute('disabled');
    } else {
        note.textContent = 'Faça login para usar seu nome na avaliação, ou envie anônimo mesmo assim.';
        submitButton.removeAttribute('disabled');
    }
}

function renderReviews() {
    const reviews = getReviews();
    const averageEl = document.getElementById('reviewAverage');
    const countEl = document.getElementById('reviewCount');
    const listEl = document.getElementById('reviewList');

    if (averageEl) {
        averageEl.textContent = getReviewAverage().toFixed(1).replace('.', ',');
    }
    if (countEl) {
        countEl.textContent = `${reviews.length} ${reviews.length === 1 ? 'avaliação' : 'avaliações'}`;
    }
    if (!listEl) return;

    if (reviews.length === 0) {
        listEl.innerHTML = '<div class="review-empty"><i class="fas fa-comment-dots"></i><p>Seja o primeiro a avaliar nosso serviço!</p></div>';
        return;
    }

    listEl.innerHTML = reviews.map(review => `
        <article class="review-card">
            <div class="review-card-header">
                <div>
                    <h4>${escapeHtml(review.name)}</h4>
                    <div class="review-card-meta">${formatReviewDate(review.createdAt)}</div>
                </div>
                <div class="review-stars">${Array.from({ length: 5 }, (_, i) => `
                    <i class="fas fa-star" style="color: ${i < review.rating ? '#fbbf24' : '#e5e7eb'}"></i>
                `).join('')}</div>
            </div>
            <p class="review-text">${escapeHtml(review.comment)}</p>
        </article>
    `).join('');
}

function initReviews() {
    const stars = document.querySelectorAll('#starsInput .star-btn');
    stars.forEach(btn => btn.addEventListener('click', () => selectReviewStars(Number(btn.dataset.value))));

    document.getElementById('reviewForm')?.addEventListener('submit', handleReviewSubmit);
    updateReviewFormState();
    renderReviews();
}

async function handleReviewSubmit(event) {
    event.preventDefault();
    const rating = Number(document.getElementById('reviewRating')?.value || 0);
    const comment = document.getElementById('reviewComment')?.value.trim() || '';
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;

    if (rating < 1 || comment.length === 0) {
        alert('Escolha uma nota e escreva um comentário antes de enviar.');
        return;
    }

    saveReview({
        id: Date.now().toString(),
        name: user?.name || 'Visitante',
        rating,
        comment,
        createdAt: new Date().toISOString()
    });

    document.getElementById('reviewForm')?.reset();
    selectReviewStars(3);
    updateReviewFormState();
    renderReviews();
    alert('Avaliação enviada com sucesso! Obrigado.');
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
    const sectionIds = ['inicio', 'promocoes', 'cardapio', 'conta', 'sobre', 'avaliacoes', 'contato'];
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
window.toggleFavorite = toggleFavorite;
window.applyCoupon = applyCoupon;
window.removeCoupon = removeCoupon;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.closeAll = closeAll;
window.sendOrder = sendOrder;
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadFavorites();
    loadCoupon();
    updateStoreStatus();
    renderPromotions();
    renderProducts();
    updateCart();
    updateCouponDisplay();
    initMobileMenu();
    initNavHighlight();
    initHeaderScroll();
    initSearch();
    initWhatsAppLinks();
    initPayment();
    if (typeof Auth !== 'undefined') Auth.init();
    initReviews();

    document.getElementById('customerPhone')?.addEventListener('input', e => maskPhone(e.target));
    document.getElementById('customerCep')?.addEventListener('input', e => maskCep(e.target));
    document.getElementById('customerCep')?.addEventListener('blur', e => fetchAddressByCep(e.target.value));
    document.getElementById('couponInput')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyCoupon();
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAll();
    });
});

// ——— Sistema de Status de Pedidos ———
const OrderStatus = {
    ORDERS_KEY: 'imperio_orders',
    STATUS_STAGES: ['recebido', 'preparando', 'saiu_entrega', 'entregue', 'cancelado'],
    
    getOrders() {
        try {
            const raw = localStorage.getItem(this.ORDERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },

    saveOrders(orders) {
        try {
            localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
        } catch (_) { /* quota */ }
    },

    getUserOrders(userId) {
        return this.getOrders().filter(o => o.userId === userId);
    },

    createOrder(userId, orderData) {
        const orders = this.getOrders();
        const order = {
            id: Date.now().toString(),
            userId,
            items: orderData.items,
            total: orderData.total,
            payment: orderData.payment,
            phone: orderData.phone,
            address: orderData.address,
            cep: orderData.cep,
            status: 'recebido',
            createdAt: new Date().toISOString(),
            estimatedTime: 45 // minutos
        };
        orders.push(order);
        this.saveOrders(orders);
        return order;
    },

    updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order && this.STATUS_STAGES.includes(newStatus)) {
            order.status = newStatus;
            this.saveOrders(orders);
        }
        return order;
    },

    getStatusLabel(status) {
        const labels = {
            recebido: { label: 'Pedido Recebido', icon: 'fa-check-circle', color: 'success' },
            preparando: { label: 'Preparando...', icon: 'fa-fire', color: 'warning' },
            saiu_entrega: { label: 'Saiu para Entrega', icon: 'fa-motorcycle', color: 'info' },
            entregue: { label: 'Entregue', icon: 'fa-check-double', color: 'success' },
            cancelado: { label: 'Cancelado', icon: 'fa-times-circle', color: 'error' }
        };
        return labels[status] || { label: status, icon: 'fa-circle', color: 'gray' };
    },

    renderOrderTimeline(order) {
        const stages = ['recebido', 'preparando', 'saiu_entrega', 'entregue'];
        const currentIndex = Math.min(stages.indexOf(order.status), 3);
        
        return stages.map((stage, idx) => {
            const stageInfo = this.getStatusLabel(stage);
            const isActive = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            
            return `
                <div class="timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}">
                    <div class="timeline-marker">
                        <i class="fas ${stageInfo.icon}"></i>
                    </div>
                    <div class="timeline-label">${stageInfo.label}</div>
                </div>
            `;
        }).join('');
    },

    renderOrderCard(order) {
        const date = new Date(order.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusInfo = this.getStatusLabel(order.status);
        const itemsSummary = order.items.map(item => 
            `${item.quantity}x ${item.name}`
        ).join(', ');

        return `
            <div class="order-card status-${order.status}">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Pedido #${order.id.slice(-6)}</h4>
                        <p class="order-date">${date}</p>
                    </div>
                    <div class="order-status-badge">
                        <i class="fas ${statusInfo.icon}"></i>
                        <span>${statusInfo.label}</span>
                    </div>
                </div>

                <div class="order-timeline">
                    ${this.renderOrderTimeline(order)}
                </div>

                <div class="order-details">
                    <p><strong>Itens:</strong> ${itemsSummary}</p>
                    <p><strong>Endereço:</strong> ${order.address}</p>
                    <p><strong>Total:</strong> ${formatMoney(order.total)}</p>
                    <p class="order-payment"><strong>Pagamento:</strong> ${order.payment}</p>
                </div>

                <div class="order-actions">
                    <button type="button" class="order-btn" onclick="OrderStatus.simulateStatusChange('${order.id}')">
                        <i class="fas fa-sync-alt"></i> Atualizar status
                    </button>
                    <a href="https://wa.me/55${order.phone.replace(/\D/g, '')}" target="_blank" class="order-btn whatsapp-btn">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                </div>
            </div>
        `;
    },

    simulateStatusChange(orderId) {
        const order = this.getOrders().find(o => o.id === orderId);
        if (!order) return;

        const currentIdx = this.STATUS_STAGES.indexOf(order.status);
        const nextIdx = currentIdx + 1;

        if (nextIdx < this.STATUS_STAGES.length) {
            const nextStatus = this.STATUS_STAGES[nextIdx];
            this.updateOrderStatus(orderId, nextStatus);
            if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                Auth.renderAccountSection();
            }
            this.showNotification(`Pedido atualizado para: ${this.getStatusLabel(nextStatus).label}`);
        } else {
            this.showNotification('Pedido já foi entregue!');
        }
    },

    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'order-notification';
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    },

    renderUserOrders(userId) {
        const orders = this.getUserOrders(userId);
        const container = document.getElementById('ordersList');
        
        if (!container) return;

        if (orders.length === 0) {
            container.parentElement.querySelector('.orders-empty').hidden = false;
            container.innerHTML = '';
            return;
        }

        container.parentElement.querySelector('.orders-empty').hidden = true;
        container.innerHTML = orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(order => this.renderOrderCard(order))
            .join('');
    }
};
