# convenience makefile, meant for linux

.PHONY: all clean

all: dist/*.js dist/wasm.wasm
	
dist/%.js: js/*.js
	npm run build
	@touch dist/*.js

dist/wasm.wasm: c/*.c c/Makefile
	cd c && make

js/*.js: ts/*.ts tsconfig/tsconfig*.json webpack.config.js
	tsc -b -f tsconfig/tsconfig.json

clean:
	-rm -f js/* tsconfig/*.tsbuildinfo dist/*.js
	cd c && make clean
