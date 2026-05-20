let isAuthenticated = false;
let salesChart = null;
let topGoodsChart = null;
let statsPeriod = 7;

function initAdminPage() {
    setupPinAuth();
    setupTabs();
    setupModals();
    setupPeriodSelector();
}

function setupPinAuth() {
    const pinInput = document.getElementById('pin-input');
    const pinSubmit = document.getElementById('pin-submit');
    const pinError = document.getElementById('pin-error');

    pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') pinSubmit.click();
    });

    pinSubmit.addEventListener('click', () => {
        const pin = pinInput.value;
        if (pin === '1111') {
            document.getElementById('pin-screen').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            isAuthenticated = true;
            loadAdminData();
        } else {
            pinError.style.display = 'block';
            pinInput.classList.add('shake');
            setTimeout(() => {
                pinError.style.display = 'none';
                pinInput.classList.remove('shake');
            }, 3000);
        }
    });
}

function loadAdminData() {
    adminGoodsPage = 1;
    updateAdminStats();
    renderGoodsTable();
    renderOrdersTable();
    renderPromoTable();
    renderStats();
}

function updateAdminStats() {
    const goods = StorageAPI.getGoods();
    const orders = StorageAPI.getOrders();
    const reviews = StorageAPI.getReviews();

    document.getElementById('stat-goods').textContent = goods.length;
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-reviews').textContent = reviews.length;

    document.getElementById('total-orders').textContent = orders.length;
    
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    document.getElementById('total-sales').textContent = formatPrice(totalSales);
    
    const totalGoodsSold = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    document.getElementById('total-goods-sold').textContent = totalGoodsSold;
    
    const avgOrder = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;
    document.getElementById('avg-order').textContent = formatPrice(avgOrder);
}

function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById('panel-' + tab.dataset.tab).classList.add('active');

            if (tab.dataset.tab === 'stats') {
                renderStats();
            }
        });
    });
}

function setupPeriodSelector() {
    const buttons = document.querySelectorAll('.stats-period-selector button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            statsPeriod = parseInt(btn.dataset.period);
            renderSalesChart();
        });
    });
}

function setupModals() {
    document.getElementById('add-good-btn').addEventListener('click', openAddGoodModal);
    document.getElementById('add-promo-btn').addEventListener('click', openAddPromoModal);
    document.getElementById('good-form').addEventListener('submit', saveGood);
    document.getElementById('promo-form').addEventListener('submit', savePromo);
    document.getElementById('order-comment-form').addEventListener('submit', saveOrderComment);
    
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', importData);
    document.getElementById('reset-data-btn').addEventListener('click', resetData);
    
    document.getElementById('admin-order-status-filter').addEventListener('change', renderOrdersTable);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

function openAddGoodModal() {
    document.getElementById('good-modal-title').innerHTML = '<i class="fas fa-plus"></i> Добавить товар';
    document.getElementById('good-edit-id').value = '';
    document.getElementById('good-form').reset();
    document.getElementById('good-modal').classList.add('active');
}

function openAddPromoModal() {
    document.getElementById('promo-modal-title').innerHTML = '<i class="fas fa-plus"></i> Добавить промокод';
    document.getElementById('promo-edit-code').value = '';
    document.getElementById('promo-form').reset();
    document.getElementById('promo-modal').classList.add('active');
}

const ADMIN_ITEMS_PER_PAGE = 10;
let adminGoodsPage = 1;

function renderGoodsTable() {
    const tbody = document.getElementById('goods-tbody');
    const goods = StorageAPI.getGoods();

    if (goods.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">Товаров пока нет</td></tr>';
        document.getElementById('goods-pagination').innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(goods.length / ADMIN_ITEMS_PER_PAGE);
    if (adminGoodsPage > totalPages) adminGoodsPage = totalPages;
    
    const startIndex = (adminGoodsPage - 1) * ADMIN_ITEMS_PER_PAGE;
    const pageGoods = goods.slice(startIndex, startIndex + ADMIN_ITEMS_PER_PAGE);

    tbody.innerHTML = pageGoods.map(good => {
        const stockClass = good.stock < 5 ? 'stock-low' : good.stock === 0 ? 'stock-empty' : '';
        const prescriptionIcon = good.prescription ? '<i class="fas fa-check" style="color: var(--danger-color);"></i>' : '<i class="fas fa-minus" style="color: var(--text-secondary);"></i>';
        
        return `
            <tr>
                <td><span class="id-badge">${good.id}</span></td>
                <td>
                    <div class="good-name-cell">
                        <img src="${good.image}" alt="" class="good-thumb">
                        <span>${good.name}</span>
                    </div>
                </td>
                <td><span class="category-badge">${good.category}</span></td>
                <td><strong>${formatPrice(good.price)}</strong></td>
                <td class="${stockClass}">${good.stock}</td>
                <td>${renderStarsSmall(good.ratingAvg || 0)} <span class="rating-text">${(good.ratingAvg || 0).toFixed(1)}</span></td>
                <td>${prescriptionIcon}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="editGood(${good.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteGood(${good.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    renderGoodsPagination(totalPages);
}

function renderGoodsPagination(totalPages) {
    const pagination = document.getElementById('goods-pagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = `<span class="pagination-info">Показано ${ADMIN_ITEMS_PER_PAGE} из ${StorageAPI.getGoods().length}</span>`;
    
    html += `<button ${adminGoodsPage === 1 ? 'disabled' : ''} onclick="changeAdminGoodsPage(${adminGoodsPage - 1})">
        <i class="fas fa-chevron-left"></i>
    </button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= adminGoodsPage - 1 && i <= adminGoodsPage + 1)) {
            html += `<button class="${i === adminGoodsPage ? 'active' : ''}" onclick="changeAdminGoodsPage(${i})">${i}</button>`;
        } else if (i === adminGoodsPage - 2 || i === adminGoodsPage + 2) {
            html += '<span class="pagination-dots">...</span>';
        }
    }
    
    html += `<button ${adminGoodsPage === totalPages ? 'disabled' : ''} onclick="changeAdminGoodsPage(${adminGoodsPage + 1})">
        <i class="fas fa-chevron-right"></i>
    </button>`;
    
    pagination.innerHTML = html;
}

function changeAdminGoodsPage(page) {
    adminGoodsPage = page;
    renderGoodsTable();
}

function renderStarsSmall(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star-small ${i <= Math.round(rating) ? 'active' : ''}">★</span>`;
    }
    return stars;
}

