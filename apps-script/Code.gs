/** Receptor vinculado à planilha A2O TMS - Leads. */
function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 12000) return reply_(false);
    const lead = JSON.parse(raw);
    if (!validLead_(lead)) return reply_(false);

    const sheet = SpreadsheetApp.openById('17MC28txoHH2YCgfhTC6IZodNpVPueUsSc7jdU4F_PKA').getSheetByName('Leads TMS');
    if (!sheet) return reply_(false);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const last = sheet.getLastRow();
      if (last > 1) {
        const start = Math.max(2, last - 199);
        const existing = sheet.getRange(start, 16, last - start + 1, 1).getDisplayValues();
        if (existing.some(row => row[0] === lead.submission_id)) return reply_(true);
      }
      sheet.appendRow([
        new Date(), safe_(lead.nome), safe_(lead.empresa), "'" + digits_(lead.cnpj),
        "'" + digits_(lead.whatsapp), safe_(lead.email || ''), safe_(lead.desafio),
        safe_(lead.origem_form), 'https://produtos.a2osistemas.com.br/tms/',
        safe_(lead.utm_source || ''), safe_(lead.utm_medium || ''),
        safe_(lead.utm_campaign || ''), safe_(lead.utm_term || ''),
        safe_(lead.utm_content || ''), safe_(lead.gclid || ''), lead.submission_id
      ]);
      SpreadsheetApp.flush();
      return reply_(true);
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error('Falha ao registrar lead: ' + error.message);
    return reply_(false);
  }
}

function reply_(success) {
  return ContentService.createTextOutput(JSON.stringify({success: success}))
    .setMimeType(ContentService.MimeType.JSON);
}

function digits_(value) {
  return String(value || '').replace(/\D/g, '');
}

function validCnpj_(value) {
  const cnpj = digits_(value);
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;
  const digit = length => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((total, weight, index) => total + Number(cnpj[index]) * weight, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return Number(cnpj[12]) === digit(12) && Number(cnpj[13]) === digit(13);
}

function validPhone_(value) {
  const number = digits_(value);
  const ddds = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];
  if (![10, 11].includes(number.length) || !ddds.includes(Number(number.slice(0, 2)))) return false;
  const local = number.slice(2);
  if (/^(\d)\1+$/.test(local) || ['12345678','123456789','98765432','987654321'].includes(local)) return false;
  return number.length === 11 ? local[0] === '9' : /^[2-5]/.test(local);
}

function validLead_(lead) {
  if (!lead || typeof lead !== 'object' || Array.isArray(lead)) return false;
  if (!/^[a-f0-9-]{32,36}$/i.test(String(lead.submission_id || ''))) return false;
  if (!validCnpj_(lead.cnpj) || !validPhone_(lead.whatsapp)) return false;
  if (String(lead.nome || '').trim().length < 2 || String(lead.nome).length > 120) return false;
  if (String(lead.empresa || '').trim().length < 2 || String(lead.empresa).length > 160) return false;
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(lead.email))) return false;
  if (String(lead.email || '').length > 180) return false;
  if (!['Operação/TMS','Frota','Fiscal','Financeiro','Integração entre áreas','Outro'].includes(lead.desafio)) return false;
  if (!['topo','final'].includes(lead.origem_form)) return false;
  return ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid']
    .every(key => String(lead[key] || '').length <= 250);
}

function safe_(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
