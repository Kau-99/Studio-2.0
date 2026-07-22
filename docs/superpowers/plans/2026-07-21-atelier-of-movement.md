# Atelier of Movement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar o site do Estúdio Thaisa Vieira de "template premium genérico" para uma experiência editorial-cinematográfica, sem framework, sem build step e sem regredir performance ou acessibilidade.

**Architecture:** Extensão em camadas sobre a base v2.0. Dois arquivos CSS novos (`atmosphere.css` para textura e fundos de palco, `motion.css` para variantes de revelação) importados por `main.css`. Um loop `requestAnimationFrame` único em `utils/raf.js` passa a ser o dono exclusivo do scroll — os três listeners crus de hoje migram para ele. Lenis é carregado como enriquecimento opcional que alimenta esse mesmo loop. Nenhum token existente é renomeado; nenhuma classe existente é removida.

**Tech Stack:** HTML5, CSS3 (custom properties, `clip-path`, `mix-blend-mode`, `animation-timeline` onde suportado), JavaScript ES Modules vanilla, Lenis 1.x via CDN, Node 18+ apenas para os scripts de verificação.

## Global Constraints

- Branch: `redesign/atelier-of-movement`. Nunca commitar em `main`.
- Sem framework, sem bundler, sem build step. Lenis é a **única** dependência externa permitida.
- Nenhum token de `:root` existente pode ser renomeado ou removido — apenas estendido.
- Só `transform`, `opacity`, `clip-path` e `filter` são animados.
- Todo movimento novo respeita `prefers-reduced-motion: reduce` com estado final estático visível.
- O site permanece legível e navegável sob `.no-js` e com o CDN do Lenis bloqueado.
- Valor repetido vira token em `:root`. Zero valor mágico.
- Fases 1, 3 e 5 se aplicam às 9 páginas (`index.html`, `404.html` + 7 em `pages/`).
- `--color-gilt` só pode ser **cor de texto** sobre fundo escuro. Em fundo claro: `--color-gilt-line` (fio) ou `--color-gilt-ink` (texto).
- Ambos os scripts de `scripts/` devem sair com código 0 ao fim de cada fase.
- **Verificação em navegador é obrigatória, não opcional.** Os scripts são checagens estáticas e não detectam erro de runtime. O bug mais grave desta execução — `header.js` e `scroll-progress.js` mortos no site inteiro por um argumento trocado — passou por `check-invariants` limpo e só apareceu quando alguém abriu um navegador. Chrome real não está instalado e não pode ser; use o Chromium em cache dirigido pelo pacote `playwright` do npx, contra o servidor local. **Raciocínio não substitui observação** — foi raciocínio que produziu aquele bug.
- **Meça overflow horizontal DEPOIS de revelar as animações.** Elementos com `data-animate="fade-right"` ficam deslocados no eixo X enquanto não revelam, e `scrollWidth` os conta — dá falso positivo. Percorra a página inteira, espere as revelações e só então meça. O critério que importa é o usuário conseguir ou não rolar horizontalmente (`documentElement.scrollLeft` permanecer 0), não o `scrollWidth` transitório.

---

## Nota sobre verificação

Este projeto **não tem test runner** e não vai ganhar um — adicionar Jest/Vitest a um site estático sem build step contraria as restrições. A verificação é feita por três mecanismos, todos reais e executáveis:

1. **`node scripts/check-contrast.mjs`** — calcula contraste WCAG lendo os tokens direto de `base.css`. Falha o build se um par reprovar.
2. **`node scripts/check-invariants.mjs`** — guardas estruturais nas 9 páginas (fonte fora do `@import`, zero listener de scroll cru, dourado nunca como texto em fundo claro).
3. **Verificação em navegador** — servidor local (`npx --yes serve@14 -l 8080 .`) com checagens manuais roteirizadas em cada task.

Onde este plano diz "rode e veja falhar", o ciclo é o mesmo do TDD: a guarda existe antes da correção.

## Desvio deliberado da ordem do spec

O spec numera hero como Fase 2 e sistema de movimento como Fase 3, mas o hero **consome** o loop rAF que só nasce na Fase 3. Este plano inverte as duas: **infraestrutura de movimento antes do consumidor**. Os commits 2 e 3 trocam de conteúdo em relação ao brief original; o conjunto entregue é idêntico.

## Estrutura de arquivos

**Criar:**

| Arquivo | Responsabilidade |
| --- | --- |
| `scripts/check-contrast.mjs` | Guarda de contraste WCAG (já criado) |
| `scripts/check-invariants.mjs` | Guardas estruturais (já criado) |
| `assets/css/atmosphere.css` | Grão de filme, `.bg-noir`/`.bg-stage`, motivo hairline |
| `assets/css/motion.css` | Variantes `reveal-mask`, `reveal-clip`, `line-draw` |
| `assets/js/utils/raf.js` | Loop rAF único, dono exclusivo do scroll |
| `assets/js/components/smooth-scroll.js` | Carregamento tolerante a falha do Lenis |
| `assets/js/components/hero.js` | Orquestração da revelação do hero |
| `assets/images/ART-DIRECTION.md` | Guia de captação fotográfica |
| `assets/images/og-image.svg` | Imagem social de marca |

**Modificar:**

| Arquivo | Mudança |
| --- | --- |
| `assets/css/base.css` | Tokens novos, `.sr-only`, correção do `--color-text-muted` |
| `assets/css/main.css` | Remover `@import` da fonte; importar `atmosphere.css` e `motion.css` |
| `assets/css/layout.css` | `.bg-noir`/`.bg-stage`, numeração de seção, eyebrow tokenizado |
| `assets/css/components.css` | Hero em camadas, stats no palco, split editorial, loader |
| `assets/js/main.js` | Ligar os módulos novos na ordem correta |
| `assets/js/components/animations.js` | `initParallax` migra para o loop rAF |
| `assets/js/components/header.js` | Listener de scroll migra para o loop rAF |
| `assets/js/components/scroll-progress.js` | Listener de scroll migra para o loop rAF |
| `assets/js/components/observer.js` | Variantes de revelação e stagger em curva |
| `assets/js/components/loader.js` | Emitir `studio:curtain-up` |
| `index.html` + `pages/*.html` | `<link>` de fonte, hero, seções, tratamento de imagem |

---

## Fase 0 — Harness de verificação

### Task 0: Estabelecer a linha de base

**Files:**
- Create: `scripts/check-contrast.mjs` (já criado)
- Create: `scripts/check-invariants.mjs` (já criado)

**Interfaces:**
- Produces: dois comandos de verificação usados como portão em todas as fases seguintes.

- [ ] **Step 1: Rodar a guarda de contraste e registrar a linha de base**

Run: `node scripts/check-contrast.mjs`

Expected: FALHA, exit 1. Quatro pares com token ausente (`--color-gilt`, `--color-gilt-ink` ainda não existem) e **um par reprovando de verdade**:

```
REPROVA   3.90:1  (min 4.5)  --color-text-muted sobre --color-alabaster
```

Este é um defeito de acessibilidade **pré-existente no site em produção** — `--color-text-muted` pinta `.section-description`, `.stat-item__label` e todo `.text-secondary`. A Task 1 corrige.

- [ ] **Step 2: Rodar as guardas estruturais e registrar a linha de base**

Run: `node scripts/check-invariants.mjs`

Expected: FALHA, exit 1, 12 invariantes quebradas — 9 de fonte via `@import`, e **3 listeners de scroll crus**, não 1:

```
FALHA    assets\js\components\animations.js sem addEventListener('scroll') cru
FALHA    assets\js\components\header.js sem addEventListener('scroll') cru
FALHA    assets\js\components\scroll-progress.js sem addEventListener('scroll') cru
```

O brief citava apenas `initParallax`. Os três disputam o main thread no mesmo gesto de scroll; os três migram na Fase 2.

