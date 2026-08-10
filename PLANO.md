# 🚀 Plano de Publicação — TermoLab 3D (ferramenta educacional)

> **Nome do repositório escolhido:** `termolab-3d` (curto, memorável e remete a "laboratório de termodinâmica 3D").

## Objetivo
Disponibilizar o simulador como **ferramenta educacional de código aberto (MIT)** para alunos e professores, com **versão desktop instalável (Windows)** e **versão web gratuita**, documentação e imagens.

## Status atual
- ✅ Versão offline pronta (`publicacao/app/` — funciona sem internet)
- ✅ Instalador Windows (`publicacao/dist/Termodinamica3D-1.0.0-x64.exe`)
- ✅ Versão portátil (`publicacao/dist/Termodinamica3D-1.0.0-portable.exe`)
- ✅ Licença MIT (`LICENSE`)
- ✅ Screenshots (`screenshots/`)
- ✅ README com imagens

---

## 1. Pré-requisitos antes de publicar (pendências suas)

1. ✅ **Autor definido:** `LICENSE` e `package.json` — **Efraim Almeida Fernandes**.
2. **Criar o repositório Git:** a pasta ainda não tem `.git`. Criar no GitHub com o nome **`termolab-3d`** e adicionar esta pasta como raiz.
3. **Escolher o nome de usuário/organização** no GitHub (afeta as URLs abaixo).

## 2. Estrutura recomendada do repositório

```
termolab-3d/
├── README.md                 ← vitrine do projeto (já criado)
├── LICENSE                   ← MIT (já criado)
├── RELATORIO.md              ← este relatório
├── PLANO.md                  ← este plano
├── screenshots/              ← imagens para README e Releases
├── simulador-termodinamica-v2/  ← fonte (manter como src/)
└── publicacao/
    ├── app/                  ← build web offline (vendored)
    ├── electron/             ← wrapper desktop (fonte do instalador)
    └── dist/                 ← instaladores .exe (não versionar; publicar em Releases)
```

> `publicacao/dist/` (80 MB de binários) **não deve** ir para o Git — publique os `.exe` como **GitHub Release** (ver §5). Adicione `publicacao/dist/` e `publicacao/electron/node_modules/` ao `.gitignore`.

## 3. Lançamento em 4 fases

### Fase A — Fundação (1–2 dias)
1. Criar repositório GitHub (público) + `.gitignore` + commit inicial.
2. ✅ Autor já ajustado (Efraim Almeida Fernandes).
3. Definir versão 1.0.0 (ou 0.1.0-beta para feedback antecipado).

### Fase B — Publicação web (grátis, 1 dia)
1. **GitHub Pages** (recomendado): publicar `publicacao/app/` em `https://<usuario>.github.io/termolab-3d/`.
   - Ou **Netlify/Vercel**: arrastar a pasta `publicacao/app/` — zero configuração.
2. Testar em: Windows, macOS, celular (a versão web é responsiva).

### Fase C — Publicação desktop (1 dia)
1. Criar **GitHub Release v1.0.0** e anexar:
   - `Termodinamica3D-1.0.0-x64.exe` (instalador)
   - `Termodinamica3D-1.0.0-portable.exe` (versão portátil, sem instalação)
   - `screenshots/*.png`
2. (Opcional) **itch.io** — muito usado por educadores: criar página gratuita com o instalador.

### Fase D — Divulgação e material didático (2–3 dias)
1. Escrever **Guia do Professor** (`docs/guia-do-professor.md`): sugestões de aula por lei, atividades com o simulador, questões para discussão.
2. **Atividades prontas** (`docs/atividades/`): roteiros imprimíveis (ex.: "Explore a 1ª Lei variando Q e W").
3. Compartilhar em comunidades: grupos de professores de física (Facebook/Telegram), repositórios de recursos educacionais abertos (REA), e-mail para escolas.

## 4. Modelo de README para publicação

O `README.md` já criado inclui: descrição, capturas de tela (7 imagens), recursos, como usar (web + desktop), requisitos, licença MIT, e instruções de build. Ajuste apenas nome/links após criar o repositório.

## 5. Como fazer o build do instalador (para você mesmo regenerar)

```bash
# 1. Entrar na pasta do wrapper
cd publicacao/electron

# 2. Instalar dependências (primeira vez)
npm install

# 3. Gerar os instaladores
npm run dist        # cria NSIS (.exe instalável) + portable em publicacao/dist/
```

Requisitos: Node.js ≥ 18, Windows (para build Windows) ou Wine.

## 6. Licenciamento (MIT)

- O projeto todo é MIT (`LICENSE`).
- Dependências embutidas no build: **Three.js r128** e **OrbitControls** são MIT; as **fontes Google** (Outfit, Space Mono) são OFL 1.1 — ambas permitem redistribuição. Atribuição: Three.js já traz seu cabeçalho de licença no `three.min.js`; as fontes estão com o `fonts.css` original. Nada adicional é exigido além da licença MIT do projeto.
- **Importante:** se você usou IA para gerar o código, revise o conteúdo didático antes de publicar (ver §7).

## 7. Checklist de qualidade educacional (revisar antes do lançamento)

- [ ] Revisar textos didáticos (as descrições foram geradas por IA — conferir conceitos, sobretudo os 10 "mitos" e as unidades).
- [ ] Testar os 6 módulos em navegador e no app desktop.
- [ ] Conferir que o app funciona **sem internet** (abrir o exe com rede desligada).
- [ ] Testar em tela pequena (celular) — layout responsivo.
- [ ] Adicionar favoritos/links de referência (ex.: livros de Física, simuladores PhET) no Guia do Professor.

## 8. Evoluções futuras (backlog)

| Ideia | Esforço | Impacto |
|---|---|---|
| Versão em inglês (i18n) | Médio | Alcança mais escolas |
| PWA (instalável no celular via navegador) | Baixo | Fácil acesso em sala |
| Trocar Electron por Neutralino/Tauri (app ~10 MB) | Alto | Downloads bem menores |
| Modo "prova/quiz" com placar | Médio | Gamificação |
| Exportar dados das simulações (CSV) | Baixo | Análise em aula |
| Suporte offline total já feito; testes automatizados | Baixo | Qualidade |
| Traduzir para outros idiomas além de EN | Médio | — |

## 9. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Windows SmartScreen alerta "editor desconhecido" | Normal em apps sem assinatura digital; orientar usuários em "Mais informações → Executar assim mesmo". Assinatura EV (~US$ 200/ano) é opcional futura. |
| App de 80 MB assustar professores | Oferecer também a versão web (1 clique, sem download) e a portátil. |
| Conteúdo didático com erro conceitual | Revisão por professor de física antes do lançamento público. |
| Escola com rede bloqueando GitHub | Disponibilizar o instalador também via link direto/Google Drive. |
