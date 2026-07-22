#!/usr/bin/env node
/**
 * Guarda de contraste WCAG.
 *
 * Lê os tokens de cor direto de assets/css/base.css — testa a fonte da
 * verdade, não uma cópia. Sai com código 1 se qualquer par reprovar,
 * para poder rodar em CI.
 *
 * Uso: node scripts/check-contrast.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_CSS = join(ROOT, 'assets', 'css', 'base.css');

/** Extrai `--nome: #RRGGBB` de base.css. */
function readTokens(css) {
  const tokens = {};
  const re = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g;
  let m;
  while ((m = re.exec(css)) !== null) tokens[m[1]] = m[2].toUpperCase();
  return tokens;
}

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map((h) => parseInt(h, 16));
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrast(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Pares que o spec exige. `min` segue WCAG AA:
 * 4.5 para texto normal, 3.0 para texto grande e elementos não-textuais.
 */
const PAIRS = [
  { fg: '--color-gilt',      bg: '--color-noir',       min: 4.5, note: 'dourado como texto sobre palco' },
  { fg: '--color-gilt',      bg: '--color-charcoal',   min: 4.5, note: 'dourado sobre charcoal legado' },
  { fg: '--color-gilt-ink',  bg: '--color-alabaster',  min: 4.5, note: 'dourado como texto sobre claro' },
  { fg: '--color-gilt-ink',  bg: '--color-white',      min: 4.5, note: 'dourado sobre branco puro' },
  { fg: '--color-text-muted', bg: '--color-alabaster', min: 4.5, note: 'texto secundário (legado)' },
  { fg: '--color-rose',      bg: '--color-charcoal',   min: 4.5, note: 'eyebrow rose sobre escuro' },
];

const css = readFileSync(BASE_CSS, 'utf8');
const tokens = readTokens(css);

let failed = 0;
let missing = 0;

console.log('Contraste WCAG — tokens de assets/css/base.css\n');

for (const { fg, bg, min, note } of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) {
    console.log(`  AUSENTE  ${fg} sobre ${bg} — token não definido`);
    missing++;
    continue;
  }
  const ratio = contrast(tokens[fg], tokens[bg]);
  const ok = ratio >= min;
  if (!ok) failed++;
  const status = ok ? 'OK     ' : 'REPROVA';
  console.log(
    `  ${status}  ${ratio.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} sobre ${bg}  — ${note}`
  );
}

console.log('');

if (missing) {
  console.error(`${missing} par(es) com token ausente.`);
}
if (failed) {
  console.error(`${failed} par(es) reprovaram o contraste mínimo.`);
}
if (failed || missing) process.exit(1);

console.log('Todos os pares passam o contraste mínimo.');
