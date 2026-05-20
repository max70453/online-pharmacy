function initSettingsPage() {
    renderStorageInfo();
    setupButtons();
}

function renderStorageInfo() {
    const container = document.getElementById('storage-info');
    
    const goods = StorageAPI.getGoods();
    const orders = StorageAPI.getOrders();
    const reviews = StorageAPI.getReviews();
    const promoCodes = StorageAPI.getPromoCodes();
    const cart = StorageAPI.getCart();
    const compareList = StorageAPI.getCompareList();

    container.innerHTML = `
        <table style="width: 100%;">
            <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);"><strong>Товары:</strong></td>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${goods.length} шт.</td>
            </tr>
            <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);"><strong>Заказы:</strong></td>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${orders.length} шт.</td>
            </tr>
            <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);"><strong>Отзывы:</strong></td>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${reviews.length} шт.</td>
            </tr>
            <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);"><strong>Промокоды:</strong></td>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${promoCodes.length} шт.</td>
            </tr>
            <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);"><strong>Корзина:</strong></td>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${cart.reduce((sum, item) => sum + item.quantity, 0)} шт.</td>
            </tr>
            <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);"><strong>Список сравнения:</strong></td>
                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${compareList.length} шт.</td>
            </tr>
        </table>
    `;
}

function setupButtons() {
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const resetBtn = document.getElementById('reset-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const file = importFile.files[0];
            if (!file) {
                showToast('Выберите файл', 'warning');
                return;
            }
            importData(file);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (!confirm('Вы уверены? Все данные будут удалены и восстановлены демо-данные!')) return;
            resetData();
        });
    }
}

function exportData() {
    const data = {
        dlv_goods: StorageAPI.getGoods(),
        dlv_orders: StorageAPI.getOrders(),
        dlv_reviews: StorageAPI.getReviews(),
        dlv_promoCodes: StorageAPI.getPromoCodes(),
        dlv_compareList: StorageAPI.getCompareList(),
        dlv_cart: StorageAPI.getCart(),
        exportedAt: new Date().toISOString()
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

function importData(file) {
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

                renderStorageInfo();
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
    localStorage.removeItem('dlv_goods');
    localStorage.removeItem('dlv_orders');
    localStorage.removeItem('dlv_reviews');
    localStorage.removeItem('dlv_promoCodes');
    localStorage.removeItem('dlv_compareList');
    localStorage.removeItem('dlv_cart');

    StorageAPI.init();
    renderStorageInfo();
    renderCartCounter();
    showToast('Данные сброшены', 'success');
}

document.addEventListener('DOMContentLoaded', initSettingsPage);