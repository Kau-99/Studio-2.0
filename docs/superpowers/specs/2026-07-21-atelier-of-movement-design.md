# Atelier of Movement — Design (v2.0 → v3.0)

**Site:** Estúdio de Artes Thaisa Vieira
**Branch:** `redesign/atelier-of-movement`
**Data:** 2026-07-21

## Objetivo

Injetar direção de arte editorial-cinematográfica numa base de engenharia já sólida, preservando performance, acessibilidade e a natureza vanilla/estática. O site deve encantar em três segundos, não apenas funcionar bem.

## Decisões tomadas

| Questão | Decisão |
| --- | --- |
| Imagens | Continua stock. Re-curadoria dos Unsplash + sistema CSS de tratamento + guia de captação. Nenhum arquivo local é pré-requisito. |
| Seção Manifesto | Entra (somente na home). |
| Vídeo de fundo no hero | Entra como andaime progressivo — funciona sem arquivo de vídeo. |
| Cursor assinatura | **Fora.** Custo de a11y sem ganho proporcional. |
| Lib de motion | **Lenis apenas** (~3KB, scroll com inércia). Motion One fora — CSS cobre as revelações. |

## Restrições herdadas (invioláveis)

- Sem framework, sem bundler, sem build step. ES Modules vanilla.
- Nenhum token existente é renomeado ou removido — apenas estendido.
- Todo movimento novo respeita `prefers-reduced-motion: reduce` com estado final estático.
- Site legível e navegável com JS desligado (`.no-js`).
- Só `transform`/`opacity`/`clip-path`/`filter` são animados.
- Zero valor mágico: valor repetido vira token em `:root`.
- Fases 1, 3 e 5 se aplicam também às sete páginas em `pages/`.

## Problemas pré-existentes que o redesign corrige

Três defeitos reais encontrados na base, que passam a fazer parte do escopo porque bloqueiam as metas de aceite:

1. **Fontes em `@import` render-blocking** — `main.css:7` importa o Google Fonts de dentro do CSS. O browser só descobre a fonte depois de baixar o CSS, criando uma cascata que penaliza o LCP. Move para `<link rel="preconnect">` + `<link rel="stylesheet">` no `<head>` de todas as 9 páginas.
2. **`initParallax` causa layout thrashing** — `animations.js:36-45` lê `getBoundingClientRect()` de todos os elementos e escreve `transform` em seguida, dentro de um listener de `scroll` sem rAF. Intercala leitura e escrita a cada evento.
3. **Loader e hero dessincronizados** — `loader.js` remove a cortina por `setTimeout` enquanto as animações do hero disparam em `DOMContentLoaded`, independentes. O título do hero revela atrás da cortina; a entrada mais cara do site é gasta onde ninguém vê.

## Fase 1 — Fundações visuais

**Arquivos:** `assets/css/base.css` (estender `:root`), novo `assets/css/atmosphere.css`, `assets/css/main.css` (importar), `<head>` das 9 páginas.

### Tokens novos

```css
/* Profundidade */
--color-noir:      #100C0D
--color-ink-800:   #130F10
--color-ink-700:   #171213

/* Acento metálico */
--color-gilt:      #C9A96A
--color-gilt-ink:  #8A6D33
--color-gilt-line: rgba(201,169,106,.35)

/* Motivo hairline */
--hairline:        1px
--rule-length:     32px

/* Tipografia manifesto */
--fluid-mega:      clamp(3rem, 1.5rem + 8vw, 8rem)

/* Luz */
--glow-warm: radial-gradient(ellipse 60% 50% at 50% 45%,
               rgba(201,169,106,.14) 0%,
               rgba(210,138,151,.07) 45%,
               transparent 75%)
```

### Regra de contraste do dourado (verificada por cálculo)

- `--color-gilt` sobre `--color-noir`: **8.7:1** — passa AA e AAA.
- `--color-gilt` sobre `--color-alabaster`: **2.17:1** — **reprova AA**.
- `--color-gilt-ink` sobre `--color-alabaster`: **4.7:1** — passa AA para texto normal.

Portanto: `--color-gilt` só é permitido como **texto** dentro de `.bg-noir`/`.bg-stage`. Em fundo claro, ou é `--color-gilt-line` (hairline decorativa, isenta de contraste de texto) ou `--color-gilt-ink` (texto). Esta regra é documentada em comentário no `:root` para não ser violada em manutenção futura.

### `atmosphere.css`

Três responsabilidades, nada além:

1. **Grão de filme** — `body::after` fixo, `feTurbulence` SVG inline como data-URI, `mix-blend-mode: overlay`, `opacity: .035`, `pointer-events: none`, z-index abaixo de modais. Permanece ativo sob `prefers-reduced-motion` — textura estática não é movimento.
2. **`.bg-noir` / `.bg-stage`** — gradiente noir→ink-800→charcoal + vinheta de canto + halo quente, substituindo o chapado de `.bg-charcoal`. `.bg-charcoal` continua existindo e funcionando (páginas internas não quebram).
3. **Motivo hairline** — três formas: `.rule` (divisor), `.link-underline` (fio que cresce da esquerda no hover), `.eyebrow` (traço de `--rule-length` antes do texto).

