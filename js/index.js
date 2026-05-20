const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let filteredGoods = [];
let currentCategory = '';
let priceSlider;
let maxPrice = 1000;

function initIndexPage() {
    const goods = StorageAPI.getGoods();
    if (goods.length > 0) {
        maxPrice = Math.max(...goods.map(g => g.price)) + 50;
        document.getElementById('price-max').value = maxPrice;
    }
    
    initPriceSlider();
    initHeroSlider();
    renderGoods();
    setupFilters();
    setupCategoryTabs();
    updateCompareCount();
}

let currentSlide = 0;
let slideInterval;

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.querySelector('.hero-dots');
    
    if (!slides.length || !dotsContainer) return;
    
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    });
    
    startAutoSlide();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    resetAutoSlide();
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.hero-slide');
    let newIndex = currentSlide + direction;
    
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;
    
    goToSlide(newIndex);
}

function startAutoSlide() {
    slideInterval = setInterval(() => changeSlide(1), 5000);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}

function initPriceSlider() {
    const slider = document.getElementById('price-slider');
    priceSlider = noUiSlider.create(slider, {
        start: [0, maxPrice],
        connect: true,
        range: {
            'min': 0,
            'max': maxPrice
        },
        step: 10,
        format: {
            to: value => Math.round(value),
            from: value => value
        }
    });

    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');

    priceSlider.on('update', (values, handle) => {
        const value = values[handle];
        if (handle === 0) {
            priceMinInput.value = value;
        } else {
            priceMaxInput.value = value;
        }
    });

    priceSlider.on('change', (values, handle) => {
        currentPage = 1;
        applyFilters(StorageAPI.getGoods());
    });

    priceMinInput.addEventListener('change', () => {
        const min = parseInt(priceMinInput.value) || 0;
        const max = parseInt(priceMaxInput.value) || maxPrice;
        priceSlider.set([min, max]);
    });

    priceMaxInput.addEventListener('change', () => {
        const min = parseInt(priceMinInput.value) || 0;
        const max = parseInt(priceMaxInput.value) || maxPrice;
        priceSlider.set([min, max]);
    });
}

function updateCompareCount() {
    const count = CompareAPI.getList().length;
    const countEl = document.getElementById('compare-count');
    if (countEl) {
        countEl.textContent = count;
    }
}

function renderGoods(page = 1) {
    currentPage = page;
    const goods = StorageAPI.getGoods();
    applyFilters(goods);
}

