# BatchCutout - customer recovery emails

Use these only for users who created an account, started checkout, contacted support, or gave clear consent to receive product emails. Keep unsubscribe handling active for non-transactional messages.

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

Choose the current plan here:
https://batchcutout.com/pricing/?lang=en&utm_source=email&utm_medium=recovery&utm_campaign=account_no_checkout

Thanks,
NexaFlow Labs

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
https://batchcutout.com/pricing/?lang=en&utm_source=email&utm_medium=recovery&utm_campaign=checkout_not_paid

Thanks,
NexaFlow Labs

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
https://batchcutout.com/pricing/?lang=en&utm_source=email&utm_medium=recovery&utm_campaign=download_no_pro

Thanks,
NexaFlow Labs

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

Escolha o plano atual aqui:
https://batchcutout.com/pricing/?utm_source=email&utm_medium=recovery&utm_campaign=account_no_checkout

Obrigado,
NexaFlow Labs
