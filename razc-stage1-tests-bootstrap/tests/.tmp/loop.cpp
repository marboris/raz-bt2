#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

std::int64_t fact(std::int64_t n);
std::int64_t __raz_entry();

std::int64_t fact(std::int64_t n) {
    std::int64_t _v1_const{};
    std::int64_t x{};
    std::int64_t _v2_const{};
    std::int64_t i{};
    std::int64_t _v3_load{};
    std::int64_t _v4_load{};
    bool _v5_bin{};
    std::int64_t _v6_load{};
    std::int64_t _v7_load{};
    std::int64_t _v8_bin{};
    std::int64_t _v9_load{};
    std::int64_t _v10_const{};
    std::int64_t _v11_bin{};
    std::int64_t _v12_load{};

b1:;
    _v1_const = 1;
    x = _v1_const;
    _v2_const = 1;
    i = _v2_const;
    goto b2;
b2:;
    _v3_load = i;
    _v4_load = n;
    _v5_bin = ((_v3_load) <= (_v4_load));
    if (_v5_bin) goto b3; else goto b4;
b3:;
    _v6_load = x;
    _v7_load = i;
    _v8_bin = ((_v6_load) * (_v7_load));
    x = _v8_bin;
    _v9_load = i;
    _v10_const = 1;
    _v11_bin = ((_v9_load) + (_v10_const));
    i = _v11_bin;
    goto b2;
b4:;
    _v12_load = x;
    return _v12_load;
}

std::int64_t __raz_entry() {
    std::int64_t _v13_const{};
    std::int64_t _v14_call{};

b5:;
    _v13_const = 5;
    _v14_call = fact(_v13_const);
    return _v14_call;
}

int main() {
    return static_cast<int>(__raz_entry());
}