### Tipografia

`@import` de fonte removido de `main.css`; `<link>` adicionado ao `<head>` das 9 páginas, incluindo peso 500 do Playfair (hoje ausente) e mantendo o itálico 400/600 já presente. `font-optical-sizing: auto`. Padronizar `text-wrap: balance` em títulos e `pretty` em parágrafos.

**Aceite:** tokens disponíveis; grão perceptível mas discreto; nenhuma regressão nas páginas internas; Lighthouse não cai.

## Fase 2 — Hero cinematográfico

**Arquivos:** `index.html`, `components.css` (`.hero*`), `assets/js/components/hero.js` (novo), `loader.js`.

### Camadas

Cinco, de trás para frente: imagem/vídeo → gradiente noir com vinheta de canto → grão → halo quente atrás do título → conteúdo. Parallax por camada (a imagem move mais devagar que o texto), alimentado pelo loop rAF único da Fase 3.

### Revelação do título

O `h1` é quebrado em spans por linha, cada uma sob `overflow: hidden`, entrando por `translateY` + `clip-path` com delay escalonado. O itálico *"grandes oportunidades"* chega por último, como acento da frase.

**Acessibilidade:** a quebra por linha não pode fragmentar o texto para leitores de tela. Solução determinística, sem depender do comportamento de cada leitor: o `h1` contém a frase completa uma única vez em `.sr-only`, seguida da estrutura decorativa por linha marcada com `aria-hidden="true"`.

```html
<h1 class="hero__title">
  <span class="sr-only">Formando bailarinas para grandes oportunidades</span>
  <span class="hero__title-lines" aria-hidden="true">
    <span class="line"><span class="line__inner">Formando bailarinas para</span></span>
    <span class="line"><span class="line__inner"><em>grandes oportunidades</em></span></span>
  </span>
</h1>
```

Sob `.no-js` e `prefers-reduced-motion`, `.line__inner` já nasce em `transform: none; clip-path: none` — a estrutura permanece, o movimento não.

**Fallbacks:** sob `.no-js` e sob `prefers-reduced-motion`, o `h1` nasce em estado final visível, sem qualquer movimento.

### Sincronia com o loader

`loader.js` passa a emitir um evento `studio:curtain-up` no momento em que a cortina termina de subir. O hero escuta esse evento para iniciar a revelação. Se o evento não chegar (loader ausente numa página interna, JS parcialmente falho), um timeout de segurança dispara a revelação assim mesmo — o hero nunca fica invisível esperando um evento que não vem.

### Vídeo de fundo

`<video muted autoplay loop playsinline>` assume apenas se um arquivo existir em `assets/images/hero/`; `<img>` serve de poster e fallback e mantém `fetchpriority="high"`. Sob `prefers-reduced-motion`, o vídeo é pausado e o poster permanece. O site nunca depende do vídeo.

### Scroll hint e eyebrow

Refinar o timing e a opacidade da linha que "respira" para algo mais sutil. Eyebrow recebe a hairline e tracking mais amplo.

**Aceite:** impacto imediato; LCP preservado; revelação a 60fps; degrada perfeito sem JS e em reduced-motion.

## Fase 3 — Sistema de movimento coreografado

**Arquivos:** `observer.js`, `animations.js`, novo `motion.css`, novo `assets/js/utils/raf.js`.

### Loop rAF único

Um só loop no site inteiro, em `utils/raf.js`, com registro de callbacks. Lenis alimenta esse loop — não roda o seu próprio rAF em paralelo. O loop só está ativo quando há elemento animável em viewport; um `IntersectionObserver` liga e desliga. Leituras de layout em lote, escritas em lote, nunca intercaladas.

### Lenis

Carregado via CDN com `integrity`/`crossorigin`. **Desligado** em `prefers-reduced-motion` e em touch (`hover: none`). Se o CDN falhar, o loop usa `scrollY` nativo e o scroll continua exatamente como hoje — o carregamento é `try/catch`, nunca bloqueante, e a ausência da lib não impede o resto do JS de inicializar.

### Variantes de revelação

`data-animate`/`data-stagger` permanecem intactos. Adiciona-se:

- `reveal-mask` — texto/imagem revelado por máscara que sobe.
- `reveal-clip` — imagem entra por `clip-path` de baixo ou do lado.
- `line-draw` — hairline que desenha da esquerda.

Stagger com delay em curva (ease no delay, não linear) — a diferença entre "aparecer em fila" e "entrar em cena".

Onde `animation-timeline: view()` for suportado, usar CSS puro; o JS permanece como fallback.

### Micro-interações

- **Botões magnéticos** — atração de poucos px, apenas sob `@media (hover: hover) and (pointer: fine)`, desligado em touch e reduced-motion.
- **Sublinhado-máscara** em nav e `.btn--text`, harmonizado com a seta já existente.
- **Imagens de card** — ao `scale(1.06)` atual soma-se dessaturação→cor e clareamento de vinheta.

**Aceite:** 60fps sem jank (verificar com CPU throttle 4x); nenhuma animação sob reduced-motion; touch não herda hover.

