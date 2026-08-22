<div align="center">
  <img src="./docs/assets/patchpulse.png" width="360" alt="PatchPulse" />
  <br />
  <img src="./docs/assets/patchpulse-path.svg" width="620" alt="Uma busca saindo de A e chegando até B" />
  <p><strong>Um laboratório de pathfinding feito para rodar no terminal.</strong></p>
  <p><a href="./README.md">Read in English</a></p>
</div>

Eu comecei o PatchPulse enquanto estudava algoritmos de busca. Ler que o A* usa uma heurística ou que o Dijkstra encontra o menor custo ajudava, mas eu ainda queria enxergar o que cada algoritmo fazia antes de chegar na resposta.

Foi daí que veio a ideia de montar um tabuleiro editável no terminal. Nele eu consigo desenhar paredes, colocar terrenos com peso e acompanhar a fronteira crescendo célula por célula. O programa não mostra apenas o caminho final. Ele mostra o raciocínio da busca.

## O experimento que melhor explica o projeto

No cenário `showcase`, o Dijkstra e o A* encontram uma rota de custo 26. A diferença é que o Dijkstra visita 255 células e o A* visita 75. Nesse caso, a heurística reduz a exploração em aproximadamente 71%.

Isso não significa que visitar menos células sempre produz a melhor resposta. O Greedy visita apenas 30, mas não tem a mesma garantia de caminho ótimo. O DFS visita 49 e encontra uma rota de 48 passos, quase o dobro da rota encontrada por BFS, Dijkstra e A*.

Você pode reproduzir todos os valores:

```bash
npm run benchmark
```

## Como abrir

O projeto precisa do Node.js 22 ou mais recente.

```bash
git clone https://github.com/miguelconfuso/patchpulse.git
cd patchpulse
npm ci
npm run build
npm start
```

Depois da instalação local, também dá para registrar o comando no sistema:

```bash
npm install -g .
patchpulse
```

No Windows, o arquivo `start.cmd` serve como atalho.

## O que dá para testar

O PatchPulse possui BFS, DFS, Dijkstra, A*, Greedy Best-First e BFS Bidirecional. Existem cenários prontos, mas o mais interessante é alterar o tabuleiro e observar quando o comportamento muda.

Algumas possibilidades:

* comparar caminho curto com caminho barato usando terrenos de peso 7;
* ligar o movimento diagonal e trocar entre Manhattan, Euclidiana e Chebyshev;
* pausar a animação e avançar uma etapa por vez;
* abrir a tela de comparação para ver custo, células visitadas e maior tamanho da fronteira;
* gerar um labirinto ou uma grade aleatória.

Os controles principais são `WASD` ou setas para mover, `Space` para desenhar, `Tab` para trocar a ferramenta, números de `1` a `6` para escolher a busca e `Enter` para executar. A tecla `?` mostra o mapa completo dentro do programa.

## Decisões técnicas

Eu separei os algoritmos da interface porque queria que a animação e os testes usassem a mesma implementação. A função `search()`, em `src/pathfinding.ts`, recebe a grade e devolve a ordem de visita, o caminho, o custo e o maior tamanho da fronteira.

As buscas com prioridade usam um min-heap binário. O movimento diagonal não permite atravessar o canto de paredes. Os cenários prontos são determinísticos, então um benchmark pode ser repetido sem mudar os números.

Os testes incluem exemplos pequenos e grades aleatórias geradas por sementes fixas. Nessas grades, A* é comparado com Dijkstra e BFS Bidirecional é comparado com BFS. Isso me ajudou a encontrar situações que eu provavelmente não teria desenhado manualmente.

## O que eu aprendi fazendo

Este projeto foi uma forma de transformar um assunto abstrato em algo que eu conseguia manipular. A maior lição foi perceber que visualização também precisa de correção. Se a interface mistura ordem de visita, caminho e custo, ela pode parecer bonita e ainda ensinar a coisa errada.

Também aprendi a criar uma CLI, organizar código TypeScript, escrever testes reproduzíveis e medir resultados em vez de depender somente da impressão visual.

Para verificar o projeto:

```bash
npm test
npm run typecheck
npm run build
```

O PatchPulse é distribuído sob a licença [MIT](LICENSE).
