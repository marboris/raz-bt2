#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

std::int64_t abs(std::int64_t x);
std::int64_t raz_main();

std::int64_t abs(std::int64_t x) {
    std::int64_t tt0{};
    std::int64_t tt1{};
    std::int64_t tt2{};
    std::int64_t tt3{};
    std::int64_t tt4{};
    std::int64_t tt5{};

entry:;
    tt0 = x;
    tt1 = 0;
    tt2 = tt0 < tt1;
    if (tt2) goto then0; else goto else1;
then0:;
    tt3 = x;
    tt4 = -tt3;
    return tt4;
    goto endif2;
else1:;
    tt5 = x;
    return tt5;
    goto endif2;
endif2:;
}

std::int64_t raz_main() {
    std::int64_t tt6{};
    std::int64_t tt7{};
    std::int64_t tt8{};

entry:;
    tt6 = 46;
    tt7 = -tt6;
    tt8 = abs(tt7);
    return tt8;
}

int main() {
    return static_cast<int>(raz_main());
}
