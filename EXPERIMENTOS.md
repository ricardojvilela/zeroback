# BatchCutout - Growth experiments

## Experimento 1: limite gratuito reduzido para 3 imagens

### Hipotese
Reduzir o limite gratuito de 20 para 3 imagens em trafego controlado pode aumentar a intencao Pro sem destruir a utilizacao inicial da ferramenta.

### Estado
Preparado, mas nao aplicado globalmente.

### URL padrao atual
https://batchcutout.com/

### URL de teste
https://batchcutout.com/?limit=3

### Links de campanha prontos

Google Ads geral:
https://batchcutout.com/?limit=3&utm_source=google_ads&utm_medium=cpc&utm_campaign=pro_limit_test

Google Ads Shopify:
https://batchcutout.com/?limit=3&utm_source=google_ads&utm_medium=cpc&utm_campaign=shopify_limit_test

Google Ads Etsy:
https://batchcutout.com/?limit=3&utm_source=google_ads&utm_medium=cpc&utm_campaign=etsy_limit_test

Comunidades Etsy:
https://batchcutout.com/?limit=3&utm_source=community&utm_medium=organic&utm_campaign=etsy_limit_test

Comunidades Shopify:
https://batchcutout.com/?limit=3&utm_source=community&utm_medium=organic&utm_campaign=shopify_limit_test

Pagina pricing:
https://batchcutout.com/pricing/?utm_source=experiment&utm_medium=internal&utm_campaign=pro_limit_test

### Metricas principais
- uploads
- tentativas acima do limite
- downloads PNG
- downloads ZIP
- respostas ao feedback pos-download
- cliques/interesse Pro
- leads Pro
- custo por lead, se usado em Google Ads

### Eventos relevantes
- upload
- limite_20
- download_png
- download_zip
- post_download_feedback_selected
- pro_interest_prompt_clicked
- lead_pro

Nota: apesar do evento manter o nome `limite_20`, os parametros `free_limit` e `limit_variant` indicam se o visitante estava em `default` ou `limit_3`.

### Regra de decisao
Manter ou expandir o limite 3 se:
- a taxa de leads Pro aumentar;
- as tentativas acima do limite subirem;
- os downloads nao cairem de forma extrema;
- o feedback nao indicar rejeicao clara do limite.

Reverter ou ajustar se:
- uploads cairem fortemente;
- quase ninguem chegar ao download;
- houver feedback negativo sobre o limite antes de perceber valor;
- o custo por lead subir sem melhoria de qualidade.

### Quando avaliar
Nao tomar decisao com menos de 100 visitas qualificadas ao teste.

Rever apos:
- 100 visitas ao URL `limit=3`; ou
- 7 dias de campanha, o que acontecer primeiro.

### Decisao inicial
Nao aplicar globalmente ainda. Usar apenas em campanhas e comunidades selecionadas.
