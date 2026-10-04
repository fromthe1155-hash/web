const products = [{
    id: 'cloud',
    name: 'Облако',
    description: 'Мягкий флис · молочный',
    price: 3490,
    category: 'warm',
    badge: 'Бестселлер',
    image: '/manus-storage/async-images/M6huJyEItY22ybDSxa1rpu/image-2.webp'
}, {
    id: 'terracotta',
    name: 'Терракота',
    description: 'Махра · открытый нос',
    price: 2890,
    category: 'light',
    badge: 'Новинка',
    image: '/manus-storage/async-images/M6huJyEItY22ybDSxa1rpu/image-3.webp'
}, {
    id: 'wool',
    name: 'Тихий вечер',
    description: 'Шерсть · пробковая подошва',
    price: 4190,
    category: 'warm',
    badge: '',
    image: '/manus-storage/async-images/M6huJyEItY22ybDSxa1rpu/image-4.webp'
}, {
    id: 'linen',
    name: 'Лён и солнце',
    description: 'Лён · джутовая деталь',
    price: 2690,
    category: 'light',
    badge: '',
    image: '/manus-storage/async-images/M6huJyEItY22ybDSxa1rpu/image-5.webp'
}];

const state = {
    filter: 'all',
    cart: JSON.parse(localStorage.getItem('teply-shag-cart') || '{}')
};
const money = (value) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const productById = (id) => products.find( (product) => product.id === id);
const saveCart = () => localStorage.setItem('teply-shag-cart', JSON.stringify(state.cart));

function renderProducts() {
    const grid = document.querySelector('#product-grid');
    const visible = state.filter === 'all' ? products : products.filter( (product) => product.category === state.filter);
    grid.innerHTML = visible.map( (product, index) => `
    <article class="product-card" style="animation-delay:${index * 70}ms">
      <div class="product-photo"><img src="${product.image}" alt="${product.name} — тапочки" loading="lazy" />${product.badge ? `<span class="product-badge ${product.badge === 'Новинка' ? 'new' : ''}">${product.badge}</span>` : ''}</div>
      <div class="product-info"><div class="product-top"><strong class="product-name">${product.name}</strong><span class="product-price">${money(product.price)}</span></div><p class="product-description">${product.description}</p><button class="add-button" data-add="${product.id}" type="button">Добавить в корзину <span>+</span></button></div>
    </article>`).join('');
    grid.querySelectorAll('[data-add]').forEach( (button) => button.addEventListener('click', () => addToCart(button.dataset.add)));
}

function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveCart();
    renderCart();
    showToast();
}
function updateQuantity(id, delta) {
    state.cart[id] = (state.cart[id] || 0) + delta;
    if (state.cart[id] <= 0)
        delete state.cart[id];
    saveCart();
    renderCart();
}
function removeFromCart(id) {
    delete state.cart[id];
    saveCart();
    renderCart();
}
function getCartItems() {
    return Object.entries(state.cart).map( ([id,quantity]) => ({
        product: productById(id),
        quantity
    })).filter( (item) => item.product);
}

function renderCart() {
    const items = getCartItems();
    const count = items.reduce( (total, item) => total + item.quantity, 0);
    const subtotal = items.reduce( (total, item) => total + item.product.price * item.quantity, 0);
    document.querySelector('#cart-count').textContent = count;
    document.querySelector('#drawer-count').textContent = `(${count})`;
    document.querySelector('#cart-empty').style.display = items.length ? 'none' : 'flex';
    document.querySelector('#cart-summary').hidden = !items.length;
    document.querySelector('#cart-items').innerHTML = items.map( ({product, quantity}) => `
    <div class="cart-row"><img class="cart-row-image" src="${product.image}" alt="${product.name}" /><div class="cart-row-info"><strong>${product.name}</strong><small>${product.description}</small><div class="quantity"><button type="button" data-minus="${product.id}" aria-label="Уменьшить количество">−</button><span>${quantity}</span><button type="button" data-plus="${product.id}" aria-label="Увеличить количество">+</button></div></div><div class="cart-row-price"><span>${money(product.price * quantity)}</span><button class="remove-item" type="button" data-remove="${product.id}">Удалить</button></div></div>`).join('');
    document.querySelector('#cart-subtotal').textContent = money(subtotal);
    document.querySelector('#cart-total').textContent = money(subtotal);
    document.querySelectorAll('[data-minus]').forEach( (button) => button.addEventListener('click', () => updateQuantity(button.dataset.minus, -1)));
    document.querySelectorAll('[data-plus]').forEach( (button) => button.addEventListener('click', () => updateQuantity(button.dataset.plus, 1)));
    document.querySelectorAll('[data-remove]').forEach( (button) => button.addEventListener('click', () => removeFromCart(button.dataset.remove)));
}

function toggleCart(open) {
    const drawer = document.querySelector('#cart-drawer');
    const overlay = document.querySelector('#cart-overlay');
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (open) {
        overlay.hidden = false;
        requestAnimationFrame( () => overlay.classList.add('visible'));
    } else {
        overlay.classList.remove('visible');
        setTimeout( () => {
            overlay.hidden = true;
        }
        , 300);
    }
}
let toastTimer;
function showToast() {
    const toast = document.querySelector('#toast');
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout( () => toast.classList.remove('show'), 1900);
}

document.querySelectorAll('.category-tab').forEach( (tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.category-tab').forEach( (item) => item.classList.remove('active'));
    tab.classList.add('active');
    state.filter = tab.dataset.filter;
    renderProducts();
}
));
document.querySelector('#open-cart').addEventListener('click', () => toggleCart(true));
document.querySelector('#close-cart').addEventListener('click', () => toggleCart(false));
document.querySelector('#cart-overlay').addEventListener('click', () => toggleCart(false));
document.querySelector('#empty-link').addEventListener('click', () => toggleCart(false));
document.querySelector('#checkout-button').addEventListener('click', () => {
    showToast();
    document.querySelector('#toast').textContent = 'Заявка готова — оплата пока не подключена';
}
);
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape')
        toggleCart(false);
}
);

renderProducts();
renderCart();
