# 📋 Relatório de Análise — Simulador de Termodinâmica 3D

> Data: agosto/2026 · Pasta analisada: raiz do projeto

## 1. Visão geral da pasta

| Item | Tipo | Descrição |
|---|---|---|
| `Prompt.txt` | Documento | Especificação original do projeto (HTML + CSS + JS + Three.js, 4 leis da termodinâmica, UI didática, dark/light, responsivo) |
| `simulador-termodinamica-v1/` | Código | Versão 1 — 3 arquivos: `index.html` (210 linhas), `script.js` (1.832 linhas), `style.css` (956 linhas) |
| `simulador-termodinamica-v2/` | Código | Versão 2 — 6 arquivos: `index.html`, `script.js` (2.561 linhas), `style.css` (1.405), `charts.js` (433), `formula-demos.js` (303), `misconceptions.js` (319) |
| `.freebuff/` | — | Interno do ambiente (ignorado) |

**Não há repositório Git** na pasta (nenhum `.git`). Isso precisa ser resolvido antes de publicar (ver `PLANO.md`).

## 2. O que o simulador faz

Aplicação web 100% cliente (sem backend) que ensina as **4 leis da termodinâmica** com cena 3D interativa (Three.js):

- **v1 (3 módulos base + extras):** Lei Zero (equilíbrio térmico, 3 blocos), 1ª Lei (pistão/cilindro, ΔU = Q − W), 2ª Lei (entropia e difusão de partículas), 3ª Lei (aproximação ao zero absoluto).
- **v2 (superset do v1):** adiciona 2 módulos — **Conceitos & Ciclos** (grandezas e processos, entalpia) e **Mitos & Conceitos** (carrossel de 10 desmistificações com analogias e SVGs) — além de:
  - gráficos em tempo real (canvas puro, sem dependências) — `charts.js`;
  - demonstrador interativo de fórmulas (clique nos termos) — `formula-demos.js`;
  - aba "Fórmulas & Porquês" em cada módulo;
  - painel de gráficos com botão minimizar.

Recursos comuns: tema claro/escuro, tutorial inicial, play/pause, reset, velocidade 0,1×–2×, métricas em tempo real (T, U, Q, W, S, pressão, volume), legenda de temperatura, painel didático com abas (Explicação / Aplicações / Fórmulas), exemplos cotidianos e aplicações em engenharia, valores em Kelvin coerentes.

## 3. Comparativo v1 × v2

| Critério | v1 | v2 |
|---|---|---|
| Arquivos | 3 | 6 |
| Linhas de código | ~3.000 | ~5.266 |
| Módulos didáticos | 4 leis | 4 leis + 2 extras |
| Gráficos em tempo real | ❌ | ✅ |
| Fórmulas interativas | ❌ | ✅ |
| Carrossel de mitos | ❌ | ✅ |
| Aba "Fórmulas & Porquês" | ❌ | ✅ |

**Conclusão: o v2 é a versão oficial** — é um superconjunto do v1, com conteúdo e funcionalidades que o v1 não tem. **Recomenda-se publicar o v2** e manter o v1 apenas como histórico (ou removê-lo do repositório).

## 4. Qualidade do código

**Pontos fortes**
- Estrutura modular em classes por lei (`Law0Module`…`Law5Module`), com ciclo de vida `init/update/unload/reset`.
- Física simplificada mas coerente, com sinalização didática; zero dependências além do Three.js.
- UI premium: glassmorphism, tema escuro/claro, responsiva (sidebar vira abas no mobile), acessibilidade básica (aria-labels, contraste).
- Comentários curtos e úteis; sem lixo de código.

**Problemas encontrados (e tratados)**
1. **Bug ativo no v2:** `FormulaDemosManager.updateLiveCalculations()` quebrava a cada frame (`TypeError: Cannot read properties of null`) porque `init()` só roda ao abrir a aba "Fórmulas". **Corrigido** com guard em `formula-demos.js` (v2 e na cópia de release).
2. **Dependência de CDN:** Three.js, OrbitControls e Google Fonts vinham da internet → app **não funcionava offline** (crítico em sala de aula sem rede). **Corrigido** criando a pasta `publicacao/app/` com tudo vendored localmente (Three.js r128, OrbitControls e 16 arquivos de fonte woff2).
3. **Tipografia:** "Benvindo" → "Bem-vindo" (corrigido na cópia de release).
4. **Sem licença** (adicionada MIT), sem README, sem documentação para professores.

**Riscos menores (não bloqueantes)**
- Three.js r128 (2021) — funciona bem, mas atualizar para versão recente (ESM) é uma modernização possível no futuro.
- Sem testes automatizados — aceitável para um simulador educacional, mas vale adicionar smoke tests se houver evolução contínua.
- `localStorage` usado para lembrar o tutorial — ok.

## 5. Requisitos e ambiente

- Node.js ≥ 18 (build Electron), navegador moderno para a versão web (WebGL).
- A versão web abre direto no navegador (ou via `python -m http.server`); a versão desktop é um app Electron (Windows x64).
- Windows 10/11 x64 para o instalador `.exe` gerado (NSIS).

## 6. O que foi entregue nesta rodada

| Entregável | Local |
|---|---|
| Versão web offline (vendored) | `publicacao/app/` |
| Wrapper desktop (Electron) | `publicacao/electron/` (`main.js`, `package.json`, `capture.js`, `gen_icon.py`) |
| **Instalador Windows** | `publicacao/dist/Termodinamica3D-1.0.0-x64.exe` (NSIS, ~80 MB) |
| **Versão portátil** | `publicacao/dist/Termodinamica3D-1.0.0-portable.exe` (~77 MB) |
| Ícone do app | `publicacao/electron/build/icon.png` e `icon.ico` |
| Screenshots (7 capturas desktop) | `screenshots/` |
| Licença MIT | `LICENSE` |
| Plano de publicação | `PLANO.md` |
| Este relatório | `RELATORIO.md` |

**Nota sobre o tamanho (~80 MB):** é o peso típico de um app Electron (embute Chromium). Para apps menores, alternativas futuras: Neutralino (~5 MB) ou Tauri (~10 MB) — ver seção 8 do `PLANO.md`.
