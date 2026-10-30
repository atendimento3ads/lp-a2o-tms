#!/usr/bin/env bash
set -euo pipefail

target=/home2/hg3ads37/produtos.a2osistemas.com.br/tms

# Uma LP de captação não deve ser publicada sem o receptor de leads.
if [[ ! -f lead.php ]]; then
  echo 'Deploy cancelado: lead.php ainda não foi configurado e validado.' >&2
  exit 1
fi
if [[ ! -f /home2/hg3ads37/.config/a2o-tms-leads.php ]]; then
  echo 'Deploy cancelado: URL privado do Apps Script ausente no servidor.' >&2
  exit 1
fi

mkdir -p "$target/assets/fonts"
sed 's/content="noindex, nofollow"/content="index, follow"/' index.html > "$target/index.html.tmp"
mv "$target/index.html.tmp" "$target/index.html"
install -m 0644 lead.php "$target/lead.php"
install -m 0644 assets/favicon.svg "$target/assets/favicon.svg"
install -m 0644 assets/logo-a2o.svg "$target/assets/logo-a2o.svg"
install -m 0644 assets/logo-a2o-branco.svg "$target/assets/logo-a2o-branco.svg"
install -m 0644 assets/form-validation.js "$target/assets/form-validation.js"
install -m 0644 assets/fonts/figtree-latin.woff2 "$target/assets/fonts/figtree-latin.woff2"
