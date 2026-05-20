let currentRating = 5;
let productId = null;
let currentQuantity = 1;

function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    productId = parseInt(urlParams.get('id'));

    if (!productId) {
        document.getElementById('product-not-found').style.display = 'block';
        document.getElementById('product-content').style.display = 'none';
        return;
    }

    renderProduct();
    setupTabs();
    setupReviewForm();
    setupQuantityControls();
}

function renderProduct() {
    const goods = StorageAPI.getGoods();
    const good = goods.find(g => g.id === productId);

    if (!good) {
        document.getElementById('product-not-found').style.display = 'block';
        document.getElementById('product-content').style.display = 'none';
        return;
    }

    document.getElementById('product-not-found').style.display = 'none';
    document.getElementById('product-content').style.display = 'block';

    // Breadcrumb
    document.getElementById('breadcrumb-category').textContent = good.category;
    document.getElementById('breadcrumb-category').href = `index.html?category=${encodeURIComponent(good.category)}`;
    document.getElementById('breadcrumb-name').textContent = good.name;
    document.title = `Аптека ДЛВ - ${good.name}`;

    // Image
    document.getElementById('product-image').src = good.image;
    document.getElementById('product-image').alt = good.name;

    // Badges
    let badgesHtml = '';
    if (good.prescription) {
        badgesHtml += '<span class="badge badge-recipe"><i class="fas fa-prescription"></i> По рецепту</span>';
    } else {
        badgesHtml += '<span class="badge badge-no-recipe"><i class="fas fa-check"></i> Без рецепта</span>';
    }
    document.getElementById('product-badges').innerHTML = badgesHtml;

    // Name and substance
    document.getElementById('product-name').textContent = good.name;
    document.getElementById('product-substance').textContent = `Действующее вещество: ${good.substance || 'не указано'}`;

    // Rating
    const reviews = StorageAPI.getReviews().filter(r => r.goodId === good.id);
    const avgRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';
    
    document.getElementById('product-rating').innerHTML = renderStars(parseFloat(avgRating));
    document.getElementById('reviews-count-text').textContent = `${avgRating} из 5 (${reviews.length} ${getReviewWord(reviews.length)})`;

    // Price
    document.getElementById('product-price').textContent = formatPrice(good.price);

    // Stock
    const stockBox = document.getElementById('stock-box');
    const lowStockWarning = document.getElementById('low-stock-warning');
    const stockText = good.stock === 0 ? 'Нет в наличии' : 
                      good.stock < 5 ? `Мало на складе (${good.stock} шт.)` : 
                      `В наличии (${good.stock} шт.)`;
    
    stockBox.className = 'product-stock-box ' + (good.stock < 5 ? 'low' : '');
    stockBox.innerHTML = `<i class="fas fa-box"></i><span>${stockText}</span>`;
    
    if (good.stock < 5 && good.stock > 0) {
        lowStockWarning.style.display = 'flex';
    } else {
        lowStockWarning.style.display = 'none';
    }

    // Description
    document.getElementById('product-description').textContent = good.description || 'Описание отсутствует.';

    // Composition
    const manufacturer = good.manufacturer ? `<p><strong>Производитель:</strong> ${good.manufacturer}</p>` : '';
    const form = good.form ? `<p><strong>Форма выпуска:</strong> ${good.form}</p>` : '';
    
    document.getElementById('product-composition').innerHTML = `
        ${manufacturer}
        <p><strong>Действующее вещество:</strong> ${good.substance || 'не указано'}</p>
        <p><strong>Категория:</strong> ${good.category}</p>
        ${form}
        ${good.composition ? `<p><strong>Состав:</strong> ${good.composition}</p>` : ''}
    `;

    // Instructions
    const expiryDate = new Date(good.createdAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);
    
    document.getElementById('product-indications').textContent = good.indications || 'Рекомендуется применять по назначению врача.';
    document.getElementById('product-usage').textContent = good.usage || 'См. инструкцию на упаковке. Принимать внутрь, запивая водой.';
    document.getElementById('product-contraindications').textContent = good.contraindications || 'Индивидуальная непереносимость компонентов.';
    document.getElementById('product-expiry').textContent = `Срок годности: до ${expiryDate.toLocaleDateString('ru-RU')}`;

    // Prescription warning
    if (good.prescription) {
        document.getElementById('prescription-check').style.display = 'flex';
    } else {
        document.getElementById('prescription-check').style.display = 'none';
    }

    setupCartButton(good);
    setupCompareButton(good);
    renderReviews();
    renderRecommendations(good.id);
    updateQuantityState(good.stock);
}

