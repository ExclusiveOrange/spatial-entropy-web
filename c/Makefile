# GNU Makefile
# spatial-entropy-web
# 2024.02.27 Atlee Brink
# copied then modified from my project circle-text

# MACOS WARNING:
# As I write this, Apple clang doesn't support wasm32 output.
# You can install a non-Apple clang with Homebrew.
#   brew install llvm@16
#   (or whatever version is recent)
#   then make *that* instance of llvm (including clang) the default by running the following command:
#     echo 'export PATH="/opt/homebrew/opt/llvm@16/bin:$PATH"' >> ~/.zshrc
#   and restarting the terminal.

COMPILER = clang
LINK_FLAGS = -Wl,--no-entry
COMPILE_FLAGS = --target=wasm32 -nostdlib -ffreestanding -O3 -msimd128 ${LINK_FLAGS}

all: ../dist/wasm.wasm # wasm/wasm.wat

# REQUIRED
../dist/wasm.wasm: \
	spatial_entropy_u8.c
	${COMPILER} ${COMPILE_FLAGS} -o $@ $^

# OPTIONAL
# wasm/wasm.wat: wasm/wasm.wasm
# 	wasm2wat wasm/wasm.wasm -o wasm/wasm.wat

clean:
	-rm -f ../dist/wasm.wasm
