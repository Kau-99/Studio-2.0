# Estúdio de Artes Thaisa Vieira

Website institucional de um estúdio de ballet clássico em Nova Iguaçu, RJ.

Site estático multi-página, sem framework e sem build step. HTML semântico, CSS
modular e JavaScript em ES Modules nativos. A única dependência de terceiros é o
Lenis, vendorado no repositório.

**Produção:** [kau-99.github.io/Studio-2.0](https://kau-99.github.io/Studio-2.0/)

---

## Por que sem build step

A decisão é deliberada e restringe todo o resto do projeto.

O site é institucional, muda com pouca frequência e será mantido por quem não
necessariamente tem Node instalado. Um pipeline de build adicionaria uma classe
inteira de falhas — dependências desatualizadas, lockfile quebrado, CI que para
de rodar — em troca de ganhos que aqui são marginais. O que se abre mão em
ergonomia (sem TypeScript, sem PostCSS, sem tree-shaking) se recupera em
longevidade: qualquer navegador serve os arquivos como estão, e o deploy é
copiar a pasta.

Consequências que aparecem no código:

- Nada de `import` de `node_modules`. Bibliotecas entram vendoradas em
  `assets/js/vendor/` ou não entram.
- CSS é organizado por `@import`, e **a ordem importa** (ver
  [Cascata](#cascata-e-especificidade)).
- Verificação é feita por scripts Node avulsos, sem test runner (ver
  [Verificação](#verificação)).

## Stack

| Camada | Escolha |
| --- | --- |
| Markup | HTML5 semântico, multi-página |
| Estilo | CSS3 com custom properties, `clip-path`, `mix-blend-mode` |
| Comportamento | JavaScript ES Modules, sem transpilação |
| Scroll suave | [Lenis](https://github.com/darkroomengineering/lenis) 1.1.18, vendorado (~28 KB) |
| Tipografia | Playfair Display (display) + Poppins (corpo), via Google Fonts |
| Deploy | GitHub Pages, via GitHub Actions |

## Estrutura

```text
.
├── index.html                      Homepage
├── 404.html                        Página de erro
├── pages/                          7 páginas internas
├── scripts/
│   ├── check-contrast.mjs          Guarda de contraste WCAG
│   └── check-invariants.mjs        Guardas estruturais das 9 páginas
├── docs/superpowers/               Spec de design e plano de implementação
└── assets/
    ├── css/                        Ordem de @import definida em main.css
    │   ├── base.css                Reset, tokens (:root), tipografia
    │   ├── layout.css              Grid, container, split, seções
    │   ├── atmosphere.css          Grão de filme, fundos de palco, hairlines
    │   ├── components.css          Header, hero, cards, forms, footer
    │   ├── motion.css              Variantes de revelação
    │   └── utilities.css           Helpers e overrides
    ├── images/
    │   ├── ART-DIRECTION.md        Guia de captação fotográfica
    │   └── og-image.svg|png        Imagem de compartilhamento social
    └── js/
        ├── main.js                 Orquestrador
        ├── components/             11 módulos (um por comportamento)
        ├── utils/
        │   ├── raf.js              Loop rAF único do site
        │   ├── constants.js
        │   └── helpers.js
        └── vendor/
            └── lenis.mjs           Vendorado, não editar à mão
```

## Rodando localmente

ES Modules exigem origem HTTP — abrir `index.html` via `file://` falha no CORS.

```bash
npx serve -l 8080 .
# ou: python -m http.server 8080
```

## Arquitetura

### Loop rAF único

Todo trabalho por frame do site passa por `assets/js/utils/raf.js`. Nenhum outro
módulo registra `addEventListener('scroll')` — há uma guarda automatizada que
falha o build se alguém tentar.

O motivo é concreto: antes disso, três módulos (`animations`, `header`,
`scroll-progress`) escutavam scroll de forma independente e disputavam o main
thread no mesmo gesto, e o parallax intercalava leitura de layout
(`getBoundingClientRect`) com escrita de estilo, provocando reflow forçado a
cada evento.

O loop expõe duas formas de registro:

```js
import { onFrame } from '../utils/raf.js';

// Função simples: só escreve, recebe o estado do frame.
onFrame(({ scrollY, viewportH }) => { /* ... */ });

// Objeto: duas fases. TODAS as leituras de layout de TODOS os módulos
// rodam antes de QUALQUER escrita.
onFrame({
  measure: ({ viewportH }) => elementos.map(medir),   // só lê
  mutate:  (medidas) => medidas.forEach(escrever),    // só escreve
});
```

**Se o seu módulo lê layout, use a forma de objeto.** A forma simples existe para
quem só escreve; usá-la para ler reintroduz exatamente o thrashing que o loop
elimina.

Um handler que lança exceção é capturado, logado e **removido do loop** — o bug
de um módulo não pode congelar o movimento do site inteiro.

### Lenis é vendorado, não vem de CDN

`import()` dinâmico não aceita atributo `integrity`. Como o Lenis é o único
código de terceiros do site e roda com acesso total ao DOM, carregá-lo de CDN
significaria executar bytes não verificados a cada visita, sem nenhuma garantia
criptográfica. Vendorado, os bytes ficam congelados no git e revisáveis em diff,
e a indisponibilidade do CDN deixa de ser um modo de falha.

O carregamento é tolerante a falha por construção: reduced-motion e ponteiro
grosso (touch) nem chegam a carregar; qualquer erro cai no scroll nativo com um
`console.warn` e **não impede o resto do JS de inicializar**. Se o Lenis falhar
em runtime, ele se desmonta sozinho e devolve o scroll ao navegador.

### Inicialização isolada

`main.js` remove a classe `no-js` do `<html>` na avaliação do módulo. A partir
daí, o conteúdo animado depende de JS para ficar visível — então cada `init` roda
dentro de um `try/catch` individual. Sem isso, um módulo que lançasse deixaria
todo elemento `[data-animate]` preso em `opacity: 0`, ou seja, a página em
branco por causa de um carrossel.

`initScrollAnimations` é o primeiro da fila justamente por ser o que revela o
conteúdo.

### Cortina e hero

O loader emite o evento `studio:curtain-up` quando termina de sair, e o hero
espera esse evento para revelar o título. Sem o handshake, a animação de entrada
mais cara do site acontecia atrás da cortina, onde ninguém via.

`initHero()` é chamado **antes** de `initLoader()`: em páginas sem cortina
(`404.html`) o evento dispara sincronamente, e o listener precisa já existir.
Ambos os lados têm timeout de segurança — o hero nunca fica invisível esperando
um evento que não veio.

## Sistema de movimento

Aplicado por atributo, sem JavaScript adicional:

| Atributo | Efeito |
| --- | --- |
| `data-animate` | Fade + subida ao entrar no viewport |
| `data-animate="fade-left\|fade-right\|scale-up"` | Variações direcionais |
| `data-animate="reveal-mask"` | Conteúdo sobe sob máscara |
| `data-animate="reveal-clip"` | Imagem entra por `clip-path` |
| `data-animate="line-draw"` | Hairline desenha da esquerda |
| `data-stagger` | Escalona os filhos com delay em curva |
| `data-counter="10"` | Contador animado até o valor |
| `data-parallax="0.12"` | Parallax por frame, via loop rAF |

### `reveal-mask` e `reveal-clip` animam o filho

Ambos exigem que o conteúdo seja **filho** do elemento anotado:

```html
<div class="split__media" data-animate="reveal-clip">
  <img src="..." alt="...">
</div>
```

Isso não é estilo, é requisito de funcionamento. Um elemento com
`clip-path: inset(0 0 100% 0)` reporta `isIntersecting: false` no
IntersectionObserver — verificado no Chromium contra um controle idêntico sem
clip, que reporta `true`. Com o clip no próprio elemento observado, a revelação
nunca dispara e a imagem fica invisível para sempre.

### Reduced motion e no-JS

Todo elemento que nasce escondido tem estado final visível em **dois** caminhos
de escape: `.no-js` e `prefers-reduced-motion: reduce`. Ao criar uma variante
nova, adicione os dois — sem eles, uma falha de JS não degrada a animação, ela
apaga o conteúdo.

## Design system

### Paleta

| Token | HEX | Uso |
| --- | --- | --- |
| `--color-charcoal` | `#1A1516` | Texto principal |
| `--color-noir` | `#100C0D` | Fundos de palco, rodapé |
| `--color-ink-800` / `-700` | `#130F10` / `#171213` | Degraus para gradiente |
| `--color-alabaster` | `#FCFAFA` | Fundo padrão |
| `--color-blush` | `#F9F1F2` | Fundo de seção |
| `--color-rose` | `#D28A97` | Accent primário |
| `--color-gilt` | `#C9A96A` | Acento metálico — **só sobre fundo escuro** |
| `--color-gilt-ink` | `#8A6D33` | Variante do dourado para fundo claro |
| `--color-gilt-line` | `rgba(201,169,106,.35)` | Hairline decorativa |
| `--color-text-muted` | `#7A6D6F` | Texto secundário |

**A regra do dourado é obrigatória.** `--color-gilt` mede 8.67:1 sobre noir e
2.17:1 sobre alabaster — reprova AA em fundo claro. Para texto sobre claro use
`--color-gilt-ink` (4.68:1); para fios decorativos, `--color-gilt-line`.
`scripts/check-contrast.mjs` verifica isso a cada execução.

### Tipografia

Playfair Display nos títulos, Poppins no corpo. A escala é fluida (`clamp()`),
de `--fluid-xs` a `--fluid-mega` — este último reservado para títulos-manifesto.

Máscaras de revelação sobre Playfair precisam de folga vertical: os descendentes
da fonte passam ~0.2em da baseline, e `line-height` apertado com
`overflow: hidden` decepa a perna do "p" e do "g". O padrão no projeto é
`padding-bottom: 0.14em` com `margin-bottom: -0.14em`.

### Motivo hairline

Linha de 1px que atravessa o site como assinatura visual — divisor de seção,
traço antes do eyebrow, sublinhado que cresce no hover, numeração de seção.
Tokens: `--hairline` e `--rule-length`.

## Cascata e especificidade

`main.css` define a ordem: **base → layout → atmosphere → components → motion →
utilities**.

`utilities.css` vem por último e contém regras genéricas de baixa especificidade,
entre elas `[data-animate] { opacity: 0; transform: translateY(28px) }`. Um
seletor de atributo tem especificidade (0,1,0) — a mesma de uma classe simples.
Isso já causou dois bugs silenciosos no projeto: regras de `motion.css` perdiam
o desempate para `utilities.css` por ordem de import, e `.bg-noir p` (0,1,1)
vencia `.manifesto__text` (0,1,0).

Ao escrever uma regra que precisa vencer a genérica, prefixe com `html` para
subir a especificidade sem inventar seletores frágeis:

```css
html [data-animate="line-draw"] { transform: scaleX(0); }
```

Quando uma cor ou transição "não está aplicando", a causa quase sempre é esta.

## Verificação

Não há test runner, e a ausência é deliberada — ver [Por que sem build
step](#por-que-sem-build-step). No lugar, dois scripts Node sem dependências,
que saem com código diferente de zero em caso de falha e servem para CI:

```bash
node scripts/check-contrast.mjs     # contraste WCAG, lendo os tokens de base.css
node scripts/check-invariants.mjs   # invariantes estruturais das 9 páginas
```

`check-invariants.mjs` cobre o que já quebrou uma vez: fonte carregada por
`<link>` e não por `@import` (que criava cascata bloqueante), ausência de
listener de scroll cru fora do `raf.js`, e o dourado nunca como texto em fundo
claro.

Verificação de comportamento é feita em navegador — checagem estática não pega
erro de runtime. O bug mais grave já encontrado aqui (um argumento trocado que
matava header e barra de progresso em todas as páginas) passou pelas guardas
limpo e só apareceu quando o site foi aberto de verdade.

## Acessibilidade

- HTML semântico, hierarquia de headings consistente, skip-to-content.
- Contraste AA verificado por script, não por inspeção visual.
- `:focus-visible` em todos os interativos; carrossel e menu navegáveis por
  teclado.
- O `h1` do hero é dividido em linhas para a animação de máscara, mas o nome
  acessível é preservado: a frase completa aparece uma vez em `.sr-only` e a
  estrutura decorativa leva `aria-hidden="true"`.
- Todo movimento respeita `prefers-reduced-motion: reduce` com estado final
  estático.

## Performance

- Sem framework, sem bundler; ~28 KB de terceiros no total.
- Fontes por `<link>` com `preconnect` — carregam em paralelo ao CSS. Enquanto
  estavam em `@import` dentro do CSS, o navegador só as descobria depois de
  baixar a folha, penalizando o LCP.
- Apenas `transform`, `opacity`, `clip-path` e `filter` são animados.
- Nenhum handler de scroll fora do loop rAF; leituras e escritas em lote.
- `loading="lazy"` no que não é crítico, `fetchpriority="high"` na imagem do
  hero, que é o elemento de LCP.

## Imagens

**As fotos atuais são de banco de imagens e devem ser substituídas.** Elas foram
curadas para respeitar a direção de arte, mas não mostram o estúdio real.

Cada `<img>` tem acima um comentário indicando o que entra ali:

```html
<!-- FOTO REAL: [assunto]. [Enquadramento e luz].
     Substituir por assets/images/content/[nome].jpg -->
```

O guia de captação está em [`assets/images/ART-DIRECTION.md`](assets/images/ART-DIRECTION.md)
— luz, fundo, movimento, composição, proporções por contexto e o que não fazer.
Leia antes da sessão de fotos; o tratamento de cor aplicado por CSS soma ao que
vier do arquivo.

## Pendências

- [ ] Substituir as fotos de banco por imagens reais do estúdio
- [ ] Atualizar WhatsApp em `assets/js/utils/constants.js` e os dados de contato
      nas páginas
- [ ] Integrar o formulário a um serviço (Formspree, Netlify Forms ou backend)
- [ ] Integrar mapa em `pages/contact.html` e newsletter a um provedor
- [ ] Favicon completo (16×16, 32×32, apple-touch-icon)
- [ ] `sitemap.xml` e `robots.txt`
- [ ] Auditoria Lighthouse (meta: 90+ em todas as categorias)
- [ ] Teste em dispositivos reais (iOS, Android, tablet)
- [ ] Ao migrar para domínio próprio, atualizar `og:url` e `og:image` nas 9
      páginas — hoje apontam para o endereço do GitHub Pages

## Deploy

Push na `main` dispara o workflow em `.github/workflows/deploy.yml`, que publica
no GitHub Pages. `.nojekyll` impede o processamento por Jekyll, que ignoraria
diretórios iniciados por underscore.

---

Desenvolvido por **Kauã Honorato de Almeida**
Estúdio de Artes Thaisa Vieira · Nova Iguaçu, RJ
