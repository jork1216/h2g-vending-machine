const productGrid = document.querySelector('.product-grid');
const basketList = document.querySelector('.basket-list');
const basketCount = document.querySelector('.basket-count');
const basketClear = document.querySelector('.basket-clear');
const basketEmpty = document.querySelector('.basket-empty');
const basketFooter = document.querySelector('.basket-footer');
const basketTotalPrice = document.querySelector('.basket-total-price');
const checkoutButton = document.querySelector('.checkout-button');
const receiptLoading = document.querySelector('.receipt-loading');
const receiptFrame = document.querySelector('.receipt-frame');
const products = window.products || [];
const vendoSound = new Audio('audio/Vendo Sound Effect.mp3');

const RECEIPT_DELAY_MS = 3000;
const formatPeso = (value) => `\u20B1${Number(value).toFixed(2)}`;
const titleCase = (value) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

let basketSelections = [];
let receiptTimerId = null;
let shouldScrollToReceipt = false;

vendoSound.preload = 'auto';

const playVendoSound = () => {
  vendoSound.currentTime = 0;
  vendoSound.play().catch(() => {});
};

const getBasketItems = () => basketSelections
  .map((selection) => {
    const item = products.find((product) => product.name === selection.name);

    if (!item) {
      return null;
    }

    return {
      name: titleCase(item.name),
      quantity: selection.quantity,
      unitPrice: item.price,
      total: item.price * selection.quantity
    };
  })
  .filter(Boolean);

const getBasketTotal = (items = getBasketItems()) => items
  .reduce((total, item) => total + item.total, 0);

const buildReceiptData = () => {
  const items = getBasketItems();

  return {
    type: 'receipt-data',
    items,
    total: getBasketTotal(items),
    date: new Date().toLocaleDateString('en-US')
  };
};

const sendReceiptData = () => {
  if (!receiptFrame?.contentWindow) {
    return;
  }

  receiptFrame.contentWindow.postMessage(buildReceiptData(), '*');
};

const hideReceipt = () => {
  shouldScrollToReceipt = false;

  if (receiptFrame) {
    receiptFrame.hidden = true;
  }
};

const scrollToReceipt = () => {
  if (!receiptFrame || receiptFrame.hidden) {
    return;
  }

  receiptFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const hideReceiptLoading = () => {
  if (receiptTimerId) {
    clearTimeout(receiptTimerId);
    receiptTimerId = null;
  }

  if (receiptLoading) {
    receiptLoading.hidden = true;
  }

  if (checkoutButton) {
    checkoutButton.disabled = false;
  }
};

const finishReceiptGeneration = () => {
  if (!receiptFrame || basketSelections.length === 0) {
    hideReceiptLoading();
    return;
  }

  receiptTimerId = null;
  shouldScrollToReceipt = true;

  if (receiptLoading) {
    receiptLoading.hidden = true;
  }

  receiptFrame.hidden = false;
  sendReceiptData();

  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToReceipt);
  });

  setTimeout(() => {
    if (shouldScrollToReceipt) {
      shouldScrollToReceipt = false;
      scrollToReceipt();
    }
  }, 100);

  if (checkoutButton) {
    checkoutButton.disabled = false;
  }
};

const showReceipt = () => {
  if (!receiptFrame || basketSelections.length === 0) {
    return;
  }

  hideReceipt();

  if (receiptLoading) {
    receiptLoading.hidden = false;

    requestAnimationFrame(() => {
      receiptLoading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  if (checkoutButton) {
    checkoutButton.disabled = true;
  }

  if (receiptTimerId) {
    clearTimeout(receiptTimerId);
  }

  receiptTimerId = setTimeout(finishReceiptGeneration, RECEIPT_DELAY_MS);
};

const addToOrderList = (item) => {
  const selection = basketSelections.find((basketItem) => basketItem.name === item.name);

  if (selection) {
    selection.quantity += 1;
  } else {
    basketSelections.push({ name: item.name, quantity: 1 });
  }

  renderBasket();
};

if (productGrid) {
  for (let i = 0; i < products.length; i += 1) {
    const item = products[i];
    const product = document.createElement('button');
    product.className = 'product';
    product.type = 'button';
    product.setAttribute('aria-label', item.name);

    const image = document.createElement('img');
    image.className = 'product-image';
    image.alt = '';
    image.src = item.image;
    product.append(image);

    product.addEventListener('click', () => {
      playVendoSound();
      addToOrderList(item);
      product.classList.add('falling');
      product.disabled = true;

      product.addEventListener('animationend', () => {
        product.classList.remove('falling');
        product.disabled = false;
      }, { once: true });
    });

    productGrid.append(product);
  }
}

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
    image.alt = item.name;
    image.src = item.image;
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
    quantity.setAttribute('aria-label', `${selection.quantity} in order list`);

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

  const receiptItems = getBasketItems();
  const itemCount = receiptItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = getBasketTotal(receiptItems);

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
    basketFooter.hidden = receiptItems.length === 0;
  }

  if (receiptFrame && !receiptFrame.hidden) {
    if (receiptItems.length === 0) {
      hideReceipt();
    } else {
      sendReceiptData();
    }
  }

  if (receiptItems.length === 0) {
    hideReceiptLoading();
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

if (checkoutButton) {
  checkoutButton.addEventListener('click', showReceipt);
}

if (receiptFrame) {
  receiptFrame.addEventListener('load', () => {
    if (!receiptFrame.hidden) {
      sendReceiptData();
    }
  });
}

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'receipt-height') {
    return;
  }

  if (receiptFrame) {
    receiptFrame.style.height = `${event.data.height}px`;

    if (shouldScrollToReceipt) {
      shouldScrollToReceipt = false;
      requestAnimationFrame(scrollToReceipt);
    }
  }
});
