# convenience makefile, meant for linux

RM ?= rm

.PHONY: all clean

all: dist/*.js dist/wasm.wasm
	
dist/%.js: js/*.js
	npm run build
	@touch dist/*.js

dist/wasm.wasm: c/*.c c/Makefile
	cd c && make

js/*.js: tsconfig*.json ts/tsconfig*.json ts/*.ts webpack.config.js
	tsc -b -f tsconfig.json

clean:
	$(RM) -f js/* dist/*.js
	cd c && make clean
