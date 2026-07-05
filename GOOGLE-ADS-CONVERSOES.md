# BatchCutout - Conversoes Google Ads

Estado revisto em 2026-06-30.

## Mapa atual

Conta Google Ads:

- `504-578-8374 BATCH CUT OUT`

Tag:

- `AW-18177126609`

## Conversoes principais

### Pro Paid Subscription BatchCutout

Objetivo: medir subscricao paga confirmada pelo Stripe.

Estado pretendido:

- Otimizacao: principal
- Categoria: Subscrever
- Contagem: uma
- Valor: variavel por transacao, fallback 19 EUR
- Usar para lances: sim

Evento no site:

- `pro_purchase_conversion_sent`

Snippet usado:

- `AW-18177126609/fpcoCP2kmMgcENHhw9tD`

Nota: este evento so deve disparar depois de `/api/sync-checkout-session` confirmar que a sessao Stripe ficou paga e sincronizada. Nao disparar em clique de checkout.

Atualizacao 2026-06-30: os Termos dos dados de clientes foram aceites no Google Ads e as conversoes melhoradas ficaram ativas ao nivel da conta, geridas pela etiqueta Google. O estado mostrado na interface ficou como `A registar conversoes melhoradas`.

Atualizacao 2026-06-30: foi adicionado fallback sem login em `/api/sync-checkout-session`. Se o regresso do Stripe perder a sessao Supabase, o browser valida o `session_id` diretamente no Stripe antes de enviar a conversao Google Ads. Isto reduz o risco de pagamentos reais ficarem sem conversao por falha de login local.

Atualizacao 2026-06-30: campanhas ativas verificadas no Google Ads. `Search - BatchCutout - Pro Launch` usa 8,00 EUR/dia, `Maximizar as conversoes` e `Objetivos de conversao: Predefinicao da conta: Subscrever`. `Search - BatchCutout - Alternatives` usa 2,00 EUR/dia, `Maximizar as conversoes` e `Objetivos de conversao: Predefinicao da conta: Subscrever`. Como as conversoes antigas de lead e visualizacao de pagina ficaram secundarias, a aprendizagem das campanhas fica alinhada com a subscricao paga.

Nota operacional: recomendacoes automaticas de correspondencia ampla e Maxima IA nao foram aplicadas nesta verificacao. Manter correspondencia controlada ate haver dados suficientes de subscricoes pagas e termos de pesquisa.

Atualizacao 2026-07-01: o site passou a definir `gtag("set", "user_data", { email })` quando existe email conhecido e o utilizador aceitou a medicao. Isto cobre login, criacao de conta, checkout e novo formulario opcional de lead pós-download. A submissao do lead gera `lead_capture_submitted` no Supabase, mas nao deve ser conversao principal de Google Ads.

### Lead Pro BatchCutout (legado)

Objetivo: medir contacto comercial antigo/lead manual.

Estado pretendido:

- Otimizacao: secundaria
- Contagem: uma
- Usar para lances: nao

Evento historico:

- `pro_waitlist_submitted`

Snippet usado:

- `AW-18177126609/riWOCOiI67McENHhw9tD`

Nota: existem duas acoes Lead Pro no Google Ads. Nao criar uma terceira ate haver necessidade.

Atualizacao 2026-06-30: as duas acoes antigas `Lead Pro BatchCutout` e `Lead Pro BatchCutout (1)` foram passadas para secundarias e removidas dos objetivos ao nivel da conta. Ficam apenas como historico/intencao secundaria.

Atualizacao 2026-07-05: ja nao existe fluxo ativo de waitlist/pedido Pro no site. A conversao comercial principal e a subscricao paga confirmada por Stripe; leads e formularios ficam apenas como sinais secundarios.

## Conversoes secundarias

### Download ZIP BatchCutout

Objetivo: medir utilizador que chegou a resultado util.

Estado pretendido:

- Otimizacao: secundaria
- Contagem: todas
- Usar para lances: nao

Snippet usado:

- `AW-18177126609/2EdRCMzF7bMcENHhw9tD`

### Limite 20 BatchCutout

Objetivo real atual: medir tentativa acima do limite gratuito de 3 imagens.

Estado pretendido:

- Otimizacao: secundaria
- Contagem: uma
- Usar para lances: nao

Snippet usado:

- `AW-18177126609/prPXCPXD8LMcENHhw9tD`

Nota: o nome no Google Ads ainda diz `Limite 20`, mas hoje representa `batch_limit_exceeded` com limite 3. Idealmente renomear na interface para `Batch Limit BatchCutout`.

### Visualizacao de pagina

Objetivo: historico tecnico criado pela Google tag.

Estado atual:

- Otimizacao: secundaria
- Usar para lances: nao

Atualizacao 2026-06-30: `Visualizacao de pagina` foi passada para secundaria e removida dos objetivos ao nivel da conta para evitar que campanhas otimizem para visitas em vez de pagamentos.

## Eventos que nao devem ser conversoes Google Ads

Estes eventos ficam apenas no Supabase/admin/debug:

- `tool_page_view`
- `tool_drag_upload_intent`
- `tool_upload_started`
- `tool_upload_added`
- `tool_processing_started`
- `tool_processing_completed`
- `tool_pro_clicked`
- `pro_submit_attempt`
- `pro_checkout_login_required`
- `pro_checkout_started`
- `lead_capture_submitted`

Motivo: sao sinais de funil, mas ainda nao devem orientar lances do Google Ads. Transformar estes eventos em conversoes cedo demais pode fazer a campanha otimizar para curiosidade em vez de intencao comercial.

Excecao: `pro_purchase_conversion_sent` e conversao principal porque representa subscricao paga.

## Proxima verificacao

Quando houver dados reais:

1. Confirmar se `Pro Paid Subscription BatchCutout` passa de configuracao incorreta/inativo para ativo apos o primeiro pagamento vindo do site publicado.
2. Se houver muitos `pro_checkout_started` e poucos pagamentos, rever preco, confianca e fluxo Stripe.
3. Se houver muitos `tool_pro_clicked` e poucos checkouts, reforcar CTA e contraste Free vs Pro.
4. Se houver muitos `batch_limit_exceeded` com bons termos de pesquisa, considerar campanha dedicada para lotes grandes.
