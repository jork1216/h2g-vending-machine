function sendReceiptHeight() {
  window.parent.postMessage({
    type: 'receipt-height',
    height: Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    )
  }, '*');
}

window.addEventListener('load', sendReceiptHeight);
window.addEventListener('resize', sendReceiptHeight);
setTimeout(sendReceiptHeight, 100);
setTimeout(sendReceiptHeight, 500);
