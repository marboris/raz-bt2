#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

std::int64_t __raz_entry();

std::int64_t __raz_entry() {
    std::vector<std::int64_t> _v1_list{};
    std::vector<std::int64_t> xs{};
    std::vector<std::int64_t> _v2_load{};
    std::int64_t _v3_const{};
    std::vector<std::int64_t> _v4_call{};
    std::vector<std::int64_t> _v5_load{};
    std::int64_t _v6_const{};
    std::vector<std::int64_t> _v7_call{};
    std::vector<std::int64_t> _v8_load{};
    std::int64_t _v9_const{};
    std::int64_t _v10_index{};

b1:;
    _v1_list = std::vector<std::int64_t>{};
    xs = _v1_list;
    _v2_load = xs;
    _v3_const = 10;
    _v4_call = raz::list_append(_v2_load, _v3_const);
    xs = _v4_call;
    _v5_load = xs;
    _v6_const = 32;
    _v7_call = raz::list_append(_v5_load, _v6_const);
    xs = _v7_call;
    _v8_load = xs;
    _v9_const = 1;
    _v10_index = _v8_load[static_cast<std::size_t>(_v9_const)];
    return _v10_index;
}

int main() {
    return static_cast<int>(__raz_entry());
}
