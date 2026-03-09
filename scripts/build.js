#!/usr/bin/env node
/**
 * Build: src/ → docs/ (prod) or dist/ (serve mode).
 * --serve: output to dist/, no hash, no minify, don't recreate dir (for local testing).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CleanCSS = require('clean-css');
const terser = require('terser');
const { minify: minifyHtml } = require('html-minifier-terser');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const isServe = process.argv.includes('--serve');
const OUT = isServe ? path.join(ROOT, 'dist') : path.join(ROOT, 'docs');

// ── Section render order ───────────────────────────────────────
const SECTION_ORDER = [
  'navbar',
  'hero',
  'about',
  'skills',
  'timeline',
  'projects',
  'contact',
  'footer',
];

/* ── helpers ─────────────────────────────────────────────────── */
function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  mkdirp(dest);
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function sectionFile(name, ext) {
  return path.join(SRC, 'sections', name, `${name}.${ext}`);
}

/* ── HTML ────────────────────────────────────────────────────── */
function buildHtml() {
  const layout = readFile(path.join(SRC, 'layout.html'));
  const body = SECTION_ORDER
    .map(name => readIfExists(sectionFile(name, 'html')))
    .filter(Boolean)
    .join('\n');
  return layout.replace('<!--SECTIONS-->', body);
}

/* ── CSS ─────────────────────────────────────────────────────── */
function buildCss() {
  const parts = [
    readFile(path.join(SRC, 'base.css')),
    ...SECTION_ORDER
      .map(name => readIfExists(sectionFile(name, 'css')))
      .filter(Boolean),
  ].filter(Boolean);
  return parts.join('\n\n');
}

/* ── JS ──────────────────────────────────────────────────────── */
function buildJs() {
  const parts = [
    // base.js first — has 'use strict' + shared observers
    readIfExists(path.join(SRC, 'base.js')),
    // section-specific JS in render order
    ...SECTION_ORDER
      .map(name => readIfExists(sectionFile(name, 'js')))
      .filter(Boolean),
  ].filter(Boolean);
  return parts.join('\n\n');
}

/* ── Banners ─────────────────────────────────────────────────── */
const CSS_BANNER = '/* Generated from src/ */\n';
const JS_BANNER = '/* Generated from src/ */\n';

function contentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function minifyCustom(html) {
  return html.replace(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi, (match, jsonStr) => {
    try {
      const minified = JSON.stringify(JSON.parse(jsonStr.trim()));
      return `<script type="application/ld+json">${minified}</script>`;
    } catch {
      return match;
    }
  });
}

async function run() {
  const cssRaw = CSS_BANNER + buildCss();
  const jsRaw = JS_BANNER + buildJs();

  let cssContent, jsContent, cssFile, jsFile;

  if (isServe) {
    cssContent = cssRaw;
    jsContent = jsRaw;
    cssFile = 'style.css';
    jsFile = 'main.js';
  } else {
    cssContent = new CleanCSS({ level: 2 }).minify(cssRaw).styles;
    const jsResult = await terser.minify(jsRaw, {
      compress: true,
      mangle: { toplevel: true },
    });
    jsContent = jsResult.code;
    const cssId = contentHash(cssContent);
    const jsId = contentHash(jsContent);
    cssFile = `style.${cssId}.css`;
    jsFile = `main.${jsId}.js`;
  }

  if (!isServe && fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
  mkdirp(path.join(OUT, 'assets', 'css'));
  mkdirp(path.join(OUT, 'assets', 'js'));

  fs.writeFileSync(path.join(OUT, 'assets', 'css', cssFile), cssContent, 'utf8');
  fs.writeFileSync(path.join(OUT, 'assets', 'js', jsFile), jsContent, 'utf8');

  let html = buildHtml()
    .replace('href="assets/css/style.css"', `href="assets/css/${cssFile}"`)
    .replace('src="assets/js/main.js"', `src="assets/js/${jsFile}"`);
  if (!isServe) {
    html = minifyCustom(html);
    html = await minifyHtml(html, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: false,
      minifyJS: true,
    });
  }
  fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf8');

  const copyAssets = [
    {
      dest: path.join(OUT, 'assets'),
      content: ['images', 'logos'],
      type: 'exact'
    },
    {
      dest: path.join(OUT),
      content: ['favicon', 'others', 'artifacts'],
      type: 'dump'
    }
  ];

  copyAssets.forEach(asset => {
    asset.content.forEach(content => {
      copyDir(
        path.join(ROOT, 'assets', content),
        asset.type === 'exact' ? path.join(asset.dest, content) : asset.dest
      );
    });
  });

  const cname = path.join(ROOT, 'CNAME');
  if (fs.existsSync(cname)) fs.copyFileSync(cname, path.join(OUT, 'CNAME'));

  console.log(isServe ? 'Build done → dist/ (serve mode)' : 'Build done → docs/ (minified)');
  if (!isServe) console.log('  assets/css/' + cssFile + '  assets/js/' + jsFile);
}

run().catch((err) => { console.error(err); process.exit(1); });
