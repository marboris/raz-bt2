#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const MANIFEST = JSON.parse(fs.readFileSync(path.join(HERE, 'manifest.json'), 'utf8'));
const COMPILER = path.join(ROOT, 'razc-stage0.mjs');
const LANGUAGE = path.join(ROOT, 'raz.language.json');
const TARGET = path.join(ROOT, 'cpp17.target.json');
const TMP = path.join(HERE, '.tmp');
fs.mkdirSync(TMP, { recursive: true });

function run(args) {
  return spawnSync(process.execPath, [COMPILER, ...args], {
    cwd: ROOT,
    encoding: 'utf8'
  });
}

function compileCase(spec) {
  const source = path.join(HERE, spec.source);
  const base = path.join(TMP, spec.name);
  const cpp = `${base}.cpp`;
  fs.copyFileSync(path.join(ROOT, 'raz_runtime.hpp'), path.join(TMP, 'raz_runtime.hpp'));
  const p = run(['compile', source, '-o', cpp, '--language', LANGUAGE, '--target', TARGET, '--emit-ir', '--run']);
  return { ...p, cpp, ir: `${p.stdout ?? ''}` };
}

function compileNegative(spec) {
  const source = path.join(HERE, spec.source);
  const cpp = path.join(TMP, `${spec.name}.cpp`);
  return run(['compile', source, '-o', cpp, '--language', LANGUAGE, '--target', TARGET]);
}

let passed = 0;
let failed = 0;

function testStage1() {
  const stageTmp = path.join(TMP, 'stage1');
  fs.mkdirSync(stageTmp, { recursive: true });
  const cpp = path.join(stageTmp, 'compiler.cpp');
  const bin = path.join(stageTmp, process.platform === 'win32' ? 'compiler.exe' : 'compiler');
  fs.copyFileSync(path.join(ROOT, 'raz_runtime.hpp'), path.join(stageTmp, 'raz_runtime.hpp'));
  const build = run(['compile', path.join(ROOT, 'stage1', 'compiler.raz'), '-o', cpp, '--language', LANGUAGE, '--target', TARGET]);
  if (build.status !== 0) {
    return { ok: false, details: `Stage-1 build failed:\n${build.stdout ?? ''}\n${build.stderr ?? ''}` };
  }
  const cc = spawnSync('c++', ['-std=c++17', '-O0', cpp, '-o', bin], { cwd: ROOT, encoding: 'utf8' });
  if (cc.status !== 0) {
    return { ok: false, details: `Stage-1 native build failed:\n${cc.stdout ?? ''}\n${cc.stderr ?? ''}` };
  }
  const output = path.join(ROOT, 'stage1', 'output.rir');
  try { fs.rmSync(output); } catch {}
  const proc = spawnSync(bin, [], { cwd: ROOT, encoding: 'utf8' });
  if (proc.status === null || proc.status <= 0) {
    return { ok: false, details: `Stage-1 executable failed with status ${proc.status}\n${proc.stdout ?? ''}\n${proc.stderr ?? ''}` };
  }
  if (!fs.existsSync(output)) {
    return { ok: false, details: 'Stage-1 did not produce stage1/output.rir' };
  }
  const rir = fs.readFileSync(output, 'utf8');
  const expected = ['rir 0', 'function add_demo', 'let a', 'const 40', 'const 2', 'const 3', 'mul', 'add', 'return'];
  const missing = expected.filter(x => !rir.includes(x));
  if (missing.length) {
    return { ok: false, details: `Stage-1 RIR is missing: ${missing.join(', ')}\n${rir}` };
  }
  return { ok: true, details: `native compiler produced RIR (${rir.length} bytes)` };
}

console.log(`Stage-0 test suite`);
console.log(`compiler: ${COMPILER}`);
console.log('');

for (const spec of MANIFEST.positive) {
  const result = compileCase(spec);
  const status = result.status;
  const allText = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  const okExit = status === spec.exit;
  const cppExists = fs.existsSync(result.cpp);
  const irOk = (spec.ir ?? []).every(token => allText.includes(token));
  const expectedLine = `[PASS] ${spec.name}`;
  const ok = okExit && cppExists && irOk;
  if (ok) {
    passed++;
    console.log(`${expectedLine} (exit=${spec.exit})`);
  } else {
    failed++;
    console.log(`[FAIL] ${spec.name}`);
    console.log(`  process=${status} expected exit=${spec.exit}; cpp=${cppExists}; ir=${irOk}`);
    console.log(allText.trim());
  }
}


const stage1 = testStage1();
if (stage1.ok) {
  passed++;
  console.log(`[PASS] stage1-native-frontend (${stage1.details})`);
} else {
  failed++;
  console.log(`[FAIL] stage1-native-frontend`);
  console.log(stage1.details);
}

for (const spec of MANIFEST.negative) {
  const result = compileNegative(spec);
  const allText = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  const ok = result.status !== 0 && allText.includes(spec.contains);
  if (ok) {
    passed++;
    console.log(`[PASS] ${spec.name} (expected semantic failure)`);
  } else {
    failed++;
    console.log(`[FAIL] ${spec.name}`);
    console.log(allText.trim());
  }
}

console.log('');
console.log(`passed=${passed} failed=${failed}`);
process.exitCode = failed ? 1 : 0;