- [ ] **Step 3: Commit**

```bash
git add scripts/
git commit -m "chore(qa): harness de verificação — contraste WCAG e invariantes estruturais"
```

---

## Fase 1 — Fundações visuais

### Task 1: Tokens, contraste e `.sr-only`

**Files:**
- Modify: `assets/css/base.css:6-139` (bloco `:root`), mais reset

**Interfaces:**
- Produces: `--color-noir`, `--color-ink-800`, `--color-ink-700`, `--color-gilt`, `--color-gilt-ink`, `--color-gilt-line`, `--hairline`, `--rule-length`, `--fluid-mega`, `--glow-warm`, classe `.sr-only`. Consumidos por todas as tasks seguintes.

- [ ] **Step 1: Adicionar os tokens novos ao final do bloco `:root`**

Inserir em `assets/css/base.css`, imediatamente antes do `}` que fecha `:root` (linha 139):

```css
  /* ---- v3.0 "Atelier of Movement" ---- */

  /* Profundidade — degraus entre noir e charcoal para gradientes ricos */
  --color-noir:      #100C0D;
  --color-ink-800:   #130F10;
  --color-ink-700:   #171213;

  /* Acento metálico. REGRA DE USO (verificada por scripts/check-contrast.mjs):
     --color-gilt      → texto SOMENTE sobre fundo escuro (8.67:1 sobre noir).
                         Sobre alabaster dá 2.17:1 e REPROVA AA.
     --color-gilt-ink  → texto sobre fundo claro (4.68:1 sobre alabaster).
     --color-gilt-line → fio/hairline decorativo, qualquer fundo (sem texto). */
  --color-gilt:      #C9A96A;
  --color-gilt-ink:  #8A6D33;
  --color-gilt-line: rgba(201,169,106,0.35);

  /* Motivo hairline — a "barra de ballet" */
  --hairline:        1px;
  --rule-length:     32px;

  /* O grão fica acima do conteúdo e ABAIXO da UI fixa (header, barra de
     progresso, menu), que vivem em --z-sticky (100). */
  --z-grain:         90;

  /* Tipografia manifesto */
  --fluid-mega: clamp(3rem, 1.5rem + 8vw, 8rem);

  /* Luz */
  --glow-warm: radial-gradient(ellipse 60% 50% at 50% 45%,
                 rgba(201,169,106,0.14) 0%,
                 rgba(210,138,151,0.07) 45%,
                 transparent 75%);
```

- [ ] **Step 2: Corrigir o contraste reprovado do texto secundário**

Em `assets/css/base.css:17`, trocar:

```css
  --color-text-muted:     #887B7D;
```

por:

```css
  /* Escurecido de #887B7D (3.90:1, reprovava AA sobre alabaster) para 4.76:1. */
  --color-text-muted:     #7A6D6F;
```

- [ ] **Step 3: Rodar a guarda de contraste**

Run: `node scripts/check-contrast.mjs`

Expected: PASSA, exit 0. Seis linhas `OK`, incluindo `8.67:1 --color-gilt sobre --color-noir` e `4.76:1 --color-text-muted sobre --color-alabaster`.

- [ ] **Step 4: Adicionar `.sr-only`**

O projeto não tem essa classe e o hero acessível depende dela. Adicionar em `assets/css/base.css`, após o bloco `.skip-to-main` (depois da linha 341):

```css
/* ----------------------------------------
   Screen-reader only
---------------------------------------- */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 5: Verificar que nada regrediu no navegador**

Run: `npx --yes serve@14 -l 8080 .`

Abrir `http://localhost:8080/` e `http://localhost:8080/pages/about.html`. Confirmar: nenhuma mudança visual perceptível além do texto secundário levemente mais escuro; nenhum erro no console.

- [ ] **Step 6: Commit**

```bash
git add assets/css/base.css
git commit -m "feat(design): tokens noir/gilt, escala mega, sr-only; corrige contraste AA do texto secundário"
```

### Task 2: Fonte fora do `@import`

**Files:**
- Modify: `assets/css/main.css:7`
- Modify: `index.html:14-17` e o `<head>` das 7 páginas em `pages/`

**Interfaces:**
- Consumes: nada.
- Produces: fonte carregada em paralelo ao CSS; peso 500 do Playfair disponível.

- [ ] **Step 1: Remover o `@import` de fonte de `main.css`**

Apagar a linha 7 inteira e o comentário `/* Google Fonts */` da linha 6 de `assets/css/main.css`. O arquivo passa a começar os imports em `base.css`.

- [ ] **Step 2: Adicionar o `<link>` ao `<head>` das 9 páginas**

Em `index.html`, as tags `preconnect` já existem (linhas 14-15). Adicionar logo após elas:

```html
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap" />
```

Note o `0,500` adicionado — o peso 500 do Playfair não existia no import antigo.

Nas 7 páginas de `pages/`, verificar se `preconnect` existe; onde não existir, adicionar o bloco completo antes do `<link rel="stylesheet" href="../assets/css/main.css" />`:

```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap" />
```

- [ ] **Step 3: Rodar as guardas estruturais**

Run: `node scripts/check-invariants.mjs`

Expected: as 9 falhas de fonte desaparecem. Restam exatamente 3 falhas — os listeners de scroll de `animations.js`, `header.js` e `scroll-progress.js`, que a Fase 2 resolve. Exit 1 ainda, com apenas essas 3.

- [ ] **Step 4: Confirmar que a fonte carrega**

Com o servidor local rodando, abrir DevTools → Network → filtrar por `font`. Confirmar que os arquivos `.woff2` do Playfair e do Poppins carregam, e que a requisição do CSS do Google inicia **em paralelo** com `main.css`, não depois dele.

- [ ] **Step 5: Commit**

```bash
git add assets/css/main.css index.html pages/
git commit -m "perf(fonts): move Google Fonts de @import para <link>, elimina cascata render-blocking"
```

### Task 3: `atmosphere.css` — grão, palco e hairline

**Files:**
- Create: `assets/css/atmosphere.css`
- Modify: `assets/css/main.css`
- Modify: `assets/css/layout.css:43-67` (tokenizar o eyebrow existente)

**Interfaces:**
- Consumes: tokens da Task 1.
- Produces: `.bg-noir`, `.bg-stage`, `.rule`, `.rule--gilt`, `.link-underline`, `.section-number`, grão global.

- [ ] **Step 1: Criar `assets/css/atmosphere.css`**

