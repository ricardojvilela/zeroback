# BatchCutout - customer recovery emails

Use these only for users who created an account, started checkout, contacted support, or gave clear consent to receive product emails. Keep unsubscribe handling active for non-transactional messages.

Do not send automatically without a final send confirmation. These are ready-to-use templates for manual or automated recovery once the sending rules are approved.

Operational files:

- SQL segments: `CUSTOMER-RECOVERY-SEGMENTS.sql`
- HTML templates: `emails/recovery-account-no-checkout.html`, `emails/recovery-checkout-not-paid.html`, `emails/recovery-download-no-pro.html`, `emails/pro-welcome.html`
- Proof request templates: `emails/proof-request.html`, `emails/proof-request-pt.html`
- Admin panel: `/admin` shows manual recovery and proof candidates after login.

## Segments to use first

1. `account_no_checkout`
   - User exists in `batchcutout_users`.
   - `plan = free`.
   - No `stripe_customer_id`.
   - Account created at least 2 hours ago.

2. `checkout_not_paid`
   - `pro_checkout_started` exists.
   - No `pro_subscription_paid` after that checkout.
   - Send after 24 hours.

3. `download_no_pro`
   - User has email.
   - `tool_download_png` or `tool_download_zip` exists.
   - No `pro_checkout_started`.
   - Send after 24 to 48 hours.
   - Current limitation: anonymous downloads do not expose email. Use this only when the user is also identifiable through an account, support contact, or consented email capture.

4. `welcome_paid`
   - `pro_subscription_paid` exists.
   - Send immediately after payment if transactional welcome email is enabled.

5. `lead_capture_followup`
   - `lead_capture_submitted` exists.
   - The email was voluntarily submitted after a free test/download.
   - No known paid subscription for that email.
   - Send manually from `/admin` after reviewing the queue.

## From/reply setup

- From: `BatchCutout <noreply@batchcutout.com>`
- Reply-to: `support@batchcutout.com`
- Footer: include NexaFlow Labs and a clear opt-out line for recovery emails.

Manual outreach must use the domain sender:

- From: `BatchCutout <support@batchcutout.com>`
- Reply-to: `support@batchcutout.com`
- Sending route: `/api/pro-users` with `mode=send-outreach` via Resend, protected by admin token.

## Sequence 1 - account created, no checkout

Timing: 2 to 4 hours after account creation if no `pro_checkout_started`.

Subject:
Finish setting up BatchCutout Pro

Email:
Hi,

You created a BatchCutout account but did not choose a Pro plan yet.

If you are preparing product photos in batches, Pro unlocks:

- Up to 100 images per batch
- Up to 2,000 images per month
- ZIP export for product workflows

Choose the current founder plan here:
https://batchcutout.com/pricing/?lang=en&checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=account_no_checkout#pricing-account-title

Thanks,
NexaFlow Labs

Plain-text opt-out:
If you do not want product follow-up emails, reply with "unsubscribe".

## Sequence 2 - checkout started, no paid subscription

Timing: 24 hours after `pro_checkout_started` if no `pro_subscription_paid`.

Subject:
Need help activating BatchCutout Pro?

Email:
Hi,

It looks like you opened BatchCutout Pro checkout but did not complete payment.

If anything blocked you, reply to this email and we will help. The current Pro offer keeps the same limits:

- 100 images per batch
- 2,000 images per month
- Monthly, founder, and annual billing options

Continue checkout:
https://batchcutout.com/pricing/?lang=en&checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=checkout_not_paid#pricing-account-title

Thanks,
NexaFlow Labs

Plain-text opt-out:
If you do not want product follow-up emails, reply with "unsubscribe".

## Sequence 3 - download happened, no Pro click

Timing: 24 to 48 hours after download if the user has an email and no Pro checkout.

Subject:
Batch product photos faster with Pro

Email:
Hi,

You used BatchCutout to export product images. If you need to repeat that workflow with larger batches, Pro removes the 2-image batch limit.

Pro includes:

- 100 images per batch
- 2,000 images per month
- Transparent PNG and ZIP export

See plans:
https://batchcutout.com/pricing/?lang=en&checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=download_no_pro#pricing-account-title

Thanks,
NexaFlow Labs

Plain-text opt-out:
If you do not want product follow-up emails, reply with "unsubscribe".

## Sequence 4 - paid subscription welcome

Timing: immediately after `pro_subscription_paid`.

