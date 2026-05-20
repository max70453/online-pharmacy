function initComparePage() {
    renderCompare();
    setupClearButton();
}

function renderCompare() {
    const compareEmpty = document.getElementById('compare-empty');
    const compareContent = document.getElementById('compare-content');
    const tbody = document.getElementById('compare-tbody');

    const compareList = CompareAPI.getList();
    const goods = StorageAPI.getGoods();
    const compareGoods = goods.filter(g => compareList.includes(g.id));

    if (compareGoods.length === 0) {
        compareEmpty.style.display = 'block';
        compareContent.style.display = 'none';
        return;
    }

    compareEmpty.style.display = 'none';
    compareContent.style.display = 'block';

    tbody.innerHTML = `
        <tr class="compare-row-header">
            <th>Товар</th>
            ${compareGoods.map(g => `
                <td class="compare-product">
                    <img src="${g.image}" alt="${g.name}">
                    <div class="compare-name">${g.name}</div>
                    <button class="btn compare-delete-btn btn-sm" onclick="removeFromCompare(${g.id})">
                        <i class="fas fa-times"></i> Убрать
                    </button>
                </td>
            `).join('')}
        </tr>
        <tr>
            <th><i class="fas fa-tag"></i> Цена</th>
            ${compareGoods.map(g => `<td class="compare-price">${formatPrice(g.price)}</td>`).join('')}
        </tr>
        <tr>
            <th><i class="fas fa-star"></i> Рейтинг</th>
            ${compareGoods.map(g => {
                const rating = g.ratingAvg || 0;
                const fullStars = Math.floor(rating);
                const emptyStars = 5 - fullStars;
                return `<td>
                    <span class="compare-rating">
                        ${'<i class="fas fa-star" style="color:#FFC107;"></i>'.repeat(fullStars)}
                        ${'<i class="far fa-star" style="color:#E0E0E0;"></i>'.repeat(emptyStars)}
                        <span class="rating-text">${rating.toFixed(1)}</span>
                    </span>
                </td>`;
            }).join('')}
        </tr>
        <tr>
            <th><i class="fas fa-box"></i> Наличие</th>
            ${compareGoods.map(g => `
                <td class="${g.stock < 5 ? 'low-stock' : 'in-stock'}">
                    ${g.stock < 5 ? `<i class="fas fa-exclamation-triangle"></i> Мало (${g.stock})` : `<i class="fas fa-check-circle"></i> В наличии (${g.stock})`}
                </td>
            `).join('')}
        </tr>
        <tr>
            <th><i class="fas fa-list"></i> Категория</th>
            ${compareGoods.map(g => `<td>${g.category || '-'}</td>`).join('')}
        </tr>
        <tr>
            <th><i class="fas fa-flask"></i> Действующее вещество</th>
            ${compareGoods.map(g => `<td>${g.substance || '-'}</td>`).join('')}
        </tr>
        <tr>
            <th><i class="fas fa-prescription"></i> По рецепту</th>
            ${compareGoods.map(g => `<td>${g.prescription ? '<span class="badge badge-recipe"><i class="fas fa-file-medical"></i> Да</span>' : '<span class="badge badge-no-recipe"><i class="fas fa-ban"></i> Нет</span>'}</td>`).join('')}
        </tr>
        <tr>
            <th><i class="fas fa-align-left"></i> Описание</th>
            ${compareGoods.map(g => `<td class="compare-description"><i class="fas fa-info-circle" style="color:var(--text-secondary);margin-right:0.3rem;"></i>${g.description ? (g.description.length > 80 ? g.description.slice(0, 80) + '...' : g.description) : '-'}</td>`).join('')}
        </tr>
        <tr class="compare-row-actions">
            <th><i class="fas fa-cogs"></i> Действия</th>
            ${compareGoods.map(g => `
                <td>
                    <div class="compare-actions">
                        <a href="product.html?id=${g.id}" class="btn btn-outline btn-sm">
                            <i class="fas fa-eye"></i> Подробнее
                        </a>
                        <button class="btn btn-primary btn-sm" onclick="addToCartFromCompare(${g.id})">
                            <i class="fas fa-cart-plus"></i> В корзину
                        </button>
                    </div>
                </td>
            `).join('')}
        </tr>
    `;
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.round(rating)) {
            stars += '<i class="fas fa-star" style="color: #FFC107;"></i>';
        } else {
            stars += '<i class="far fa-star" style="color: #E0E0E0;"></i>';
        }
    }
    return stars;
}

function removeFromCompare(goodId) {
    CompareAPI.remove(goodId);
    renderCompare();
    showToast('Товар удалён из сравнения', 'success');
}

function setupClearButton() {
    const clearBtn = document.getElementById('clear-compare-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (!confirm('Очистить список сравнения?')) return;
            CompareAPI.clear();
            renderCompare();
            showToast('Список сравнения очищен', 'success');
        });
    }
}

function addToCartFromCompare(goodId) {
    const goods = StorageAPI.getGoods();
    const good = goods.find(g => g.id === goodId);
    
    if (good.prescription) {
        showToast('Этот товар отпускается по рецепту', 'warning');
        return;
    }

    const result = CartAPI.add(goodId, 1);
    if (result.success) {
        renderCartCounter();
        showToast('Товар добавлен в корзину', 'success');
    } else {
        showToast(result.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initComparePage);