# BatchCutout - Growth experiments

## Experimento 1: limite gratuito reduzido para 3 imagens

### Hipotese
Reduzir o limite gratuito de 20 para 3 imagens em trafego controlado pode aumentar a intencao Pro sem destruir a utilizacao inicial da ferramenta.

### Estado
Encerrado em 2026-07-12. O parametro publico `limit` deixou de alterar o acesso gratuito. O teste gratuito passou a incluir 2 imagens no total por navegador para impedir processamento gratuito repetido em lotes pequenos.

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
https://batchcutout.com/pricing/?checkout_plan=pack100&utm_source=experiment&utm_medium=internal&utm_campaign=pack100_limit_test#pricing-account-title

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

## Experimento 2: teste de 2 imagens no total para Pack 100

### Hipotese
Impedir a repeticao ilimitada do modo gratuito deve transformar utilizadores que ja confirmaram a qualidade do recorte em intencao Pack, sem alterar o preco de 5 EUR.

### Estado
Ativo desde 2026-07-12. A oferta gratuita permite 2 imagens concluidas no total por navegador. Depois disso, a acao principal e Pack 100.

### Baseline anterior
Leitura de 30 dias feita em 2026-07-13, ainda dominada pela versao gratuita antiga:
- 360 dias-visitante (a mesma pessoa podia contar em dias diferentes);
- 517 visualizacoes de pagina;
- 296 inicios de upload;
- 217 momentos de resultado pronto;
- 188 downloads;
- 27 cliques de intencao paga na ferramenta e 5 cliques de pricing;
- 0 sessoes Stripe atribuidas e 0 pagamentos.

Esta baseline prova utilizacao, mas nao deve ser usada como denominador do novo funil porque o gratuito podia ser repetido sem compra.

### Medicao valida
O painel `/admin` conta pessoas unicas na sequencia:
1. teste de 2 imagens concluido;
2. tentativa de continuar;
3. clique Pack;
4. chegada a Stripe;
5. compra Pack.

Cliques repetidos da mesma pessoa contam uma unica vez nas etapas principais.

### Regra de decisao
Nao alterar preco nem oferta antes de 30 pessoas unicas concluirem o novo teste ou 7 dias completos de trafego, o que acontecer mais tarde.

Este e o gate minimo para permitir alteracoes a preco/oferta. Nao substitui a validacao comercial alargada de 14/07 a 13/08, que procura 50 testes concluidos e 3 compras Pack reais. O painel `/admin` apresenta os dois marcos separadamente e preserva a contagem do gate desde 12/07, independentemente do intervalo diario selecionado.

Depois dessa amostra:
- se teste -> clique Pack ficar abaixo de 5%, rever apenas mensagem e posicao do CTA;
- se houver cliques Pack mas menos de 60% chegarem a Stripe, corrigir email/checkout antes de mexer no preco;
- se pelo menos 5 pessoas chegarem a Stripe sem qualquer compra, rever confianca, recuperacao e so depois o valor;
- se houver compras, repetir as origens que converteram e manter o preco enquanto a taxa se sustentar.
