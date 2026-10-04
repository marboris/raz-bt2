#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

bool explode();
std::int64_t __raz_entry();

bool explode() {
    std::int64_t _v1_const{};
    std::int64_t _v2_const{};
    std::int64_t _v3_bin{};
    std::int64_t _v4_const{};
    bool _v5_bin{};

b1:;
    _v1_const = 1;
    _v2_const = 0;
    _v3_bin = ((_v1_const) / (_v2_const));
    _v4_const = 0;
    _v5_bin = ((_v3_bin) == (_v4_const));
    return _v5_bin;
}

std::int64_t __raz_entry() {
    bool _v6_const{};
    bool __logic_7{};
    bool _v8_call{};
    bool _v9_logic{};
    bool _v10_logic{};
    bool ok{};
    bool _v11_load{};
    std::int64_t _v12_const{};
    std::int64_t _v13_const{};

b2:;
    _v6_const = false;
    if (_v6_const) goto b3; else goto b4;
b3:;
    _v8_call = explode();
    __logic_7 = _v8_call;
    goto b5;
b4:;
    _v9_logic = false;
    __logic_7 = _v9_logic;
    goto b5;
b5:;
    _v10_logic = __logic_7;
    ok = _v10_logic;
    _v11_load = ok;
    if (_v11_load) goto b6; else goto b7;
b6:;
    _v12_const = 1;
    return _v12_const;
b7:;
    _v13_const = 0;
    return _v13_const;
}

int main() {
    return static_cast<int>(__raz_entry());
}
