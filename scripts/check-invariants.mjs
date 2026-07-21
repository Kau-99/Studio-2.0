#!/usr/bin/env node
/**
 * Guardas estruturais do redesign "Atelier of Movement".
 *
 * Checagens baratas que impedem regressões silenciosas nas 8 páginas.
 * Sai com código 1 se qualquer invariante quebrar.
 *
 * Uso: node scripts/check-invariants.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

const pages = [
  'index.html',
  ...readdirSync(join(ROOT, 'pages'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => join('pages', f)),
  '404.html',
];

const failures = [];
const check = (name, ok, detail = '') => {
  if (ok) {
    console.log(`  OK       ${name}`);
  } else {
    console.log(`  FALHA    ${name}${detail ? ` — ${detail}` : ''}`);
    failures.push(name);
  }
};

console.log(`Invariantes — ${pages.length} páginas\n`);

// 1. A fonte não pode voltar para @import (cascata render-blocking, penaliza LCP).
const mainCss = read('assets', 'css', 'main.css');
check(
  'main.css não importa Google Fonts via @import',
  !/@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com/.test(mainCss)
);

// 2. Toda página precisa do <link> de fonte no <head>.
for (const page of pages) {
  const html = read(page);
  check(
    `${page} carrega a fonte via <link>`,
    /<link[^>]+fonts\.googleapis\.com\/css2/.test(html)
  );
}

// 3. Nenhum listener de scroll cru fora do loop rAF compartilhado.
const jsDir = join(ROOT, 'assets', 'js');
const jsFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) jsFiles.push(full);
  }
})(jsDir);

const RAF_OWNER = join('assets', 'js', 'utils', 'raf.js');
for (const file of jsFiles) {
  const rel = file.slice(ROOT.length + 1);
  if (rel === RAF_OWNER) continue; // o dono do loop pode escutar scroll
  const src = readFileSync(file, 'utf8');
  check(
    `${rel} sem addEventListener('scroll') cru`,
    !/addEventListener\(\s*['"]scroll['"]/.test(src)
  );
}

// 4. O dourado claro nunca vira cor de texto sobre fundo claro.
const layoutCss = read('assets', 'css', 'layout.css');
const lightBgRule = /\.bg-(alabaster|white|blush|blush-deep)[^{]*\{[^}]*color:\s*var\(--color-gilt\)/;
check(
  'nenhum fundo claro usa --color-gilt como cor de texto',
  !lightBgRule.test(layoutCss)
);

console.log('');
if (failures.length) {
  console.error(`${failures.length} invariante(s) quebrada(s).`);
  process.exit(1);
}
console.log('Todas as invariantes passam.');
