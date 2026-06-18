const productGrid = document.querySelector('.product-grid');
const basketList = document.querySelector('.basket-list');
const basketCount = document.querySelector('.basket-count');
const basketClear = document.querySelector('.basket-clear');
const basketEmpty = document.querySelector('.basket-empty');
const basketFooter = document.querySelector('.basket-footer');
const basketTotalPrice = document.querySelector('.basket-total-price');
const products = window.products || [];

const formatPeso = (value) => `\u20B1${Number(value).toFixed(2)}`;
const titleCase = (value) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

if (productGrid) {
  for (let i = 0; i < products.length; i += 1) {
    const item = products[i];
    const product = document.createElement('button');
    product.className = 'product';
    product.type = 'button';
    product.setAttribute('aria-label', item.name);

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = item.image;
    image.alt = '';
    product.append(image);

    product.addEventListener('click', () => {
      product.classList.add('falling');
    });

    productGrid.append(product);
  }
}

let basketSelections = [
  { name: 'Piattos', quantity: 1 },
  { name: 'Coke', quantity: 1 },
  { name: 'Dove soap', quantity: 1 }
];

const renderBasket = () => {
  if (!basketList) {
    return;
  }

  basketList.innerHTML = '';

  for (let i = 0; i < basketSelections.length; i += 1) {
    const selection = basketSelections[i];
    const item = products.find((product) => product.name === selection.name);

    if (!item) {
      continue;
    }

    const card = document.createElement('article');
    card.className = 'basket-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'basket-image-wrap';

    const image = document.createElement('img');
    image.className = 'basket-image';
    image.src = item.image;
    image.alt = item.name;
    imageWrap.append(image);

    const details = document.createElement('div');
    details.className = 'basket-details';

    const name = document.createElement('h3');
    name.textContent = titleCase(item.name);

    const price = document.createElement('strong');
    price.className = 'basket-price';
    price.textContent = formatPeso(item.price);

    details.append(name, price);

    const actions = document.createElement('div');
    actions.className = 'basket-actions';

    const quantity = document.createElement('div');
    quantity.className = 'basket-quantity';
    quantity.setAttribute('aria-label', `${selection.quantity} in basket`);

    const minus = document.createElement('button');
    minus.className = 'quantity-button';
    minus.type = 'button';
    minus.dataset.action = 'decrease';
    minus.dataset.index = i;
    minus.setAttribute('aria-label', `Decrease ${item.name}`);
    minus.textContent = '-';

    const count = document.createElement('strong');
    count.textContent = selection.quantity;

    const plus = document.createElement('button');
    plus.className = 'quantity-button';
    plus.type = 'button';
    plus.dataset.action = 'increase';
    plus.dataset.index = i;
    plus.setAttribute('aria-label', `Increase ${item.name}`);
    plus.textContent = '+';

    quantity.append(minus, count, plus);

    const remove = document.createElement('button');
    remove.className = 'basket-remove';
    remove.type = 'button';
    remove.dataset.action = 'remove';
    remove.dataset.index = i;
    remove.setAttribute('aria-label', `Remove ${item.name}`);
    remove.innerHTML = '<span class="trash-icon" aria-hidden="true"></span>';

    actions.append(quantity, remove);
    card.append(imageWrap, details, actions);
    basketList.append(card);
  }

  const itemCount = basketSelections.reduce((total, selection) => total + selection.quantity, 0);
  const totalPrice = basketSelections.reduce((total, selection) => {
    const item = products.find((product) => product.name === selection.name);
    return total + (item ? item.price * selection.quantity : 0);
  }, 0);

  if (basketCount) {
    basketCount.textContent = itemCount;
  }

  if (basketTotalPrice) {
    basketTotalPrice.textContent = formatPeso(totalPrice);
  }

  if (basketEmpty) {
    basketEmpty.hidden = basketSelections.length > 0;
  }

  if (basketFooter) {
    basketFooter.hidden = basketSelections.length === 0;
  }
};

if (basketList) {
  basketList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const index = Number(button.dataset.index);
    const action = button.dataset.action;
    const selection = basketSelections[index];

    if (!selection) {
      return;
    }

    if (action === 'increase') {
      selection.quantity += 1;
    }

    if (action === 'decrease') {
      selection.quantity -= 1;

      if (selection.quantity <= 0) {
        basketSelections.splice(index, 1);
      }
    }

    if (action === 'remove') {
      basketSelections.splice(index, 1);
    }

    renderBasket();
  });

  renderBasket();
}

if (basketClear) {
  basketClear.addEventListener('click', () => {
    basketSelections = [];
    renderBasket();
  });
}

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'receipt-height') {
    return;
  }

  const receiptFrame = document.querySelector('.receipt-frame');
  receiptFrame.style.height = `${event.data.height}px`;
});