Subject:
BatchCutout Pro is active

Email:
Hi,

Your BatchCutout Pro access is active.

You can now process up to 100 images per batch and up to 2,000 images per month.

Open BatchCutout:
https://batchcutout.com/?utm_source=email&utm_medium=onboarding&utm_campaign=pro_welcome#tool

Manage billing from your account panel whenever needed.

Thanks,
NexaFlow Labs

## Sequence 5 - free test lead captured

Timing: 2 to 24 hours after `lead_capture_submitted`, only when the user voluntarily submitted email.

Subject:
Your BatchCutout link

Email:
Hi,

You asked to receive BatchCutout updates after testing the tool.

Here is the link to come back and process product photos:
https://batchcutout.com/?lang=en&utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_followup#tool

If you need larger batches, the founder plan includes:

- 100 images per batch
- 2,000 images per month
- Transparent PNG and ZIP export

Founder plan:
https://batchcutout.com/pricing/?lang=en&checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_followup#pricing-account-title

If this is not useful, reply "unsubscribe" and we will not send product follow-ups.

Thanks,
NexaFlow Labs

## PT variant - account created, no checkout

Subject:
Conclua a ativacao do BatchCutout Pro

Email:
Ola,

Criou uma conta BatchCutout, mas ainda nao escolheu um plano Pro.

Se esta a preparar fotos de produto em lote, o Pro desbloqueia:

- Ate 100 imagens por lote
- Ate 2.000 imagens por mes
- Exportacao ZIP para fluxos de ecommerce

Escolha o plano fundador aqui:
https://batchcutout.com/pricing/?checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=account_no_checkout#pricing-account-title

Obrigado,
NexaFlow Labs

Linha opt-out:
Se nao quiser receber emails de acompanhamento do produto, responda com "remover".

## PT variant - checkout started, no paid subscription

Subject:
Precisa de ajuda a ativar o BatchCutout Pro?

Email:
Ola,

Abriu o checkout do BatchCutout Pro, mas o pagamento nao ficou concluido.

Se alguma coisa bloqueou o processo, responda a este email e ajudamos. O plano Pro inclui:

- Ate 100 imagens por lote
- Ate 2.000 imagens por mes
- PNG transparente e ZIP para fluxos de ecommerce

Continuar:
https://batchcutout.com/pricing/?checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=checkout_not_paid#pricing-account-title

Obrigado,
NexaFlow Labs

Linha opt-out:
Se nao quiser receber emails de acompanhamento do produto, responda com "remover".

## PT variant - download happened, no Pro click

Subject:
Trate lotes de fotos de produto mais depressa

Email:
Ola,

Usou o BatchCutout para exportar imagens. Se precisa de repetir esse fluxo com mais fotos, o Pro remove o limite de 2 imagens por lote.

O Pro inclui:

- 100 imagens por lote
- 2.000 imagens por mes
- Exportacao em PNG transparente e ZIP

Ver planos:
https://batchcutout.com/pricing/?checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=download_no_pro#pricing-account-title

Obrigado,
NexaFlow Labs

Linha opt-out:
Se nao quiser receber emails de acompanhamento do produto, responda com "remover".

## PT variant - paid subscription welcome

Subject:
O BatchCutout Pro esta ativo

Email:
Ola,

O seu acesso BatchCutout Pro esta ativo.

Agora pode processar ate 100 imagens por lote e ate 2.000 imagens por mes.

Abrir BatchCutout:
https://batchcutout.com/?utm_source=email&utm_medium=onboarding&utm_campaign=pro_welcome#tool

Pode gerir a faturacao no painel da sua conta.

Obrigado,
NexaFlow Labs

## PT variant - free test lead captured

Subject:
O seu link BatchCutout

Email:
Ola,

Pediu para receber novidades do BatchCutout depois de testar a ferramenta.

Aqui fica o link para voltar e tratar fotos de produto:
https://batchcutout.com/?utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_followup#tool

Se precisar de lotes maiores, o plano fundador inclui:

- 100 imagens por lote
- 2.000 imagens por mes
- PNG transparente e exportacao ZIP

Plano fundador:
https://batchcutout.com/pricing/?checkout_plan=early&utm_source=email&utm_medium=recovery&utm_campaign=lead_capture_followup#pricing-account-title

Se nao quiser receber emails de acompanhamento, responda com "remover".

Obrigado,
NexaFlow Labs
