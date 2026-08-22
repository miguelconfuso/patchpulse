<div align="center">
  <img src="./docs/assets/patchpulse.png" width="360" alt="PatchPulse" />
  <br />
  <img src="./docs/assets/patchpulse-path.svg" width="620" alt="O caractere A percorrendo uma linha até o caractere B" />
  <p><strong>Pathfinding que você consegue enxergar.</strong></p>
  <p>Desenhe o problema. Rode seis estratégias. Entenda cada decisão.</p>
  <p>
    <a href="https://github.com/miguelconfuso/pathpulse/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/miguelconfuso/pathpulse/ci.yml?branch=main&style=flat-square&label=build" /></a>
    <img alt="Node.js 22+" src="https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-7-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <a href="./LICENSE"><img alt="MIT" src="https://img.shields.io/github/license/miguelconfuso/pathpulse?style=flat-square" /></a>
  </p>
</div>

---

PatchPulse é um laboratório de pathfinding inteiramente no terminal. BFS, DFS, Dijkstra, A*, Greedy Best-First e BFS bidirecional recebem a mesma grade; você acompanha a exploração, a fronteira e a rota final sem tratar o algoritmo como uma caixa-preta.

## A diferença aparece nos números

No cenário determinístico `showcase`, A* encontra a mesma rota de custo `26` que Dijkstra visitando cerca de **71% menos nós**.

| Estratégia | Nós visitados | Passos | Custo | Pico da fronteira |
|---|---:|---:|---:|---:|
| BFS | 252 | 26 | 26 | 15 |
| DFS | 49 | 48 | 48 | 49 |
| Dijkstra | 255 | 26 | 26 | 20 |
| **A\*** | **75** | **26** | **26** | 47 |
| Greedy | 30 | 26 | 26 | 36 |
| Bi-BFS | 232 | 26 | 26 | 30 |

Reproduza localmente com `npm run benchmark`. Menos nós visitados não significa automaticamente menor custo; essa é justamente uma das comparações que o laboratório torna visível.

## Comece em segundos

É necessário Node.js 22 ou superior. O bundle versionado já inclui as dependências da interface.

```bash
git clone https://github.com/miguelconfuso/pathpulse.git
cd pathpulse
npm start
```

No Windows, você também pode abrir `start.cmd` diretamente.

## O laboratório

- Editor de paredes, terreno ponderado, origem e destino.
- Execução animada com pausa, passo manual e seis velocidades.
- Cinco cenários reproduzíveis: `showcase`, `weighted`, `open`, `maze` e `random`.
- Movimentos diagonais seguros, sem atravessar cantos bloqueados.
- Heurísticas Manhattan, Euclidiana e Chebyshev.
- Comparação, teoria e métricas dentro da própria TUI.
- Temas automático, escuro e claro; layout mínimo de 80×24.

## Algoritmos

| Algoritmo | Complexidade | O que demonstra |
|---|---:|---|
| BFS | `O(V + E)` | Menor número de passos em arestas uniformes |
| DFS | `O(V + E)` | Busca profunda; encontra rotas sem garantir a melhor |
| Dijkstra | `O((V + E) log V)` | Menor custo com pesos não negativos |
| A* | Exponencial no pior caso | Dijkstra orientado por uma heurística admissível |
| Greedy Best-First | `O((V + E) log V)` | Velocidade guiada somente por `h(n)`, sem garantia ótima |
| BFS bidirecional | `O(V + E)` | Duas ondas de BFS que se encontram no meio |

`V` representa as células transitáveis; `E`, as conexões válidas entre vizinhos.

## CLI

```bash
# Demonstração automática
npm run demo

# Comparação reproduzível
npm run benchmark

# Cenário e estratégia específicos
node dist/cli.js --demo --algorithm astar --scenario weighted

# Saída adequada para scripts e gráficos
node dist/cli.js --benchmark --scenario maze --json
```

Use `node dist/cli.js --help` para ver todas as opções.

<details>
<summary><strong>Mapa de controles</strong></summary>

| Tecla | Ação |
|---|---|
| Setas ou `WASD` | Move o cursor |
| `Espaço` / `Z` | Pinta uma célula / alterna desenho contínuo |
| `Tab` | Alterna parede, peso, borracha, origem e destino |
| `1`–`6` | Seleciona o algoritmo |
| `Enter` | Inicia a animação |
| `P` / `N` / `R` | Pausa, avança um passo ou reinicia |
| `G` / `M` / `X` / `C` | Alterna cenário, labirinto, aleatório ou campo aberto |
| `I` / `U` | Alterna diagonais ou heurística |
| `+` / `-` | Ajusta a velocidade |
| `H` / `V` / `?` | Abre teoria, comparação ou ajuda |
| `T` / `Q` | Alterna tema ou sai |

</details>

## Arquitetura

```text
src/
├── pathfinding.ts   algoritmos puros, heap e geração de mapas
├── scenarios.ts     cenários determinísticos compartilhados
├── app.tsx          estado, animação e interface Ink
└── cli.tsx          argumentos, benchmark e ciclo do terminal
```

O núcleo não conhece a interface. A mesma função `search()` alimenta a animação, o benchmark e os testes, reduzindo duplicação e mantendo as comparações honestas.

## Desenvolvimento

```bash
npm install
npm run dev
npm run check
```

`npm run check` executa os testes determinísticos, verifica os tipos e produz o bundle final. A integração contínua repete o mesmo fluxo em cada push e pull request.

## Projeto

- [Roteiro de apresentação](docs/PRESENTATION.md)
- [Histórico de versões](CHANGELOG.md)
- [Como contribuir](CONTRIBUTING.md)
- [Política de segurança](SECURITY.md)
- [Revisão de simplicidade](docs/PONYTAIL_REVIEW.md)

## Créditos

A linguagem visual foi inspirada no [Yoinks](https://github.com/pablostanley/yoinks), de Pablo Stanley. A revisão de simplicidade segue princípios do [Ponytail](https://github.com/DietrichGebert/ponytail). Nenhuma marca, componente ou implementação desses projetos foi copiada.

## Licença

[MIT](LICENSE) — use, estude e adapte.
