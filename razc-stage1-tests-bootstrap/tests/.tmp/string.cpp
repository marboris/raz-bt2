#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

std::int64_t __raz_entry();

std::int64_t __raz_entry() {
    std::string _v1_const{};
    std::string s{};
    std::string _v2_load{};
    std::int64_t _v3_call{};

b1:;
    _v1_const = std::string("bootstrap");
    s = _v1_const;
    _v2_load = s;
    _v3_call = raz::string_length(_v2_load);
    return _v3_call;
}

int main() {
    return static_cast<int>(__raz_entry());
}