```css
/* ============================================
   ATMOSPHERE.CSS — Textura, palco e motivo hairline
   Studio Thaisa Vieira v3.0 "Atelier of Movement"
============================================ */

/* ----------------------------------------
   Grão de filme global

   Textura estática, não movimento — permanece ativa sob
   prefers-reduced-motion de propósito.
---------------------------------------- */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: var(--z-grain);
  pointer-events: none;
  opacity: 0.035;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px 160px;
}

/* ----------------------------------------
   Fundos de palco

   .bg-charcoal permanece intacto — páginas internas não quebram.
   .bg-noir e .bg-stage são adições.
---------------------------------------- */
.bg-noir {
  position: relative;
  background-color: var(--color-noir);
  color: var(--color-white);
}

.bg-stage {
  position: relative;
  color: var(--color-white);
  background-color: var(--color-noir);
  background-image:
    var(--glow-warm),
    linear-gradient(170deg,
      var(--color-charcoal) 0%,
      var(--color-ink-700) 38%,
      var(--color-noir) 100%);
}

/* Vinheta de canto — camada separada para não brigar com o gradiente */
.bg-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 85% 75% at 50% 50%,
                transparent 45%,
                rgba(16,12,13,0.55) 100%);
}

.bg-stage > * { position: relative; z-index: var(--z-base); }

/* Herança tipográfica, espelhando o que .bg-charcoal já faz */
.bg-noir h1, .bg-noir h2, .bg-noir h3, .bg-noir h4,
.bg-stage h1, .bg-stage h2, .bg-stage h3, .bg-stage h4 { color: var(--color-white); }

.bg-noir p, .bg-stage p { color: rgba(252,250,250,0.72); }

.bg-noir .section-description,
.bg-stage .section-description { color: rgba(252,250,250,0.70); }

.bg-noir .section-eyebrow,
.bg-stage .section-eyebrow { color: var(--color-rose); }

/* ----------------------------------------
   Motivo hairline — a "barra de ballet"
---------------------------------------- */

/* Forma 1: divisor */
.rule {
  border: 0;
  height: var(--hairline);
  background: var(--color-border);
}

.rule--gilt { background: var(--color-gilt-line); }
.rule--short { width: var(--rule-length); }
.rule--center { margin-inline: auto; }

/* Forma 2: sublinhado que cresce da esquerda no hover */
.link-underline {
  position: relative;
  display: inline-block;
}

.link-underline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: var(--hairline);
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.link-underline:hover::after,
.link-underline:focus-visible::after { transform: scaleX(1); }

@media (prefers-reduced-motion: reduce) {
  .link-underline::after { transition: none; }
}

/* Forma 3: numeração de seção, estilo programa de espetáculo */
.section-number {
  display: inline-block;
  font-family: var(--font-body);
  font-size: var(--fluid-xs);
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--color-gilt-ink);
  margin-right: var(--space-3);
}

.bg-noir .section-number,
.bg-stage .section-number,
.bg-charcoal .section-number { color: var(--color-gilt); }
```

- [ ] **Step 2: Importar em `main.css`**

`assets/css/main.css` fica assim por inteiro:

```css
/* ============================================
   MAIN.CSS — Aggregator
   Studio Thaisa Vieira v3.0
============================================ */

/* Layers */
@import 'base.css';
@import 'layout.css';
@import 'atmosphere.css';
@import 'components.css';
@import 'motion.css';
@import 'utilities.css';
```

`motion.css` ainda não existe nesta task — criar um arquivo vazio com apenas o cabeçalho de comentário para o import não falhar; a Fase 2 o preenche.

- [ ] **Step 3: Tokenizar o eyebrow existente**

`.section-eyebrow::before` já é o motivo hairline. Em `assets/css/layout.css:54-63`, trocar os valores mágicos por tokens:

```css
.section-eyebrow::before {
  content: '';
  display: inline-block;
  width: var(--rule-length);
  height: var(--hairline);
  background: var(--color-rose);
  vertical-align: middle;
  margin-right: var(--space-3);
  margin-bottom: 3px;
}
```

- [ ] **Step 4: Verificar o grão no navegador**

Com o servidor local, abrir a home. Confirmar: o grão é perceptível ao aproximar mas não polui a leitura; texto continua nítido; **clicar em links e botões funciona** (o `pointer-events: none` está correto); o grão não aparece por cima do menu mobile aberto nem do loader.

- [ ] **Step 5: Rodar as duas guardas**

Run: `node scripts/check-contrast.mjs && node scripts/check-invariants.mjs`

Expected: contraste passa (exit 0); invariantes ainda mostram as 3 falhas de scroll (exit 1). Nenhuma falha nova.

- [ ] **Step 6: Commit da Fase 1**

```bash
git add assets/css/
git commit -m "feat(design): fundações — paleta noir/gilt, grão de filme, escala tipográfica editorial"
```

---

## Fase 2 — Sistema de movimento coreografado

> Esta fase vem antes do hero porque o hero consome o loop rAF construído aqui.

### Task 4: Loop rAF único

**Files:**
- Create: `assets/js/utils/raf.js`

**Interfaces:**
- Produces:
  - `onFrame(handler): () => void` — registra trabalho por frame, retorna função de cancelamento.
    - `handler` como **função simples** = escrita pura (fase mutate). Use quando o módulo não lê layout.
    - `handler` como **objeto `{ measure, mutate }`** = duas fases. Quem chama `getBoundingClientRect()` ou qualquer leitura de layout **deve** usar esta forma: as leituras vão em `measure`, as escritas em `mutate`, e o retorno de `measure` chega como primeiro argumento de `mutate`.
  - `FrameState = { scrollY: number, viewportH: number }`
  - `setScrollSource(getScrollY: () => number): void` — permite ao Lenis assumir a origem do valor de scroll.
  - O loop só roda enquanto houver handler registrado.

> **Correção aplicada em `ae7c4b2` (achado de review).** O código deste Step abaixo é a versão original e está **desatualizado**: ele não isolava falhas (um handler que lançasse matava o movimento do site inteiro em silêncio) e a "leitura em lote antes das escritas" que os comentários prometiam só valia para `scrollY`/`viewportH`. A versão em vigor tem `try`/`catch` por handler, remove do loop quem falha, implementa as duas fases de verdade e reconfere `handlers.size` antes de reagendar. **Leia `assets/js/utils/raf.js` como fonte da verdade, não o bloco abaixo.**

- [ ] **Step 1: Criar `assets/js/utils/raf.js`**

```js
/**
 * Loop requestAnimationFrame único do site.
 *
 * É o dono exclusivo do scroll: nenhum outro módulo deve chamar
 * addEventListener('scroll'). Centralizar evita que três listeners
 * disputem o main thread no mesmo gesto e permite separar leituras
 * de layout das escritas.
 */

const callbacks = new Set();
let running = false;
let rafId = null;

/** Origem do valor de scroll. O Lenis substitui via setScrollSource. */
let getScrollY = () => window.scrollY;

export function setScrollSource(fn) {
  if (typeof fn === 'function') getScrollY = fn;
}

function tick() {
  if (!callbacks.size) {
    running = false;
    rafId = null;
    return;
  }

  // Leitura de layout em lote, antes de qualquer escrita.
  const state = { scrollY: getScrollY(), viewportH: window.innerHeight };

  // Escritas.
  callbacks.forEach((cb) => cb(state));

  rafId = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  rafId = requestAnimationFrame(tick);
}

/**
 * Registra um callback executado a cada frame.
 * @returns {() => void} cancela o registro; o loop para sozinho ao esvaziar.
 */
export function onFrame(callback) {
  callbacks.add(callback);
  start();
  return () => {
    callbacks.delete(callback);
    if (!callbacks.size && rafId !== null) {
      cancelAnimationFrame(rafId);
      running = false;
      rafId = null;
    }
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/js/utils/raf.js
git commit -m "feat(motion): loop rAF único como dono exclusivo do scroll"
```

### Task 5: Migrar os três listeners de scroll

**Files:**
- Modify: `assets/js/components/animations.js:30-46`
- Modify: `assets/js/components/header.js`
- Modify: `assets/js/components/scroll-progress.js`

**Interfaces:**
- Consumes: `onFrame` de `utils/raf.js`.
- Produces: `initParallax`, `initHeader`, `initScrollProgress` com as mesmas assinaturas (sem argumentos, sem retorno) — `main.js` não muda.

- [ ] **Step 1: Confirmar a linha de base dos três arquivos**

Run: `node scripts/check-invariants.mjs`

Expected: exit 1 com exatamente 3 falhas — `animations.js`, `header.js` e `scroll-progress.js`. Nenhuma outra. Se aparecer uma quarta, pare: alguém adicionou um listener de scroll fora do plano.

- [ ] **Step 2: Reescrever `initParallax` sem layout thrashing**

Substituir o corpo de `initParallax` em `assets/js/components/animations.js` (linhas 30-46):

