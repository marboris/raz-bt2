# Raz Compiler Bootstrap

پروژه‌ی bootstrap برای ساخت یک compiler self-hosting برای Raz.

## تست

```bash
npm test
```

## Pipeline فعلی

```text
Raz source
  → Stage-0 frontend/compiler
  → RIR-1
  → Stage-3 RIR verifier
  → Stage-2 native backend
  → C++17
  → native executable
```

در کنار compiler، `tests/` تست‌های اجرایی و منفی را نگه می‌دارد و `doc/rir.md` قرارداد فعلی RIR را خلاصه می‌کند.

## Stageها

- Stage-0: bootstrap compiler در Node.js/ESM با AST، تحلیل، IR و C++ backend.
- Stage-1: frontend نوشته‌شده با خود Raz که RIR تولید می‌کند.
- Stage-2: backend RIR→C++ نوشته‌شده با خود Raz.
- Stage-3: verifier قرارداد RIR-1 نوشته‌شده با خود Raz.

هدف نهایی این است که compiler کامل Raz با خود Raz نوشته شود و binary حاصل بتواند نسخه‌ی بعدی خودش را بسازد تا زنجیره‌ی self-hosting پایدار شود.

## Bootstrap check

برای اجرای زنجیره‌ی native bootstrap از Stage-0:

```bash
npm run bootstrap
```

این فرمان Stage-1 را با Stage-0 می‌سازد، compiler.raz را با binary بومی خودش parse می‌کند، سپس همان RIR را دوباره از مسیر native frontend + host backend تولید می‌کند و دو RIR را دقیقاً مقایسه می‌کند.

گزارش در `.bootstrap/report.txt` نوشته می‌شود.
