# Raz Stage-0 Bootstrap Compiler

این نسخه برای bootstrap طراحی شده است، نه برای شبیه‌سازی متن به C++.

## Pipeline

source
  -> lexer
  -> parser
  -> AST
  -> semantic/type analysis
  -> target-independent IR
  -> IR passes
  -> C++ backend
  -> native compiler

## اصل معماری

- AST درباره syntax است.
- Analyzer درباره semantics و types است.
- IR درباره computation و control flow است.
- Passها روی IR کار می‌کنند.
- Backend فقط IR + target profile را می‌بیند.
- C++ runtime بیرون compiler است و در `raz_runtime.hpp` قرار دارد.
- language spec بیرون compiler است و در `raz.language.json` قرار دارد.
- target profile بیرون compiler است و در `cpp17.target.json` قرار دارد.

## اجرا

```bash
node razc-stage0.mjs compile demo.raz -o demo.cpp --language raz.language.json --target cpp17.target.json
c++ -std=c++17 -O0 demo.cpp -o demo
./demo
```

نمایش IR:

```bash
node razc-stage0.mjs compile demo.raz -o demo.cpp --emit-ir
```

اجرای مستقیم:

```bash
node razc-stage0.mjs compile demo.raz -o demo.cpp --run
```

## اولین قطعه self-host

`stage1-selfhost-seed.raz` یک lexer واقعی و قابل اجرا است که با خود زبان Raz نوشته شده است.
این فایل هنوز compiler کامل نیست؛ نقطه‌ی شروع Stage-1 است.

## مسیر bootstrap

Stage-0: `razc-stage0.mjs`

Stage-1: lexer/parser/AST/semantic/IR compiler نوشته‌شده با Raz و تولیدشده توسط Stage-0

Stage-2: همان compiler توسط binary حاصل از Stage-1 دوباره build می‌شود.

Stage-3: Stage-2 باید خودش را build کند و خروجی‌ها باید پایدار باشند.

## نکته

هدف این است که featureهای زبان، typeها، operatorها و intrinsicها در core compiler به اسم‌های خاص hard-code نشوند.
برای اضافه کردن abstraction جدید ابتدا language spec و سپس semantics/IR آن abstraction تعریف می‌شود؛ C++ فقط یکی از targetها است.