function editGood(id) {
    const goods = StorageAPI.getGoods();
    const good = goods.find(g => g.id === id);
    if (!good) return;

    document.getElementById('good-modal-title').innerHTML = '<i class="fas fa-edit"></i> Редактировать товар';
    document.getElementById('good-edit-id').value = id;
    document.getElementById('good-name').value = good.name;
    document.getElementById('good-substance').value = good.substance || '';
    document.getElementById('good-category').value = good.category;
    document.getElementById('good-price').value = good.price;
    document.getElementById('good-stock').value = good.stock;
    document.getElementById('good-prescription').value = good.prescription ? 'true' : 'false';
    document.getElementById('good-description').value = good.description || '';
    document.getElementById('good-image').value = good.image || '';

    document.getElementById('good-modal').classList.add('active');
}

function saveGood(e) {
    e.preventDefault();
    
    const editId = document.getElementById('good-edit-id').value;
    const goods = StorageAPI.getGoods();

    const goodData = {
        name: document.getElementById('good-name').value,
        substance: document.getElementById('good-substance').value,
        category: document.getElementById('good-category').value,
        price: parseInt(document.getElementById('good-price').value),
        stock: parseInt(document.getElementById('good-stock').value),
        prescription: document.getElementById('good-prescription').value === 'true',
        description: document.getElementById('good-description').value,
        image: document.getElementById('good-image').value || `https://via.placeholder.com/200x200?text=${encodeURIComponent(document.getElementById('good-name').value)}`
    };

    if (editId) {
        const index = goods.findIndex(g => g.id === parseInt(editId));
        if (index !== -1) {
            goods[index] = { ...goods[index], ...goodData };
        }
    } else {
        const maxId = goods.length > 0 ? Math.max(...goods.map(g => g.id)) : 0;
        goods.push({ id: maxId + 1, ...goodData, ratingAvg: 0, createdAt: new Date().toISOString() });
    }

    StorageAPI.setGoods(goods);
    closeAllModals();
    adminGoodsPage = 1;
    renderGoodsTable();
    updateAdminStats();
    showToast('Товар сохранён', 'success');
}

