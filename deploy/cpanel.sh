#!/usr/bin/env bash
set -euo pipefail

target=/home2/hg3ads37/produtos.a2osistemas.com.br/tms
whatsapp_target=/home2/hg3ads37/produtos.a2osistemas.com.br/tms-whatsapp

# Uma LP de captação não deve ser publicada sem o receptor de leads.
if [[ ! -f lead.php ]]; then
  echo 'Deploy cancelado: lead.php ainda não foi configurado e validado.' >&2
  exit 1
fi
config=/home2/hg3ads37/.config/a2o-tms-leads.php
if [[ ! -f "$config" ]] || ! grep -q "make_webhook_url" "$config"; then
  echo 'Deploy cancelado: configuração privada do webhook Make ausente no servidor.' >&2
  exit 1
fi

mkdir -p "$target/assets/fonts" "$target/obrigado" "$whatsapp_target"
sed 's/content="noindex, nofollow"/content="index, follow"/' index.html > "$target/index.html.tmp"
mv "$target/index.html.tmp" "$target/index.html"
install -m 0644 obrigado/index.html "$target/obrigado/index.html"
sed 's/content="noindex, nofollow"/content="index, follow"/' index-whatsapp.html > "$whatsapp_target/index.html.tmp"
mv "$whatsapp_target/index.html.tmp" "$whatsapp_target/index.html"
install -m 0644 lead.php "$target/lead.php"
install -m 0644 assets/favicon.svg "$target/assets/favicon.svg"
install -m 0644 assets/logo-a2o.svg "$target/assets/logo-a2o.svg"
install -m 0644 assets/logo-a2o-branco.svg "$target/assets/logo-a2o-branco.svg"
install -m 0644 assets/form-validation.js "$target/assets/form-validation.js"
install -m 0644 assets/fonts/figtree-latin.woff2 "$target/assets/fonts/figtree-latin.woff2"
