# Medição do funil BatchCutout

Eventos principais enviados pela Google tag:

- `upload`: utilizador carregou imagens suportadas.
- `processar`: utilizador clicou para remover fundos.
- `download_png`: utilizador descarregou uma imagem PNG individual.
- `download_zip`: utilizador descarregou ZIP com imagens processadas.
- `limite_20`: utilizador tentou ultrapassar o limite grátis de 20 imagens.
- `lead_pro`: utilizador submeteu interesse no acesso Pro.

Eventos técnicos mantidos para compatibilidade:

- `photos_selected`
- `upload_rejected`
- `background_removal_started`
- `background_removal_finished`
- `png_downloaded`
- `zip_downloaded`
- `pro_interest_prompt_clicked`
- `pro_lead_submitted`

Leitura recomendada:

- Muitos `upload` e poucos `processar`: a fila ou o botão de processamento ainda não estão claros.
- Muitos `processar` e poucos `download_png`/`download_zip`: qualidade, velocidade ou confiança no resultado podem estar a falhar.
- Muitos `limite_20` e poucos `lead_pro`: a proposta Pro precisa de ser mais forte ou mais imediata.
- Muitos cliques de Google Ads e poucos `upload`: problema de intenção das palavras-chave ou da promessa inicial da página.

Validação técnica em 2026-05-26:

- `upload`: confirmado no `dataLayer`.
- `processar`: confirmado no `dataLayer` e em pedidos para a Google.
- `download_png`: confirmado no `dataLayer` e em pedidos para a Google.
- `download_zip`: confirmado no `dataLayer` e em pedidos para a Google.
- `limite_20`: confirmado no `dataLayer` e em pedidos para a Google.

Estado Google Ads:

- A interface de conversões abriu, mas mostrou aviso de bloqueador de anúncios e impediu a configuração direta pela UI.
- A conta mostra objetivos existentes `Inscrição` e `Visualização de página` com estado de configuração incorreta.
- O código já envia a conversão Google Ads existente para lead Pro através de `AW-18177126609/nCaxCPrw1rEcENHhw9tD`.
- Próximo passo manual na UI: quando o aviso de bloqueador estiver resolvido, marcar `lead_pro` como conversão principal e `download_zip`/`limite_20` como conversões secundárias ou observação, para não otimizar a campanha cedo demais para ações de baixo valor.