function deleteGood(id) {
    if (!confirm('Удалить товар? Это действие необратимо.')) return;
    
    let goods = StorageAPI.getGoods();
    goods = goods.filter(g => g.id !== id);
    StorageAPI.setGoods(goods);
    
    let reviews = StorageAPI.getReviews();
    reviews = reviews.filter(r => r.goodId !== id);
    StorageAPI.setReviews(reviews);
    
    adminGoodsPage = 1;
    renderGoodsTable();
    updateAdminStats();
    showToast('Товар удалён', 'success');
}

function closeGoodModal() {
    document.getElementById('good-modal').classList.remove('active');
}

function renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-tbody');
    const statusFilter = document.getElementById('admin-order-status-filter').value;
    
    let orders = StorageAPI.getOrders();
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (statusFilter) {
        orders = orders.filter(o => o.status === statusFilter);
    }

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">Заказов нет</td></tr>';
        return;
    }

    const statusOptions = {
        'new': '<option value="new" selected>Новый</option><option value="processing">В обработке</option><option value="ready">Готов к выдаче</option><option value="completed">Выдан</option>',
        'processing': '<option value="new">Новый</option><option value="processing" selected>В обработке</option><option value="ready">Готов к выдаче</option><option value="completed">Выдан</option>',
        'ready': '<option value="new">Новый</option><option value="processing">В обработке</option><option value="ready" selected>Готов к выдаче</option><option value="completed">Выдан</option>',
        'completed': '<option value="new">Новый</option><option value="processing">В обработке</option><option value="ready">Готов к выдаче</option><option value="completed" selected>Выдан</option>'
    };

    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.createdAt);
        const formattedDate = date.toLocaleDateString('ru-RU') + '<br>' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const statusClass = 'status-' + order.status;
        const statusIcon = { 'new': 'fa-clock', 'processing': 'fa-spinner', 'ready': 'fa-check', 'completed': 'fa-check-double' }[order.status];

        return `
            <tr>
                <td><span class="order-id-badge">${order.id}</span></td>
                <td><small>${formattedDate}</small></td>
                <td>${order.customer.name}</td>
                <td>${order.customer.phone}</td>
                <td><strong>${formatPrice(order.total)}</strong></td>
                <td>
                    <select class="status-select ${statusClass}" onchange="updateOrderStatus('${order.id}', this.value)">
                        ${statusOptions[order.status]}
                    </select>
                </td>
                <td>
                    <div class="comment-cell" title="${order.managerComment || 'Нет комментария'}">
                        ${order.managerComment ? '<i class="fas fa-comment"></i>' : '<span style="color: var(--text-secondary);">—</span>'}
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="viewOrder('${order.id}')" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="addComment('${order.id}')" title="Комментарий">
                            <i class="fas fa-comment-dots"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStatus(orderId, status) {
    const orders = StorageAPI.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        StorageAPI.setOrders(orders);
        updateAdminStats();
        showToast('Статус обновлён', 'success');
    }
}

function viewOrder(orderId) {
    const orders = StorageAPI.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const date = new Date(order.createdAt);
    const statusConfig = {
        'new': { class: 'status-new', text: 'Новый', icon: 'fa-clock' },
        'processing': { class: 'status-processing', text: 'В обработке', icon: 'fa-spinner' },
        'ready': { class: 'status-ready', text: 'Готов к выдаче', icon: 'fa-check' },
        'completed': { class: 'status-completed', text: 'Выдан', icon: 'fa-check-double' }
    }[order.status];

    const statusIcon = statusConfig ? statusConfig.icon : 'fa-clock';

    document.getElementById('order-view-title').innerHTML = `<i class="fas fa-file-alt"></i> Заказ ${order.id}`;
    document.getElementById('order-view-content').innerHTML = `
        <div class="order-view-section">
            <div class="status-header ${statusConfig.class}">
                <i class="fas ${statusIcon}"></i>
                <span>${statusConfig.text}</span>
            </div>
            <div class="order-date-info">
                <i class="fas fa-calendar"></i>
                ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
        
        <div class="order-view-section">
            <h3><i class="fas fa-user"></i> Клиент</h3>
            <div class="customer-grid">
                <div><strong>ФИО:</strong> ${order.customer.name}</div>
                <div><strong>Телефон:</strong> ${order.customer.phone}</div>
                <div><strong>Доставка:</strong> ${order.customer.delivery === 'delivery' ? 'Доставка' : 'Самовывоз'}</div>
                ${order.customer.address ? `<div><strong>Адрес:</strong> ${order.customer.address}</div>` : ''}
                ${order.customer.comment ? `<div><strong>Комментарий:</strong> ${order.customer.comment}</div>` : ''}
            </div>
        </div>
        
        <div class="order-view-section">
            <h3><i class="fas fa-shopping-bag"></i> Состав заказа</h3>
            <table class="order-view-table">
                <thead>
                    <tr>
                        <th>Товар</th>
                        <th>Цена</th>
                        <th>Кол-во</th>
                        <th>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${formatPrice(item.price)}</td>
                            <td>×${item.quantity}</td>
                            <td><strong>${formatPrice(item.price * item.quantity)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="order-view-section order-view-total">
            ${order.discount > 0 ? `<div class="total-row"><span>Сумма:</span><span>${formatPrice(order.subtotal)}</span></div>` : ''}
            ${order.discount > 0 ? `<div class="total-row discount"><span>Скидка:</span><span>-${formatPrice(order.discount)}</span></div>` : ''}
            ${order.promoCode ? `<div class="total-row"><span>Промокод:</span><span class="badge badge-no-recipe">${order.promoCode}</span></div>` : ''}
            <div class="total-row final"><span>Итого:</span><span>${formatPrice(order.total)}</span></div>
        </div>
        
        ${order.managerComment ? `
        <div class="order-view-section manager">
            <h3><i class="fas fa-comment-dots"></i> Комментарий менеджера</h3>
            <p>${order.managerComment}</p>
        </div>
        ` : ''}
    `;

    document.getElementById('order-view-modal').classList.add('active');
}

function closeOrderViewModal() {
    document.getElementById('order-view-modal').classList.remove('active');
}

function addComment(orderId) {
    const orders = StorageAPI.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('comment-order-id').value = orderId;
    document.getElementById('order-comment').value = order.managerComment || '';
    document.getElementById('order-comment-modal').classList.add('active');
}

function saveOrderComment(e) {
    e.preventDefault();
    
    const orderId = document.getElementById('comment-order-id').value;
    const comment = document.getElementById('order-comment').value;
    
    const orders = StorageAPI.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.managerComment = comment;
        StorageAPI.setOrders(orders);
        closeAllModals();
        renderOrdersTable();
        showToast('Комментарий сохранён', 'success');
    }
}

function closeOrderCommentModal() {
    document.getElementById('order-comment-modal').classList.remove('active');
}

function renderPromoTable() {
    const tbody = document.getElementById('promo-tbody');
    const codes = StorageAPI.getPromoCodes();

    if (codes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">Промокодов нет</td></tr>';
        return;
    }

    tbody.innerHTML = codes.map(code => `
        <tr>
            <td><strong class="promo-code">${code.code}</strong></td>
            <td><span class="discount-badge">${code.discountPercent}%</span></td>
            <td>
                <span class="status-toggle ${code.active ? 'active' : 'inactive'}">
                    <i class="${code.active ? 'fas fa-check-circle' : 'fas fa-times-circle'}"></i>
                    ${code.active ? 'Активен' : 'Неактивен'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" onclick="editPromo('${code.code}')" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePromo('${code.code}')" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editPromo(codeStr) {
    const codes = StorageAPI.getPromoCodes();
    const code = codes.find(c => c.code === codeStr);
    if (!code) return;

    document.getElementById('promo-modal-title').innerHTML = '<i class="fas fa-edit"></i> Редактировать промокод';
    document.getElementById('promo-edit-code').value = code.code;
    document.getElementById('promo-code').value = code.code;
    document.getElementById('promo-discount').value = code.discountPercent;
    document.getElementById('promo-active').value = code.active ? 'true' : 'false';

    document.getElementById('promo-modal').classList.add('active');
}

function savePromo(e) {
    e.preventDefault();
    
    const editCode = document.getElementById('promo-edit-code').value;
    const codes = StorageAPI.getPromoCodes();

    const codeData = {
        code: document.getElementById('promo-code').value.toUpperCase(),
        discountPercent: parseInt(document.getElementById('promo-discount').value),
        active: document.getElementById('promo-active').value === 'true'
    };

    if (editCode) {
        const index = codes.findIndex(c => c.code === editCode);
        if (index !== -1) {
            codes[index] = codeData;
        }
    } else {
        if (codes.find(c => c.code === codeData.code)) {
            showToast('Промокод уже существует', 'error');
            return;
        }
        codes.push(codeData);
    }

    StorageAPI.setPromoCodes(codes);
    closeAllModals();
    renderPromoTable();
    showToast('Промокод сохранён', 'success');
}

function deletePromo(codeStr) {
    if (!confirm('Удалить промокод?')) return;
    
    let codes = StorageAPI.getPromoCodes();
    codes = codes.filter(c => c.code !== codeStr);
    StorageAPI.setPromoCodes(codes);
    renderPromoTable();
    showToast('Промокод удалён', 'success');
}

function closePromoModal() {
    document.getElementById('promo-modal').classList.remove('active');
}

function renderStats() {
    renderSalesChart();
    renderTopGoodsChart();
}

function renderSalesChart() {
    const orders = StorageAPI.getOrders();
    const labels = [];
    const data = [];
    
    for (let i = statsPeriod - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        labels.push(dateStr);
        
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= dayStart && orderDate <= dayEnd;
        });
        
        const dayTotal = dayOrders.reduce((sum, o) => sum + o.total, 0);
        data.push(dayTotal);
    }

    const ctx = document.getElementById('sales-chart').getContext('2d');
    if (salesChart) salesChart.destroy();
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Продажи (₽)',
                data: data,
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2E7D32',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: value => value + ' ₽'
                    }
                }
            }
        }
    });
}

