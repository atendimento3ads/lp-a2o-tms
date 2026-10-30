const test = require('node:test');
const assert = require('node:assert/strict');
const { validCnpj, validPhone, maskCnpj } = require('../assets/form-validation.js');

test('CNPJ válido aceita formato com ou sem máscara', () => {
  assert.equal(validCnpj('05.132.079/0001-28'), true);
  assert.equal(validCnpj('05132079000128'), true);
  assert.equal(maskCnpj('05132079000128'), '05.132.079/0001-28');
});

test('CNPJ inválido rejeita dígito verificador e sequências repetidas', () => {
  assert.equal(validCnpj('05.132.079/0001-29'), false);
  assert.equal(validCnpj('00.000.000/0000-00'), false);
  assert.equal(validCnpj('11111111111111'), false);
});

test('telefone rejeita números repetidos, sequenciais e DDD inválido', () => {
  for (const phone of ['(62) 99999-9999', '(11) 00000-0000', '(11) 12345-6789', '(00) 98435-2270']) {
    assert.equal(validPhone(phone), false, phone);
  }
});

test('telefone aceita celular e fixo plausíveis com DDD', () => {
  assert.equal(validPhone('(62) 98435-2270'), true);
  assert.equal(validPhone('(62) 3587-3147'), true);
});