```js
export function initParallax() {
  if (prefersReducedMotion()) return;

  const els = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;

  // Só os elementos em viewport entram no loop.
  const active = new Set();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) active.add(entry.target);
        else active.delete(entry.target);
      });
    },
    { rootMargin: '15% 0px' }
  );

  els.forEach((el) => io.observe(el));

  onFrame(({ viewportH }) => {
    if (!active.size) return;

    // Leituras primeiro, todas juntas.
    const reads = [];
    active.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      reads.push({ el, offset: (rect.top + rect.height / 2 - viewportH / 2) * speed });
    });

    // Escritas depois, todas juntas.
    for (const { el, offset } of reads) {
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }
  });
}
```

Adicionar o import no topo do arquivo:

```js
import { onFrame } from '../utils/raf.js';
```

- [ ] **Step 3: Migrar `header.js`**

Substituir `assets/js/components/header.js` por inteiro. O `throttle` de 50ms sai — o loop rAF já limita a um passo por frame, e o throttle por cima causava atraso visível na troca de estado:

```js
import { onFrame } from '../utils/raf.js';

export function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 80;
  const startsTransparent = header.classList.contains('transparent');

  // Só escreve no DOM quando o estado muda, não a 60fps.
  let wasScrolled = null;

  onFrame(({ scrollY }) => {
    const scrolled = scrollY > SCROLL_THRESHOLD;
    if (scrolled === wasScrolled) return;
    wasScrolled = scrolled;

    header.classList.toggle('scrolled', scrolled);

    // Na home o header começa transparente sobre o hero. Ao rolar, o fundo
    // clareia → logo e nav precisam voltar para as cores escuras.
    if (startsTransparent) header.classList.toggle('transparent', !scrolled);
  });
}
```

- [ ] **Step 4: Migrar `scroll-progress.js` de `width` para `transform`**

A implementação atual anima `width` com `transition: width 100ms linear` — dispara layout a cada frame de scroll e **viola a constraint global** de animar apenas `transform`/`opacity`/`clip-path`/`filter`. A migração corrige as duas coisas de uma vez.

Substituir `assets/js/components/scroll-progress.js` por inteiro:

```js
import { onFrame } from '../utils/raf.js';

export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;

  // scrollHeight é leitura de layout: mede uma vez, não a cada frame.
  let docHeight = 0;
  const measure = () => {
    docHeight = document.documentElement.scrollHeight - window.innerHeight;
  };
  measure();
  window.addEventListener('resize', measure, { passive: true });

  let last = -1;

  onFrame(({ scrollY }) => {
    const ratio = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
    // Duas casas bastam para 1px em telas largas; evita escrita redundante.
    const next = Math.round(ratio * 1000) / 1000;
    if (next === last) return;
    last = next;
    bar.style.transform = `scaleX(${next})`;
  });
}
```

Ajustar o CSS em `assets/css/components.css:2156-2161`:

```css
.scroll-progress__bar {
  height: 100%;
  background: linear-gradient(to right, var(--color-rose), var(--color-rose-dark));
  width: 100%;
  transform: scaleX(0);
  transform-origin: left;
  will-change: transform;
}
```

A `transition` sai: o valor já é atualizado a cada frame, e uma transição por cima só adiciona atraso. `width` passa a `100%` porque a escala agora faz o trabalho.

Nota sobre `resize`: `measure` é um listener de `resize`, não de `scroll` — `check-invariants.mjs` só proíbe `scroll`, então isso passa e está correto.

- [ ] **Step 5: Rodar as guardas estruturais**

Run: `node scripts/check-invariants.mjs`

Expected: PASSA, exit 0. As 3 falhas de scroll desaparecem e nenhuma nova aparece.

- [ ] **Step 6: Verificar comportamento e performance**

Com o servidor local, na home:
- O header ainda muda de estado ao rolar.
- A barra de progresso ainda acompanha o scroll de 0 a 100%.
- DevTools → Performance, CPU throttle 4x, gravar 5s de scroll: sem barras vermelhas de long task, sem `Forced reflow` no log.

- [ ] **Step 7: Commit**

```bash
git add assets/js/components/animations.js assets/js/components/header.js assets/js/components/scroll-progress.js
git commit -m "perf(motion): migra os três listeners de scroll para o loop rAF único"
```

### Task 6: Lenis tolerante a falha

**Files:**
- Create: `assets/js/components/smooth-scroll.js`
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes: `onFrame`, `setScrollSource` de `utils/raf.js`; `prefersReducedMotion` de `utils/helpers.js`.
- Produces: `initSmoothScroll(): Promise<boolean>` — resolve `true` se o Lenis assumiu, `false` se o scroll seguiu nativo. Nunca rejeita.

- [ ] **Step 1: Criar `assets/js/components/smooth-scroll.js`**

```js
import { onFrame, setScrollSource } from '../utils/raf.js';
import { prefersReducedMotion } from '../utils/helpers.js';

const LENIS_URL = 'https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.mjs';

/**
 * Carrega o Lenis como enriquecimento opcional.
 *
 * Falha do CDN, reduced-motion e dispositivos touch caem no scroll
 * nativo sem erro. Nunca rejeita — uma lib de 3KB não pode derrubar
 * o menu e os formulários junto.
 *
 * @returns {Promise<boolean>} true se o Lenis assumiu o scroll.
 */
export async function initSmoothScroll() {
  if (prefersReducedMotion()) return false;

  // Inércia em touch briga com o scroll nativo do sistema.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;

  try {
    const { default: Lenis } = await import(LENIS_URL);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 0,
    });

    // O Lenis alimenta o loop existente em vez de abrir o seu próprio rAF.
    onFrame(() => lenis.raf(performance.now()));
    setScrollSource(() => lenis.scroll);

    document.documentElement.classList.add('has-smooth-scroll');
    return true;
  } catch (err) {
    // CDN fora do ar, bloqueio de rede, CSP. O scroll nativo continua.
    console.warn('[smooth-scroll] Lenis indisponível, usando scroll nativo.', err);
    return false;
  }
}
```

- [ ] **Step 2: Ligar em `main.js`**

Adicionar o import e a chamada dentro do `DOMContentLoaded`, **após** `initScrollProgress()`:

```js
import { initSmoothScroll } from './components/smooth-scroll.js';
```

```js
  initSmoothScroll();
```

Não usar `await` — o carregamento é assíncrono de propósito e nada depende do resultado.

- [ ] **Step 3: Verificar o caminho feliz**

Com o servidor local, rolar a home no desktop com mouse. O scroll deve ter amortecimento perceptível. Confirmar no console: sem warning.

- [ ] **Step 4: Verificar o caminho de falha — este é o passo crítico**

DevTools → Network → Add blocking request pattern: `*jsdelivr*`. Recarregar a home.

Expected:
- Warning `[smooth-scroll] Lenis indisponível` no console.
- Scroll nativo funcionando normalmente.
- **Menu mobile abre, formulários funcionam, carrossel navega** — nenhum outro módulo é afetado.

- [ ] **Step 5: Verificar reduced-motion e touch**

Com `prefers-reduced-motion: reduce` ativo (DevTools → Rendering → Emulate CSS media feature), recarregar: sem inércia, sem warning, scroll nativo. Em emulação de dispositivo touch: idem.

- [ ] **Step 6: Commit**

```bash
git add assets/js/components/smooth-scroll.js assets/js/main.js
git commit -m "feat(motion): scroll com inércia via Lenis, com queda limpa para scroll nativo"
```

### Task 7: Variantes de revelação editorial

**Files:**
- Modify: `assets/js/components/observer.js`
- Modify: `assets/css/motion.css` (criado vazio na Task 3)

**Interfaces:**
- Consumes: nada além do que já existe.
- Produces: atributos `data-animate="reveal-mask"`, `data-animate="reveal-clip"`, `data-animate="line-draw"`; stagger com delay em curva. `data-animate` e `data-stagger` existentes continuam funcionando sem mudança.

- [ ] **Step 1: Preencher `assets/css/motion.css`**

