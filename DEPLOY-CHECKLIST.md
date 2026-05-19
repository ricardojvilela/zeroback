# Checklist antes de publicar

## Vercel

1. Criar conta em https://vercel.com.
2. Criar novo projeto.
3. Fazer upload da pasta ou ligar a um repositório GitHub.
4. Usar:
   - Framework Preset: Other
   - Build Command: vazio ou `npm run build`
   - Output Directory: `.`
5. Publicar.
6. Abrir o link gerado em janela anónima.
7. Testar upload, remoção, ZIP e troca de idioma.

## Netlify

1. Criar conta em https://netlify.com.
2. Ir a Add new site.
3. Escolher Deploy manually.
4. Arrastar a pasta do projeto para o upload.
5. Abrir o link gerado e testar.

## Ficheiros necessários no deploy

- `index.html`
- `styles.css`
- `script.js`
- `favicon.svg`
- `privacidade.html`
- `package.json`
- `vercel.json`

Os ficheiros `abrir-ferramenta.bat` e `servidor-ferramenta.ps1` são apenas para uso local.

