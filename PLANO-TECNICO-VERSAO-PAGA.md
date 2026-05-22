# BatchCutout - plano tecnico para versao paga

Documento interno para preparar a passagem de teste gratuito para produto pago.

## Arquitetura recomendada

| Area | Solucao inicial |
| --- | --- |
| Hosting | Vercel |
| Base de dados | Supabase |
| Autenticacao | Supabase Auth ou Clerk |
| Pagamentos | Stripe Checkout |
| Emails | Resend ou Supabase + SMTP |
| Analytics | Google Ads + GA4/Plausible |

## Funcionalidades pagas

1. Login por email.
2. Limite gratuito por utilizador.
3. Contador mensal de imagens processadas.
4. Plano ativo/inativo.
5. Pagamento via Stripe.
6. Historico simples de lotes.
7. Painel admin com utilizadores, leads e pagamentos.

## Processamento

### Fase 1: manter no browser

Vantagens:
- custos baixos;
- maior privacidade;
- menos carga de servidor.

Limites:
- depende do computador do utilizador;
- formatos pesados podem falhar;
- dificil controlar abusos sem login.

### Fase 2: processamento em servidor

Vantagens:
- mais controlo;
- melhor experiencia em volumes grandes;
- possibilidade de filas e notificacoes.

Limites:
- custo de GPU/CPU;
- responsabilidade maior sobre privacidade;
- necessidade de armazenamento temporario.

## Modelo de dados inicial

### users

- id
- email
- created_at
- plan
- stripe_customer_id
- monthly_image_limit
- monthly_images_used

### leads

- id
- email
- company
- volume
- source
- created_at

### batches

- id
- user_id
- image_count
- status
- created_at

## Ordem de implementacao

1. Guardar leads em Supabase.
2. Criar login.
3. Criar contador mensal.
4. Integrar Stripe.
5. Bloquear Pro sem pagamento.
6. Criar painel admin.