## Fase 4 — Composição editorial

**Arquivos:** `index.html`, `pages/*.html`, `components.css`, `layout.css`.

### Numeração de seções

Estilo programa de espetáculo: `01 —`, em `--color-gilt` (fundo escuro) ou `--color-gilt-ink` (fundo claro), tipografia pequena com tracking, ao lado do eyebrow.

### Ritmo da home em atos

**Ato I (penumbra):** Hero → Stats. Os números saem do `bg-white` e passam ao noir em `--fluid-mega`.

> **Decisão registrada:** a faixa de Stats é **delimitada, não emendada ao hero**. A versão sem costura encadearia ~1,5 viewport de escuridão contínua — se a foto do hero for pesada, vira opressão antes da primeira luz. A faixa mantém `section--sm` e é separada do hero por uma hairline em `--color-gilt-line`, lendo-se como segundo movimento. Preserva a dramatização da prova social sem o risco.

Corte seco para a luz em seguida.

**Ato II (ateliê iluminado):** `01 —` Filosofia em split assimétrico, imagem sangrando até a borda, texto em coluna estreita com respiro, moldura hairline e parallax leve → `02 —` Manifesto do método, full-bleed noir, só tipografia mega e hairline → `03 —` Diferenciais.

**Ato III (palco):** `04 —` Bolshoi como matéria de revista — fio dourado, citação em destaque, card de imprensa com hierarquia.

**Ato IV (navegação):** `05 —` Programas, `06 —` Depoimentos, `07 —` Agenda.

> **Decisão registrada:** a grade **permanece grade**, contrariando deliberadamente o "quebrar a grade" do brief neste trecho. Quem chega aqui está comparando turmas e datas, não contemplando — assimetria custa escaneabilidade, e é o ponto onde uma composição quebrada tem mais chance de desmoronar em 360px. Drama contínuo também cansa. O que muda é a direção de arte das imagens, o badge e o hover.

**Fecho:** CTA em noir + newsletter; rodapé com hairline e tratamento noir.

**Aceite:** cada seção tem identidade e respiro; a home conta uma narrativa; nada parece grid genérico.

## Fase 5 — Direção de arte de imagem

**Arquivos:** `components.css`, `index.html`, `pages/*.html`, novo `assets/images/ART-DIRECTION.md`, novo `assets/images/og-image` + metatags.

### Sistema de tratamento

Classes que fazem stock de origens diferentes parecer uma campanha só: moldura hairline opcional, vinheta padrão, overlay quente sutil via `filter`/`mix-blend`, e razões de aspecto fixas por contexto — hero 16:9, split 4:5, card 3:4, retrato de mestre 1:1.

### Curadoria e documentação

Re-curar os Unsplash para o vocabulário certo: movimento, penumbra quente, ponta/sapatilha, barra de ateliê. Zero sorriso corporativo. Cada slot recebe um comentário HTML declarando qual foto real deve entrar e com que enquadramento.

`ART-DIRECTION.md` documenta como as fotos reais devem ser feitas: luz quente lateral, fundo escuro/neutro, movimento com arrasto sutil, espaço negativo para tipografia, retratos de mestres em preto e branco quente.

### OG image e favicon

Gerar `og:image` de marca (composição tipográfica + hairline) e apontar as metatags nas 9 páginas, resolvendo a pendência do README.

**Aceite:** as imagens parecem pertencer à mesma campanha; existe guia claro para trocar por fotos reais sem quebrar a direção.

## Commits

Um por fase, na branch `redesign/atelier-of-movement`:

1. `feat(design): fundações — paleta noir/gilt, grão de filme, escala tipográfica editorial`
2. `feat(hero): hero cinematográfico com revelação por máscara e camadas`
3. `feat(motion): sistema de movimento coreografado + correção de parallax (rAF)`
4. `feat(layout): composição editorial e ritmo assimétrico das seções`
5. `feat(art): sistema de tratamento de imagem + guia de direção de arte`

## Critérios de aceite finais

- [ ] Com `prefers-reduced-motion: reduce`, todo conteúdo em estado final estático, sem movimento — testado de fato.
- [ ] Com JS desligado: site legível, navegável, imagens visíveis, título do hero visível.
- [ ] Com o CDN do Lenis bloqueado: scroll nativo funcional, resto do JS inicializa normalmente.
- [ ] Lighthouse mobile ≥ 90 em Performance, Best Practices, SEO e Accessibility; LCP do hero não regride.
- [ ] Nenhum handler de scroll sem rAF; 60fps com CPU throttle 4x.
- [ ] Foco visível em tudo; contraste AA respeitando a regra do dourado; ARIA intacto; teclado navega hero, carrossel e menu.
- [ ] Título do hero lido corretamente por leitor de tela apesar da quebra por linha.
- [ ] 360 / 768 / 1024 / 1440 sem overflow horizontal; safe-area respeitada.
- [ ] Motivo hairline consistente; nenhum valor mágico fora de token; paleta antiga intacta nas páginas internas.
- [ ] Fases 1, 3 e 5 aplicadas às sete páginas em `pages/`.
