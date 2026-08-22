# Como eu apresentaria o PatchPulse

Eu começaria explicando a dúvida que originou o projeto: dois algoritmos podem encontrar o mesmo caminho e, ainda assim, realizar uma quantidade muito diferente de trabalho.

## Demonstração curta

1. Abra o cenário `showcase` com `npm run demo`.
2. Mostre a fronteira do A* avançando em direção ao objetivo.
3. Pressione `V` e compare os seis resultados na mesma grade.
4. Destaque o Dijkstra com 255 células visitadas e o A* com 75. Os dois chegam ao custo 26.
5. Abra o cenário `weighted` e compare BFS com Dijkstra. Esse exemplo separa quantidade de passos e custo acumulado.
6. Pause a execução e avance uma etapa por vez para mostrar que a ordem de exploração também faz parte do resultado.

## O que vale explicar no código

O motor de busca não conhece a interface. A função `search()` devolve todos os dados usados pela animação, pelo benchmark e pelos testes.

Dijkstra, A* e Greedy usam um min-heap binário. A reconstrução do caminho percorre os pais uma vez e depois inverte o array, com custo `O(L)`. Nos movimentos diagonais, as duas células laterais são verificadas para impedir que o caminho atravesse uma quina bloqueada.

## Perguntas que eu me prepararia para responder

**Por que o DFS visita poucas células no cenário principal e ainda produz uma rota pior?**

Porque ele aprofunda uma escolha antes de considerar alternativas. A quantidade visitada pode ser pequena sem que o caminho seja curto.

**Por que o Greedy não substitui o A*?**

O Greedy considera apenas a estimativa até o destino. O A* combina essa estimativa com o custo que já foi percorrido.

**Como eu sei que a comparação é confiável?**

Os cenários são determinísticos e todas as estratégias recebem a mesma grade. Os testes também comparam algoritmos que devem concordar sobre o custo ou a quantidade de passos em centenas de grades geradas por sementes fixas.

## Comandos de apoio

```bash
node dist/cli.js --benchmark --scenario showcase
node dist/cli.js --demo --algorithm astar --scenario weighted
npm test
```
