// Global variables
let currentUser = null;
let currentItems = [];
let currentViewMode = 'grid';

// DOM elements
const navUser = document.getElementById('navUser');
const itemsGrid = document.getElementById('itemsGrid');
const noItems = document.getElementById('noItems');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modeFilter = document.getElementById('modeFilter');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadItems();
});

// Initialize the application
function initializeApp() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            currentUser = user;
            updateNavigation();
        }
    }
    
    // Setup mobile navigation
    setupMobileNav();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Filter functionality
    categoryFilter.addEventListener('change', handleFilters);
    modeFilter.addEventListener('change', handleFilters);
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('addItemForm').addEventListener('submit', handleAddItem);
    document.getElementById('contactForm').addEventListener('submit', sendContactMessage);
    
    // Image upload preview
    document.getElementById('itemImage').addEventListener('change', handleImagePreview);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Setup mobile navigation
function setupMobileNav() {
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Update navigation based on user authentication status
function updateNavigation() {
    if (currentUser) {
        navUser.innerHTML = `
            <div class="user-welcome">Welcome, ${currentUser.name}</div>
            <button class="nav-link" onclick="showProfileModal()">
                <i class="fas fa-user"></i>
                Profile
            </button>
            ${currentUser.role === 'admin' ? `
                <button class="nav-link" onclick="showAdminModal()">
                    <i class="fas fa-shield-alt"></i>
                    Admin
                </button>
            ` : ''}
            <button class="logout-btn" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        `;
    } else {
        navUser.innerHTML = `
            <button class="nav-link" onclick="showAuthModal('login')">
                <i class="fas fa-sign-in-alt"></i>
                Login
            </button>
            <button class="nav-link" onclick="showAuthModal('register')">
                <i class="fas fa-user-plus"></i>
                Register
            </button>
        `;
    }
}

// Authentication functions
function showAuthModal(tab = 'login') {
    document.getElementById('authModal').classList.add('active');
    switchTab(tab);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function switchTab(tab) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    // Add active class to selected tab and form
    if (tab === 'login') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            updateNavigation();
            closeModal('authModal');
            showNotification('Login successful!', 'success');
            
            // Clear form
            document.getElementById('loginForm').reset();
            
            // Reload items to show user-specific content
            loadItems();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('An error occurred. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const userClass = document.getElementById('registerClass').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, class: userClass, phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            updateNavigation();
            closeModal('authModal');
            showNotification('Registration successful!', 'success');

            // Clear form
            document.getElementById('registerForm').reset();

            // Reload items
            loadItems();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('An error occurred. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavigation();
    showNotification('Logged out successfully', 'info');
    loadItems();
}

// Item management functions
async function loadItems() {
    try {
        const searchParams = new URLSearchParams();
        if (searchInput.value) searchParams.append('search', searchInput.value);
        if (categoryFilter.value !== 'all') searchParams.append('category', categoryFilter.value);
        if (modeFilter.value !== 'all') searchParams.append('mode', modeFilter.value);
        
        const response = await fetch(`/api/items?${searchParams.toString()}`);
        const items = await response.json();
        
        currentItems = items;
        displayItems(items);
    } catch (error) {
        showNotification('Error loading items', 'error');
    }
}

function displayItems(items) {
    if (items.length === 0) {
        itemsGrid.style.display = 'none';
        noItems.style.display = 'block';
        return;
    }
    
    itemsGrid.style.display = 'grid';
    noItems.style.display = 'none';
    
    itemsGrid.innerHTML = items.map(item => createItemCard(item)).join('');
}

function createItemCard(item) {
    const modeClass = item.mode === 'free' ? 'mode-donate' : `mode-${item.mode}`;
    const priceDisplay = item.mode === 'free' ? 'Free' : `₹${item.price}`;
    const priceClass = item.mode === 'free' ? 'free' : '';
    
    // Handle image display with better fallback
    let imageHtml = '';
    let iconStyle = 'display: flex;';
    
    if (item.image_url && item.image_url !== 'null' && item.image_url !== '') {
        // Check if it's a full URL or relative path
        const imageSrc = item.image_url.startsWith('http') ? item.image_url : item.image_url;
        imageHtml = `<img src="${imageSrc}" alt="${item.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" onload="this.nextElementSibling.style.display='none';">`;
        iconStyle = 'display: none;'; // Hide icon initially, will be shown by onerror
    }
    
    // Add admin delete button if user is admin
    const adminDeleteBtn = currentUser && currentUser.role === 'admin' ? `
        <button class="hero-btn danger" onclick="deleteItem(${item.id})" style="margin-top: 8px;">
            <i class="fas fa-trash"></i>
            Delete
        </button>
    ` : '';
    
    return `
        <div class="item-card">
            <div class="item-image">
                ${imageHtml}
                <i class="fas fa-image" style="${iconStyle}"></i>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-badges">
                        <span class="badge category">${item.category || 'other'}</span>
                        <span class="badge ${modeClass}">${item.mode === 'free' ? 'Free' : item.mode || 'buy'}</span>
                    </div>
                </div>
                <div class="item-price ${priceClass}">${priceDisplay}</div>
                <p class="item-description">${item.description}</p>
                <div class="seller-info-mini">
                    <small><i class="fas fa-user"></i> ${item.seller_name || 'Unknown'} (${item.seller_class || 'Student'})</small>
                </div>
                <button class="contact-seller-btn" onclick="contactSeller(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <i class="fas fa-envelope"></i>
                    Contact Seller
                </button>
                ${adminDeleteBtn}
            </div>
        </div>
    `;
}

// Search and filter functions
function handleSearch() {
    loadItems();
}

function handleFilters() {
    loadItems();
}

function clearFilters() {
    searchInput.value = '';
    categoryFilter.value = 'all';
    modeFilter.value = 'all';
    loadItems();
}

function filterByCategory(category) {
    categoryFilter.value = category;
    loadItems();
}

// Contact seller functionality
function contactSeller(itemStr) {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }

    let item;
    if (typeof itemStr === 'string') {
        try {
            item = JSON.parse(itemStr);
        } catch (e) {
            showNotification('Invalid item data', 'error');
            return;
        }
    } else {
        item = itemStr;
    }

    // Populate seller info
    document.getElementById('sellerName').textContent = item.seller_name || 'Unknown';
    document.getElementById('sellerEmail').textContent = item.seller_email || 'N/A';
    document.getElementById('sellerPhone').textContent = item.seller_phone || 'N/A';
    document.getElementById('sellerClass').textContent = item.seller_class || 'N/A';

    // Store current item for message sending
    window.currentContactItem = item;

    // Show contact modal
    document.getElementById('contactModal').classList.add('active');
}

async function sendContactMessage(e) {
    e.preventDefault();

    // Validate that current item is set
    if (!window.currentContactItem || !window.currentContactItem.id) {
        showNotification('Invalid item data. Please try again.', 'error');
        return;
    }

    const submitBtn = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    const data = {
        itemId: window.currentContactItem.id,
        name: document.getElementById('contactName').value.trim(),
        collegeName: document.getElementById('contactCollege').value.trim(),
        branch: document.getElementById('contactBranch').value.trim(),
        enrollmentNumber: document.getElementById('contactEnrollment').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        email: document.getElementById('contactEmail').value.trim()
    };

    // Client-side validation
    if (!data.name || !data.collegeName || !data.branch || !data.enrollmentNumber || !data.phone || !data.email) {
        showNotification('Please fill in all required fields.', 'error');
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
    }

    try {
        const response = await fetch('/api/contact-seller', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (response.ok) {
            showNotification('Contact request sent successfully!', 'success');
            closeModal('contactModal');
            document.getElementById('contactForm').reset();
        } else {
            showNotification(responseData.message, 'error');
        }
    } catch (error) {
        showNotification('An error occurred. Please try again.', 'error');
    } finally {
        // Re-enable button and restore original text
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Add item functionality
function showAddItemModal() {
    if (!currentUser) {
        showAuthModal('login');
        return;
    }
    
    document.getElementById('addItemModal').classList.add('active');
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

async function handleAddItem(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('itemTitle').value);
    formData.append('description', document.getElementById('itemDescription').value);
    formData.append('category', document.getElementById('itemCategory').value);
    formData.append('mode', document.getElementById('itemMode').value);
    formData.append('price', document.getElementById('itemPrice').value);
    formData.append('phone', document.getElementById('itemPhone').value);

    const imageFile = document.getElementById('itemImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Item added successfully! It will be reviewed by admin.', 'success');
            closeModal('addItemModal');
            document.getElementById('addItemForm').reset();
            document.getElementById('imagePreview').innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload image</p>
            `;
            loadItems();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('An error occurred. Please try again.', 'error');
    }
}

// Profile functionality
function showProfileModal() {
    if (!currentUser) return;
    
    document.getElementById('profileModal').classList.add('active');
    loadUserItems();
    loadUserOrders();
}

function switchProfileTab(tab) {
    // Remove active class from all tabs and sections
    document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.profile-section').forEach(section => section.classList.remove('active'));
    
    // Add active class to selected tab and section
    if (tab === 'items') {
        document.querySelector('.profile-tabs .tab-btn:first-child').classList.add('active');
        document.getElementById('myItemsSection').classList.add('active');
    } else {
        document.querySelector('.profile-tabs .tab-btn:last-child').classList.add('active');
        document.getElementById('myOrdersSection').classList.add('active');
    }
}

async function loadUserItems() {
    try {
        const response = await fetch('/api/user/items', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const items = await response.json();
        const myItemsGrid = document.getElementById('myItemsGrid');
        
        if (items.length === 0) {
            myItemsGrid.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-box-open"></i>
                    <h3>No items yet</h3>
                    <p>Start selling by adding your first item!</p>
                </div>
            `;
        } else {
            myItemsGrid.innerHTML = items.map(item => createUserItemCard(item)).join('');
        }
    } catch (error) {
        showNotification('Error loading your items', 'error');
    }
}

function createUserItemCard(item) {
    const statusClass = item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'error' : 'warning';
    const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    
    return `
        <div class="item-card">
            <div class="item-image">
                ${item.image_url ? 
                    `<img src="${item.image_url}" alt="${item.title}">` : 
                    `<i class="fas fa-image"></i>`
                }
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-badges">
                        <span class="badge category">${item.category}</span>
                        <span class="badge ${item.status === 'free' ? 'mode-donate' : `mode-${item.mode}`}">${item.mode === 'free' ? 'Free' : item.mode}</span>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="item-price ${item.mode === 'free' ? 'free' : ''}">${item.mode === 'free' ? 'Free' : `₹${item.price}`}</div>
                <p class="item-description">${item.description}</p>
            </div>
        </div>
    `;
}

async function loadUserOrders() {
    try {
        const response = await fetch('/api/user/orders', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const orders = await response.json();
        const myOrdersGrid = document.getElementById('myOrdersGrid');
        
        if (orders.length === 0) {
            myOrdersGrid.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here!</p>
                </div>
            `;
        } else {
            myOrdersGrid.innerHTML = orders.map(order => createOrderCard(order)).join('');
        }
    } catch (error) {
        showNotification('Error loading your orders', 'error');
    }
}

function createOrderCard(order) {
    return `
        <div class="item-card">
            <div class="item-image">
                ${order.image_url ? 
                    `<img src="${order.image_url}" alt="${order.title}">` : 
                    `<i class="fas fa-image"></i>`
                }
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${order.title}</h3>
                    <div class="item-badges">
                        <span class="badge ${order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}">${order.status}</span>
                    </div>
                </div>
                <p class="item-description">Ordered from: ${order.seller_name}</p>
                <small>Ordered on: ${new Date(order.created_at).toLocaleDateString()}</small>
            </div>
        </div>
    `;
}

// Admin functionality
function showAdminModal() {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    document.getElementById('adminModal').classList.add('active');
    loadPendingItems();
}

async function loadPendingItems() {
    try {
        const response = await fetch('/api/admin/pending-items', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const items = await response.json();
        const pendingItemsGrid = document.getElementById('pendingItemsGrid');
        
        if (items.length === 0) {
            pendingItemsGrid.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-check-circle"></i>
                    <h3>No pending items</h3>
                    <p>All items have been reviewed!</p>
                </div>
            `;
        } else {
            pendingItemsGrid.innerHTML = items.map(item => createPendingItemCard(item)).join('');
        }
    } catch (error) {
        showNotification('Error loading pending items', 'error');
    }
}

function createPendingItemCard(item) {
    return `
        <div class="item-card">
            <div class="item-image">
                ${item.image_url ? 
                    `<img src="${item.image_url}" alt="${item.title}">` : 
                    `<i class="fas fa-image"></i>`
                }
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-badges">
                        <span class="badge category">${item.category}</span>
                        <span class="badge ${item.mode === 'free' ? 'mode-donate' : `mode-${item.mode}`}">${item.mode === 'free' ? 'Free' : item.mode}</span>
                    </div>
                </div>
                <div class="item-price ${item.mode === 'free' ? 'free' : ''}">${item.mode === 'free' ? 'Free' : `₹${item.price}`}</div>
                <p class="item-description">${item.description}</p>
                <div class="seller-info-mini">
                    <small><i class="fas fa-user"></i> ${item.seller_name} (${item.seller_class})</small>
                </div>
                <div class="admin-actions">
                    <button class="hero-btn primary" onclick="approveItem(${item.id})">
                        <i class="fas fa-check"></i>
                        Approve
                    </button>
                    <button class="hero-btn secondary" onclick="rejectItem(${item.id})">
                        <i class="fas fa-times"></i>
                        Reject
                    </button>
                    <button class="hero-btn danger" onclick="deleteItem(${item.id})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function approveItem(itemId) {
    try {
        const response = await fetch(`/api/admin/items/${itemId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'approved' })
        });
        
        if (response.ok) {
            showNotification('Item approved successfully!', 'success');
            loadPendingItems();
            loadItems(); // Refresh main marketplace
        } else {
            const data = await response.json();
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error approving item', 'error');
    }
}

async function rejectItem(itemId) {
    try {
        const response = await fetch(`/api/admin/items/${itemId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'rejected' })
        });
        
        if (response.ok) {
            showNotification('Item rejected successfully!', 'success');
            loadPendingItems();
        } else {
            const data = await response.json();
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error rejecting item', 'error');
    }
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showNotification('Item deleted successfully!', 'success');
            loadPendingItems();
            loadItems(); // Refresh main marketplace
        } else {
            const data = await response.json();
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Error deleting item', 'error');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function scrollToMarketplace() {
    document.getElementById('marketplace').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function setViewMode(mode) {
    currentViewMode = mode;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update grid layout
    if (mode === 'list') {
        itemsGrid.style.gridTemplateColumns = '1fr';
    } else {
        itemsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
