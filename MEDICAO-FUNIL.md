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
- A ação principal `Lead Pro BatchCutout (1)` foi criada no Google Ads em `Inscrição`.
- O código envia a conversão Google Ads de lead Pro através de `AW-18177126609/riWOCOiI67McENHhw9tD`.
- Próximo passo na UI: criar `download_zip` e `limite_20` como conversões secundárias ou observação, para não otimizar a campanha cedo demais para ações de baixo valor.

Atualização em 2026-05-26:

- A ação secundária `Download ZIP BatchCutout` foi criada no Google Ads em `Visualização de página`.
- O código envia a conversão Google Ads de download ZIP através de `AW-18177126609/2EdRCMzF7bMcENHhw9tD`.
- A ação secundária `Limite 20 BatchCutout` foi criada no Google Ads em `Inscrição`.
- O código envia a conversão Google Ads de limite de 20 imagens através de `AW-18177126609/prPXCPXD8LMcENHhw9tD`.

Atualizacao em 2026-05-27 - visitas:

- Vercel Web Analytics foi ativado no projeto Vercel no plano Hobby incluido.
- O script `/_vercel/insights/script.js` foi instalado nas principais paginas HTML do BatchCutout.
- Validacao online: `https://batchcutout.com/_vercel/insights/script.js` responde com sucesso e a homepage inclui o script.
- GA4: foi iniciada/criada a configuracao BatchCutout Web para `https://batchcutout.com`, mas a ligacao final da Google tag ficou pendente por limitacao de clique em frame no browser integrado.
- Nao usar o ID `G-90G5BHW0RZ` no BatchCutout porque pertence/estava associado a `strongpadel.pt`.

Atualizacao em 2026-05-28 - otimizacao de trafego pago:

- Aplicadas 16 palavras-chave negativas exatas na campanha `Search - BatchCutout - Limit 3 Test`.
- Negativas principais: termos de app concorrente, pesquisas explicitamente gratis, `removebg` e pesquisas de fundo branco/adicionar fundo.
- Primeira dobra publicada com mensagem mais direta para a campanha `?limit=3`: teste gratis com 3 imagens, exportacao PNG/ZIP e chamada clara para arrastar fotos.
- Proxima leitura recomendada: comparar cliques, uploads e tentativas acima do limite nas proximas 24-48 horas antes de alterar orcamento.

Atualizacao em 2026-05-28 - limite gratuito:

- O limite gratuito padrao passou de 20 para 3 imagens por lote em todo o site.
- As paginas `shopify.html`, `etsy.html` e `bulk-background-remover/index.html` tambem passaram a comunicar 3 imagens.
- Foram corrigidos textos com caracteres de acentuacao mal codificados no `index.html` e `script.js`.

Atualizacao em 2026-05-28 - Pro early access:

- A pagina `/pricing/` foi reposicionada como pagina Pro/Early Access para lojas e equipas com volume.
- A proposta principal passou a focar centenas de fotos de produto, PNG transparente, ZIP organizado, minimo 1200px e fluxos Shopify/Etsy/marketplaces.
- Os CTAs de limite da ferramenta passaram a encaminhar para `/pricing/?source=app&reason=...&limit=3#pro-waitlist`.
- Validacao online: `/pricing/` mostra a nova proposta e o CTA Pro da homepage redireciona corretamente.

Atualizacao em 2026-05-28 - simplificacao da homepage:

- Removidos da homepage os blocos longos de casos de uso, prova visual, formulario Pro completo, audiencia e feedback inicial.
- A homepage ficou focada em: proposta curta, upload, fila, botoes de processamento/download, notas essenciais, CTA Pro e FAQ curta.
- O pedido Pro fica concentrado na pagina `/pricing/`.
- Validacao online: ferramenta presente, link Pro visivel, blocos removidos ausentes e sem erros JavaScript do dominio BatchCutout.

Atualizacao em 2026-05-28 - upgrade visual Pro:

