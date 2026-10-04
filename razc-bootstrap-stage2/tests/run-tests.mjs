#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const MANIFEST = JSON.parse(fs.readFileSync(path.join(HERE, 'manifest.json'), 'utf8'));
const BOOTSTRAP = process.argv.includes('--bootstrap');
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

for (const spec of MANIFEST.positive) {
  const result = compileCase(spec);
  const ok = result.status === spec.exit && result.stdout.includes('generated ');
  const missing = (spec.ir ?? []).filter(x => !result.stdout.includes(x));
  if (ok && missing.length === 0) {
    passed++;
    console.log(`[PASS] ${spec.name} (exit=${result.status})`);
  } else {
    failed++;
    console.log(`[FAIL] ${spec.name}`);
    console.log(`status=${result.status}`);
    console.log(`stdout=${result.stdout ?? ''}`);
    console.log(`stderr=${result.stderr ?? ''}`);
    if (missing.length) console.log(`missing IR markers: ${missing.join(', ')}`);
  }
}

function buildStage1() {
  const stageTmp = path.join(TMP, 'stage1');
  fs.mkdirSync(stageTmp, { recursive: true });
  const cpp = path.join(stageTmp, 'compiler.cpp');
  const bin = path.join(stageTmp, process.platform === 'win32' ? 'compiler.exe' : 'compiler');
  fs.copyFileSync(path.join(ROOT, 'raz_runtime.hpp'), path.join(stageTmp, 'raz_runtime.hpp'));
  const build = run(['compile', path.join(ROOT, 'stage1', 'compiler.raz'), '-o', cpp, '--language', LANGUAGE, '--target', TARGET]);
  if (build.status !== 0) return { ok: false, details: `Stage-1 build failed:\n${build.stdout ?? ''}\n${build.stderr ?? ''}` };
  const cc = spawnSync('c++', ['-std=c++17', '-O0', cpp, '-o', bin], { cwd: ROOT, encoding: 'utf8' });
  if (cc.status !== 0) return { ok: false, details: `Stage-1 native build failed:\n${cc.stdout ?? ''}\n${cc.stderr ?? ''}` };
  return { ok: true, bin, stageTmp };
}

function runStage1Input(bin, sourcePath, expectedContains) {
  const input = path.join(ROOT, 'stage1', 'input.raz');
  const output = path.join(ROOT, 'stage1', 'output.rir');
  fs.copyFileSync(sourcePath, input);
  try { fs.rmSync(output); } catch {}
  const proc = spawnSync(bin, [], { cwd: ROOT, encoding: 'utf8' });
  if (proc.status !== 0) return { ok: false, details: `Stage-1 executable failed with status ${proc.status}\n${proc.stdout ?? ''}\n${proc.stderr ?? ''}` };
  if (!fs.existsSync(output)) return { ok: false, details: 'Stage-1 did not produce stage1/output.rir' };
  const rir = fs.readFileSync(output, 'utf8');
  const missing = expectedContains.filter(x => !rir.includes(x));
  if (missing.length) return { ok: false, details: `RIR is missing: ${missing.join(', ')}\n${rir.slice(0, 8000)}` };
  return { ok: true, bytes: rir.length };
}

function runStage1NegativeInput(bin, sourcePath, expectedContains) {
  const input = path.join(ROOT, 'stage1', 'input.raz');
  fs.copyFileSync(sourcePath, input);
  const proc = spawnSync(bin, [], { cwd: ROOT, encoding: 'utf8' });
  const all = `${proc.stdout ?? ''}\n${proc.stderr ?? ''}`;
  const missing = expectedContains.filter(x => !all.includes(x));
  if (proc.status === 0) return { ok: false, details: `expected Stage-1 failure, got status 0\n${all}` };
  if (missing.length) return { ok: false, details: `Stage-1 error is missing: ${missing.join(', ')}\n${all}` };
  return { ok: true };
}

