<div align="center">
  <img src="./docs/assets/patchpulse.png" width="360" alt="PatchPulse" />
  <br />
  <img src="./docs/assets/patchpulse-path.svg" width="620" alt="O caractere A percorrendo uma linha até o caractere B" />
</div>

Desenhe paredes, adicione terrenos ponderados e observe seis estratégias explorarem exatamente o mesmo problema, passo a passo. O PatchPulse transforma estruturas de dados, heurísticas e métricas de desempenho em uma experiência visual — sem esconder o algoritmo em uma caixa-preta.

O visual é inspirado na linguagem de interface do [Yoinks](https://github.com/pablostanley/yoinks), de Pablo Stanley: composição central, paleta monocromática com acentos vibrantes, painéis finos e atalhos sempre visíveis. A marca, o logo e os componentes do Yoinks não foram copiados; esta interface foi implementada de forma independente.

## Destaques para apresentação

- Seis estratégias executadas pelo mesmo motor, do BFS clássico ao BFS bidirecional.
- Editor interativo com paredes, terrenos ponderados, origem, destino e diagonais seguras.
- Cinco cenários: showcase, pesos, campo aberto, labirinto e mapa aleatório.
- Execução animada com pausa, passo manual, velocidade variável e métricas ao vivo.
- Telas de teoria, ajuda e comparação lado a lado no próprio terminal.
- Benchmark humano ou JSON, ideal para demonstrações reproduzíveis e CI.
- Três temas, inicializador sem instalação e interface adaptada a terminais de 80×24.

## Abrir sem `npm start`

No Windows, extraia o projeto e dê dois cliques em `start.cmd` — ou execute no terminal:

```powershell
.\start.cmd
```

O pacote entregue já contém `dist/cli.js`, incluindo as dependências da interface. É preciso apenas Node.js 22 ou superior. Dentro do Codex, o inicializador também detecta automaticamente o runtime incluído no aplicativo.

Para desenvolvimento normal:

```bash
npm install
npm run dev
```

Para produzir e abrir a versão final:

```bash
npm run build
npm start
```

Modo de apresentação e benchmark reproduzível:

```bash
npm run demo
npm run benchmark
node dist/cli.js --demo --algorithm greedy --scenario weighted
node dist/cli.js --benchmark --scenario maze --json
```

## Controles

| Tecla | Ação |
|---|---|
| Setas ou `WASD` | Move o cursor |
| `Espaço` | Aplica a ferramenta na célula |
| `Z` | Liga/desliga o desenho contínuo |
| `Tab` | Alterna parede, peso ×7, borracha, origem e destino |
| `1`–`6` | Escolhe BFS, DFS, Dijkstra, A*, Greedy ou Bi-BFS |
| `Enter` | Inicia a animação |
| `P` / `N` / `R` | Pausa, avança um passo ou reinicia a execução |
| `G` | Alterna showcase, weighted, open, maze e random |
| `M` / `X` / `C` | Gera labirinto, mapa aleatório ou limpa o mapa |
| `I` | Liga movimentos diagonais sem atravessar cantos |
| `U` | Alterna Manhattan, Euclidiana e Chebyshev |
| `+` / `-` | Ajusta a velocidade |
| `H` / `V` / `?` | Abre teoria, comparação e ajuda |
| `T` | Alterna tema automático, escuro e claro |
| `Q` | Sai e restaura o terminal |

## O que cada algoritmo demonstra

| Algoritmo | Tempo | Espaço | Garantia |
|---|---:|---:|---|
| BFS | `O(V + E)` | `O(V)` | Menor número de passos quando as arestas têm o mesmo custo |
| DFS | `O(V + E)` | `O(V)` | Encontra uma rota, mas não garante a melhor |
| Dijkstra | `O((V + E) log V)` | `O(V)` | Menor custo total com pesos não negativos |
| A* | Depende da heurística; exponencial no pior caso | `O(V)` | Mesmo custo ótimo de Dijkstra quando `h` é admissível |
| Greedy Best-First | `O((V + E) log V)` | `O(V)` | Prioriza velocidade; não garante a melhor rota |
| BFS bidirecional | `O(V + E)` | `O(V)` | Menor número de passos em arestas uniformes |

`V` é o número de células transitáveis; `E`, o número de conexões válidas entre vizinhos.

BFS usa uma fila e expande o mapa em camadas. Isso minimiza passos, não custo: atravessar uma célula `7` ainda conta como um passo. Dijkstra usa uma fila de prioridade e sempre expande o menor custo acumulado `g(n)`, por isso pode preferir uma rota mais longa que contorne pesos.

A* usa `f(n) = g(n) + h(n)`. A heurística estima a distância restante e direciona a busca ao destino. Manhattan é usada em quatro direções; com diagonais ela se transforma em distância octil para continuar admissível. Euclidiana e Chebyshev permitem comparar estimativas mais ou menos informadas.

Greedy usa somente `h(n)`: costuma visitar poucos nós, mas pode cair em armadilhas. Bi-BFS cria duas ondas, uma de cada ponta, e normalmente reduz a profundidade efetiva da busca.

## Arquitetura

- `src/pathfinding.ts`: algoritmos puros, heap binário, heurísticas, labirinto e geração de mapas.
- `src/scenarios.ts`: catálogo reproduzível de cenários para demonstração e benchmark.
- `src/app.tsx`: estado do laboratório, animação, temas, telas didáticas e renderização Ink.
- `src/cli.tsx`: argumentos, tela alternativa e restauração segura do cursor.
- `test/pathfinding.test.ts`: testes determinísticos de correção e conectividade.

O núcleo não depende da interface, então pode ser importado em testes, benchmarks ou outra UI. Para apresentar o projeto, veja [`docs/PRESENTATION.md`](docs/PRESENTATION.md); o histórico está em [`CHANGELOG.md`](CHANGELOG.md).

## Qualidade

```bash
npm test
npm run typecheck
npm run build
```

O código também passou por uma revisão de simplicidade baseada no [Ponytail](https://github.com/DietrichGebert/ponytail). O registro está em [`docs/PONYTAIL_REVIEW.md`](docs/PONYTAIL_REVIEW.md).

## Licença

MIT. Veja [`LICENSE`](LICENSE).
