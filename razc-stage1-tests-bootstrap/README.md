# Raz Compiler Bootstrap

Stage-0 bootstrap compiler for Raz.

Run tests:

```bash
node tests/run-tests.mjs
```

Compile one program:

```bash
node razc-stage0.mjs compile tests/cases/arithmetic.raz -o /tmp/arithmetic.cpp --language raz.language.json --target cpp17.target.json --emit-ir --run
```

See `doc/README.fa.md` for the project goal.
