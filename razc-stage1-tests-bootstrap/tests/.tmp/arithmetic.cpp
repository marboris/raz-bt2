#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

std::int64_t __raz_entry();

std::int64_t __raz_entry() {
    std::int64_t _v1_const{};
    std::int64_t a{};
    std::int64_t _v2_const{};
    std::int64_t b{};
    std::int64_t _v3_load{};
    std::int64_t _v4_load{};
    std::int64_t _v5_bin{};
    std::int64_t _v6_const{};
    std::int64_t _v7_bin{};
    std::int64_t c{};
    std::int64_t _v8_load{};

b1:;
    _v1_const = 10;
    a = _v1_const;
    _v2_const = 20;
    b = _v2_const;
    _v3_load = a;
    _v4_load = b;
    _v5_bin = ((_v3_load) * (_v4_load));
    _v6_const = 7;
    _v7_bin = ((_v5_bin) + (_v6_const));
    c = _v7_bin;
    _v8_load = c;
    return _v8_load;
}

int main() {
    return static_cast<int>(__raz_entry());
}
