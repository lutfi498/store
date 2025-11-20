document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMEN DOM ---
    const loginForm = document.getElementById('login-form');
    const loginFormElement = document.getElementById('login-form-element');
    const loginError = document.getElementById('login-error');
    const adminDashboard = document.getElementById('admin-dashboard');
    const logoutBtn = document.getElementById('logout-btn');
    
    const productForm = document.getElementById('product-form');
    const productTableBody = document.querySelector('#product-table tbody');
    const productIdInput = document.getElementById('product-id');
    
    const settingsForm = document.getElementById('settings-form');
    const testimonialForm = document.getElementById('testimonial-form');
    const testimonialList = document.getElementById('testimonial-list');

    const backupBtn = document.getElementById('backup-data');
    const restoreBtn = document.getElementById('restore-data');
    const backupTextarea = document.getElementById('backup-textarea');

    // --- DATA & PENGATURAN ---
    let products = [];
    let testimonials = [];
    let settings = {
        whatsappNumber: '6288985628174',
        promoBannerText: 'Selamat Datang di Lutfi Store! Dapatkan diskon spesial untuk pembelian pertama.',
        waOrderTemplate: 'Halo Lutfi Store, saya ingin memesan:\n\n{order_details}\n\nTotal: {total_price}\n\nUntuk pengiriman ke alamat:\n{customer_address}'
    };

    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin';

    // --- INISIALISASI & CEK LOGIN ---
    function initializeAdmin() {
        if (isLoggedIn()) {
            showDashboard();
        } else {
            showLoginForm();
        }
    }

    function isLoggedIn() {
        return sessionStorage.getItem('lutfiAdminLoggedIn') === 'true';
    }

    // --- FUNGSI UI LOGIN/DASHBOARD ---
    function showLoginForm() {
        loginForm.style.display = 'block';
        adminDashboard.style.display = 'none';
    }

    function showDashboard() {
        loginForm.style.display = 'none';
        adminDashboard.style.display = 'block';
        loadData();
        renderProductTable();
        renderTestimonials();
        populateSettingsForm();
    }

    function login(username, password) {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('lutfiAdminLoggedIn', 'true');
            showDashboard();
        } else {
            loginError.textContent = 'Username atau password salah!';
        }
    }

    function logout() {
        sessionStorage.removeItem('lutfiAdminLoggedIn');
        showLoginForm();
    }

    // --- FUNGSI DATA (LOAD & SAVE) ---
    function loadData() {
        const storedProducts = localStorage.getItem('lutfiStoreProducts');
        if (storedProducts) products = JSON.parse(storedProducts);

        const storedTestimonials = localStorage.getItem('lutfiStoreTestimonials');
        if (storedTestimonials) testimonials = JSON.parse(storedTestimonials);

        const storedSettings = localStorage.getItem('lutfiStoreSettings');
        if (storedSettings) settings = { ...settings, ...JSON.parse(storedSettings) };
    }

    function saveData() {
        localStorage.setItem('lutfiStoreProducts', JSON.stringify(products));
        localStorage.setItem('lutfiStoreTestimonials', JSON.stringify(testimonials));
        localStorage.setItem('lutfiStoreSettings', JSON.stringify(settings));
    }

    // --- MANAJEMEN PRODUK ---
    function renderProductTable() {
        productTableBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>Rp ${product.price.toLocaleString('id-ID')}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn-edit" data-id="${product.id}">Edit</button>
                    <button class="btn-delete" data-id="${product.id}">Hapus</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    }

    function handleProductSubmit(e) {
        e.preventDefault();
        const productId = productIdInput.value;
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseInt(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            image: document.getElementById('product-image').value,
            description: document.getElementById('product-description').value,
            variants: document.getElementById('product-variants').value,
        };

        if (productId) {
            // Edit produk
            const index = products.findIndex(p => p.id == productId);
            if (index > -1) {
                products[index] = { ...products[index], ...productData };
            }
        } else {
            // Tambah produk baru
            const newProduct = {
                id: Date.now(), // ID unik sementara
                ...productData
            };
            products.push(newProduct);
        }

        saveData();
        renderProductTable();
        productForm.reset();
        productIdInput.value = '';
    }

    function handleProductTableClick(e) {
        const productId = parseInt(e.target.dataset.id);
        if (e.target.classList.contains('btn-edit')) {
            const productToEdit = products.find(p => p.id === productId);
            if (productToEdit) {
                productIdInput.value = productToEdit.id;
                document.getElementById('product-name').value = productToEdit.name;
                document.getElementById('product-category').value = productToEdit.category;
                document.getElementById('product-price').value = productToEdit.price;
                document.getElementById('product-stock').value = productToEdit.stock;
                document.getElementById('product-image').value = productToEdit.image;
                document.getElementById('product-description').value = productToEdit.description;
                document.getElementById('product-variants').value = productToEdit.variants;
                window.scrollTo(0, 0);
            }
        } else if (e.target.classList.contains('btn-delete')) {
            if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                products = products.filter(p => p.id !== productId);
                saveData();
                renderProductTable();
            }
        }
    }

    // --- MANAJEMEN PENGATURAN ---
    function populateSettingsForm() {
        document.getElementById('whatsapp-number').value = settings.whatsappNumber.substring(2); // Hilangkan +62
        document.getElementById('promo-banner-text').value = settings.promoBannerText;
        document.getElementById('wa-order-template').value = settings.waOrderTemplate;
    }

    function handleSettingsSubmit(e) {
        e.preventDefault();
        settings.whatsappNumber = '62' + document.getElementById('whatsapp-number').value;
        settings.promoBannerText = document.getElementById('promo-banner-text').value;
        settings.waOrderTemplate = document.getElementById('wa-order-template').value;
        saveData();
        alert('Pengaturan berhasil disimpan!');
    }

    // --- MANAJEMEN TESTIMONI ---
    function renderTestimonials() {
        testimonialList.innerHTML = '';
        testimonials.forEach((testimoni, index) => {
            const item = document.createElement('div');
            item.className = 'testimonial-item';
            item.innerHTML = `
                <strong>${testimoni.name}</strong>
                <p>${testimoni.message}</p>
                <button class="btn-delete" data-index="${index}">Hapus</button>
            `;
            testimonialList.appendChild(item);
        });
    }

    function handleTestimonialSubmit(e) {
        e.preventDefault();
        const newTestimonial = {
            name: document.getElementById('testimonial-name').value,
            message: document.getElementById('testimonial-message').value,
        };
        testimonials.push(newTestimonial);
        saveData();
        renderTestimonials();
        testimonialForm.reset();
    }

    function handleTestimonialListClick(e) {
        if (e.target.classList.contains('btn-delete')) {
            const index = parseInt(e.target.dataset.index);
            if (confirm('Hapus testimoni ini?')) {
                testimonials.splice(index, 1);
                saveData();
                renderTestimonials();
            }
        }
    }

    // --- BACKUP & RESTORE ---
    function backupData() {
        const allData = {
            products: products,
            testimonials: testimonials,
            settings: settings
        };
        backupTextarea.value = JSON.stringify(allData, null, 2);
    }

    function restoreData() {
        try {
            const restoredData = JSON.parse(backupTextarea.value);
            if (restoredData.products) products = restoredData.products;
            if (restoredData.testimonials) testimonials = restoredData.testimonials;
            if (restoredData.settings) settings = restoredData.settings;
            
            saveData();
            alert('Data berhasil dipulihkan! Halaman akan dimuat ulang.');
            location.reload();
        } catch (error) {
            alert('Gagal memulihkan data. Pastikan format JSON yang Anda tempel benar.');
            console.error('Restore error:', error);
        }
    }

    // --- EVENT LISTENERS ---
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
    });

    logoutBtn.addEventListener('click', logout);

    productForm.addEventListener('submit', handleProductSubmit);
    productTableBody.addEventListener('click', handleProductTableClick);

    settingsForm.addEventListener('submit', handleSettingsSubmit);
    
    testimonialForm.addEventListener('submit', handleTestimonialSubmit);
    testimonialList.addEventListener('click', handleTestimonialListClick);

    backupBtn.addEventListener('click', backupData);
    restoreBtn.addEventListener('click', restoreData);

    // --- JALANKAN APLIKASI ADMIN ---
    initializeAdmin();
});