```css
/* ============================================
   MOTION.CSS — Variantes de revelação editorial
   Studio Thaisa Vieira v3.0
============================================ */

/* ----------------------------------------
   reveal-mask — texto/imagem revelado por máscara que sobe
---------------------------------------- */
[data-animate="reveal-mask"] {
  display: block;
  overflow: hidden;
}

[data-animate="reveal-mask"] > * {
  display: block;
  transform: translateY(110%);
  transition: transform 900ms var(--ease-out);
}

[data-animate="reveal-mask"].is-visible > * { transform: translateY(0); }

/* ----------------------------------------
   reveal-clip — imagem entra por clip-path
---------------------------------------- */
[data-animate="reveal-clip"] {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 1100ms var(--ease-out);
}

[data-animate="reveal-clip"].is-visible { clip-path: inset(0 0 0 0); }

/* ----------------------------------------
   line-draw — hairline que desenha da esquerda
---------------------------------------- */
[data-animate="line-draw"] {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 800ms var(--ease-out);
}

[data-animate="line-draw"].is-visible { transform: scaleX(1); }

/* ----------------------------------------
   Estados finais obrigatórios

   Sem JS e sob reduced-motion, tudo nasce revelado.
---------------------------------------- */
.no-js [data-animate="reveal-mask"] > * { transform: none; }
.no-js [data-animate="reveal-clip"]     { clip-path: none; }
.no-js [data-animate="line-draw"]       { transform: scaleX(1); }

@media (prefers-reduced-motion: reduce) {
  [data-animate="reveal-mask"] > * { transform: none; transition: none; }
  [data-animate="reveal-clip"]     { clip-path: none; transition: none; }
  [data-animate="line-draw"]       { transform: scaleX(1); transition: none; }
}
```

- [ ] **Step 2: Adicionar stagger em curva no observer**

Em `assets/js/components/observer.js`, dentro do callback do `IntersectionObserver`, antes de `entry.target.classList.add('is-visible')`, aplicar delay musical aos filhos de `[data-stagger]`:

```js
        if (entry.isIntersecting) {
          const el = entry.target;

          if (el.hasAttribute('data-stagger')) {
            const children = Array.from(el.children);
            const step = 90; // ms
            children.forEach((child, i) => {
              // Ease no delay: os primeiros entram mais juntos, a cauda alonga.
              const t = i / Math.max(1, children.length - 1);
              const eased = t * t * (3 - 2 * t); // smoothstep
              child.style.transitionDelay = `${Math.round(eased * step * children.length)}ms`;
            });
          }

          el.classList.add('is-visible');
          observer.unobserve(el);
        }
```

- [ ] **Step 3: Garantir que reduced-motion não aplica delay**

O early-return de `prefersReducedMotion()` nas linhas 8-12 já cobre — os elementos recebem `is-visible` direto sem passar pelo observer. Confirmar lendo o arquivo que o bloco novo está **depois** desse return.

- [ ] **Step 4: Verificar no navegador**

Adicionar temporariamente `data-animate="reveal-mask"` a um `<h2>` da home (envolvendo o texto num `<span>`), recarregar e rolar até ele. Confirmar a entrada por máscara. Depois reverter a mudança temporária — o uso definitivo é na Fase 4.

Testar reduced-motion: o `<h2>` aparece estático, sem movimento.

- [ ] **Step 5: Commit da Fase 2**

```bash
git add assets/css/motion.css assets/js/components/observer.js
git commit -m "feat(motion): sistema de movimento coreografado + correção de parallax (rAF)"
```

---

## Fase 3 — Hero cinematográfico

### Task 8: Loader emite `studio:curtain-up`

**Files:**
- Modify: `assets/js/components/loader.js`

**Interfaces:**
- Produces: evento `studio:curtain-up` disparado em `document` quando a cortina termina de subir. Consumido pela Task 9.

- [ ] **Step 1: Reescrever `assets/js/components/loader.js`**

```js
/**
 * Cortina de entrada.
 *
 * Emite `studio:curtain-up` quando termina de sair, para que o hero
 * revele depois da cortina e não atrás dela.
 */
export function initLoader() {
  const loader = document.querySelector('.page-loader');

  // Sem cortina (páginas internas), o hero revela imediatamente.
  if (!loader) {
    announce();
    return;
  }

  let announced = false;

  function announce() {
    if (announced) return;
    announced = true;
    document.dispatchEvent(new CustomEvent('studio:curtain-up'));
  }

  const hide = () => {
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.remove();
      announce();
    }, 600);
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 400);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 400));
  }

  // Rede de segurança: o CSS já esconde a cortina em 2500ms via
  // loaderFallback. Se `load` nunca disparar, o hero não pode ficar
  // invisível esperando um evento que não vem.
  setTimeout(announce, 3200);
}
```

Note que `announce` é declarada como *function declaration* de propósito — é chamada antes da sua posição no corpo, no caminho sem loader.

- [ ] **Step 2: Verificar o evento**

No console da home, antes de recarregar:

```js
document.addEventListener('studio:curtain-up', () => console.log('cortina subiu'));
```

Recarregar. Expected: `cortina subiu` logado uma única vez, ~1s após o load, depois da cortina sumir.

- [ ] **Step 3: Commit**

```bash
git add assets/js/components/loader.js
git commit -m "feat(hero): loader emite studio:curtain-up para sincronizar a revelação"
```

### Task 9: Hero em camadas com revelação por máscara

**Files:**
- Modify: `index.html:73-103` (bloco `.hero`)
- Modify: `assets/css/components.css:362-511`
- Create: `assets/js/components/hero.js`
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes: evento `studio:curtain-up` (Task 8), `onFrame` (Task 4), tokens (Task 1).
- Produces: `initHero(): void`.

- [ ] **Step 1: Reescrever o markup do hero em `index.html`**

Substituir as linhas 74-103 por:

```html
    <section class="hero hero--centered hero--cinematic" aria-label="Apresentação do estúdio">
      <div class="hero__background" data-parallax="0.12">
        <!-- FOTO REAL: bailarina em movimento, luz quente lateral, fundo escuro.
             Enquadramento paisagem 16:9 com espaço negativo no centro-baixo
             para a tipografia. Substituir por assets/images/hero/hero.jpg -->
        <img
          src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1920&q=80&auto=format&fit=crop"
          alt=""
          loading="eager"
          fetchpriority="high"
        />
      </div>
      <div class="hero__overlay"></div>
      <div class="hero__glow" aria-hidden="true"></div>

      <div class="container hero__content">
        <span class="hero__eyebrow">Nova Iguaçu · RJ · Metodologia Vaganova</span>

        <h1 class="hero__title">
          <span class="sr-only">Formando bailarinas para grandes oportunidades</span>
          <span class="hero__title-lines" aria-hidden="true">
            <span class="line"><span class="line__inner">Formando bailarinas para</span></span>
            <span class="line"><span class="line__inner"><em>grandes oportunidades</em></span></span>
          </span>
        </h1>

        <p class="hero__subtitle">
          Há 10 anos unindo técnica, disciplina e sensibilidade artística através da metodologia Vaganova. Um ensino que prepara bailarinas para o palco, para seletivas e para grandes sonhos.
        </p>

        <div class="hero__actions">
          <a href="pages/contact.html" class="btn btn--primary btn--lg">Agendar Aula Experimental</a>
          <a href="pages/about.html" class="btn btn--ghost btn--lg">Conhecer o Estúdio</a>
        </div>
      </div>

      <div class="hero__scroll-hint" aria-hidden="true">
        <div class="hero__scroll-line"></div>
        <span>Scroll</span>
      </div>
    </section>
```

Os `data-animate` foram removidos do hero de propósito — a revelação agora é orquestrada por `hero.js`, não pelo observer genérico.

- [ ] **Step 2: Adicionar o CSS do hero cinematográfico**

