const StorageAPI = {
    getGoods: () => JSON.parse(localStorage.getItem('dlv_goods')) || [],
    setGoods: (goods) => localStorage.setItem('dlv_goods', JSON.stringify(goods)),
    
    getOrders: () => JSON.parse(localStorage.getItem('dlv_orders')) || [],
    setOrders: (orders) => localStorage.setItem('dlv_orders', JSON.stringify(orders)),
    
    getReviews: () => JSON.parse(localStorage.getItem('dlv_reviews')) || [],
    setReviews: (reviews) => localStorage.setItem('dlv_reviews', JSON.stringify(reviews)),
    
    getPromoCodes: () => JSON.parse(localStorage.getItem('dlv_promoCodes')) || [],
    setPromoCodes: (codes) => localStorage.setItem('dlv_promoCodes', JSON.stringify(codes)),
    
    getCompareList: () => JSON.parse(localStorage.getItem('dlv_compareList')) || [],
    setCompareList: (list) => localStorage.setItem('dlv_compareList', JSON.stringify(list)),
    
    getCart: () => JSON.parse(localStorage.getItem('dlv_cart')) || [],
    setCart: (cart) => localStorage.setItem('dlv_cart', JSON.stringify(cart)),
    
    init: function() {
        const storedGoods = localStorage.getItem('dlv_goods');
        let needsUpdate = false;
        
        if (storedGoods) {
            const goods = JSON.parse(storedGoods);
            if (goods.length > 0 && !goods[0].manufacturer) {
                needsUpdate = true;
            }
        }
        
        if (!storedGoods || needsUpdate) {
            const demoGoods = [
                { id: 1, name: "Нурофен", substance: "Ибупрофен", category: "Обезболивающие", price: 350, stock: 50, description: "Обезболивающее и противовоспалительное средство. Применяется при головной боли, зубной боли, менструальной боли, мышечной боли, повышенной температуре.", image: "assets/images/нурофен.png", ratingAvg: 4.5, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Рекитт Бенкизер", form: "Таблетки 200 мг", composition: "Ибупрофен 200 мг. Вспомогательные вещества: кроскармеллоза натрия, целлюлоза микрокристаллическая, кремния диоксид коллоидный.", indications: "Головная боль, мигрень, зубная боль, менструальная боль, невралгия, боль в спине, мышечная боль, ревматическая боль, лихорадка при ОРВИ и гриппе.", usage: "Взрослым и детям старше 12 лет по 1-2 таблетки каждые 4-6 часов. Максимальная суточная доза - 6 таблеток.", contraindications: "Гиперчувствительность к компонентам, язвенная болезнь желудка, бронхиальная астма, тяжёлые заболевания печени и почек." },
                { id: 2, name: "Парацетамол", substance: "Парацетамол", category: "Обезболивающие", price: 120, stock: 100, description: "Жаропонижающее и обезболивающее средство. Эффективен при простудных заболеваниях, гриппе, головной боли.", image: "assets/images/парацетамол.png", ratingAvg: 4.2, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Фармстандарт", form: "Таблетки 500 мг", composition: "Парацетамол 500 мг. Вспомогательные вещества: крахмал картофельный, повидон, стеариновая кислота.", indications: "Лихорадка при простудных заболеваниях, головная боль, зубная боль, мигрень, невралгия, боль в мышцах и суставах.", usage: "Взрослым по 1-2 таблетки 3-4 раза в сутки. Детям 6-12 лет по 0.5-1 таблетке 3-4 раза в сутки.", contraindications: "Тяжёлые нарушения функции печени и почек, алкоголизм, гиперчувствительность." },
                { id: 3, name: "Анальгин", substance: "Метамизол натрия", category: "Обезболивающие", price: 80, stock: 3, description: "Обезболивающее средство. Применяется при болях различного происхождения: головной, зубной, мышечной.", image: "assets/images/анальгин.png", ratingAvg: 3.8, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Дальхимфарм", form: "Таблетки 500 мг", composition: "Метамизол натрия 500 мг. Вспомогательные вещества: сахароза, крахмал картофельный, кальция стеарат.", indications: "Болевой синдром различной этиологии: головная боль, зубная боль, невралгия, миалгия, артралгия.", usage: "Взрослым по 1 таблетке 2-3 раза в сутки. Максимальная доза - 3 таблетки в сутки.", contraindications: "Гиперчувствительность, тяжёлые нарушения функции печени и почек, бронхиальная астма." },
                { id: 4, name: "Амоксиклав", substance: "Амоксициллин + клавулановая кислота", category: "Антибиотики", price: 450, stock: 30, description: "Антибактериальный препарат широкого спектра действия. Применяется при инфекциях дыхательных путей, мочевыводящих путей, кожи.", image: "assets/images/амоксиклав.png", ratingAvg: 4.7, createdAt: new Date().toISOString(), prescription: true, manufacturer: "Сандоз", form: "Таблетки 875/125 мг", composition: "Амоксициллин 875 мг, клавулановая кислота 125 мг.", indications: "Инфекции дыхательных путей, мочевыводящих путей, кожи и мягких тканей, костей и суставов.", usage: "Взрослым и детям старше 12 лет по 1 таблетке каждые 12 часов во время еды.", contraindications: "Гиперчувствительность к пенициллинам, нарушения функции печени, инфекционный мононуклеоз." },
                { id: 5, name: "Цитрамон", substance: "Ацетилсалициловая кислота", category: "Обезболивающие", price: 90, stock: 80, description: "Комбинированный анальгетик. Применяется при головной боли, мигрени, зубной боли.", image: "assets/images/цитрамон.png", ratingAvg: 4.0, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Фармстандарт", form: "Таблетки", composition: "Ацетилсалициловая кислота 240 мг, парацетамол 180 мг, кофеин 30 мг.", indications: "Головная боль, мигрень, зубная боль, невралгия, артралгия, лихорадка.", usage: "Взрослым по 1-2 таблетки 2-3 раза в сутки. Максимальная доза - 6 таблеток в сутки.", contraindications: "Гиперчувствительность, язвенная болезнь, геморрагический диатез, тяжёлые заболевания печени и почек." },
                { id: 6, name: "Мезим", substance: "Панкреатин", category: "Пищеварение", price: 280, stock: 45, description: "Ферментный препарат. Улучшает пищеварение при недостаточности поджелудочной железы, метеоризме.", image: "assets/images/мезим.png", ratingAvg: 4.3, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Берлин-Хеми", form: "Таблетки 12000 ЕД", composition: "Панкреатин 12000 ЕД (липаза, амилаза, протеаза). Вспомогательные вещества.", indications: "Недостаточность внешнесекреторной функции поджелудочной железы, хронический панкреатит, метеоризм, погрешности в диете.", usage: "Взрослым по 1-2 таблетки перед едой, не разжёвывая, с небольшим количеством воды.", contraindications: "Острый панкреатит, гиперчувствительность к компонентам." },
                { id: 7, name: "Смекта", substance: "Смектит диоктаэдрический", category: "Пищеварение", price: 200, stock: 60, description: "Противодиарейный препарат. Применяется при острой и хронической диарее, изжоге, диспепсии.", image: "assets/images/смекта.png", ratingAvg: 4.6, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Ипсен Фарма", form: "Пакетики 3 г", composition: "Смектит диоктаэдрический 3 г. Вспомогательные вещества: глюкоза, ванилин, сахарин.", indications: "Острая и хроническая диарея, изжога, вздутие живота, диспепсия.", usage: "Взрослым по 1 пакетику 3 раза в сутки. Содержимое пакетика растворить в 0.5 стакана воды.", contraindications: "Непроходимость кишечника, гиперчувствительность." },
                { id: 8, name: "Витамин С", substance: "Аскорбиновая кислота", category: "Витамины", price: 150, stock: 120, description: "Витаминный препарат. Укрепляет иммунитет, повышает устойчивость к инфекциям.", image: "assets/images/витамн-с.png", ratingAvg: 4.4, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Фармстандарт", form: "Таблетки 500 мг", composition: "Аскорбиновая кислота 500 мг. Вспомогательные вещества: сахар, крахмал, стеариновая кислота.", indications: "Профилактика и лечение гиповитаминоза С, простудные заболевания, повышенные физические и умственные нагрузки.", usage: "Взрослым по 1 таблетке 1-2 раза в сутки во время еды.", contraindications: "Гиперчувствительность, мочекаменная болезнь, гемохроматоз." },
                { id: 9, name: "Валерьянка", substance: "Экстракт валерианы", category: "Успокоительные", price: 70, stock: 70, description: "Седативное средство растительного происхождения. Применяется при нервном возбуждении, бессоннице.", image: "assets/images/валерьянка.png", ratingAvg: 4.1, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Эвалар", form: "Таблетки", composition: "Экстракт валерианы 200 мг. Вспомогательные вещества.", indications: "Повышенная нервная возбудимость, бессонница, функциональные расстройства сердечно-сосудистой системы.", usage: "Взрослым по 1-2 таблетки 3 раза в сутки. Курс лечения 2-4 недели.", contraindications: "Гиперчувствительность к валериане." },
                { id: 10, name: "Корвалол", substance: "Фенобарбитал + мята перечная", category: "Успокоительные", price: 95, stock: 55, description: "Комбинированный препарат с седативным и спазмолитическим действием. Применяется при неврозах, тахикардии.", image: "assets/images/корвалол.png", ratingAvg: 3.9, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Фармстандарт", form: "Капли 25 мл", composition: "Фенобарбитал, этиловый эфир α-бромизовалериановой кислоты, масло мяты перечной.", indications: "Неврозы, раздражительность, бессонница, тахикардия, спазмы кишечника.", usage: "По 15-30 капель 2-3 раза в сутки перед едой. При тахикардии - 40-50 капель.", contraindications: "Тяжёлые нарушения функции печени и почек, гиперчувствительность." },
                { id: 11, name: "Линетол", substance: "Линолевая кислота", category: "Витамины", price: 320, stock: 25, description: "Витаминный комплекс. Улучшает обмен веществ, укрепляет сосуды.", image: "assets/images/линетол.png", ratingAvg: 4.2, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Вифитех", form: "Капсулы", composition: "Линолевая кислота, витамины группы В, Е.", indications: "Профилактика атеросклероза, гиперлипидемия, кожные заболевания.", usage: "По 1-2 капсулы 2-3 раза в сутки во время еды.", contraindications: "Гиперчувствительность, желчнокаменная болезнь." },
                { id: 12, name: "Омепразол", substance: "Омепразол", category: "Пищеварение", price: 180, stock: 2, description: "Ингибитор протонной помпы. Применяется при гастрите, язве желудка, рефлюкс-эзофагите.", image: "assets/images/омепразол.png", ratingAvg: 4.5, createdAt: new Date().toISOString(), prescription: true, manufacturer: "Астрафарм", form: "Капсулы 20 мг", composition: "Омепразол 20 мг. Вспомогательные вещества: маннитол, натрия лаурилсульфат.", indications: "Язвенная болезнь желудка и двенадцатиперстной кишки, рефлюкс-эзофагит, гастропатия.", usage: "По 1 капсуле 1-2 раза в сутки. Курс лечения 2-8 недель.", contraindications: "Гиперчувствительность, одновременный приём с кларитромицином." },
                { id: 13, name: "Аспирин", substance: "Ацетилсалициловая кислота", category: "Обезболивающие", price: 110, stock: 90, description: "Обезболивающее, жаропонижающее и противовоспалительное средство.", image: "assets/images/аспирин.png", ratingAvg: 4.3, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Байер", form: "Таблетки 500 мг", composition: "Ацетилсалициловая кислота 500 мг. Вспомогательные вещества.", indications: "Головная боль, зубная боль, мигрень, невралгия, лихорадка при ОРВИ.", usage: "Взрослым по 1-2 таблетки каждые 4-6 часов. Максимум 6 таблеток в сутки.", contraindications: "Язвенная болезнь, геморрагический диатез, бронхиальная астма." },
                { id: 14, name: "Феррум Лек", substance: "Железо (III) гидроксид полимальтозат", category: "Витамины", price: 450, stock: 35, description: "Препарат железа. Применяется при железодефицитной анемии.", image: "assets/images/феррум лек.png", ratingAvg: 4.8, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Вифор", form: "Сироп 100 мл", composition: "Железо (III) гидроксид полимальтозат 50 мг/мл. Вспомогательные вещества.", indications: "Железодефицитная анемия, скрытый дефицит железа, профилактика дефицита железа.", usage: "Взрослым по 5-10 мл 1-3 раза в сутки. Детям - по назначению врача.", contraindications: "Гемохроматоз, гемосидероз, гиперчувствительность." },
                { id: 15, name: "Но-шпа", substance: "Дротаверин", category: "Обезболивающие", price: 240, stock: 65, description: "Спазмолитическое средство. Применяется при спазмах гладкой мускулатуры ЖКТ, желчевыводящих путей.", image: "assets/images/нош-па.png", ratingAvg: 4.6, createdAt: new Date().toISOString(), prescription: false, manufacturer: "Санофи", form: "Таблетки 40 мг", composition: "Дротаверина гидрохлорид 40 мг. Вспомогательные вещества.", indications: "Спазмы гладкой мускулатуры ЖКТ, желчевыводящих путей, мочевыводящих путей, сосудов.", usage: "Взрослым по 1-2 таблетки 2-3 раза в сутки. Детям 6-12 лет - по 1 таблетке 1-2 раза.", contraindications: "Тяжёлая печёночная, почечная или сердечная недостаточность, гиперчувствительность." }
            ];
            localStorage.setItem('dlv_goods', JSON.stringify(demoGoods));
        }
        
        if (!localStorage.getItem('dlv_promoCodes')) {
            const promoCodes = [
                { code: "SAVE10", discountPercent: 10, active: true },
                { code: "HEALTH20", discountPercent: 20, active: true },
                { code: "EXPIRED", discountPercent: 15, active: false }
            ];
            localStorage.setItem('dlv_promoCodes', JSON.stringify(promoCodes));
        }
        
        if (!localStorage.getItem('dlv_orders')) {
            const demoOrders = [
                { id: "ORD-001", customer: { name: "Иван Иванов", phone: "+79001234567", address: "ул. Ленина 10", delivery: "delivery", comment: "" }, items: [{ goodId: 1, name: "Нурофен", quantity: 2, price: 350 }, { goodId: 6, name: "Мезим", quantity: 1, price: 280 }], subtotal: 980, discount: 0, promoCode: null, total: 980, status: "completed", managerComment: "Заказ выдан", createdAt: new Date(Date.now() - 7*24*60*60*1000).toISOString() },
                { id: "ORD-002", customer: { name: "Петр Петров", phone: "+79007654321", address: "ул. Пушкина 5", delivery: "pickup", comment: "" }, items: [{ goodId: 2, name: "Парацетамол", quantity: 3, price: 120 }, { goodId: 8, name: "Витамин С", quantity: 1, price: 150 }], subtotal: 510, discount: 51, promoCode: "SAVE10", total: 459, status: "processing", managerComment: "В обработке", createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
                { id: "ORD-003", customer: { name: "Анна Сидорова", phone: "+79005557777", address: "ул. Гагарина 15", delivery: "delivery", comment: "" }, items: [{ goodId: 4, name: "Амоксиклав", quantity: 1, price: 450 }], subtotal: 450, discount: 0, promoCode: null, total: 450, status: "ready", managerComment: "Готов к выдаче", createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() }
            ];
            localStorage.setItem('dlv_orders', JSON.stringify(demoOrders));
        }
        
        if (!localStorage.getItem('dlv_reviews')) {
            const demoReviews = [
                { id: 1, goodId: 1, rating: 5, text: "Отличное средство от головной боли! Помогает быстро.", authorName: "Алексей", createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
                { id: 2, goodId: 1, rating: 4, text: "Хорошее лекарство, но цена высоковата.", authorName: "Мария", createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
                { id: 3, goodId: 2, rating: 5, text: "Всегда помогает при простуде.", authorName: "Сергей", createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
                { id: 4, goodId: 6, rating: 4, text: "Отлично помогает после сытного обеда.", authorName: "Елена", createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() }
            ];
            localStorage.setItem('dlv_reviews', JSON.stringify(demoReviews));
        }
        
        if (!localStorage.getItem('dlv_compareList')) {
            localStorage.setItem('dlv_compareList', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('dlv_cart')) {
            localStorage.setItem('dlv_cart', JSON.stringify([]));
        }
    }
};

const CartAPI = {
    add: function(goodId, quantity = 1) {
        const cart = StorageAPI.getCart();
        const goods = StorageAPI.getGoods();
        const good = goods.find(g => g.id === goodId);
        
        if (!good) return { success: false, message: "Товар не найден" };
        if (good.stock < quantity) return { success: false, message: "Недостаточно товара на складе" };
        
        const existingItem = cart.find(item => item.goodId === goodId);
        if (existingItem) {
            if (good.stock < existingItem.quantity + quantity) {
                return { success: false, message: "Недостаточно товара на складе" };
            }
            existingItem.quantity += quantity;
        } else {
            cart.push({ goodId, quantity });
        }
        
        StorageAPI.setCart(cart);
        return { success: true, message: "Товар добавлен в корзину" };
    },
    
    remove: function(goodId) {
        let cart = StorageAPI.getCart();
        cart = cart.filter(item => item.goodId !== goodId);
        StorageAPI.setCart(cart);
    },
    
    updateQuantity: function(goodId, quantity) {
        const cart = StorageAPI.getCart();
        const item = cart.find(item => item.goodId === goodId);
        const goods = StorageAPI.getGoods();
        const good = goods.find(g => g.id === goodId);
        
        if (!item || !good) return { success: false, message: "Товар не найден" };
        
        if (quantity <= 0) {
            CartAPI.remove(goodId);
            return { success: true, message: "Товар удалён из корзины" };
        }
        
        if (good.stock < quantity) {
            return { success: false, message: "Недостаточно товара на складе" };
        }
        
        item.quantity = quantity;
        StorageAPI.setCart(cart);
        return { success: true, message: "Количество обновлено" };
    },
    
    getCartItems: function() {
        const cart = StorageAPI.getCart();
        const goods = StorageAPI.getGoods();
        return cart.map(item => {
            const good = goods.find(g => g.id === item.goodId);
            return { ...item, good };
        }).filter(item => item.good);
    },
    
    getCartTotal: function() {
        const items = CartAPI.getCartItems();
        return items.reduce((total, item) => total + (item.good.price * item.quantity), 0);
    },
    
    clear: function() {
        StorageAPI.setCart([]);
    }
};

const CompareAPI = {
    add: function(goodId) {
        let list = StorageAPI.getCompareList();
        if (list.length >= 4) return { success: false, message: "Максимум 4 товара для сравнения" };
        if (list.includes(goodId)) return { success: false, message: "Товар уже в списке сравнения" };
        list.push(goodId);
        StorageAPI.setCompareList(list);
        return { success: true, message: "Товар добавлен к сравнению" };
    },
    
    remove: function(goodId) {
        let list = StorageAPI.getCompareList();
        list = list.filter(id => id !== goodId);
        StorageAPI.setCompareList(list);
    },
    
    getList: function() {
        return StorageAPI.getCompareList();
    },
    
    clear: function() {
        StorageAPI.setCompareList([]);
    }
};

const PromoAPI = {
    validate: function(code) {
        const codes = StorageAPI.getPromoCodes();
        const promo = codes.find(c => c.code === code && c.active);
        return promo ? promo : null;
    },
    
    calculateDiscount: function(total, code) {
        const promo = PromoAPI.validate(code);
        if (!promo) return { discount: 0, total };
        const discount = Math.round(total * promo.discountPercent / 100);
        return { discount, total: total - discount, promo };
    }
};

function renderCartCounter() {
    const cart = StorageAPI.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterEl = document.getElementById('cart-counter');
    if (counterEl) {
        counterEl.textContent = totalItems;
        counterEl.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getProductRecommendations(goodId) {
    const orders = StorageAPI.getOrders();
    const itemPairs = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (item.goodId !== goodId) {
                const key = `${goodId}-${item.goodId}`;
                if (!itemPairs[key]) {
                    itemPairs[key] = 0;
                }
                itemPairs[key] += item.quantity;
            }
        });
    });
    
    let maxCount = 0;
    let recommendedId = null;
    
    Object.keys(itemPairs).forEach(key => {
        if (itemPairs[key] > maxCount) {
            maxCount = itemPairs[key];
            recommendedId = parseInt(key.split('-')[1]);
        }
    });
    
    if (recommendedId) {
        const goods = StorageAPI.getGoods();
        return goods.filter(g => g.id === recommendedId);
    }
    
    return [];
}

function generateOrderId() {
    return 'ORD-' + Date.now().toString(36).toUpperCase();
}

document.addEventListener('DOMContentLoaded', function() {
    StorageAPI.init();
    renderCartCounter();
});