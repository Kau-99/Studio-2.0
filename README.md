# Estúdio de Artes Thaisa Vieira — v2.0

Website institucional do Estúdio Thaisa Vieira — ballet clássico de excelência em Nova Iguaçu, RJ.

## Stack

- HTML5 semântico
- CSS3 modular (sem frameworks)
- JavaScript ES Modules (vanilla, sem dependências)
- Google Fonts: Playfair Display + Poppins
- Imagens placeholder: Unsplash (substituir por imagens reais antes de produção)

## Estrutura

```text
.
├── index.html                  Homepage
├── 404.html                    Página de erro elegante
├── pages/
│   ├── about.html             História, valores, fundadora, timeline
│   ├── programs.html          Catálogo de programas + grade horária
│   ├── faculty.html           Corpo docente
│   ├── events.html            Espetáculos e workshops
│   ├── blog.html              Artigos e insights
│   ├── contact.html           Formulário + informações + FAQ
│   └── privacy.html           Política de Privacidade (LGPD)
└── assets/
    ├── css/
    │   ├── base.css           Reset, variáveis, tipografia
    │   ├── layout.css         Grid, container, spacing
    │   ├── components.css     Buttons, cards, header, forms, etc.
    │   ├── utilities.css      Helpers, animações, responsive
    │   └── main.css           Aggregator (importa todos)
    └── js/
        ├── main.js            Orchestrator
        ├── components/
        │   ├── header.js
        │   ├── menu.js
        │   ├── observer.js    (IntersectionObserver reveal)
        │   ├── animations.js  (Counters + parallax)
        │   ├── carousel.js
        │   ├── forms.js       (Validação real-time)
        │   ├── loader.js      (Page loader elegante)
        │   ├── scroll-progress.js
        │   └── consent-notice.js
        └── utils/
            ├── constants.js
            └── helpers.js
```

## Como rodar localmente

Como o projeto usa ES Modules, precisa de um servidor local (não funciona via `file://`).

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# VS Code: Live Server extension
```

Acesse `http://localhost:8000`.

## Antes de produção

- [ ] Substituir imagens Unsplash por fotos reais do estúdio
- [ ] Atualizar número de WhatsApp em `assets/js/utils/constants.js`
- [ ] Atualizar dados de contato (telefone, e-mail, endereço) em todos os HTMLs
- [ ] Integrar formulário com backend ou serviço (Formspree, Netlify Forms)
- [ ] Integrar mapa Google Maps em `pages/contact.html`
- [ ] Integrar newsletter com Mailchimp / Brevo / outro
- [ ] Adicionar favicon real (16×16, 32×32, apple-touch-icon)
- [ ] Adicionar `og:image` para preview em redes sociais
- [ ] Minificar CSS/JS para produção
- [ ] Criar `sitemap.xml` e `robots.txt`
- [ ] Configurar redirecionamento 404 no servidor
- [ ] Auditoria Lighthouse (meta: 90+ em todas categorias)
- [ ] Testar em devices reais (iOS, Android, tablets)

## Design System

### Paleta

| Variável                | HEX       | Uso                              |
| ----------------------- | --------- | -------------------------------- |
| `--color-charcoal`      | `#1A1516` | Texto principal, fundos escuros  |
| `--color-alabaster`     | `#FCFAFA` | Fundo padrão (off-white)         |
| `--color-blush`         | `#F9F1F2` | Fundo de seção rosado            |
| `--color-rose`          | `#D28A97` | Cor primária / accent            |
| `--color-rose-dark`     | `#B56B79` | Hover / contraste                |
| `--color-text-muted`    | `#887B7D` | Texto secundário                 |
| `--color-border`        | `#E8DCDD` | Bordas suaves                    |

### Tipografia

- **Display:** Playfair Display (headings — elegância editorial)
- **Body:** Poppins (UI e body text)
- **Italic accents:** `<em class="text-italic-accent">` em headings para contraste editorial

### Componentes principais

- `.btn` — `--primary`, `--secondary`, `--text`, `--ghost`, `--sm`, `--lg`, `--block`
- `.card` — `--program`, `--event`, `--blog`, `--testimonial`, `--faculty`
- `.feature-card`, `.value-card`, `.info-card`, `.timeline`, `.faq-item`
- `.hero`, `.page-hero`, `.featured-event`
- `.section` + `.bg-{white|blush|charcoal|alabaster}`
- `.split`, `.grid`, `.flex`
- `.section-eyebrow` (label decorativa)
- `.scroll-progress`, `.consent-notice`, `.page-loader`

### Animações

Aplique via atributos HTML — sem JavaScript adicional necessário:

- `data-animate` — fade-up ao entrar viewport
- `data-animate="fade-left"` / `="fade-right"` / `="scale-up"` / `="fade"`
- `data-stagger` — anima filhos com delay progressivo
- `data-counter="350"` — contador animado de 0 ao valor
- `data-parallax="0.3"` — efeito parallax sutil

Tudo respeita `prefers-reduced-motion: reduce`.

## Acessibilidade

- HTML semântico (`header`, `nav`, `main`, `section`, `article`, `footer`)
- Skip-to-content link
- ARIA labels em ícones, navegação e elementos interativos
- Focus rings visíveis (`:focus-visible`)
- Contraste WCAG AA
- Hierarquia de headings correta
- `prefers-reduced-motion` respeitado
- Carrossel pausa em hover/focus, navegável via teclado (←/→)
- Formulário com validação acessível e mensagens de erro

## Performance

- Sem frameworks ou bibliotecas externas
- ES Modules nativos
- `loading="lazy"` em imagens não-críticas
- `fetchpriority="high"` no hero image
- Fonts via `preconnect`
- CSS modular dividido por concern
- Animações via `transform` e `opacity` (GPU-accelerated)

## Páginas

| Rota | Descrição |
| --- | --- |
| `/` | Homepage — hero, stats, filosofia, diferenciais, programas, depoimentos, eventos |
| `/pages/about.html` | Sobre, missão, valores, fundadora, timeline 18 anos |
| `/pages/programs.html` | 6 programas + grade semanal de horários |
| `/pages/faculty.html` | Corpo docente — fundadora, professoras, mestres convidados |
| `/pages/events.html` | Evento em destaque + próximos + histórico |
| `/pages/blog.html` | Grid de artigos com filtros por categoria |
| `/pages/contact.html` | Formulário, info, mapa, FAQ |
| `/pages/privacy.html` | Política de Privacidade (LGPD) |
| `/404.html` | Página de erro elegante |

## Créditos

Desenvolvido por **Kauã Honorato de Almeida**
Estúdio de Artes Thaisa Vieira · Nova Iguaçu, RJ · 2026
