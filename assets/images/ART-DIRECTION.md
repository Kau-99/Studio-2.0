# Direção de arte — Atelier of Movement

Guia de captação para as fotos do Estúdio de Artes Thaisa Vieira.

Quem fotografar o estúdio deve ler isto antes. Quem for trocar uma imagem do site
deve conferir se a nova respeita estas regras — é o que mantém fotos de origens
diferentes parecendo uma campanha só.

## O conceito em uma linha

Um ateliê editorial de movimento: entre a capa de uma revista de dança e o
programa impresso de um espetáculo. Penumbra quente, silêncio, respiro.

## Estado atual das imagens

**Todas as fotos do site hoje são stock e devem ser substituídas.** Elas foram
curadas para respeitar a direção — ballet clássico, ponta, fundo escuro,
movimento — mas são de terceiros e não mostram o estúdio real, as alunas reais
nem os mestres reais.

Cada `<img>` no HTML tem acima um comentário no formato:

```html
<!-- FOTO REAL: [assunto]. [Enquadramento e luz].
     Substituir por assets/images/[pasta]/[nome].jpg -->
```

Esse comentário diz exatamente o que deve entrar no lugar. Ao trocar, mantenha o
`alt` existente (ou melhore-o), preserve `loading="lazy"` e não mexa em
`fetchpriority="high"` na imagem do hero — ela é o elemento de LCP da home.

## Luz

- **Quente e lateral.** A luz entra de um lado e deixa o outro cair na sombra. É
  o que dá volume ao corpo e profundidade à cena.
- **Penumbra, não escuridão.** Sombra com informação, não preto chapado.
- **Nunca flash direto na câmera.** Achata o corpo e mata a atmosfera.
- **Nunca luz fluorescente branca de teto.** É a luz que faz sala de aula parecer
  repartição.
- Evite gelatinas coloridas frias (ciano, magenta). Elas brigam com a paleta
  quente do site e não sobrevivem ao tratamento de cor aplicado por CSS.

## Fundo

- Escuro ou neutro: parede do estúdio, cortina de palco, penumbra.
- Sem poluição visual — nada de mochilas, garrafas, cadeiras, cartazes ou
  espelho refletindo o fotógrafo.
- Fundo branco de estúdio fotográfico está fora. O site é noir.

## Movimento

- Prefira o gesto em curso ao gesto congelado. Um leve arrasto (1/60 a 1/125)
  transmite dança; 1/1000 transmite fotografia de esporte.
- O ápice do salto, o desdobrar do braço, o giro do tutu.
- Poses estáticas olhando para a câmera são o oposto do que queremos.

## Composição

- **Espaço negativo é requisito, não sobra.** Várias fotos recebem tipografia por
  cima. Deixe pelo menos um terço do quadro respirando, de preferência à
  esquerda ou no centro-baixo.
- Assimetria: o corpo não precisa estar no centro.
- Corte com intenção. Detalhe (pés em ponta, mãos, fitas da sapatilha) vale tanto
  quanto o corpo inteiro.

## Retratos dos mestres

- Preto e branco quente (não cinza neutro, não sépia forte).
- Fundo escuro, luz lateral suave.
- Olhar sereno e direto, ou olhar fora de quadro. **Sem sorriso posado para a
  câmera** — o registro é de autoridade artística, não de foto de perfil.
- Enquadramento 1:1, do peito para cima.

## Razões de aspecto por contexto

O CSS já impõe estas proporções. Fotografe com folga para permitir o corte.

| Contexto | Proporção | Onde |
| --- | --- | --- |
| Hero | 16:9 | topo da home |
| Split editorial | 4:5 | seção Filosofia, Sobre |
| Card | 3:4 e 3:2 | programas, blog, espetáculos |
| Retrato de mestre | 1:1 | página Mestres |

## Tratamento automático

O site aplica por CSS, em toda foto dentro de card, split ou vídeo-poster:

- dessaturação leve, contraste editorial e escurecimento sutil
  (`saturate(.88) contrast(1.06) brightness(.96)`);
- vinheta radial quente nas bordas;
- placa escura por trás, para não haver flash branco durante o carregamento;
- ao passar o mouse, a cor volta ao pleno.

Isso significa duas coisas na hora de fotografar: **não entregue a foto já
escurecida** (o tratamento soma), e **não entregue saturada demais** achando que
o site vai suavizar — ele suaviza pouco.

## O que não fazer

- Flash direto, luz chapada, fundo branco.
- Sorriso posado para a câmera.
- Saturação alta, HDR, contraste estourado.
- Marca d'água, logo sobreposto, moldura.
- Foto de celular em vertical cortada para caber num slot horizontal.
- Qualquer imagem que não seja ballet: o site já teve fotos de academia e de
  basquete em produção. É o erro mais fácil de cometer e o mais visível.

## Onde colocar os arquivos

```
assets/images/
  hero/      → imagem (e vídeo opcional) do topo da home
  content/   → fotos de seções, cards, blog, espetáculos
  icons/     → ícones e marcas
```

Nomes em minúsculas, sem acento, separados por hífen — o comentário em cada slot
já sugere o nome esperado.

## Vídeo de fundo do hero (opcional)

O hero aceita um vídeo. Ele vem **desligado por padrão** e não faz requisição
alguma enquanto não for ativado.

Para ativar: coloque `assets/images/hero/hero.mp4` e acrescente
`data-hero-video="assets/images/hero/hero.mp4"` ao `<video>` do hero em
`index.html`.

Requisitos do arquivo: mudo, curto (8–15s), em loop imperceptível, escuro o
bastante para a tipografia branca ler por cima, e leve — o vídeo nunca substitui
a imagem como elemento de LCP, que continua sendo o `<img>`. Sob
`prefers-reduced-motion` o vídeo não é exibido.
