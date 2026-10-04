#include <cstdint>
#include <cstddef>
#include <string>
#include <vector>
#include "raz_runtime.hpp"

struct Box {
    std::int64_t value{};
};

std::int64_t inc(Box& box);
std::int64_t __raz_entry();

std::int64_t inc(Box& box) {
    std::int64_t _v1_const{};
    std::int64_t _v3_field{};

b1:;
    _v1_const = 41;
    box.value = _v1_const;
    _v3_field = box.value;
    return _v3_field;
}

std::int64_t __raz_entry() {
    Box _v4_new{};
    Box box{};
    std::int64_t _v6_call{};

b2:;
    _v4_new = Box{};
    box = _v4_new;
    _v6_call = inc(box);
    return _v6_call;
}

int main() {
    return static_cast<int>(__raz_entry());
}
