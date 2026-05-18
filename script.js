const products = [
    {
        id: 1,
        name: "Hambúrguer Artesanal",
        category: "hamburguer",
        price: 28.90,
        description: "Pão brioche, carne 180g, queijo cheddar, bacon",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
    },
    {
        id: 2,
        name: "Pizza Calabresa",
        category: "pizza",
        price: 45.00,
        description: "Molho de tomate, mussarela e calabresa",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400"
    }
];

let cart = [];

function renderProducts(category = "todos") {
    const grid = document.getElementById("productsGrid");

    const filtered = category === "todos"
        ? products
        : products.filter(p => p.category === category);

    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <img src="${product.image}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <button class="add-btn" onclick="addToCart(${product.id})">
                    Adicionar
                </button>
            </div>
        </div>
    `).join("");
}

function filterCategory(category, btn) {
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(category);
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const item = cart.find(i => i.id === id);

    if (item) {
        item.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }

    updateCart();
}

function updateCart() {
    const cartCount = document.getElementById("cartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    let total = 0;

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartItems.innerHTML = cart.map(item => {
        total += item.price * item.quantity;

        return `
            <div>
                <p>${item.name} x${item.quantity}</p>
                <p>R$ ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        `;
    }).join("");

    cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

function toggleCart() {
    document.getElementById("cartSidebar").classList.toggle("open");
    document.getElementById("overlay").classList.toggle("active");
}

function openCheckout() {
    document.getElementById("checkoutModal").classList.add("active");
}

function closeCheckout() {
    document.getElementById("checkoutModal").classList.remove("active");
}

function closeAll() {
    document.getElementById("cartSidebar").classList.remove("open");
    document.getElementById("checkoutModal").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
}

function sendOrder() {
    const name = document.getElementById("customerName").value;
    const phone = document.getElementById("customerPhone").value;
    const address = document.getElementById("customerAddress").value;

    if (!name || !phone || !address) {
        alert("Preencha todos os campos!");
        return;
    }

    let message = `Novo Pedido:\nCliente: ${name}\nTelefone: ${phone}\nEndereço: ${address}\n\n`;

    cart.forEach(item => {
        message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, "_blank");
}

renderProducts();