Acrescentar em `assets/css/components.css`, após o bloco `.hero__scroll-line` (linha 511). As regras antigas permanecem; estas as especializam via `.hero--cinematic`:

```css
/* ---- Hero cinematográfico v3.0 ---- */

.hero--cinematic .hero__overlay {
  background:
    radial-gradient(ellipse 90% 80% at 50% 50%,
      transparent 30%, rgba(16,12,13,0.62) 100%),
    linear-gradient(170deg,
      rgba(16,12,13,0.55) 0%,
      rgba(16,12,13,0.72) 55%,
      rgba(16,12,13,0.88) 100%);
}

.hero__glow {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: var(--glow-warm);
}

/* Eyebrow com o motivo hairline */
.hero--cinematic .hero__eyebrow {
  color: var(--color-gilt);
  letter-spacing: 0.28em;
}

.hero--cinematic .hero__eyebrow::before {
  content: '';
  display: inline-block;
  width: var(--rule-length);
  height: var(--hairline);
  background: var(--color-gilt-line);
  vertical-align: middle;
  margin-right: var(--space-3);
  margin-bottom: 3px;
}

/* Revelação por linha */
.hero__title-lines { display: block; }

.hero__title .line {
  display: block;
  overflow: hidden;
}

.hero__title .line__inner {
  display: block;
  transform: translateY(110%);
  opacity: 0;
}

.hero.is-revealed .line__inner {
  transform: translateY(0);
  opacity: 1;
  transition:
    transform 1100ms var(--ease-out),
    opacity 700ms var(--ease-out);
}

/* O itálico chega por último, como acento da frase. */
.hero.is-revealed .line:nth-child(1) .line__inner { transition-delay: 0ms; }
.hero.is-revealed .line:nth-child(2) .line__inner { transition-delay: 220ms; }

/* Eyebrow, subtítulo e ações seguem o título. */
.hero--cinematic .hero__eyebrow,
.hero--cinematic .hero__subtitle,
.hero--cinematic .hero__actions {
  opacity: 0;
  transform: translateY(16px);
}

.hero.is-revealed .hero__eyebrow,
.hero.is-revealed .hero__subtitle,
.hero.is-revealed .hero__actions {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 800ms var(--ease-out),
    transform 800ms var(--ease-out);
}

.hero.is-revealed .hero__eyebrow  { transition-delay: 80ms; }
.hero.is-revealed .hero__subtitle { transition-delay: 520ms; }
.hero.is-revealed .hero__actions  { transition-delay: 660ms; }

/* Scroll hint mais sutil */
.hero--cinematic .hero__scroll-line {
  height: 56px;
  background: linear-gradient(to bottom, var(--color-gilt-line), transparent);
}

/* ---- Estados finais obrigatórios ---- */

.no-js .hero--cinematic .hero__eyebrow,
.no-js .hero--cinematic .hero__subtitle,
.no-js .hero--cinematic .hero__actions {
  opacity: 1;
  transform: none;
}

.no-js .hero__title .line__inner { transform: none; opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .hero__title .line__inner,
  .hero--cinematic .hero__eyebrow,
  .hero--cinematic .hero__subtitle,
  .hero--cinematic .hero__actions {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }

  .hero--cinematic .hero__background img { animation: none; }
}
```

- [ ] **Step 3: Criar `assets/js/components/hero.js`**

```js
import { prefersReducedMotion } from '../utils/helpers.js';

/**
 * Orquestra a revelação do hero.
 *
 * Espera `studio:curtain-up` para que o título entre depois da cortina,
 * não atrás dela. Sob reduced-motion, revela na hora — o CSS já anula
 * qualquer transição.
 */
export function initHero() {
  const hero = document.querySelector('.hero--cinematic');
  if (!hero) return;

  const reveal = () => hero.classList.add('is-revealed');

  if (prefersReducedMotion()) {
    reveal();
    return;
  }

  document.addEventListener('studio:curtain-up', reveal, { once: true });

  // Se o evento não chegar (loader removido, JS parcialmente falho),
  // o hero nunca fica invisível esperando.
  setTimeout(reveal, 3500);
}
```

- [ ] **Step 4: Ligar em `main.js`**

```js
import { initHero } from './components/hero.js';
```

Chamar dentro do `DOMContentLoaded`, logo após `initMenu()`.

- [ ] **Step 5: Verificar a sequência visual**

Com o servidor local, recarregar a home com cache desabilitado. Expected, nesta ordem: cortina com a marca → cortina sobe → primeira linha do título sobe sob máscara → o itálico *grandes oportunidades* chega depois → subtítulo → botões. O título **não** deve estar visível antes da cortina sair.

- [ ] **Step 6: Verificar acessibilidade do título**

No console:

```js
document.querySelector('.hero__title').textContent.trim().replace(/\s+/g, ' ')
```

Expected: a frase completa aparece **uma única vez** no começo (do `.sr-only`), seguida da repetição decorativa — e o bloco decorativo tem `aria-hidden="true"`, então o leitor de tela anuncia a frase uma vez só.

Confirmar também no painel Accessibility do DevTools que o `h1` tem nome acessível `Formando bailarinas para grandes oportunidades`.

- [ ] **Step 7: Verificar os fallbacks**

- **Sem JS:** DevTools → Settings → Debugger → Disable JavaScript. Recarregar. O título, subtítulo e botões devem estar **visíveis** e a cortina não deve travar a tela (o `loaderFallback` do CSS cobre).
- **Reduced-motion:** título visível de imediato, sem máscara, sem zoom na imagem de fundo.

- [ ] **Step 8: Verificar que o LCP não regrediu**

DevTools → Lighthouse → Mobile → Performance. Comparar o LCP com o valor da `main` (rodar antes em `git stash` se necessário). O elemento LCP deve continuar sendo a imagem do hero e o valor não pode piorar.

- [ ] **Step 9: Commit da Fase 3**

```bash
git add index.html assets/css/components.css assets/js/components/hero.js assets/js/main.js
git commit -m "feat(hero): hero cinematográfico com revelação por máscara e camadas"
```

### Task 10: Suporte progressivo a vídeo de fundo

**Files:**
- Modify: `index.html` (bloco `.hero__background`)
- Modify: `assets/css/components.css`
- Modify: `assets/js/components/hero.js`

**Interfaces:**
- Consumes: `initHero` da Task 9.
- Produces: nada novo. O vídeo é opcional e o site funciona sem ele.

- [ ] **Step 1: Adicionar o `<video>` ao markup do hero**

Dentro de `.hero__background`, **antes** do `<img>`:

```html
        <!-- Opcional: se assets/images/hero/hero.mp4 existir, assume o fundo.
             Sem o arquivo, o <img> abaixo continua sendo o fundo e o LCP. -->
        <video
          class="hero__video"
          muted
          loop
          playsinline
          preload="none"
          data-hero-video="assets/images/hero/hero.mp4"
          aria-hidden="true"
        ></video>
```

O `src` fica em `data-` de propósito: sem isso o browser tentaria baixar um arquivo inexistente e poluiria o console com 404 em toda visita.

- [ ] **Step 2: Adicionar o CSS**

```css
.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1200ms var(--ease-out);
}

.hero__video.is-playing { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .hero__video { display: none; }
}
```

- [ ] **Step 3: Adicionar a ativação condicional em `hero.js`**

Acrescentar ao final de `initHero`, e chamar `initHeroVideo(hero)` antes do return de reduced-motion não acontecer:

```js
/**
 * Ativa o vídeo de fundo apenas se o arquivo existir de fato.
 * O <img> permanece como poster e como elemento de LCP.
 */
function initHeroVideo(hero) {
  if (prefersReducedMotion()) return;

  const video = hero.querySelector('[data-hero-video]');
  if (!video) return;

  const src = video.dataset.heroVideo;

  // HEAD antes de atribuir o src: evita 404 no console quando não há vídeo.
  fetch(src, { method: 'HEAD' })
    .then((res) => {
      if (!res.ok) return;
      video.src = src;
      return video.play();
    })
    .then(() => {
      if (video.src) video.classList.add('is-playing');
    })
    .catch(() => {
      /* Sem vídeo, ou autoplay bloqueado. O poster basta. */
    });
}
```

