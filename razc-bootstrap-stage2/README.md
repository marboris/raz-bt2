# Raz Compiler Bootstrap

پروژه‌ی bootstrap برای ساخت یک compiler self-hosting برای Raz.

## تست کامل

```bash
npm test
```

## Stage-0

```bash
node razc-stage0.mjs compile tests/cases/arithmetic.raz -o /tmp/arithmetic.cpp --language raz.language.json --target cpp17.target.json --emit-ir --run
```

## Stage-1

Stage-1 frontend با خود Raz نوشته شده و RIR تولید می‌کند.

```bash
./stage1/compiler
cat stage1/output.rir
```

## Stage-2

Stage-2 یک backend اولیه است که RIR را با خود Raz به C++17 تبدیل می‌کند.

```text
Raz source → Stage-1 → RIR → Stage-2 → C++17 → native
```

برای هدف پروژه و مسیر bootstrapping به `doc/README.fa.md` و `doc/rir.md` مراجعه کنید.
