# LP A2O TMS

Fonte: protótipo da 3ADS em `main`. A versão do GitHub Pages permanece com `noindex`.

## Produção

- URL desejada: `https://produtos.a2osistemas.com.br/tms/`.
- cPanel 3ADS UX: domínio `produtos.a2osistemas.com.br`, raiz `/home2/hg3ads37/produtos.a2osistemas.com.br`.
- Git Version Control: `/home2/hg3ads37/repositories/lp-a2o-tms`, remoto `https://github.com/atendimento3ads/lp-a2o-tms.git`.
- `.cpanel.yml` chama `deploy/cpanel.sh`, que publica somente arquivos necessários em `tms/` e troca `noindex` por `index, follow` na cópia de produção.
- O script bloqueia o deploy enquanto `lead.php` não existir. O endpoint PHP encaminha os envios ao Apps Script vinculado à planilha privada `A2O TMS - Leads` da conta `atendimento.3ads@gmail.com`.
- A configuração privada fica em `/home2/hg3ads37/.config/a2o-tms-leads.php`, fora da pasta pública, com permissões `0600` e diretório `0700`. Ela retorna `['web_app_url' => 'https://script.google.com/macros/s/…/exec']`. Esse URL não deve ser versionado.

## Formulário

Dois pontos de captura usam o mesmo template. Nome, empresa, CNPJ, WhatsApp e principal desafio são obrigatórios; e-mail é opcional. O navegador valida os dígitos do CNPJ e rejeita telefones repetidos, sequenciais ou com DDD inválido. A validação deve ser repetida no servidor. O evento `generate_lead` só é emitido após resposta `{"success":true}` de `lead.php`.

## Verificação

- O Apps Script foi implantado como web app. Envios de teste válidos e inválidos foram conferidos na planilha; os registros de teste estão identificados para descarte.
- Após cada deploy, testar o endpoint PHP e o formulário da página publicada.
- Confirmar DNS autoritativo apontando para `216.172.172.148`, AutoSSL e resposta HTTPS.
