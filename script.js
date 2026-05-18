// PRODUTOS
const products = [
    { id: 1, name: "Hambúrguer Artesanal", category: "hamburguer", price: 28.90, description: "Pão brioche, carne 180g, queijo cheddar, bacon e molho especial", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", badge: "Mais Vendido" },
    { id: 2, name: "Hambúrguer Duplo", category: "hamburguer", price: 38.90, description: "Dois hambúrgueres 180g, queijo duplo, bacon e molho especial", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400", badge: "Novo" },
    { id: 3, name: "Pizza Calabresa", category: "pizza", price: 45.00, description: "Molho de tomate, mussarela, calabresa e cebola", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400", badge: null },
    { id: 4, name: "Pizza Pepperoni", category: "pizza", price: 52.00, description: "Molho de tomate, mussarela e pepperoni importado", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400", badge: "Popular" },
    { id: 5, name: "Pizza Marguerita", category: "pizza", price: 42.00, description: "Molho de tomate, mussarela de búfala, manjericão fresco", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", badge: null },
    { id: 6, name: "Coca-Cola 2L", category: "bebida", price: 12.00, description: "Refrigerante Coca-Cola garrafa 2 litros", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", badge: null },
    { id: 7, name: "Suco Natural", category: "bebida", price: 8.90, description: "Suco natural 500ml", image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400", badge: "Natural" },
    { id: 8, name: "Milkshake", category: "sobremesa", price: 15.90, description: "Milkshake cremoso 400ml", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400", badge: null },
    { id: 9, name: "Sundae", category: "sobremesa", price: 9.90, description: "Sorvete com calda de chocolate", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400", badge: null },
    { id: 10, name: "Combo Família", category: "combo", price: 89.90, description: "2 hambúrgueres + pizza + bebidas", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400", badge: "Economize" }
];

// CARRINHO
let cart = [];
let selectedPayment = "";

// RENDERIZAR PRODUTOS
function renderProducts(category = "todos") {
    const grid = document.getElementById("productsGrid");

    const filteredProducts = category === "todos"
        ? products
        : products.filter(product => product.category === category);

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
            
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}'">

            <div class="product-info">
                <p class="product-category">${getCategoryName(product.category)}</p>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>

                <div class="product-footer">
                    <div class="product-price">
                        R$ ${product.price.toFixed(2).replace(".", ",")}
                    </div>

                    <button class="add-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// NOMES DAS CATEGORIAS
function getCategoryName(category) {
    const categories = {
        hamburguer: "Hambúrguer",
        pizza: "Pizza",
        bebida: "Bebida",
        sobremesa: "Sobremesa",
        combo: "Combo"
    };

    return categories[category] || category;
}

// FILTRO
function filterCategory(category, button) {
    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    renderProducts(category);
}

// ADICIONAR AO CARRINHO
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
    showSuccessMessage();
}

// ATUALIZAR CARRINHO
function updateCart() {
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCount.textContent = totalItems;
    cartTotal.textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-basket"></i>
                <h4>Seu carrinho está vazio</h4>
                <p>Adicione itens deliciosos ao seu pedido!</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">
                    R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}
                </div>
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
    `).join("");
}

// QUANTIDADE
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeItem(productId);
    } else {
        updateCart();
    }
}

// REMOVER ITEM
function removeItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// ABRIR / FECHAR CARRINHO
function toggleCart() {
    document.getElementById("cartSidebar").classList.toggle("open");
    document.getElementById("overlay").classList.toggle("active");
}

// FECHAR TUDO
function closeAll() {
    document.getElementById("cartSidebar").classList.remove("open");
    document.getElementById("checkoutModal").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
}

// SUCESSO
function showSuccessMessage() {
    const successMessage = document.getElementById("successMessage");

    successMessage.classList.add("show");

    setTimeout(() => {
        successMessage.classList.remove("show");
    }, 3000);
}

// CHECKOUT
function openCheckout() {
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    document.getElementById("checkoutModal").classList.add("active");
    document.getElementById("overlay").classList.add("active");
}

function closeCheckout() {
    document.getElementById("checkoutModal").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
}

// PAGAMENTO
function selectPayment(element, method) {
    document.querySelectorAll(".payment-method").forEach(pm => {
        pm.classList.remove("selected");
    });

    element.classList.add("selected");
    selectedPayment = method;
}

// ENVIAR PEDIDO
function sendOrder() {
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const cep = document.getElementById("customerCep").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const notes = document.getElementById("orderNotes").value.trim();

    if (!name || !phone || !address || !selectedPayment) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    let message = `*NOVO PEDIDO - IMPÉRIO DELIVERY*%0A%0A`;
    message += `*Cliente:* ${name}%0A`;
    message += `*Telefone:* ${phone}%0A`;
    message += `*CEP:* ${cep}%0A`;
    message += `*Endereço:* ${address}%0A`;
    message += `*Pagamento:* ${selectedPayment}%0A%0A`;
    message += `*ITENS:*%0A`;

    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        message += `• ${item.quantity}x ${item.name} - R$ ${subtotal.toFixed(2).replace(".", ",")}%0A`;
    });

    message += `%0A*TOTAL:* R$ ${total.toFixed(2).replace(".", ",")}%0A`;

    if (notes) {
        message += `*Observações:* ${notes}%0A`;
    }

    const whatsappNumber = "5511999999999";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

    window.open(whatsappURL, "_blank");

    cart = [];
    updateCart();
    closeCheckout();

    alert("Pedido enviado com sucesso!");
}

// INICIAR
document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    updateCart();
});
