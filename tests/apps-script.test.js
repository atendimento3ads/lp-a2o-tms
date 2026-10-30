const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createContext() {
  const rows = [['Recebido em', 'Nome', 'Empresa', 'CNPJ', 'WhatsApp', 'E-mail', 'Principal desafio', 'Posição do formulário', 'Página', 'UTM source', 'UTM medium', 'UTM campaign', 'UTM term', 'UTM content', 'GCLID', 'ID do envio']];
  const sheet = {
    getLastRow: () => rows.length,
    getRange: (start, column, count) => ({getDisplayValues: () => rows.slice(start - 1, start - 1 + count).map(row => [row[column - 1]])}),
    appendRow: row => rows.push(row),
  };
  const context = {
    SpreadsheetApp: {openById: () => ({getSheetByName: () => sheet}), flush: () => {}},
    LockService: {getScriptLock: () => ({waitLock: () => {}, releaseLock: () => {}})},
    ContentService: {MimeType: {JSON: 'application/json'}, createTextOutput: text => ({text, setMimeType() {return this;}})},
    console,
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../apps-script/Code.gs'), 'utf8'), context);
  return {context, rows};
}

const base = {
  nome: 'TESTE 3ADS', empresa: 'A2O Sistemas', cnpj: '05.132.079/0001-28',
  whatsapp: '(62) 98435-2270', email: '', desafio: 'Operação/TMS', origem_form: 'topo',
  submission_id: '12345678-1234-1234-1234-123456789abc',
};

function submit(context, data) {
  return JSON.parse(context.doPost({postData: {contents: JSON.stringify(data)}}).text);
}

test('grava um lead válido e não duplica o mesmo envio', () => {
  const {context, rows} = createContext();
  assert.equal(submit(context, base).success, true);
  assert.equal(rows.length, 2);
  assert.equal(rows[1][3], "'05132079000128");
  assert.equal(rows[1][5], '');
  assert.equal(submit(context, base).success, true);
  assert.equal(rows.length, 2);
});

test('não grava CNPJ, telefone ou e-mail inválido', () => {
  const {context, rows} = createContext();
  for (const changed of [
    {cnpj: '05.132.079/0001-29'},
    {whatsapp: '(62) 99999-9999'},
    {whatsapp: '(62) 90000-0001'},
    {email: 'invalido'},
  ]) assert.equal(submit(context, {...base, ...changed}).success, false);
  assert.equal(rows.length, 1);
});

test('escapa entrada que começaria fórmula no Google Sheets', () => {
  const {context, rows} = createContext();
  assert.equal(submit(context, {...base, empresa: '=HYPERLINK("x")'}).success, true);
  assert.equal(rows[1][2], '\'=HYPERLINK("x")');
});
