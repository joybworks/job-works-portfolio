#!/usr/bin/env node
/**
 * Serve dist/ at http://localhost:3000 — build with --serve (no hash, no minify, no dir wipe).
 * Watches src/ in-process; browser-sync watches files inside dist/ for reload.
 * No nodemon subprocess, so no "clean exit" — build runs inside this process.
 */

const { spawn } = require('child_process');
const path = require('path');
const chokidar = require('chokidar');

const ROOT = path.resolve(__dirname, '..');
const PORT = 3000;

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [path.join(__dirname, 'build.js'), '--serve'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`build exited ${code}`))));
  });
}

async function main() {
  console.log('Building (serve mode)...');
  await runBuild();

  let rebuildTimer = null;
  chokidar.watch(path.join(ROOT, 'src'), { ignoreInitial: true }).on('all', () => {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      rebuildTimer = null;
      try {
        await runBuild();
      } catch (e) {
        console.error(e.message);
      }
    }, 150);
  });

  const bs = spawn(
    'npx',
    ['browser-sync', 'start', '--server', 'dist', '--files', 'dist/**', '--port', String(PORT), '--no-open', '--no-notify'],
    { cwd: ROOT, stdio: 'inherit' }
  );

  process.on('SIGINT', () => { bs.kill(); process.exit(0); });
  process.on('SIGTERM', () => { bs.kill(); process.exit(0); });

  bs.on('close', (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