function getReviewWord(count) {
    if (count === 1) return 'отзыв';
    if (count >= 2 && count <= 4) return 'отзыва';
    return 'отзывов';
}

function updateQuantityState(stock) {
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');
    const input = document.getElementById('quantity-input');
    const addBtn = document.getElementById('add-to-cart-btn');

    if (stock === 0) {
        input.max = 0;
        addBtn.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-times"></i> Нет в наличии';
    } else {
        input.max = Math.min(stock, 99);
        addBtn.disabled = false;
    }
}

function setupQuantityControls() {
    const input = document.getElementById('quantity-input');
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');

    minusBtn.addEventListener('click', () => changeQuantity(-1));
    plusBtn.addEventListener('click', () => changeQuantity(1));
    
    input.addEventListener('change', () => {
        let value = parseInt(input.value) || 1;
        value = Math.max(1, Math.min(value, parseInt(input.max)));
        input.value = value;
        currentQuantity = value;
    });
}

function changeQuantity(delta) {
    const input = document.getElementById('quantity-input');
    let value = parseInt(input.value) + delta;
    value = Math.max(1, Math.min(value, parseInt(input.max) || 99));
    input.value = value;
    currentQuantity = value;
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="rating-star ${i <= Math.round(rating) ? '' : 'empty'}">★</span>`;
    }
    return stars;
}

function setupCartButton(good) {
    const btn = document.getElementById('add-to-cart-btn');
    btn.onclick = () => {
        const hasRecipe = document.getElementById('has-recipe').checked;
        const quantity = parseInt(document.getElementById('quantity-input').value) || 1;
        
        if (good.prescription && !hasRecipe) {
            showToast('Для этого товара требуется рецепт', 'warning');
            return;
        }

        if (good.stock === 0) {
            showToast('Товара нет в наличии', 'error');
            return;
        }

        const result = CartAPI.add(good.id, quantity);
        if (result.success) {
            renderCartCounter();
            showToast(`${good.name} (×${quantity}) добавлен в корзину`, 'success');
        } else {
            showToast(result.message, 'error');
        }
    };
}

function setupCompareButton(good) {
    const btn = document.getElementById('add-to-compare-btn');
    const compareList = CompareAPI.getList();
    const isInCompare = compareList.includes(good.id);
    
    if (isInCompare) {
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-secondary');
        btn.innerHTML = '<i class="fas fa-check"></i> В сравнении';
    }
    
    btn.onclick = () => {
        if (isInCompare) {
            CompareAPI.remove(good.id);
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-outline');
            btn.innerHTML = '<i class="fas fa-balance-scale"></i> К сравнению';
            showToast('Товар удалён из сравнения', 'success');
        } else {
            const result = CompareAPI.add(good.id);
            if (result.success) {
                btn.classList.remove('btn-outline');
                btn.classList.add('btn-secondary');
                btn.innerHTML = '<i class="fas fa-check"></i> В сравнении';
                showToast('Товар добавлен к сравнению', 'success');
            } else {
                showToast(result.message, 'warning');
            }
        }
    };
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const targetId = 'tab-' + tab.dataset.tab;
            const target = document.getElementById(targetId);
            if (target) {
                target.classList.add('active');
            }
        });
    });
}

function renderReviews() {
    const reviews = StorageAPI.getReviews().filter(r => r.goodId === productId);
    const listEl = document.getElementById('reviews-list');
    const emptyEl = document.getElementById('reviews-empty');
    const summaryEl = document.getElementById('reviews-summary');

    if (reviews.length === 0) {
        listEl.innerHTML = '';
        emptyEl.style.display = 'flex';
        summaryEl.innerHTML = '';
        return;
    }

    emptyEl.style.display = 'none';

    // Summary
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    reviews.forEach(r => ratingCounts[r.rating]++);

    summaryEl.innerHTML = `
        <div class="rating-summary">
            <div class="rating-big">${avgRating}</div>
            <div class="rating-stars">${renderStars(parseFloat(avgRating))}</div>
            <div class="rating-total">${reviews.length} ${getReviewWord(reviews.length)}</div>
        </div>
        <div class="rating-bars">
            ${[5, 4, 3, 2, 1].map(rating => `
                <div class="rating-bar-row">
                    <span>${rating}</span>
                    <div class="rating-bar">
                        <div class="rating-bar-fill" style="width: ${reviews.length > 0 ? (ratingCounts[rating] / reviews.length * 100) : 0}%"></div>
                    </div>
                    <span>${ratingCounts[rating]}</span>
                </div>
            `).join('')}
        </div>
    `;

    // List
    listEl.innerHTML = reviews.map(review => {
        const date = new Date(review.createdAt);
        const formattedDate = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

        return `
            <div class="review-item-detailed">
                <div class="review-header-detailed">
                    <div class="review-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="review-meta">
                        <span class="review-author-detailed">${review.authorName}</span>
                        <span class="review-date-detailed">${formattedDate}</span>
                    </div>
                    <div class="review-rating-detailed">
                        ${renderStars(review.rating)}
                    </div>
                </div>
                <p class="review-text-detailed">${review.text}</p>
            </div>
        `;
    }).join('');
}

function setupReviewForm() {
    const starsContainer = document.getElementById('review-stars');
    const stars = starsContainer.querySelectorAll('.star');
    const ratingInput = document.getElementById('review-rating');

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            ratingInput.value = currentRating;
            updateStarsDisplay(stars);
        });

        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                const icon = s.querySelector('i');
                if (i < index + 1) {
                    icon.className = 'fas fa-star';
                    s.classList.add('active');
                } else {
                    icon.className = 'far fa-star';
                    s.classList.remove('active');
                }
            });
        });

        star.addEventListener('mouseleave', () => {
            updateStarsDisplay(stars);
        });
    });

    updateStarsDisplay(stars);

    const form = document.getElementById('review-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const authorName = document.getElementById('review-author').value.trim();
        const text = document.getElementById('review-text').value.trim();

        if (!authorName || !text) {
            showToast('Заполните все обязательные поля', 'error');
            return;
        }

        const reviews = StorageAPI.getReviews();
        const maxId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) : 0;

        const newReview = {
            id: maxId + 1,
            goodId: productId,
            rating: currentRating,
            text: text,
            authorName: authorName,
            createdAt: new Date().toISOString()
        };

        reviews.push(newReview);
        StorageAPI.setReviews(reviews);

        updateGoodRating(productId);

        form.reset();
        currentRating = 5;
        ratingInput.value = 5;
        updateStarsDisplay(stars);

        renderReviews();
        showToast('Спасибо за отзыв!', 'success');
    });
}

function updateStarsDisplay(stars) {
    stars.forEach((star, i) => {
        const icon = star.querySelector('i');
        if (i < currentRating) {
            icon.className = 'fas fa-star';
            star.classList.add('active');
        } else {
            icon.className = 'far fa-star';
            star.classList.remove('active');
        }
    });
}

function updateGoodRating(goodId) {
    const goods = StorageAPI.getGoods();
    const good = goods.find(g => g.id === goodId);
    if (!good) return;

    const reviews = StorageAPI.getReviews().filter(r => r.goodId === goodId);
    if (reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        good.ratingAvg = Math.round(avg * 10) / 10;
        StorageAPI.setGoods(goods);
    }
}

function renderRecommendations(goodId) {
    const recommendations = getProductRecommendations(goodId);
    const container = document.getElementById('recommendations');
    const emptyEl = document.getElementById('recommendations-empty');

    if (recommendations.length === 0) {
        container.innerHTML = '';
        emptyEl.style.display = 'block';
        return;
    }

    emptyEl.style.display = 'none';
    container.innerHTML = recommendations.map(good => `
        <div class="recommendation-card">
            <a href="product.html?id=${good.id}">
                <img src="${good.image}" alt="${good.name}">
            </a>
            <div class="recommendation-info">
                <a href="product.html?id=${good.id}" class="recommendation-name">${good.name}</a>
                <p class="recommendation-substance">${good.substance || ''}</p>
                <div class="recommendation-rating">${renderStars(good.ratingAvg || 0)}</div>
                <p class="recommendation-price">${formatPrice(good.price)}</p>
                <button class="btn btn-primary btn-sm" style="width: 24%;" onclick="addRecToCart(${good.id}, event)">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addRecToCart(goodId, event) {
    event.preventDefault();
    event.stopPropagation();
    
    const result = CartAPI.add(goodId, 1);
    if (result.success) {
        renderCartCounter();
        showToast('Товар добавлен в корзину', 'success');
    } else {
        showToast(result.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initProductPage);