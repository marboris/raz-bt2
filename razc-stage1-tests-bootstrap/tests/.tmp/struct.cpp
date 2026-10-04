#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

struct Point {
    std::int64_t x{};
    std::int64_t y{};
};

std::int64_t norm2(Point p);
std::int64_t __raz_entry();

std::int64_t norm2(Point p) {
    Point _v1_load{};
    std::int64_t _v2_field{};
    Point _v3_load{};
    std::int64_t _v4_field{};
    std::int64_t _v5_bin{};
    Point _v6_load{};
    std::int64_t _v7_field{};
    Point _v8_load{};
    std::int64_t _v9_field{};
    std::int64_t _v10_bin{};
    std::int64_t _v11_bin{};

b1:;
    _v1_load = p;
    _v2_field = _v1_load.x;
    _v3_load = p;
    _v4_field = _v3_load.x;
    _v5_bin = ((_v2_field) * (_v4_field));
    _v6_load = p;
    _v7_field = _v6_load.y;
    _v8_load = p;
    _v9_field = _v8_load.y;
    _v10_bin = ((_v7_field) * (_v9_field));
    _v11_bin = ((_v5_bin) + (_v10_bin));
    return _v11_bin;
}

std::int64_t __raz_entry() {
    Point _v12_new{};
    Point p{};
    std::int64_t _v13_const{};
    std::int64_t _v14_const{};
    Point _v15_load{};
    std::int64_t _v16_call{};

b2:;
    _v12_new = Point{};
    p = _v12_new;
    _v13_const = 3;
    p.x = _v13_const;
    _v14_const = 4;
    p.y = _v14_const;
    _v15_load = p;
    _v16_call = norm2(_v15_load);
    return _v16_call;
}

int main() {
    return static_cast<int>(__raz_entry());
}
