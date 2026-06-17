function sendReceiptHeight() {
  const receipt = document.querySelector('.receipt');

  window.parent.postMessage({
    type: 'receipt-height',
    height: Math.ceil(receipt.getBoundingClientRect().height)
  }, '*');
}

window.addEventListener('load', sendReceiptHeight);
window.addEventListener('resize', sendReceiptHeight);
setTimeout(sendReceiptHeight, 100);
setTimeout(sendReceiptHeight, 500);