- A pagina `/pricing/` passou a ter hero escuro, contraste forte, imagem de antes/depois e metricas comerciais visiveis.
- Foram adicionados sinais rapidos: 3 imagens gratis para testar, exportacao minima 1200px e ZIP pronto para catalogo.
- O CSS partilhado das landing pages recebeu navegação com fundo/transparencia, sombras mais consistentes e cards menos planos.
- Validacao online: `/pricing/` mostra o novo layout, sem texto partido e sem erros JavaScript do dominio BatchCutout.

Atualizacao em 2026-05-28 - pricing bilingue:

- A pagina `/pricing/` passou a suportar PT/EN com detecao automatica por idioma do browser e seletor manual no topo.
- Titulos, CTAs, placeholders, opcoes de volume, meta description e mensagens do formulario sao trocados dinamicamente.
- Validacao online: PT e EN funcionam, sem texto partido e sem erros JavaScript do dominio BatchCutout.

Atualizacao em 2026-05-28 - medicao Pro:

- A pagina `/pricing/` passou a registar sinais de intencao Pro: visita, clique em CTA, inicio de formulario, volume escolhido e tentativa de envio.
- O painel tecnico de validacao fica disponivel com `?debug=1`, usando o mesmo historico local de eventos da ferramenta.
- A tentativa de envio passou a ser registada mesmo quando o formulario ainda esta invalido, para medir interesse antes do contacto completo.
- Validacao online: tentativa invalida no formulario Pro regista `pro_submit_attempt` com `isValid: false`, sem duplicar a tentativa atual.

Atualizacao em 2026-05-28 - funil da ferramenta:

- A homepage passou a registar eventos de funil mais claros: `tool_page_view`, `tool_drag_upload_intent`, `tool_upload_started`, `tool_upload_added`, `batch_limit_exceeded`, `tool_processing_started`, `tool_processing_completed`, `tool_download_png`, `tool_download_zip` e `tool_pro_clicked`.
- O evento antigo `limite_20` fica ativo apenas como compatibilidade com a conversao ja criada no Google Ads, mas os novos relatorios devem usar `batch_limit_exceeded`.
- Os eventos incluem limite gratuito, idioma, origem/campanha, quantidade selecionada, quantidade aceite, rejeicoes por limite, ficheiros nao suportados e downloads PNG/ZIP.
- Validacao online: `https://batchcutout.com/?debug=1` mostra `tool_page_view` com `free_limit: 3`; o ficheiro publicado contem os novos eventos de upload, limite, processamento, download e Pro.

Atualizacao em 2026-05-28 - painel interno:

- Criada a pagina `/admin.html` para registo diario de visitantes, uploads, imagens aceites, tentativas acima de 3, downloads, cliques Pro, leads e custo Google Ads.
- O painel calcula taxas de visita para upload, upload para download, limite para Pro e custo por lead.
- Inclui recomendacao automatica: manter teste, ajustar pagina/anuncio, melhorar experiencia, reforcar Pro, controlar custo ou escalar com cuidado.
- A pagina tem `noindex,nofollow`, nao esta no sitemap e o `robots.txt` bloqueia `/admin.html`.

Atualizacao em 2026-05-28 - recolha real de eventos:

- Criado endpoint `/api/track` para receber eventos do site e guardar no Supabase quando as variaveis estiverem configuradas no Vercel.
- A homepage envia os eventos principais do funil para o endpoint, alem de Google/Vercel/debug.
- A pagina `/pricing/` envia eventos Pro para o mesmo endpoint.
- Criado o guia `SUPABASE-EVENTOS.md` com SQL da tabela, variaveis do Vercel e consultas de funil.
- Supabase ficou ativo em producao: projeto `kpsxurgxmkfwdfnyzzhj`, tabela `public.batchcutout_events`, endpoint validado com `stored: true`.
- Variaveis Vercel configuradas em producao: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_EVENTS_TABLE`.
