#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

std::int64_t __raz_entry();

std::int64_t __raz_entry() {
    std::int64_t _v2_const{};
    std::int64_t _v3_const{};
    std::vector<std::int64_t> _v1_list{};
    std::vector<std::int64_t> xs{};
    std::int64_t _v5_const{};
    std::vector<std::int64_t> _v6_load{};
    std::int64_t _v7_call{};

b1:;
    _v2_const = 1;
    _v3_const = 2;
    _v1_list = std::vector<std::int64_t>{_v2_const, _v3_const};
    xs = _v1_list;
    _v5_const = 3;
    raz::list_push(xs, _v5_const);
    _v6_load = xs;
    _v7_call = raz::list_length(_v6_load);
    return _v7_call;
}

int main() {
    return static_cast<int>(__raz_entry());
}
