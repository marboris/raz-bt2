# هدف پروژه Raz

هدف این پروژه ساخت یک **کامپایلر self-hosting و قابل توسعه** برای زبان Raz است. نسخه‌ی اولیه در Node.js به‌عنوان Bootstrap Compiler اجرا می‌شود؛ اما معماری آن بر پایه‌ی یک pipeline مستقل از backend است:

`Source → AST → Semantic Analysis → IR → Optimization → Backend → Native Code`

در این مدل، تعریف زبان و مشخصات target از هسته‌ی کامپایلر جدا هستند و C++ فقط یکی از backendهاست. هدف نهایی این است که خود کامپایلر Raz با زبان Raz نوشته شود، سپس نسخه‌ی Bootstrap آن را بسازد و نسخه‌ی ساخته‌شده بتواند خودش را دوباره کامپایل کند. این فرایند همان **bootstrapping / self-hosting** است.

## برای مطالعه

- Compiler — Wikipedia: https://en.wikipedia.org/wiki/Compiler
- Bootstrapping (compilers) — Wikipedia: https://en.wikipedia.org/wiki/Bootstrapping_(compilers)
- Self-hosting (compilers) — Wikipedia: https://en.wikipedia.org/wiki/Self-hosting_(compilers)
- LLVM: https://llvm.org/docs/
- MLIR Language Reference: https://mlir.llvm.org/docs/LangRef/

اصل طراحی پروژه: منطق زبان در frontend و IR باشد، منطق target در backend باشد، و runtime جزئی از خود compiler نباشد.