Chamar dentro de `initHero`, após a checagem de `hero`:

```js
  initHeroVideo(hero);
```

- [ ] **Step 4: Verificar sem arquivo de vídeo**

Recarregar a home. Expected: a imagem continua sendo o fundo; **nenhum erro 404 no console**; o hero revela normalmente.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/components.css assets/js/components/hero.js
git commit -m "feat(hero): suporte progressivo a vídeo de fundo, inerte sem o arquivo"
```

---

## Fase 4 — Composição editorial

### Task 11: Ato I — Stats no palco

**Files:**
- Modify: `index.html:105-132`
- Modify: `assets/css/components.css:571-625`

**Interfaces:**
- Consumes: `.bg-stage` (Task 3), `--fluid-mega` (Task 1).

- [ ] **Step 1: Trocar o fundo e o markup dos stats**

Em `index.html`, trocar a abertura da seção (linha 106):

```html
    <section class="section section--sm bg-stage stats-band" aria-label="Números do estúdio">
```

Trocar cada `.stat-item__divider` por uma hairline dourada — em cada um dos três blocos:

```html
            <div class="stat-item__divider" data-animate="line-draw"></div>
```

- [ ] **Step 2: Adicionar o CSS da faixa de palco**

```css
/* ---- Ato I: faixa de stats no palco ---- */

/* Hairline que separa o hero da faixa — a decisão registrada no spec é
   faixa DELIMITADA, não emenda: evita 1,5 viewport de escuridão contínua. */
.stats-band { border-top: var(--hairline) solid var(--color-gilt-line); }

.stats-band .stat-item__number {
  font-size: clamp(2.75rem, 1.8rem + 4.5vw, 5.5rem);
  color: var(--color-white);
}

.stats-band .stat-item__suffix { color: var(--color-gilt); }

.stats-band .stat-item__divider {
  width: var(--rule-length);
  height: var(--hairline);
  background: var(--color-gilt-line);
}

.stats-band .stat-item__label { color: rgba(252,250,250,0.68); }
```

- [ ] **Step 3: Verificar contraste e leitura**

Com o servidor local: os números devem ser brancos sobre o gradiente de palco; os rótulos legíveis. Verificar em 360px que os três permanecem lado a lado (o breakpoint de 380px já empilha).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/components.css
git commit -m "feat(layout): Ato I — stats como faixa de palco delimitada por hairline"
```

### Task 12: Numeração de seções e Ato II

**Files:**
- Modify: `index.html` (seções Filosofia, Diferenciais, Bolshoi, Programas, Depoimentos, Agenda)
- Modify: `assets/css/components.css` (bloco `.split`)

**Interfaces:**
- Consumes: `.section-number` (Task 3), `reveal-clip` (Task 7).

- [ ] **Step 1: Adicionar a numeração aos eyebrows**

Em cada `.section-eyebrow` da home, prefixar com o número. Exemplo, na Filosofia (linha 146):

```html
            <span class="section-eyebrow"><span class="section-number">01</span>Nossa Filosofia</span>
```

Aplicar na sequência: `01` Filosofia, `02` Manifesto (Task 13), `03` Diferenciais, `04` Nossas conquistas, `05` Para todas as idades, `06` O que dizem nossos alunos, `07` Agenda.

- [ ] **Step 2: Tornar o split assimétrico com imagem sangrando**

> **ATENÇÃO (verificado em navegador):** `reveal-clip` aplica o `clip-path` no FILHO do elemento observado, não nele mesmo. Um elemento com `clip-path: inset(0 0 100% 0)` reporta `isIntersecting: false` no IntersectionObserver e nunca revelaria. Aplique `data-animate="reveal-clip"` no container `.split__media` (que contém a `<img>`), nunca na `<img>` direto.

Trocar o `data-animate` da mídia (linha 138) por `reveal-clip` e adicionar parallax:

```html
          <div class="split__media split__media--bleed" data-animate="reveal-clip" data-parallax="0.06">
```

CSS a acrescentar:

```css
/* ---- Ato II: split editorial assimétrico ---- */
.split__media--bleed {
  position: relative;
  border: var(--hairline) solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

@media (min-width: 1024px) {
  /* A imagem sangra para fora do container, o texto respira. */
  .split__media--bleed { margin-left: calc(-1 * var(--fluid-container-px)); }
}
```

- [ ] **Step 3: Verificar em todos os breakpoints**

360 / 768 / 1024 / 1440. Expected: **nenhum overflow horizontal**. Verificar no console:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

Expected: `true` em todas as larguras. O sangramento é a mudança de maior risco deste plano — se der `false`, reduzir a margem negativa.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/components.css
git commit -m "feat(layout): numeração de seções e split editorial com imagem sangrando"
```

### Task 13: Seção Manifesto

**Files:**
- Modify: `index.html` (inserir entre Filosofia e Diferenciais)

**Interfaces:**
- Consumes: `.bg-noir`, `--fluid-mega`, `reveal-mask`, `line-draw`.

- [ ] **Step 1: Inserir a seção após o fechamento da Filosofia (linha 161)**

```html
    <!-- ===== MANIFESTO ===== -->
    <section class="section section--lg bg-noir manifesto" aria-label="Nosso método">
      <div class="container">
        <span class="section-eyebrow"><span class="section-number">02</span>O método</span>

        <p class="manifesto__text" data-animate="reveal-mask">
          <span>Técnica não é rigidez. É a liberdade de fazer o difícil parecer inevitável.</span>
        </p>

        <div class="manifesto__rule" data-animate="line-draw"></div>

        <p class="manifesto__source">Metodologia Vaganova · desde 2016</p>
      </div>
    </section>
```

- [ ] **Step 2: Adicionar o CSS**

```css
/* ---- Ato II: manifesto ---- */
.manifesto { text-align: left; }

.manifesto__text {
  font-family: var(--font-display);
  font-size: var(--fluid-mega);
  font-weight: 400;
  font-style: italic;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-white);
  max-width: 16ch;
  text-wrap: balance;
  margin-block: var(--space-7);
}

.manifesto__rule {
  width: min(420px, 100%);
  height: var(--hairline);
  background: var(--color-gilt-line);
  margin-bottom: var(--space-5);
}

.manifesto__source {
  font-size: var(--fluid-xs);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-gilt);
}
```

`.bg-noir p` define `color: rgba(252,250,250,0.72)`; as regras acima vêm depois no arquivo e vencem por ordem, com a mesma especificidade de classe — confirmar visualmente que o texto do manifesto está branco e a fonte em dourado.

- [ ] **Step 3: Verificar tipografia em 360px**

`--fluid-mega` chega a `3rem` no mínimo. Confirmar que `max-width: 16ch` não causa overflow e que a frase quebra bem. Rodar de novo a checagem de `scrollWidth`.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/components.css
git commit -m "feat(layout): seção manifesto full-bleed noir"
```

### Task 14: Ato III e fecho

**Files:**
- Modify: `index.html` (Bolshoi, CTA final, rodapé)
- Modify: `assets/css/components.css`

- [ ] **Step 1: Elevar a seção Bolshoi para `.bg-stage`**

Trocar `bg-charcoal` por `bg-stage` na linha 219. Adicionar a hairline dourada acima do `.video-poster` e tratar o card de imprensa com mais hierarquia (fonte maior no título, `--color-gilt` no rótulo da fonte).

- [ ] **Step 2: Aplicar `.bg-stage` ao CTA final**

