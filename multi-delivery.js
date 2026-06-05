// ——— Integração Multi-Delivery com script.js ———
// Este arquivo estende a funcionalidade do script.js com suporte a múltiplas lojas

let currentStoreConfig = null;
let storeProducts = null;

// Função para atualizar toda a interface com dados da loja selecionada
async function updateStoreInterface(store) {
    if (!store) return;

    currentStoreConfig = store;
    console.log('[v0] Atualizando interface para loja:', store.name);

    // Atualizar header com logo e nome da loja
    document.getElementById('storeLogo').src = store.logo;
    document.getElementById('storeLogo').alt = store.name;
    document.getElementById('storeName').textContent = store.name;
    
    // Atualizar texto de subtítulo (usar primeiro horário como exemplo)
    const dias = Object.keys(store.horarios);
    document.getElementById('storeSubtitle').textContent = 
        `Horários: ${store.horarios[dias[0]]}`;

    // Atualizar hero section
    document.getElementById('heroEyebrow').textContent = store.name;
    document.getElementById('heroTitle').innerHTML = 
        `Delivery rápido e <span class="hero-highlight">saboroso</span> em ${store.name}`;

    // Atualizar telefone
    document.getElementById('phoneBtn').href = `tel:+55${store.whatsapp.replace(/\D/g, '')}`;
    document.getElementById('phoneDisplay').textContent = store.phone;

    // Atualizar WhatsApp
    const waUrl = `https://wa.me/55${store.whatsapp.replace(/\D/g, '')}`;
    document.getElementById('heroWhatsapp').href = waUrl;
    document.getElementById('footerWhatsapp').href = waUrl;

    // Atualizar seção "Sobre"
    document.getElementById('aboutTitle').innerHTML = 
        `<i class="fas fa-heart"></i> Sobre ${store.name}`;

    // Atualizar cores da marca (CSS variables)
    document.documentElement.style.setProperty('--color-primary', store.cor_primaria);
    document.documentElement.style.setProperty('--color-secondary', store.cor_secundaria);

    // Atualizar localStorage para persistência
    localStorage.setItem('selectedStore', store.id);

    // Renderizar produtos e interface
    renderProducts();
    updateCartDisplay();
}

// Função para renderizar seletor de lojas
function renderStoreSelector() {
    const container = document.getElementById('storeSelectorGrid');
    if (!container) return;

    const stores = storeManager.getAllStores();
    container.innerHTML = stores.map(store => `
        <button class="store-selector-card" onclick="selectStore('${store.id}')" aria-label="Selecionar ${store.name}">
            <img src="${store.logo}" alt="${store.name}" class="store-selector-logo">
            <h3>${store.name}</h3>
            <p class="store-selector-info">
                <i class="fas fa-clock"></i>
                ${Object.values(store.horarios)[0]}
            </p>
            <p class="store-selector-contact">
                <i class="fas fa-phone"></i> ${store.phone}
            </p>
        </button>
    `).join('');
}

// Função para selecionar uma loja
function selectStore(storeId) {
    if (storeManager.setCurrentStore(storeId)) {
        const store = storeManager.getCurrentStore();
        document.getElementById('storeSelectorModal').hidden = true;
        updateStoreInterface(store);
        window.history.replaceState({}, '', `?store=${storeId}`);
    }
}

// Função para abrir seletor de lojas
function openStoreSelector() {
    const modal = document.getElementById('storeSelectorModal');
    if (modal) {
        modal.hidden = false;
        renderStoreSelector();
    }
}

// Função para fechar seletor de lojas
function closeStoreSelector() {
    document.getElementById('storeSelectorModal').hidden = true;
}

// Inicializar sistema multi-delivery quando a página carrega
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[v0] Inicializando sistema multi-delivery...');

    // Aguardar carregamento das lojas
    await storeManager.initialize();

    const store = storeManager.getCurrentStore();

    if (!store) {
        // Se nenhuma loja foi selecionada, mostrar seletor
        console.log('[v0] Mostrando seletor de lojas');
        openStoreSelector();
    } else {
        // Usar loja existente
        console.log('[v0] Loja selecionada:', store.name);
        document.getElementById('storeSelectorModal').hidden = true;
        updateStoreInterface(store);
    }

    // Event listener para botão de trocar loja
    const storeChangeBtn = document.getElementById('storeChangeBtn');
    if (storeChangeBtn) {
        storeChangeBtn.addEventListener('click', openStoreSelector);
    }

    // Fechar modal ao clicar fora
    document.getElementById('storeSelectorModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeStoreSelector();
        }
    });
}, { once: true });

// Atualizar WhatsApp URL quando o CONFIG mudar
function getStoreWhatsAppUrl(message) {
    if (!currentStoreConfig) return '';
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/55${currentStoreConfig.whatsapp.replace(/\D/g, '')}${text}`;
}
