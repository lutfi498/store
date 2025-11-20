document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMEN DOM ---
    const productGrid = document.getElementById('product-grid');
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-whatsapp');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const promoBanner = document.getElementById('promo-banner');
    const themeToggle = document.getElementById('theme-toggle');

    // --- DATA & PENGATURAN AWAL ---
    let products = [];
    let cart = [];
    let settings = {
        whatsappNumber: '6288985628174',
        promoBannerText: 'Selamat Datang di Lutfi Store! Dapatkan diskon spesial untuk pembelian pertama.',
        waOrderTemplate: 'Halo Lutfi Store, saya ingin memesan:\n\n{order_details}\n\nTotal: {total_price}\n\nUntuk pengiriman ke alamat:\n{customer_address}'
    };

    // --- INISIALISASI ---
    function initializeApp() {
        loadSettings();
        loadProducts();
        loadCart();
        renderProducts();
        updateCartUI();
        setupEventListeners();
        populateCategoryFilter();
        applySettings();
    }

    // --- FUNGSI DATA ---
    function loadProducts() {
        const storedProducts = localStorage.getItem('lutfiStoreProducts');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
        } else {
            // Data contoh jika belum ada produk
            products = [
                {
                    id: 1,
                    name: 'Kaos Polos Hitam',
                    category: 'Pakaian',
                    price: 100000,
                    stock: 50,
                    image: 'https://via.placeholder.com/250x200/000000/FFFFFF?text=Kaos+Hitam',
                    description: 'Kaos polos berkualitas tinggi, nyaman dipakai.',
                    variants: 'S, M, L, XL'
                },
                {
                    id: 2,
                    name: 'Mug Keramik',
                    category: 'Aksesoris',
                    price: 45000,
                    stock: 30,
                    image: 'https://via.placeholder.com/250x200/EEEEEE/000000?text=Mug+Keramik',
                    description: 'Mug keramik dengan desain minimalis.',
                    variants: ''
                }
            ];
            saveProducts();
        }
    }

    function saveProducts() {
        localStorage.setItem('lutfiStoreProducts', JSON.stringify(products));
    }

    function loadCart() {
        const storedCart = localStorage.getItem('lutfiStoreCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    }

    function saveCart() {
        localStorage.setItem('lutfiStoreCart', JSON.stringify(cart));
    }

    function loadSettings() {
        const storedSettings = localStorage.getItem('lutfiStoreSettings');
        if (storedSettings) {
            settings = { ...settings, ...JSON.parse(storedSettings) };
        }
    }
    
    function applySettings() {
        if (promoBanner && settings.promoBannerText) {
            promoBanner.querySelector('p').textContent = settings.promoBannerText;
        }
    }

    // --- FUNGSI RENDER UI ---
    function renderProducts(productsToRender = products) {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p>Produk tidak ditemukan.</p>';
            return;
        }
        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image || 'https://via.placeholder.com/250x200'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <p class="stock">Stok: ${product.stock}</p>
                <p class="description">${product.description}</p>
                <div class="actions">
                    <button class="btn-add-to-cart" data-id="${product.id}">Tambah ke Keranjang</button>
                    <button class="btn-buy-via-wa" data-id="${product.id}">Beli via WA</button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }

    function updateCartUI() {
        cartCount.textContent = cart.length;
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Keranjang belanja kosong.</p>';
        } else {
            cart.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <img src="${item.image || 'https://via.placeholder.com/60x60'}" alt="${item.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="decrease-quantity" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-id="${item.id}">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
                total += item.price * item.quantity;
            });
        }
        cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
    
    function populateCategoryFilter() {
        const categories = [...new Set(products.map(p => p.category))];
        categoryFilter.innerHTML = '<option value="">Semua Kategori</option>';
        categories.forEach(cat => {
            categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }

    // --- FUNGSI KERANJANG & PEMBAYARAN ---
    function addToCart(productId) {
        const productToAdd = products.find(p => p.id === productId);
        if (productToAdd && productToAdd.stock > 0) {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                if (existingItem.quantity < productToAdd.stock) {
                    existingItem.quantity++;
                } else {
                    alert('Stok tidak mencukupi!');
                    return;
                }
            } else {
                cart.push({ ...productToAdd, quantity: 1 });
            }
            saveCart();
            updateCartUI();
        } else {
            alert('Produk tidak ditemukan atau stok habis.');
        }
    }

    function updateQuantity(productId, change) {
        const item = cart.find(i => i.id === productId);
        const product = products.find(p => p.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== productId);
            } else if (item.quantity > product.stock) {
                alert('Stok tidak mencukupi!');
                item.quantity = product.stock;
            }
            saveCart();
            updateCartUI();
        }
    }

    function buyViaWhatsApp(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const variants = product.variants ? product.variants.split(',').map(v => v.trim()) : [];
        let selectedVariant = '';
        if (variants.length > 0) {
            const variantOptions = variants.map((v, i) => `${i + 1}. ${v}`).join('\n');
            selectedVariant = prompt(`Pilih variasi untuk ${product.name}:\n${variantOptions}\n\nKetik nomor variasi (1, 2, dst.) atau kosongkan jika tidak ada:`);
            if (selectedVariant && !isNaN(selectedVariant) && variants[selectedVariant - 1]) {
                selectedVariant = variants[selectedVariant - 1];
            } else {
                selectedVariant = 'Tidak ada';
            }
        }

        const message = `Halo Lutfi Store, saya tertarik dengan produk ini:\n\n` +
            `Nama: ${product.name}\n` +
            `Harga: Rp ${product.price.toLocaleString('id-ID')}\n` +
            `Link: ${window.location.href}\n` +
            `Variasi: ${selectedVariant}\n\n` +
            `Apakah masih tersedia?`;

        const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    function checkoutWhatsApp() {
        if (cart.length === 0) {
            alert('Keranjang belanja kamu kosong!');
            return;
        }

        let orderDetails = '';
        let totalPrice = 0;
        cart.forEach(item => {
            orderDetails += `- ${item.name} (Qty: ${item.quantity}) = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
            totalPrice += item.price * item.quantity;
        });

        const customerAddress = prompt('Masukkan alamat pengiriman kamu:');
        if (!customerAddress) {
            alert('Alamat pengiriman harus diisi untuk checkout.');
            return;
        }

        const finalMessage = settings.waOrderTemplate
            .replace('{order_details}', orderDetails.trim())
            .replace('{total_price}', `Rp ${totalPrice.toLocaleString('id-ID')}`)
            .replace('{customer_address}', customerAddress);

        const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
        window.open(whatsappUrl, '_blank');
        
        // Kosongkan keranjang setelah checkout
        cart = [];
        saveCart();
        updateCartUI();
        cartSidebar.classList.remove('open');
    }

    // --- FUNGSI SEARCH, FILTER, & SORT ---
    function filterAndSortProducts() {
        let filteredProducts = [...products];

        // Search
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        // Category Filter
        const categoryTerm = categoryFilter.value;
        if (categoryTerm) {
            filteredProducts = filteredProducts.filter(p => p.category === categoryTerm);
        }

        // Sort
        const sortTerm = sortFilter.value;
        switch (sortTerm) {
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
        }

        renderProducts(filteredProducts);
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // Cart
        cartIcon.addEventListener('click', () => cartSidebar.classList.add('open'));
        closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('open'));
        checkoutBtn.addEventListener('click', checkoutWhatsApp);

        // Product actions (using event delegation)
        productGrid.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            if (e.target.classList.contains('btn-add-to-cart')) {
                addToCart(productId);
            } else if (e.target.classList.contains('btn-buy-via-wa')) {
                buyViaWhatsApp(productId);
            }
        });

        // Cart quantity actions (using event delegation)
        cartItemsContainer.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            if (e.target.classList.contains('increase-quantity')) {
                updateQuantity(productId, 1);
            } else if (e.target.classList.contains('decrease-quantity')) {
                updateQuantity(productId, -1);
            }
        });

        // Search, Filter, Sort
        searchInput.addEventListener('input', filterAndSortProducts);
        categoryFilter.addEventListener('change', filterAndSortProducts);
        sortFilter.addEventListener('change', filterAndSortProducts);

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('lutfiStoreDarkMode', isDarkMode);
            themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        });
        
        // Load theme preference
        const isDarkMode = localStorage.getItem('lutfiStoreDarkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }
    }

    // --- JALANKAN APLIKASI ---
    initializeApp();
});