Trocar `bg-charcoal` por `bg-stage` na linha 509.

- [ ] **Step 3: Rodapé com a hairline**

Adicionar `border-top: var(--hairline) solid var(--color-gilt-line);` ao seletor do rodapé em `components.css`.

- [ ] **Step 4: Verificar o ritmo da página inteira**

Rolar a home de cima a baixo. Expected: alternância clara entre atos de penumbra e de luz; três seções escuras nunca seguidas sem uma clara entre elas, exceto o Ato I (hero + stats), que é deliberado.

- [ ] **Step 5: Commit da Fase 4**

```bash
git add index.html assets/css/components.css
git commit -m "feat(layout): composição editorial e ritmo assimétrico das seções"
```

---

## Fase 5 — Direção de arte de imagem

### Task 15: Sistema de tratamento de imagem

**Files:**
- Modify: `assets/css/components.css`
- Modify: `index.html` e `pages/*.html`

**Interfaces:**
- Produces: `.img-treated`, `.img-treated--portrait`, `.img-frame`, razões de aspecto por contexto.

- [ ] **Step 1: Adicionar as classes de tratamento**

```css
/* ============================================
   TRATAMENTO DE IMAGEM — direção de arte unificada

   Faz fotos de origens diferentes parecerem uma só campanha.
============================================ */
.img-treated {
  position: relative;
  overflow: hidden;
  background: var(--color-ink-700);
}

.img-treated > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Unificação de cor: leve aquecimento e contraste. */
  filter: saturate(0.88) contrast(1.06) brightness(0.96);
  transition: filter var(--transition-slow), transform var(--transition-slow);
}

/* Vinheta padrão */
.img-treated::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 90% 85% at 50% 45%,
                transparent 50%, rgba(16,12,13,0.38) 100%);
}

.img-frame { border: var(--hairline) solid var(--color-border); }

/* Razões de aspecto editoriais por contexto */
.img-treated--hero    { aspect-ratio: 16 / 9; }
.img-treated--split   { aspect-ratio: 4 / 5; }
.img-treated--card    { aspect-ratio: 3 / 4; }
.img-treated--portrait { aspect-ratio: 1 / 1; }

/* Hover editorial: dessatura → cor, vinheta clareia. Só em ponteiro fino. */
@media (hover: hover) and (pointer: fine) {
  .card:hover .img-treated > img {
    filter: saturate(1.02) contrast(1.02) brightness(1);
    transform: scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .img-treated > img { transition: none; }
  .card:hover .img-treated > img { transform: none; }
}
```

- [ ] **Step 2: Aplicar aos slots das 9 páginas**

Envolver cada `<img>` de card, split e retrato em `<div class="img-treated img-treated--card">` (ou o modificador adequado ao contexto). Manter os `alt` existentes.

- [ ] **Step 3: Re-curar os Unsplash e documentar cada slot**

Para cada imagem que permanecer stock, trocar por uma coerente com a direção — movimento, penumbra quente, ponta, barra de ateliê; nenhum sorriso corporativo — e adicionar acima dela um comentário no formato:

```html
<!-- FOTO REAL: [assunto]. [Enquadramento]. [Luz]. Substituir por assets/images/content/[nome].jpg -->
```

- [ ] **Step 4: Verificar coerência visual**

Abrir as 9 páginas em sequência. Expected: as fotos parecem da mesma campanha — mesma temperatura, mesma profundidade, mesmas razões de aspecto por contexto.

- [ ] **Step 5: Commit**

```bash
git add assets/css/components.css index.html pages/
git commit -m "feat(art): sistema de tratamento de imagem e curadoria coerente"
```

### Task 16: Guia de captação, OG image e QA final

**Files:**
- Create: `assets/images/ART-DIRECTION.md`
- Create: `assets/images/og-image.svg`
- Modify: `index.html` e `pages/*.html` (metatags)

- [ ] **Step 1: Escrever `assets/images/ART-DIRECTION.md`**

Documento cobrindo, com esta estrutura: conceito em uma linha; luz (quente lateral, penumbra, nunca frontal chapada); fundo (escuro ou neutro, sem poluição); movimento (arrasto sutil, 1/60–1/125, nunca congelado demais); composição (espaço negativo para tipografia à esquerda ou no centro-baixo); retratos de mestres (preto e branco quente, fundo escuro, 1:1); razões de aspecto por contexto (hero 16:9, split 4:5, card 3:4, retrato 1:1); e o que **não** fazer (flash direto, sorriso posado para a câmera, fundo branco de estúdio fotográfico, saturação alta).

- [ ] **Step 2: Criar `assets/images/og-image.svg`**

Composição tipográfica de marca em 1200×630: fundo `--color-noir`, nome do estúdio em Playfair, hairline em `--color-gilt`, sem foto. SVG para não depender de rasterização.

Nota: alguns validadores de OG não aceitam SVG. Gerar também um PNG 1200×630 a partir dele e apontar as metatags para o PNG, mantendo o SVG como fonte editável.

- [ ] **Step 3: Apontar as metatags nas 9 páginas**

```html
  <meta property="og:image" content="https://<domínio>/assets/images/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 4: Rodar as duas guardas uma última vez**

Run: `node scripts/check-contrast.mjs && node scripts/check-invariants.mjs`

Expected: ambos exit 0.

- [ ] **Step 5: QA completo contra os critérios de aceite**

Percorrer a lista abaixo, marcando cada item apenas após verificação real:

- [ ] `prefers-reduced-motion: reduce` — todo conteúdo em estado final estático nas 9 páginas.
- [ ] JS desligado — site legível, navegável, título do hero visível.
- [ ] CDN do jsdelivr bloqueado — scroll nativo, menu e formulários funcionando.
- [ ] Lighthouse mobile ≥ 90 em Performance, Best Practices, SEO e Accessibility.
- [ ] LCP do hero não regrediu em relação à `main`.
- [ ] CPU throttle 4x — scroll sem long tasks nem forced reflow.
- [ ] Foco visível em todos os interativos; teclado navega hero, carrossel e menu.
- [ ] `h1` do hero com nome acessível correto e anunciado uma única vez.
- [ ] 360 / 768 / 1024 / 1440 — `scrollWidth <= clientWidth` em todas.
- [ ] Páginas internas sem regressão de paleta.

- [ ] **Step 6: Commit da Fase 5**

```bash
git add assets/images/ index.html pages/
git commit -m "feat(art): sistema de tratamento de imagem + guia de direção de arte"
```

---

## Auto-revisão deste plano

**Cobertura do spec:** Fase 1 → Tasks 1-3. Fase 2 (hero) → Tasks 8-10. Fase 3 (motion) → Tasks 4-7. Fase 4 → Tasks 11-14. Fase 5 → Tasks 15-16. Os três defeitos pré-existentes: fontes → Task 2, parallax → Task 5, sincronia loader/hero → Tasks 8-9. A regra de contraste do dourado é imposta automaticamente pela Task 0.

**Itens do spec sem task, resolvidos aqui:** as micro-interações de botão magnético e sublinhado-máscara do spec estão parcialmente cobertas — `.link-underline` nasce na Task 3, mas o **botão magnético não tem task própria**. Decisão: fica fora do escopo desta execução. É o item de menor retorno do brief, exige um listener de `pointermove` por botão e o próprio brief o marcava como sutil. Se for desejado, entra como task avulsa depois da Fase 5, sem bloquear nada.

**Consistência de nomes verificada:** `onFrame`/`setScrollSource` (Task 4) são os mesmos consumidos nas Tasks 5 e 6. `studio:curtain-up` idêntico entre Tasks 8 e 9. `.bg-stage`/`.bg-noir` definidos na Task 3 e usados nas Tasks 11-14. `--color-gilt-line` definido na Task 1 e usado em cinco tasks. `.sr-only` definido na Task 1 e usado na Task 9.