function testStage1() {
  const built = buildStage1();
  if (!built.ok) return built;
  const frontend = runStage1Input(
    built.bin,
    path.join(HERE, MANIFEST.stage1.frontend_source),
    MANIFEST.stage1.frontend_contains
  );
  if (!frontend.ok) return { ok: false, details: `Stage-1 frontend test failed:\n${frontend.details}` };
  let selfBytes = 0;
  if (BOOTSTRAP) {
    const self = runStage1Input(
      built.bin,
      path.join(ROOT, 'stage1', 'compiler.raz'),
      MANIFEST.stage1.self_contains
    );
    if (!self.ok) return { ok: false, details: `Stage-1 self-parse/test failed:\n${self.details}` };
    selfBytes = self.bytes;
  }
  const negative = runStage1NegativeInput(
    built.bin,
    path.join(HERE, MANIFEST.stage1.negative_source),
    MANIFEST.stage1.negative_contains
  );
  if (!negative.ok) return { ok: false, details: `Stage-1 semantic-negative test failed:\n${negative.details}` };
  return { ok: true, details: BOOTSTRAP ? `frontend RIR=${frontend.bytes} bytes; compiler self-RIR=${selfBytes} bytes` : `frontend RIR=${frontend.bytes} bytes` };
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

function testStage2() {
  const built = buildStage1();
  if (!built.ok) return built;

  const stage2Tmp = path.join(TMP, 'stage2');
  fs.mkdirSync(stage2Tmp, { recursive: true });
  const backendCpp = path.join(stage2Tmp, 'rir_backend.cpp');
  const backendBin = path.join(stage2Tmp, process.platform === 'win32' ? 'rir_backend.exe' : 'rir_backend');
  fs.copyFileSync(path.join(ROOT, 'raz_runtime.hpp'), path.join(stage2Tmp, 'raz_runtime.hpp'));

  const stage2RirBuild = run([
    'compile',
    path.join(ROOT, 'stage2', 'rir_backend.raz'),
    '-o', backendCpp,
    '--language', LANGUAGE,
    '--target', TARGET
  ]);
  if (stage2RirBuild.status !== 0) {
    return { ok: false, details: `Stage-2 source build failed:\n${stage2RirBuild.stdout ?? ''}\n${stage2RirBuild.stderr ?? ''}` };
  }

  const ccBackend = spawnSync('c++', ['-std=c++17', '-O0', backendCpp, '-o', backendBin], { cwd: ROOT, encoding: 'utf8' });
  if (ccBackend.status !== 0) {
    return { ok: false, details: `Stage-2 backend native build failed:\n${ccBackend.stdout ?? ''}\n${ccBackend.stderr ?? ''}` };
  }

  const source = path.join(HERE, MANIFEST.stage2.source);
  const input = path.join(ROOT, 'stage1', 'input.raz');
  const rirPath = path.join(ROOT, 'stage2', 'input.rir');
  const cppPath = path.join(ROOT, 'stage2', 'output.cpp');
  const binPath = path.join(ROOT, 'stage2', process.platform === 'win32' ? 'output.exe' : 'output');
  fs.copyFileSync(source, input);
  const frontend = spawnSync(built.bin, [], { cwd: ROOT, encoding: 'utf8' });
  if (frontend.status !== 0 || !fs.existsSync(path.join(ROOT, 'stage1', 'output.rir'))) {
    return { ok: false, details: `Stage-1 could not produce RIR for Stage-2 input\n${frontend.stdout ?? ''}\n${frontend.stderr ?? ''}` };
  }
  fs.copyFileSync(path.join(ROOT, 'stage1', 'output.rir'), rirPath);

  const backendRun = spawnSync(backendBin, [], { cwd: ROOT, encoding: 'utf8' });
  if (backendRun.status !== 0 || !fs.existsSync(cppPath)) {
    return { ok: false, details: `Stage-2 backend execution failed with status ${backendRun.status}\n${backendRun.stdout ?? ''}\n${backendRun.stderr ?? ''}` };
  }

  const native = spawnSync('c++', ['-std=c++17', '-O0', cppPath, '-o', binPath], { cwd: ROOT, encoding: 'utf8' });
  if (native.status !== 0) {
    return { ok: false, details: `Stage-2 generated C++ failed to compile:\n${native.stdout ?? ''}\n${native.stderr ?? ''}` };
  }
  const program = spawnSync(binPath, [], { cwd: ROOT, encoding: 'utf8' });
  if (program.status !== MANIFEST.stage2.exit) {
    return { ok: false, details: `Stage-2 program exit ${program.status}, expected ${MANIFEST.stage2.exit}` };
  }

  const rir = fs.readFileSync(rirPath, 'utf8');
  const cpp = fs.readFileSync(cppPath, 'utf8');
  const missingRir = MANIFEST.stage2.rir_contains.filter(x => !rir.includes(x));
  const missingCpp = MANIFEST.stage2.cpp_contains.filter(x => !cpp.includes(x));
  if (missingRir.length || missingCpp.length) {
    return { ok: false, details: `Stage-2 markers missing; RIR=${missingRir.join(', ')} C++=${missingCpp.join(', ')}` };
  }
  return { ok: true, details: `RIR=${rir.length} bytes; C++=${cpp.length} bytes; exit=${program.status}` };
}

const stage2 = testStage2();
if (stage2.ok) {
  passed++;
  console.log(`[PASS] stage2-native-backend (${stage2.details})`);
} else {
  failed++;
  console.log(`[FAIL] stage2-native-backend`);
  console.log(stage2.details);
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
