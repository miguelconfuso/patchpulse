<div align="center">
  <img src="./docs/assets/patchpulse.png" width="360" alt="PatchPulse" />
  <br />
  <img src="./docs/assets/patchpulse-path.svg" width="620" alt="O caractere A percorrendo uma linha até o caractere B" />
  <p><strong>Pathfinding que você consegue enxergar.</strong></p>
  <p>Desenhe o problema. Rode seis estratégias. Entenda cada decisão.</p>
  <p><a href="./README.md">English</a> · <strong>Português</strong></p>
</div>

---

PatchPulse é um laboratório interativo de pathfinding inteiramente no terminal. BFS, DFS, Dijkstra, A*, Greedy Best-First e BFS bidirecional recebem a mesma grade; você acompanha os nós explorados, a fronteira e a rota final sem tratar os algoritmos como caixas-pretas.

## A diferença aparece nos números

No cenário determinístico `showcase`, A* encontra a mesma rota de custo `26` que Dijkstra visitando cerca de **71% menos nós**.

| Estratégia | Nós visitados | Passos | Custo | Pico da fronteira |
|---|---:|---:|---:|---:|
| BFS | 252 | 26 | 26 | 15 |
| DFS | 49 | 48 | 48 | 49 |
| Dijkstra | 255 | 26 | 26 | 20 |
| **A\*** | **75** | **26** | **26** | 47 |
| Greedy | 30 | 26 | 26 | 36 |
| Bi-BFS | 237 | 26 | 26 | 28 |

Reproduza a comparação com `npm run benchmark`. Visitar menos nós não significa automaticamente encontrar a rota de menor custo; essa é justamente uma das diferenças que o laboratório torna visível.

## Início rápido

É necessário Node.js 22 ou superior.

```bash
git clone https://github.com/miguelconfuso/patchpulse.git
cd patchpulse
npm ci
npm run build
npm start
```

No Windows, você também pode abrir `start.cmd`. Depois da publicação no npm, será possível executar sem clonar:

```bash
npx patchpulse-tui
```

## O laboratório

- Editor de paredes, terreno ponderado, origem e destino.
- Execução animada com pausa, passo manual e seis velocidades.
- Cinco cenários: `showcase`, `weighted`, `open`, `maze` e `random`.
- Movimentos diagonais seguros, sem atravessar cantos bloqueados.
- Heurísticas Manhattan, Euclidiana e Chebyshev.
- Teoria, comparação e métricas dentro da própria TUI.
- Temas automático, escuro e claro; layout mínimo de 80×24.

## Algoritmos

| Algoritmo | Tempo no pior caso | O que demonstra |
|---|---:|---|
| BFS | `O(V + E)` | Menor número de arestas em grafos sem peso |
| DFS | `O(V + E)` | Busca profunda sem garantia de otimalidade |
| Dijkstra | `O((V + E) log V)` | Menor custo com pesos não negativos |
| A* | `O((V + E) log V)` | Dijkstra guiado por uma heurística admissível |
| Greedy Best-First | `O((V + E) log V)` | Velocidade guiada ao destino sem garantia ótima |
| BFS bidirecional | `O(V + E)` | Duas ondas de BFS que se encontram no caminho |

`V` representa as células transitáveis; `E`, as conexões válidas entre vizinhos. Em uma grade, `E = O(V)`.

## CLI

```bash
npm run demo
npm run benchmark
node dist/cli.js --demo --algorithm astar --scenario weighted
node dist/cli.js --benchmark --scenario maze --json
```

Use `node dist/cli.js --help` para ver todas as opções e consulte o [README em inglês](README.md) para o mapa completo de controles, arquitetura e documentação do projeto.

## Verificações de engenharia

```bash
npm ci
npm run check
```

O comando executa exemplos focados e testes de propriedades com seed fixa, verifica os tipos e produz o bundle final. A suíte compara A* com Dijkstra e BFS bidirecional com BFS em 500 grades reproduzíveis. A CI repete a instalação travada e as mesmas verificações em cada push e pull request.

## Documentos do projeto

- [Roteiro de apresentação](docs/PRESENTATION.md)
- [Processo de release](docs/RELEASING.md)
- [Histórico de versões](CHANGELOG.md)
- [Como contribuir](CONTRIBUTING.md)
- [Política de segurança](SECURITY.md)

## Licença

[MIT](LICENSE) — use, estude e adapte.
