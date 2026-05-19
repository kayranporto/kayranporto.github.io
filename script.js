// Dados dos produtos
const products = [
    { id: 1, name: "Hambúrguer Artesanal", category: "hamburguer", price: 28.90, description: "Pão brioche, carne 180g, queijo cheddar, bacon e molho especial", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", badge: "Mais Vendido" },
    { id: 2, name: "Hambúrguer Duplo", category: "hamburguer", price: 38.90, description: "Dois hambúrgueres 180g, queijo duplo, bacon e molho especial", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400", badge: "Novo" },
    { id: 3, name: "Pizza Calabresa", category: "pizza", price: 45.00, description: "Molho de tomate, mussarela, calabresa e cebola", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400", badge: null },
    { id: 4, name: "Pizza Pepperoni", category: "pizza", price: 52.00, description: "Molho de tomate, mussarela e pepperoni importado", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400", badge: "Popular" },
    { id: 5, name: "Pizza Marguerita", category: "pizza", price: 42.00, description: "Molho de tomate, mussarela de búfala, manjericão fresco", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", badge: null },
    { id: 6, name: "Coca-Cola 2L", category: "bebida", price: 12.00, description: "Refrigerante Coca-Cola garrafa 2 litros", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", badge: null },
    { id: 7, name: "Suco Natural", category: "bebida", price: 8.90, description: "Suco de laranja ou limão natural 500ml", image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400", badge: "Natural" },
    { id: 8, name: "Milkshake", category: "sobremesa", price: 15.90, description: "Milkshake de chocolate, morango ou baunilha 400ml", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400", badge: null },
    { id: 9, name: "Sundae", category: "sobremesa", price: 9.90, description: "Sorvete de creme com calda de chocolate", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400", badge: null },
    { id: 10, name: "Combo Família", category: "combo", price: 89.90, description: "2 hambúrgueres + 1 pizza média + 2 refrigerantes 2L", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400", badge: "Economize" },
    { id: 11, name: "Combo Casal", category: "combo", price: 59.90, description: "1 hambúrguer + 1 pizza média + 1 refrigerante 2L", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400", badge: null },
    { id: 12, name: "Batata Frita", category: "hamburguer", price: 18.90, description: "Batata frita crocante com cheddar e bacon", image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400", badge: "Acompanhamento" }
];

// Carrinho
let cart = [];
let selectedPayment = '';

// Renderizar produtos
function renderProducts(category = 'todos') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const filtered = category === 'todos' ? products : products.filter(p => p.category === category);
    
    grid.innerHTML = filtered.map(product => `
        <div class="product-card" data-category="${product.category}">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}'">
            <div class="product-info">
                <p class="product-category">${getCategoryName(product.category)}</p>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-price">
                        R$ ${product.price.toFixed(2).replace('.', ',')}
                    </div>
                    <button class="add-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryName(cat) {
    const names = {
        'hamburguer': 'Hambúrguer',
        'pizza': 'Pizza',
        'bebida': 'Bebida',
        'sobremesa': 'Sobremesa',
        'combo': 'Combo'
    };
    return names[cat] || cat;
}

// Filtrar categoria
function filterCategory(category, btn) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(category);
}

// Adicionar ao carrinho
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    showSuccessMessage();
}

// Atualizar carrinho
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    
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
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70?text=${encodeURIComponent(item.name)}'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Atualizar quantidade
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCart();
    }
}

// Remover item
function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Toggle cart
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

// Mostrar mensagem de sucesso
function showSuccessMessage() {
    const msg = document.getElementById('successMessage');
    if (msg) {
        msg.classList.add('show');
        setTimeout(() => msg.classList.remove('show'), 3000);
    }
}

// Abrir checkout
function openCheckout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('checkoutModal').classList.add('active');
}

// Fechar checkout
function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Selecionar pagamento
function selectPayment(el, method) {
    document.querySelectorAll('.payment-method').forEach(pm => pm.classList.remove('selected'));
    el.classList.add('selected');
    selectedPayment = method;
}

// Fechar tudo
function closeAll() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// Enviar pedido
function sendOrder() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const cep = document.getElementById('customerCep').value;
    const notes = document.getElementById('orderNotes').value;
    
    if (!name || !phone || !address || !selectedPayment) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    let message = `*NOVO PEDIDO - IMPÉRIO DELIVERY*\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Telefone:* ${phone}\n`;
    message += `*Endereço:* ${address}\n`;
    message += `*CEP:* ${cep}\n`;
    message += `*Pagamento:* ${selectedPayment}\n\n`;
    message += `*ITENS DO PEDIDO:*\n`;
    message += `━━━━━━━━━━━━━━━━━\n`;
    
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• ${item.quantity}x ${item.name}\n`;
        message += `  R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━━\n`;
    message += `*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    
    if (notes) {
        message += `*Observações:* ${notes}\n`;
    }
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho
    cart = [];
    updateCart();
    closeCheckout();
    
    alert('Pedido enviado com sucesso! Redirecionando para o WhatsApp...');
}

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
});
