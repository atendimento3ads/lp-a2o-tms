# LP A2O TMS — teste de conversão

Fonte: protótipo da 3ADS em `main`. A versão do GitHub Pages permanece com `noindex`.

## Variantes públicas

- Variante A — formulário: `https://produtos.a2osistemas.com.br/tms/`.
- Obrigado após confirmação do webhook: `https://produtos.a2osistemas.com.br/tms/obrigado/`.
- Variante B — WhatsApp: `https://produtos.a2osistemas.com.br/tms-whatsapp/`.
- cPanel 3ADS UX: domínio `produtos.a2osistemas.com.br`, raiz `/home2/hg3ads37/produtos.a2osistemas.com.br`.
- Git Version Control: `/home2/hg3ads37/repositories/lp-a2o-tms`, remoto `https://github.com/atendimento3ads/lp-a2o-tms.git`.
- `.cpanel.yml` chama `deploy/cpanel.sh`, que publica a variante A, a página de obrigado e a variante B; remove `noindex` nas cópias públicas.
- O formulário da variante A envia JSON ao `lead.php`. O PHP valida os campos, normaliza o telefone como `55` + DDD + número (somente dígitos) e encaminha ao webhook do Make.
- A configuração privada fica em `/home2/hg3ads37/.config/a2o-tms-leads.php`, fora da pasta pública, com permissões `0600` e diretório `0700`. Ela deve retornar `['make_webhook_url' => 'https://hook.us2.make.com/…']`. O webhook não deve ser versionado.
- A página de obrigado é servida somente depois de resposta HTTP de sucesso do Make; o evento `generate_lead` segue sem dados pessoais e a navegação aguarda o GTM por até 1,1 s.
- A variante B não tem formulário nem redirecionamento de obrigado. Todos os CTAs de conversão e o botão flutuante apontam para o link Tintim fornecido.

## Formulário

Um único formulário permanece no bloco final; a versão da hero foi removida. Nome, empresa, CNPJ, WhatsApp e principal desafio são obrigatórios; e-mail é opcional. O navegador valida os dígitos do CNPJ e rejeita telefones repetidos, sequenciais ou com DDD inválido. A validação deve ser repetida no servidor. O evento `generate_lead` só é emitido após resposta `{"success":true}` de `lead.php`.

## Verificação

- Não executar POST de lead de teste sem dados sintéticos e autorização específica. Após deploy, a equipe deve validar o cenário Make e os disparos GTM nas duas URLs.
- O teste de tráfego A/B requer que a mídia distribua os acessos entre as duas URLs; este repositório publica as variantes, mas não configura a divisão de tráfego.
- Confirmar DNS autoritativo apontando para `216.172.172.148`, AutoSSL e resposta HTTPS.
