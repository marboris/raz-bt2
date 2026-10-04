#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(ROOT, '.bootstrap');
const STAGE0 = path.join(ROOT, 'razc-stage0.mjs');
const LANGUAGE = path.join(ROOT, 'raz.language.json');
const TARGET = path.join(ROOT, 'cpp17.target.json');
const SOURCE = path.join(ROOT, 'stage1', 'compiler.raz');
const RUNTIME = path.join(ROOT, 'raz_runtime.hpp');

fs.mkdirSync(TMP, { recursive: true });

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: opts.timeout ?? 300000,
    env: opts.env ?? process.env,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed with ${r.status}\n${r.stdout ?? ''}${r.stderr ?? ''}`);
  }
  return r;
}

function compileStage0(source, cpp) {
  run(process.execPath, [STAGE0, 'compile', source, '-o', cpp, '--language', LANGUAGE, '--target', TARGET]);
}

const stage1Cpp = path.join(TMP, 'stage1.cpp');
const stage1Bin = path.join(TMP, process.platform === 'win32' ? 'stage1.exe' : 'stage1');
const firstInput = path.join(TMP, 'first-input.raz');
const firstRir = path.join(TMP, 'stage1-first.rir');
const secondCpp = path.join(TMP, 'self-compiler.cpp');
const secondBin = path.join(TMP, process.platform === 'win32' ? 'self-compiler.exe' : 'self-compiler');
const secondRir = path.join(TMP, 'stage1-second.rir');

console.log('[bootstrap] Stage-0 -> native Stage-1');
compileStage0(SOURCE, stage1Cpp);
fs.copyFileSync(RUNTIME, path.join(TMP, 'raz_runtime.hpp'));
run('c++', ['-std=c++17', '-O3', stage1Cpp, '-o', stage1Bin]);

console.log('[bootstrap] native Stage-1 -> compiler.raz -> RIR');
fs.copyFileSync(SOURCE, path.join(ROOT, 'stage1', 'input.raz'));
run(stage1Bin, []);
fs.copyFileSync(path.join(ROOT, 'stage1', 'output.rir'), firstRir);

console.log('[bootstrap] native frontend rebuilt through host backend');
const host = path.join(ROOT, 'stage4', 'host-driver.mjs');
run(process.execPath, [host, 'compile', SOURCE, '-o', secondCpp], {
  env: { ...process.env, RAZ_STAGE1_BIN: stage1Bin }
});
fs.copyFileSync(RUNTIME, path.join(TMP, 'raz_runtime.hpp'));
run('c++', ['-std=c++17', '-O3', secondCpp, '-o', secondBin]);
fs.copyFileSync(SOURCE, path.join(ROOT, 'stage1', 'input.raz'));
run(secondBin, []);
fs.copyFileSync(path.join(ROOT, 'stage1', 'output.rir'), secondRir);

const a = fs.readFileSync(firstRir, 'utf8');
const b = fs.readFileSync(secondRir, 'utf8');
if (a !== b) {
  throw new Error(`bootstrap mismatch: first=${a.length} second=${b.length}`);
}

const report = [
  'Raz bootstrap report',
  '=====================',
  `source: ${SOURCE}`,
  `stage-1 RIR bytes: ${a.length}`,
  'frontend self-parse: OK',
  'host rebuild: OK',
  'RIR exact match: OK',
].join('\n') + '\n';
fs.writeFileSync(path.join(TMP, 'report.txt'), report, 'utf8');
console.log(report.trim());
