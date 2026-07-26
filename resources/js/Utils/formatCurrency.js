const localeMap = { EGP: 'ar-EG-u-nu-latn', IDR: 'id-ID', USD: 'en-US' };

export function formatCurrency(value = 0) {
  const currency = window.__storeCurrency || 'IDR';
  const locale = localeMap[currency] || 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}
