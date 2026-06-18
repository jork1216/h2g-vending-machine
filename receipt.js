const receiptLines = document.querySelector('.receipt-lines');
const receiptSubtotalPrice = document.querySelector('.receipt-subtotal-price');
const receiptTotalPrice = document.querySelector('.receipt-total-price');
const receiptDate = document.querySelector('.receipt-date');

const formatPeso = (value) => `\u20B1${Number(value).toFixed(2)}`;

function sendReceiptHeight() {
  const receipt = document.querySelector('.receipt');

  if (!receipt) {
    return;
  }

  window.parent.postMessage({
    type: 'receipt-height',
    height: Math.ceil(receipt.getBoundingClientRect().height)
  }, '*');
}

function renderReceipt(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  const total = Number(data.total) || 0;

  if (receiptLines) {
    receiptLines.innerHTML = '';

    if (items.length === 0) {
      const emptyLine = document.createElement('li');
      const label = document.createElement('span');
      const price = document.createElement('span');

      label.textContent = 'No items selected';
      price.textContent = formatPeso(0);
      emptyLine.append(label, price);
      receiptLines.append(emptyLine);
    }

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const line = document.createElement('li');
      const label = document.createElement('span');
      const price = document.createElement('span');

      label.textContent = `${item.quantity} x ${item.name}`;
      price.textContent = formatPeso(item.total);
      line.append(label, price);
      receiptLines.append(line);
    }
  }

  if (receiptSubtotalPrice) {
    receiptSubtotalPrice.textContent = formatPeso(total);
  }

  if (receiptTotalPrice) {
    receiptTotalPrice.textContent = formatPeso(total);
  }

  if (receiptDate && data.date) {
    receiptDate.textContent = data.date;
  }

  requestAnimationFrame(sendReceiptHeight);
}

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'receipt-data') {
    return;
  }

  renderReceipt(event.data);
});

window.addEventListener('load', sendReceiptHeight);
window.addEventListener('resize', sendReceiptHeight);
setTimeout(sendReceiptHeight, 100);
setTimeout(sendReceiptHeight, 500);
