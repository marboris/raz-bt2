# Stage-1

این milestone نخستین مؤلفه‌ی native compiler است که با خود Raz نوشته شده است.
`compiler.raz` یک lexer، AST عددی، parser و lowering ساده به RIR متنی دارد.
در این مرحله فقط زیرمجموعه‌ی کوچک `function / let / return` و expressions عددی پشتیبانی می‌شود.
هدف مرحله‌ی بعد گسترش همین implementation به parser و semantic model کامل زبان و سپس بازتولید IR مستقل است.