function renderTopGoodsChart() {
    const orders = StorageAPI.getOrders();
    const goods = StorageAPI.getGoods();

    const goodsSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!goodsSales[item.goodId]) {
                goodsSales[item.goodId] = 0;
            }
            goodsSales[item.goodId] += item.quantity;
        });
    });

    const topGoods = Object.entries(goodsSales)
        .map(([id, count]) => {
            const good = goods.find(g => g.id === parseInt(id));
            return { name: good ? good.name : 'Товар #' + id, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    if (topGoods.length === 0) {
        topGoods.push({ name: 'Нет данных', count: 0 });
    }

    const ctx = document.getElementById('top-goods-chart').getContext('2d');
    if (topGoodsChart) topGoodsChart.destroy();
    
    topGoodsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topGoods.map(g => g.name),
            datasets: [{
                label: 'Продано шт.',
                data: topGoods.map(g => g.count),
                backgroundColor: ['#2E7D32', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

function exportData() {
    const data = {
        dlv_goods: StorageAPI.getGoods(),
        dlv_orders: StorageAPI.getOrders(),
        dlv_reviews: StorageAPI.getReviews(),
        dlv_promoCodes: StorageAPI.getPromoCodes(),
        dlv_compareList: StorageAPI.getCompareList(),
        dlv_cart: StorageAPI.getCart(),
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dlv-pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Резервная копия скачана', 'success');
}

function importData() {
    const file = document.getElementById('import-file').files[0];
    if (!file) {
        showToast('Выберите файл для импорта', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.dlv_goods || !data.dlv_orders || !data.dlv_reviews || !data.dlv_promoCodes) {
                showToast('Неверный формат файла', 'error');
                return;
            }

            if (confirm('Восстановить данные? Текущие данные будут заменены.')) {
                if (data.dlv_goods) StorageAPI.setGoods(data.dlv_goods);
                if (data.dlv_orders) StorageAPI.setOrders(data.dlv_orders);
                if (data.dlv_reviews) StorageAPI.setReviews(data.dlv_reviews);
                if (data.dlv_promoCodes) StorageAPI.setPromoCodes(data.dlv_promoCodes);
                if (data.dlv_compareList) StorageAPI.setCompareList(data.dlv_compareList);
                if (data.dlv_cart) StorageAPI.setCart(data.dlv_cart);

                loadAdminData();
                renderCartCounter();
                showToast('Данные восстановлены', 'success');
            }
        } catch (err) {
            showToast('Ошибка чтения файла', 'error');
        }
    };
    reader.readAsText(file);
}

function resetData() {
    if (!confirm('ВНИМАНИЕ! Все данные будут удалены и загружены демо-данные. Продолжить?')) return;
    
    localStorage.removeItem('dlv_goods');
    localStorage.removeItem('dlv_orders');
    localStorage.removeItem('dlv_reviews');
    localStorage.removeItem('dlv_promoCodes');
    localStorage.removeItem('dlv_compareList');
    localStorage.removeItem('dlv_cart');

    StorageAPI.init();
    loadAdminData();
    renderCartCounter();
    showToast('Данные сброшены', 'success');
}

document.addEventListener('DOMContentLoaded', initAdminPage);