# convenience makefile, meant for linux

RM ?= rm

.PHONY: all clean

all: dist/*.js dist/wasm.wasm
	
dist/%.js: js/ts/*.js
	npm run build
	@touch dist/*.js

dist/wasm.wasm: c/*.c c/Makefile
	cd c && make

js/ts/*.js: tsconfig*.json ts/tsconfig*.json ts/common/*.ts ts/main/*.ts ts/worker/*.ts webpack.config.js
	tsc -b -f tsconfig.json

clean:
	-$(RM) -rf js
	-$(RM) dist/*.js
	cd c && make clean
