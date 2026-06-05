// Gerenciamento de lojas no sistema multi-delivery
class StoreManager {
  constructor() {
    this.stores = [];
    this.currentStore = null;
    this.loadStores();
  }

  async loadStores() {
    try {
      const response = await fetch('stores.json');
      const data = await response.json();
      this.stores = data.stores;
    } catch (error) {
      console.error('[v0] Erro ao carregar stores.json:', error);
    }
  }

  // Obter loja pelo ID
  getStore(storeId) {
    return this.stores.find(store => store.id === storeId);
  }

  // Obter todas as lojas
  getAllStores() {
    return this.stores;
  }

  // Definir loja atual
  setCurrentStore(storeId) {
    const store = this.getStore(storeId);
    if (store) {
      this.currentStore = store;
      localStorage.setItem('currentStore', storeId);
      return true;
    }
    return false;
  }

  // Obter loja atual
  getCurrentStore() {
    return this.currentStore;
  }

  // Restaurar loja do localStorage
  restoreStore() {
    const storeId = localStorage.getItem('currentStore');
    if (storeId) {
      this.setCurrentStore(storeId);
    }
  }

  // Obter parâmetro de URL
  getStoreFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('store');
  }

  // Inicializar: primeiro tenta URL, depois localStorage
  async initialize() {
    await this.loadStores();
    
    const urlStore = this.getStoreFromUrl();
    if (urlStore && this.setCurrentStore(urlStore)) {
      return true;
    }
    
    this.restoreStore();
    return this.currentStore !== null;
  }
}

// Instância global
const storeManager = new StoreManager();
