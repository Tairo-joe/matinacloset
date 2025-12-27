const UI = (() => {
  function stars(rating) {
    const r = Math.round(Number(rating || 0));
    let html = '';
    for (let i = 1; i <= 5; i++) html += `<span class="text-warning">${i <= r ? '★' : '☆'}</span>`;
    return html;
  }

  const currencyFormatter = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 });
  function fmtPrice(p) { return currencyFormatter.format(Number(p || 0)); }

  function toast(msg, type = 'info') {
    alert(msg);
  }

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  return { stars, fmtPrice, toast, qs, qsa };
})();
