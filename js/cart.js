let appliedPromo = null;

function initCartPage() {
    renderCart();
    setupEventListeners();
}

function renderCart() {
    const cartEmpty = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content');
    const cartItems = document.getElementById('cart-items');
    const itemsCount = document.getElementById('cart-items-count');

    const items = CartAPI.getCartItems();

    if (items.length === 0) {
        cartEmpty.style.display = 'flex';
        cartContent.style.display = 'none';
        return;
    }

    cartEmpty.style.display = 'none';
    cartContent.style.display = 'block';
    itemsCount.textContent = `${items.length} ${getItemsWord(items.length)}`;

    cartItems.innerHTML = items.map(item => `
        <div class="cart-item-card" data-id="${item.goodId}">
            <div class="cart-item-image-wrapper">
                <a href="product.html?id=${item.goodId}">
                    <img src="${item.good.image}" alt="${item.good.name}">
                </a>
            </div>
            <div class="cart-item-info">
                <a href="product.html?id=${item.goodId}" class="cart-item-name">${item.good.name}</a>
                <div class="cart-item-substance">${item.good.substance || ''}</div>
                ${item.good.prescription ? '<span class="badge badge-recipe"><i class="fas fa-prescription"></i> По рецепту</span>' : ''}
                ${item.good.stock < 5 ? `<span class="stock-warning"><i class="fas fa-exclamation-circle"></i> Осталось ${item.good.stock} шт.</span>` : ''}
            </div>
            <div class="cart-item-price">${formatPrice(item.good.price)}</div>
            <div class="cart-item-quantity">
                <div class="quantity-control">
                    <button class="qty-btn" onclick="updateQuantity(${item.goodId}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.goodId}, ${item.quantity + 1})" ${item.quantity >= item.good.stock ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item-sum">${formatPrice(item.good.price * item.quantity)}</div>
            <div class="cart-item-actions">
                <button class="btn-remove-item" onclick="removeFromCart(${item.goodId})" title="Удалить">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');

    updateSummary();
}

function getItemsWord(count) {
    if (count === 1) return 'товар';
    if (count >= 2 && count <= 4) return 'товара';
    return 'товаров';
}

function updateSummary() {
    const items = CartAPI.getCartItems();
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = CartAPI.getCartTotal();
    
    document.getElementById('items-count').textContent = itemsCount;
    document.getElementById('subtotal').textContent = formatPrice(subtotal);

    if (appliedPromo) {
        const result = PromoAPI.calculateDiscount(subtotal, appliedPromo.code);
        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('discount-amount').textContent = '-' + formatPrice(result.discount);
        document.getElementById('cart-total').textContent = formatPrice(result.total);
    } else {
        document.getElementById('discount-row').style.display = 'none';
        document.getElementById('cart-total').textContent = formatPrice(subtotal);
    }
}

function updateQuantity(goodId, quantity) {
    if (quantity <= 0) {
        removeFromCart(goodId);
        return;
    }

    const result = CartAPI.updateQuantity(goodId, quantity);
    if (!result.success) {
        showToast(result.message, 'error');
    }
    renderCart();
    renderCartCounter();
}

function removeFromCart(goodId) {
    CartAPI.remove(goodId);
    renderCart();
    renderCartCounter();
    showToast('Товар удалён из корзины', 'success');
}

function clearCart() {
    document.getElementById('confirm-clear-modal').classList.add('active');
}

function closeClearModal() {
    document.getElementById('confirm-clear-modal').classList.remove('active');
}

function confirmClearCart() {
    CartAPI.clear();
    renderCart();
    renderCartCounter();
    closeClearModal();
    showToast('Корзина очищена', 'success');
}

function setupEventListeners() {
    const applyBtn = document.getElementById('apply-promo');
    const removeBtn = document.getElementById('remove-promo');
    const clearBtn = document.getElementById('clear-cart-btn');
    const orderForm = document.getElementById('order-form');
    const phoneInput = document.getElementById('customer-phone');
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');

    if (applyBtn) {
        applyBtn.addEventListener('click', applyPromoCode);
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', removePromoCode);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }

    if (orderForm) {
        orderForm.addEventListener('submit', placeOrder);
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhone);
    }

    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const addressGroup = document.getElementById('address-group');
            const options = document.querySelectorAll('.delivery-option');
            
            options.forEach(opt => opt.classList.remove('active'));
            radio.closest('.delivery-option').classList.add('active');
            
            if (radio.value === 'pickup') {
                addressGroup.style.display = 'none';
                document.getElementById('customer-address').removeAttribute('required');
            } else {
                addressGroup.style.display = 'block';
                document.getElementById('customer-address').setAttribute('required', 'required');
            }
        });
    });
}

function applyPromoCode() {
    const input = document.getElementById('promo-input');
    const promoApplied = document.getElementById('promo-applied');
    const promoText = document.getElementById('promo-text');

    if (!input.value.trim()) {
        showToast('Введите промокод', 'warning');
        return;
    }

    const promo = PromoAPI.validate(input.value.trim().toUpperCase());
    if (!promo) {
        showToast('Промокод не найден или неактивен', 'error');
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 1000);
        return;
    }

    appliedPromo = promo;
    promoApplied.style.display = 'flex';
    promoText.textContent = `${promo.code} (-${promo.discountPercent}%)`;
    input.value = '';
    updateSummary();
    showToast(`Промокод ${promo.code} применён! Скидка ${promo.discountPercent}%`, 'success');
}

function removePromoCode() {
    appliedPromo = null;
    document.getElementById('promo-applied').style.display = 'none';
    updateSummary();
    showToast('Промокод убран', 'success');
}

function formatPhone(e) {
    let target = e.target || e;
    let value = target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 0) {
        if (value[0] === '7' || value[0] === '8') {
            value = value.slice(1);
        }
        
        let formatted = '+7';
        if (value.length > 0) {
            formatted += ' (' + value.slice(0, 3);
        }
        if (value.length > 3) {
            formatted += ') ' + value.slice(3, 6);
        }
        if (value.length > 6) {
            formatted += '-' + value.slice(6, 8);
        }
        if (value.length > 8) {
            formatted += '-' + value.slice(8, 10);
        }
        
        target.value = formatted;
    }
}

function placeOrder(e) {
    e.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const comment = document.getElementById('customer-comment').value.trim();
    const delivery = document.querySelector('input[name="delivery"]:checked').value;

    if (!name) {
        showToast('Введите ФИО', 'error');
        document.getElementById('customer-name').focus();
        return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        showToast('Введите корректный номер телефона', 'error');
        document.getElementById('customer-phone').focus();
        return;
    }

    if (delivery === 'delivery' && !address) {
        showToast('Введите адрес доставки', 'error');
        document.getElementById('customer-address').focus();
        return;
    }

    const items = CartAPI.getCartItems();
    const subtotal = CartAPI.getCartTotal();
    let finalTotal = subtotal;
    let discount = 0;

    if (appliedPromo) {
        const result = PromoAPI.calculateDiscount(subtotal, appliedPromo.code);
        discount = result.discount;
        finalTotal = result.total;
    }

    const orderId = generateOrderId();
    
    const order = {
        id: orderId,
        customer: { name, phone, address, delivery, comment },
        items: items.map(item => ({
            goodId: item.goodId,
            name: item.good.name,
            quantity: item.quantity,
            price: item.good.price
        })),
        subtotal: subtotal,
        discount: discount,
        promoCode: appliedPromo ? appliedPromo.code : null,
        total: finalTotal,
        status: 'new',
        managerComment: '',
        createdAt: new Date().toISOString()
    };

    const orders = StorageAPI.getOrders();
    orders.push(order);
    StorageAPI.setOrders(orders);

    CartAPI.clear();
    appliedPromo = null;
    renderCartCounter();

    showOrderSuccessModal(orderId, order.total);
}

function showOrderSuccessModal(orderId, total) {
    const modal = document.getElementById('order-success-modal');
    document.getElementById('success-order-id').textContent = orderId;
    document.getElementById('success-order-total').textContent = formatPrice(total);
    modal.classList.add('active');
}

function closeSuccessModal() {
    document.getElementById('order-success-modal').classList.remove('active');
    window.location.href = 'orders.html';
}

document.addEventListener('DOMContentLoaded', initCartPage);