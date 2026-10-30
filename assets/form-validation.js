(function (root) {
  'use strict';

  function digits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function validCnpj(value) {
    var number = digits(value);
    if (number.length !== 14 || /^(\d)\1{13}$/.test(number)) return false;
    function checkDigit(length) {
      var weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      for (var i = 0; i < length; i++) sum += Number(number[i]) * weights[i];
      var remainder = sum % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    }
    return Number(number[12]) === checkDigit(12) && Number(number[13]) === checkDigit(13);
  }

  var validAreaCodes = new Set([11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99]);

  function validPhone(value) {
    var number = digits(value);
    if (number.length !== 10 && number.length !== 11) return false;
    if (!validAreaCodes.has(Number(number.slice(0, 2)))) return false;
    var local = number.slice(2);
    if (/(\d)\1{4,}/.test(local)) return false;
    if (local === '12345678' || local === '123456789' || local === '98765432' || local === '987654321') return false;
    return number.length === 11 ? local[0] === '9' : /^[2-5]/.test(local);
  }

  function maskCnpj(value) {
    var number = digits(value).slice(0, 14);
    return number.replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  var api = { validCnpj: validCnpj, validPhone: validPhone, maskCnpj: maskCnpj };
  root.A2OValidation = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
