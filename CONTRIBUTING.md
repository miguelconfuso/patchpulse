# Contribuindo com o PatchPulse

Obrigado por dedicar tempo ao projeto. Mudanças pequenas, explicáveis e testadas são as mais fáceis de revisar.

## Ambiente

- Node.js 22 ou superior.
- npm incluído na instalação do Node.js.

```bash
git clone https://github.com/miguelconfuso/pathpulse.git
cd pathpulse
npm install
npm run check
```

## Fluxo

1. Abra uma issue para mudanças de comportamento relevantes.
2. Crie uma branch curta a partir de `main`.
3. Faça uma alteração por pull request.
4. Adicione ou atualize testes quando o comportamento mudar.
5. Execute `npm run check` antes de enviar.

Mudanças em algoritmos devem explicar a garantia esperada e incluir um caso determinístico. Mudanças visuais devem continuar utilizáveis em terminais de 80×24.

## Pull requests

Descreva o problema, a solução e como a alteração foi verificada. Imagens ajudam em mudanças visuais; números reproduzíveis ajudam em mudanças de desempenho.
