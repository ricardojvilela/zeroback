# Publicar o Remover Fundo em Lote online

Esta versão pode ser publicada como site estático para teste. As imagens são processadas no navegador do utilizador e não são enviadas para um servidor próprio.

## Opção recomendada para teste: Vercel

1. Criar conta em https://vercel.com.
2. Criar um novo projeto.
3. Fazer upload desta pasta ou ligar a um repositório GitHub.
4. Configurações:
   - Framework Preset: Other
   - Build Command: vazio ou `npm run build`
   - Output Directory: `.`
5. Publicar.

Depois da publicação, a Vercel gera um link público para testes.

## Alternativa simples: Netlify

1. Criar conta em https://netlify.com.
2. Ir a Add new site.
3. Usar Deploy manually.
4. Arrastar esta pasta para a zona de upload.

## Antes de transformar em ferramenta paga

A versão atual é boa para validar interesse, mas não é suficiente para cobrar com controlo real de acesso.

Para uma versão paga será necessário adicionar:

- contas de utilizador;
- login;
- planos ou créditos;
- pagamento, por exemplo Stripe;
- limite de imagens por plano;
- painel de administração;
- termos de uso e política de privacidade;
- backend/API para validar permissões antes de processar.

## Decisão técnica importante

Existem duas formas de evoluir:

1. Processamento no navegador
   - Mais barato de operar.
   - Melhor para privacidade, porque as imagens ficam no dispositivo do utilizador.
   - Mais difícil de proteger como produto pago.

2. Processamento no servidor
   - Melhor controlo para planos pagos, limites e histórico.
   - Custa mais, porque o servidor faz o trabalho pesado.
   - Exige armazenamento temporário seguro e políticas claras sobre imagens.

Para teste público inicial, manter processamento no navegador é suficiente.

