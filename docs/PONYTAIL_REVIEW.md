# Ponytail review

Revisão realizada com as regras do commit `2ed6c52c9d7e5e56942508591085fd45dea277d3` de [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail).

- `src/pathfinding.ts`: removido o metadado `label`, que não tinha consumidor. Nada o substituiu.
- `src/app.tsx`: removida a cor `danger`, que não era renderizada. Nada a substituiu.
- `src/app.tsx`: corrigida a afirmação de que toda rota reconstruída seria a menor; isso não é garantido pelo DFS.
- `src/app.tsx`: corrigido o gerador determinístico para não produzir números negativos por overflow de 32 bits.
- `tsconfig.json`: verificações de símbolos e parâmetros não usados ativadas.
- `src/app.tsx` (v1.1): removido o campo de tema `dim`, que deixou de ter consumidor após a revisão visual.
- `src/app.tsx` (v1.1.1): painéis principais fixados na mesma altura; botão encurtado sem abstração extra.
- `src/app.tsx` (v1.1.1): comandos inativos removidos do rodapé conforme o estado da execução.
- `src/cli.tsx` (v1.1.1): cursor escondido explicitamente durante a sessão e restaurado em `finally`.
- `src/pathfinding.ts` (v2.0): reconstrução da rota mudou de inserções repetidas no início do array para `push` + `reverse`, reduzindo o custo de `O(L²)` para `O(L)`.
- `src/scenarios.ts` (v2.0): cenários foram extraídos somente após existirem dois consumidores reais — TUI e benchmark CLI.
- `src/app.tsx` (v2.0): resultado inicial do modo demo agora usa inicialização preguiçosa; a busca não é refeita a cada frame da animação.
- `src/app.tsx` (v2.0): dimensões pequenas recebem um aviso simples, evitando renderização quebrada sem introduzir um segundo layout.

Resultado: duas estruturas especulativas removidas, uma extração justificada por uso real, duas otimizações mensuráveis e nenhum finding de segurança ou correção pendente. Lean already. Ship.
