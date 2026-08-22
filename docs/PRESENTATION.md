# Roteiro de apresentação — PatchPulse

## Pitch de 30 segundos

O PatchPulse transforma seis algoritmos de busca em uma experiência observável. O mesmo mapa pode ser editado, reproduzido e medido no terminal, permitindo comparar quantidade de nós visitados, tamanho da rota, custo e memória de fronteira sem tratar o algoritmo como uma caixa-preta.

## Demo de 5 minutos

1. Execute `npm run demo` e apresente a animação do A* no cenário `showcase`.
2. Pressione `V`: compare os seis algoritmos sobre a mesma entrada.
3. Pressione `G` até `weighted`, escolha BFS (`1`) e execute. Depois escolha Dijkstra (`3`) e mostre por que passos e custo não são a mesma coisa.
4. Escolha Greedy (`5`) para explicar `h(n)`, depois A* (`4`) para explicar `f(n) = g(n) + h(n)`.
5. Escolha Bi-BFS (`6`) no cenário `open` e compare a onda dupla com BFS.
6. Pressione `H` para fechar com as complexidades.

## Demo sem interação

```bash
node dist/cli.js --demo --algorithm astar --scenario weighted
node dist/cli.js --benchmark --scenario showcase
node dist/cli.js --benchmark --scenario weighted --json
```

## Pontos técnicos

- Núcleo puro e separado da renderização.
- Heap binário para Dijkstra, A* e Greedy.
- Reconstrução de caminho em `O(L)`.
- Heurísticas admissíveis com e sem diagonais.
- Movimento diagonal impede atravessar o canto de paredes.
- Bundle portátil e CI com testes, tipos e build.

## Perguntas comuns

**Por que BFS e Dijkstra dão rotas diferentes?** BFS minimiza arestas; Dijkstra minimiza custo acumulado.

**A* sempre é melhor?** Não. A qualidade depende da heurística; no pior caso ele pode se aproximar de Dijkstra.

**Greedy é ótimo?** Não. Ele ignora o custo já pago e pode escolher uma rota cara.

**Por que Bi-BFS ajuda?** Duas buscas de profundidade aproximada `d/2` costumam expandir muito menos estados que uma busca de profundidade `d`.
