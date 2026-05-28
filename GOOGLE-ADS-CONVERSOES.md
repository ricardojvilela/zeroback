# BatchCutout - Conversoes Google Ads

Estado revisto em 2026-05-28.

## Mapa atual

Conta Google Ads:

- `504-578-8374 BATCH CUT OUT`

Tag:

- `AW-18177126609`

## Conversoes principais

### Lead Pro BatchCutout

Objetivo: medir contacto comercial real.

Estado pretendido:

- Otimizacao: principal
- Contagem: uma
- Usar para lances: sim

Evento no site:

- `pro_waitlist_submitted`

Snippet usado:

- `AW-18177126609/riWOCOiI67McENHhw9tD`

Nota: existem duas acoes Lead Pro no Google Ads. O codigo usa `Lead Pro BatchCutout (1)`. Nao criar uma terceira ate haver necessidade.

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

Motivo: sao sinais de funil, mas ainda nao devem orientar lances do Google Ads. Transformar estes eventos em conversoes cedo demais pode fazer a campanha otimizar para curiosidade em vez de intencao comercial.

## Proxima verificacao

Quando houver leads reais:

1. Confirmar se `Lead Pro BatchCutout (1)` passa de inativo para ativo.
2. Se houver muitos `tool_pro_clicked` e poucos leads, melhorar formulario/proposta antes de criar nova conversao Ads.
3. Se houver muitos `batch_limit_exceeded` com bons termos de pesquisa, considerar criar campanha dedicada para lotes grandes.
