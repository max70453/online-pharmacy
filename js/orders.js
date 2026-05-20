let currentStatusFilter = '';
let currentUserPhone = '';

function initOrdersPage() {
    currentUserPhone = localStorage.getItem('dlv_currentUserPhone') || '';
    
    if (currentUserPhone) {
        showOrdersSection();
    } else {
        showAuthSection();
    }
    
    setupAuth();
    setupLogout();
    setupStatusFilters();
}

function showAuthSection() {
    document.getElementById('phone-auth-section').style.display = 'flex';
    document.getElementById('orders-section').style.display = 'none';
}

function showOrdersSection() {
    document.getElementById('phone-auth-section').style.display = 'none';
    document.getElementById('orders-section').style.display = 'block';
    document.getElementById('current-user-phone').textContent = currentUserPhone;
    renderOrders();
}

function setupAuth() {
    const authPhone = document.getElementById('auth-phone');
    const authSubmit = document.getElementById('auth-submit');
    
    authSubmit.addEventListener('click', () => {
        const phone = authPhone.value.trim();
        if (!phone) {
            showToast('Введите номер телефона', 'warning');
            return;
        }
        
        const orders = StorageAPI.getOrders();
        const userOrders = orders.filter(o => o.customer.phone === phone);
        
        if (userOrders.length === 0) {
            showToast('Заказы с этим номером не найдены', 'warning');
            return;
        }
        
        currentUserPhone = phone;
        localStorage.setItem('dlv_currentUserPhone', phone);
        showOrdersSection();
        showToast('Добро пожаловать!', 'success');
    });
    
    authPhone.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            authSubmit.click();
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            currentUserPhone = '';
            localStorage.removeItem('dlv_currentUserPhone');
            showAuthSection();
            document.getElementById('auth-phone').value = '';
        });
    }
}

function renderOrders() {
    const ordersEmpty = document.getElementById('orders-empty');
    const ordersList = document.getElementById('orders-list');
    const noResults = document.getElementById('no-results');
    
    let orders = StorageAPI.getOrders();
    
    // Фильтруем только заказы текущего пользователя
    orders = orders.filter(order => order.customer.phone === currentUserPhone);
    
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (currentStatusFilter) {
        orders = orders.filter(order => order.status === currentStatusFilter);
    }
    
    if (orders.length === 0) {
        ordersEmpty.style.display = 'flex';
        ordersList.innerHTML = '';
        noResults.style.display = 'none';
        return;
    }
    
    ordersEmpty.style.display = 'none';
    noResults.style.display = 'none';
    
    ordersList.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt);
        const formattedDate = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        const formattedTime = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        const statusConfig = getStatusConfig(order.status);
        const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const deliveryIcon = order.customer.delivery === 'delivery' ? 'fa-truck' : 'fa-store';
        
        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-card-row">
                    <div class="order-card-col order-id-col">
                        <span class="order-id">${order.id}</span>
                        <span class="order-date">${formattedDate}, ${formattedTime}</span>
                    </div>
                    <div class="order-card-col order-status-col">
                        <span class="order-status-badge ${statusConfig.class}">
                            <i class="${statusConfig.icon}"></i>
                        </span>
                    </div>
                    <div class="order-card-col order-customer-col">
                        <span class="customer-name">${order.customer.name}</span>
                        <span class="customer-phone">${order.customer.phone}</span>
                    </div>
                    <div class="order-card-col order-delivery-col">
                        <i class="fas ${deliveryIcon}"></i>
                        <span>${order.customer.delivery === 'delivery' && order.customer.address ? order.customer.address : 'Самовывоз'}</span>
                    </div>
                    <div class="order-card-col order-items-col">
                        <span class="items-count">${itemsCount} шт.</span>
                        <span class="items-preview-text">${order.items.slice(0, 2).map(i => i.name).join(', ')}${order.items.length > 2 ? '...' : ''}</span>
                    </div>
                    <div class="order-card-col order-total-col">
                        <span class="total-amount">${formatPrice(order.total)}</span>
                    </div>
                    <div class="order-card-col order-actions-col">
                        <button class="btn btn-sm btn-outline" onclick="showOrderDetail('${order.id}')" title="Подробнее">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getStatusConfig(status) {
    const configs = {
        'new': { class: 'status-new', text: 'Новый', icon: 'fas fa-clock' },
        'processing': { class: 'status-processing', text: 'В обработке', icon: 'fas fa-spinner' },
        'ready': { class: 'status-ready', text: 'Готов к выдаче', icon: 'fas fa-check' },
        'completed': { class: 'status-completed', text: 'Выдан', icon: 'fas fa-check-double' }
    };
    return configs[status] || configs['new'];
}

function setupStatusFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatusFilter = btn.dataset.status;
            renderOrders();
        });
    });
}

function showOrderDetail(orderId) {
    const orders = StorageAPI.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Проверяем что заказ принадлежит текущему пользователю
    if (order.customer.phone !== currentUserPhone) {
        showToast('У вас нет доступа к этому заказу', 'error');
        return;
    }
    
    const date = new Date(order.createdAt);
    const formattedDate = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    const statusConfig = getStatusConfig(order.status);
    const deliveryIcon = order.customer.delivery === 'delivery' ? 'fa-truck' : 'fa-store';
    const deliveryText = order.customer.delivery === 'delivery' ? 'Доставка' : 'Самовывоз';
    
    document.getElementById('modal-order-title').innerHTML = `
        <i class="fas fa-file-alt" style="color: var(--primary-color);"></i>
        Заказ ${order.id}
    `;
    
    document.getElementById('modal-order-body').innerHTML = `
        <div class="order-detail-header">
            <div class="status-badge-large ${statusConfig.class}">
                <i class="${statusConfig.icon}"></i>
                ${statusConfig.text}
            </div>
            <div class="detail-date">
                <i class="fas fa-calendar-alt"></i>
                ${formattedDate}, ${formattedTime}
            </div>
        </div>
        
        <div class="order-detail-grid">
            <div class="order-detail-section">
                <h3><i class="fas fa-user-circle"></i> Клиент</h3>
                <div class="customer-info-compact">
                    <div class="customer-row">
                        <span class="customer-label"><i class="fas fa-user"></i> ФИО</span>
                        <span class="customer-value">${order.customer.name}</span>
                    </div>
                    <div class="customer-row">
                        <span class="customer-label"><i class="fas fa-phone"></i> Телефон</span>
                        <span class="customer-value">${order.customer.phone}</span>
                    </div>
                    <div class="customer-row">
                        <span class="customer-label"><i class="fas ${deliveryIcon}"></i> ${deliveryText}</span>
                        <span class="customer-value">${order.customer.delivery === 'delivery' && order.customer.address ? order.customer.address : (order.customer.delivery === 'pickup' ? 'Аптека на ул. Аптечная, 1' : '-')}</span>
                    </div>
                    ${order.customer.comment ? `
                    <div class="customer-row">
                        <span class="customer-label"><i class="fas fa-comment"></i> Комментарий</span>
                        <span class="customer-value">${order.customer.comment}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="order-detail-section">
                <h3><i class="fas fa-shopping-basket"></i> Состав</h3>
                <table class="order-items-table-compact">
                    <thead>
                        <tr>
                            <th>Товар</th>
                            <th>Цена</th>
                            <th>Кол</th>
                            <th>Сумма</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${formatPrice(item.price)}</td>
                                <td>×${item.quantity}</td>
                                <td class="item-sum">${formatPrice(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="order-summary-compact">
                    ${order.discount > 0 ? `<span>Скидка: -${formatPrice(order.discount)}</span>` : ''}
                    <span class="summary-total">Итого: ${formatPrice(order.total)}</span>
                </div>
            </div>
        </div>
        
        ${order.managerComment ? `
        <div class="order-detail-section manager-comment">
            <h3><i class="fas fa-comment-dots"></i> Комментарий менеджера</h3>
            <p>${order.managerComment}</p>
        </div>
        ` : ''}
    `;
    
    document.getElementById('order-detail-modal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('order-detail-modal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', initOrdersPage);

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeOrderModal();
    }
});
