# RIR

RIR (Raz Intermediate Representation) نمایش میانی مستقل از target در پروژه است.
هدف آن این است که frontend دربارهٔ معنا و محاسبه تصمیم بگیرد و backend فقط RIR را به کد هدف تبدیل کند.

در Stage-1، RIR متنی و قابل مشاهده است تا bootstrap به‌راحتی قابل بررسی باشد.
نمونه:

```text
rir 1
function add(i64 x, i64 y) -> i64
entry:
    %t0 = load x
    %t1 = load y
    %t2 = + %t0, %t1
    return %t2
endfunction
```

RIR فعلی هنوز قرارداد نهایی compiler نیست؛ در Stageهای بعدی باید type، value model، control-flow و call convention آن دقیق‌تر و رسمی‌تر شوند.
