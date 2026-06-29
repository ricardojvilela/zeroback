# Checklist antes de publicar

## Segurança e pagamentos

1. Rodar qualquer chave Stripe live que tenha sido partilhada fora da Stripe.
2. Atualizar `STRIPE_SECRET_KEY` na Vercel com a nova chave live.
3. Confirmar que estes valores existem na Vercel:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRO_MONTHLY_PRICE_ID`
   - `STRIPE_PRO_ANNUAL_PRICE_ID`
   - `STRIPE_PRO_EARLY_PRICE_ID`
   - `BATCHCUTOUT_SITE_URL`
4. Fazer uma compra real de baixo valor ou uma compra live controlada.
5. Confirmar que, depois do pagamento, a conta fica Pro, com 100 imagens por lote e 2.000 imagens por mês.
6. Confirmar que o portal de faturação abre e permite cancelar/gerir o pagamento.
7. Confirmar que `support@batchcutout.com` reencaminha para uma caixa ativa.

## Email de suporte

1. No Resend, criar um webhook para `https://batchcutout.com/api/resend-inbound`.
2. Ativar o evento `email.received` no webhook.
3. Guardar o webhook secret na Vercel como `RESEND_WEBHOOK_SECRET`.
4. Criar ou reutilizar uma chave API do Resend com acesso suficiente para ler e reencaminhar emails recebidos.
5. Guardar na Vercel:
   - `RESEND_API_KEY`
   - `RESEND_WEBHOOK_SECRET`
   - `SUPPORT_FORWARD_TO=ricardojvilela@gmail.com`
   - `SUPPORT_FORWARD_FROM=support@batchcutout.com`
   - `SUPPORT_INBOUND_ADDRESSES=support@batchcutout.com`
6. No DNS da Vercel, adicionar os MX de receção indicados pelo Resend para `batchcutout.com`.
7. Confirmar no Resend que a receção ficou verificada.
8. Enviar um email real para `support@batchcutout.com` e confirmar que chega à caixa de destino.

## Vercel

1. Criar conta em https://vercel.com.
2. Criar novo projeto.
3. Fazer upload da pasta ou ligar a um repositório GitHub.
4. Usar:
   - Framework Preset: Other
   - Build Command: vazio ou `npm run build`
   - Output Directory: `.`
5. Publicar.
6. Abrir o link gerado em janela anónima.
7. Testar upload, remoção, ZIP, login, checkout, portal de faturação e troca de idioma.

## Netlify

1. Criar conta em https://netlify.com.
2. Ir a Add new site.
3. Escolher Deploy manually.
4. Arrastar a pasta do projeto para o upload.
5. Abrir o link gerado e testar.

## Ficheiros necessários no deploy

- `index.html`
- `styles.css`
- `script.js`
- `favicon.svg`
- `privacidade.html`
- `termos.html`
- `reembolsos.html`
- `contacto.html`
- `package.json`
- `vercel.json`

Os ficheiros `abrir-ferramenta.bat` e `servidor-ferramenta.ps1` são apenas para uso local.

