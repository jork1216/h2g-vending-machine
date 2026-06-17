const productGrid = document.querySelector('.product-grid');
const products = [
  { name: 'Toilet roll', image: 'products/toilet roll.png' },
  { name: 'Shampoo', image: 'products/shampoo.png' },
  { name: 'Dove soap', image: 'products/dove soap.png' },
  { name: 'Colgate', image: 'products/colgate.png' },

  { name: 'Bundle', image: 'products/bundle.png' },
  { name: 'Egg', image: 'products/egg.png' },
  { name: 'Oil', image: 'products/oil.png' },

  { name: 'Piattos', image: 'products/piattos.png' },
  { name: 'Water', image: 'products/water.png' },
  { name: 'Coke', image: 'products/coke.png' },
  { name: 'Kopiko', image: 'products/kopiko.png' },

  { name: 'Maxglow', image: 'products/maxglow.png' }
];

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

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'receipt-height') {
    return;
  }

  const receiptFrame = document.querySelector('.receipt-frame');
  receiptFrame.style.height = `${event.data.height}px`;
});
