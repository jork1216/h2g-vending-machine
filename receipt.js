const receiptLines = document.querySelector('.receipt-lines');
const receiptSubtotalPrice = document.querySelector('.receipt-subtotal-price');
const receiptTotalPrice = document.querySelector('.receipt-total-price');
const receiptDate = document.querySelector('.receipt-date');
const gcashCopyButton = document.querySelector('.gcash-mobile-number');
const gcashCopyHint = document.querySelector('.gcash-copy-hint');

const formatPeso = (value) => `\u20B1${Number(value).toFixed(2)}`;
const DEFAULT_COPY_HINT = 'Tap number to copy';
const COPIED_COPY_HINT = 'Copied!';
let copyHintTimerId = null;

function copyTextWithFallback(value) {
  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.top = '-999px';
  input.style.left = '-999px';
  document.body.append(input);
  input.select();

  const copied = document.execCommand('copy');
  input.remove();
  return copied;
}

async function copyText(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (error) {
    // Fall back for local file previews or browsers with stricter clipboard rules.
  }

  return copyTextWithFallback(value);
}

function setCopyHint(message) {
  if (!gcashCopyHint) {
    return;
  }

  gcashCopyHint.textContent = message;

  if (copyHintTimerId) {
    clearTimeout(copyHintTimerId);
  }

  if (message !== DEFAULT_COPY_HINT) {
    copyHintTimerId = setTimeout(() => {
      gcashCopyHint.textContent = DEFAULT_COPY_HINT;
      copyHintTimerId = null;
    }, 1800);
  }
}

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

if (gcashCopyButton) {
  gcashCopyButton.addEventListener('click', async () => {
    const copied = await copyText(gcashCopyButton.dataset.copyText || gcashCopyButton.textContent.trim());
    setCopyHint(copied ? COPIED_COPY_HINT : 'Copy failed');
  });
}

setTimeout(sendReceiptHeight, 100);
setTimeout(sendReceiptHeight, 500);