function applyFilters(goods) {
    const searchValue = document.getElementById('search-input')?.value.toLowerCase() || '';
    const categoryValue = currentCategory || '';
    const sortValue = document.getElementById('sort-select')?.value || 'name';
    const inStockOnly = document.getElementById('in-stock-only')?.checked || false;
    const noPrescriptionOnly = document.getElementById('prescription-only')?.checked || false;
    const priceMin = parseInt(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseInt(document.getElementById('price-max')?.value) || maxPrice;

    filteredGoods = goods.filter(good => {
        const matchesSearch = !searchValue || 
            good.name.toLowerCase().includes(searchValue) || 
            (good.substance && good.substance.toLowerCase().includes(searchValue));
        const matchesCategory = !categoryValue || good.category === categoryValue;
        const matchesStock = !inStockOnly || good.stock > 0;
        const matchesPrescription = !noPrescriptionOnly || !good.prescription;
        const matchesPrice = good.price >= priceMin && good.price <= priceMax;
        return matchesSearch && matchesCategory && matchesStock && matchesPrescription && matchesPrice;
    });

    switch (sortValue) {
        case 'price-asc':
            filteredGoods.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredGoods.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredGoods.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
            break;
        case 'stock':
            filteredGoods.sort((a, b) => b.stock - a.stock);
            break;
        default:
            filteredGoods.sort((a, b) => a.name.localeCompare(b.name));
    }

    const totalPages = Math.ceil(filteredGoods.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageGoods = filteredGoods.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    renderGoodsGrid(pageGoods);
    renderPagination(totalPages, currentPage);
    updateResultsCount();
}

function updateResultsCount() {
    const countEl = document.getElementById('results-count');
    if (countEl) {
        const total = filteredGoods.length;
        const word = total === 1 ? 'товар' : (total >= 2 && total <= 4) ? 'товара' : 'товаров';
        countEl.textContent = `Найдено: ${total} ${word}`;
    }
}

function renderGoodsGrid(goods) {
    const container = document.getElementById('goods-container');
    if (!container) return;

    if (goods.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; background: white; border-radius: 12px; padding: 3rem;">
                <i class="fas fa-search" style="color: var(--primary-color);"></i>
                <h3>Товары не найдены</h3>
                <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
                <button class="btn btn-outline" onclick="resetFilters()" style="margin-top: 1rem;">
                    <i class="fas fa-undo"></i> Сбросить фильтры
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = goods.map(good => {
        const stockClass = good.stock < 5 ? 'low-stock' : 'in-stock';
        const stockIcon = good.stock < 5 ? 'fa-exclamation-triangle' : 'fa-check-circle';
        const stockText = good.stock < 5 ? `Мало на складе (${good.stock})` : `В наличии (${good.stock})`;
        const prescriptionBadge = good.prescription 
            ? '<span class="badge badge-recipe"><i class="fas fa-prescription"></i> По рецепту</span>'
            : '<span class="badge badge-no-recipe"><i class="fas fa-check"></i> Без рецепта</span>';
        const reviews = StorageAPI.getReviews().filter(r => r.goodId === good.id);
        const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '0.0';
        const compareList = CompareAPI.getList();
        const isInCompare = compareList.includes(good.id);

        return `
            <div class="card product-card">
                ${isInCompare ? '<div class="compare-badge"><i class="fas fa-balance-scale"></i></div>' : ''}
                <a href="product.html?id=${good.id}">
                    <img src="${good.image}" alt="${good.name}" class="product-image">
                </a>
                <div class="product-info">
                    <a href="product.html?id=${good.id}" class="product-name">${good.name}</a>
                    <p class="product-substance">${good.substance || ''}</p>
                    ${prescriptionBadge}
                    <div class="rating">
                        ${renderStars(parseFloat(avgRating))}
                        <span class="rating-count">${avgRating} (${reviews.length})</span>
                    </div>
                    <p class="product-price">${formatPrice(good.price)}</p>
                    <p class="product-stock ${stockClass}">
                        <i class="fas ${stockIcon}"></i>
                        ${stockText}
                    </p>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="addToCart(${good.id})" ${good.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> В корзину
                        </button>
                        <button class="btn ${isInCompare ? 'btn-secondary' : 'btn-outline'} btn-sm" onclick="addToCompare(${good.id})" title="${isInCompare ? 'В сравнении' : 'Добавить к сравнению'}">
                            <i class="fas fa-balance-scale"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="rating-star ${i <= Math.round(rating) ? '' : 'empty'}">★</span>`;
    }
    return stars;
}

function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';
    
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span style="padding: 0.5rem;">...</span>';
        }
    }

    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
    </button>`;

    pagination.innerHTML = html;
}

function changePage(page) {
    renderGoods(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const inStockOnly = document.getElementById('in-stock-only');
    const prescriptionOnly = document.getElementById('prescription-only');
    const clearBtn = document.getElementById('clear-filters');

    if (searchInput) searchInput.addEventListener('input', debounce(() => { currentPage = 1; applyFilters(StorageAPI.getGoods()); }, 300));
    if (sortSelect) sortSelect.addEventListener('change', () => { currentPage = 1; applyFilters(StorageAPI.getGoods()); });
    if (inStockOnly) inStockOnly.addEventListener('change', () => { currentPage = 1; applyFilters(StorageAPI.getGoods()); });
    if (prescriptionOnly) prescriptionOnly.addEventListener('change', () => { currentPage = 1; applyFilters(StorageAPI.getGoods()); });
    if (clearBtn) clearBtn.addEventListener('click', resetFilters);
}

function setupCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            currentPage = 1;
            applyFilters(StorageAPI.getGoods());
        });
    });
}

function resetFilters() {
    currentCategory = '';
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.category-tab[data-category=""]').classList.add('active');
    
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const inStockOnly = document.getElementById('in-stock-only');
    const prescriptionOnly = document.getElementById('prescription-only');
    
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'name';
    if (inStockOnly) inStockOnly.checked = false;
    if (prescriptionOnly) prescriptionOnly.checked = false;
    
    priceSlider.set([0, maxPrice]);
    
    currentPage = 1;
    applyFilters(StorageAPI.getGoods());
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

function addToCart(goodId) {
    const goods = StorageAPI.getGoods();
    const good = goods.find(g => g.id === goodId);
    
    if (good.prescription) {
        showToast('Этот товар отпускается по рецепту', 'warning');
        return;
    }
    
    if (good.stock === 0) {
        showToast('Товара нет в наличии', 'error');
        return;
    }
    
    const result = CartAPI.add(goodId, 1);
    if (result.success) {
        renderCartCounter();
        showToast(`${good.name} добавлен в корзину`, 'success');
    } else {
        showToast(result.message, 'error');
    }
}

function addToCompare(goodId) {
    const compareList = CompareAPI.getList();
    const isInCompare = compareList.includes(goodId);
    
    if (isInCompare) {
        CompareAPI.remove(goodId);
        showToast('Товар удалён из сравнения', 'success');
    } else {
        const result = CompareAPI.add(goodId);
        if (result.success) {
            showToast('Товар добавлен к сравнению', 'success');
        } else {
            showToast(result.message, 'warning');
        }
    }
    
    updateCompareCount();
    renderGoods(currentPage);
}

document.addEventListener('DOMContentLoaded', initIndexPage);