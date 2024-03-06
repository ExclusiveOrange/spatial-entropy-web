# GNU Makefile, meant for Linux

RM ?= rm

JS_FILES := dist/main.js dist/worker.js
WASM_FILES := dist/wasm.wasm

TS_FILES := $(shell find ts/**/*.ts)
TSCONFIG_FILES := $(shell find ts/tsconfig*.json) tsconfig*.json

.PHONY: all clean

all: $(JS_FILES) $(WASM_FILES)

$(JS_FILES): .js_timestamp

.js_timestamp: $(TS_FILES) $(TSCONFIG_FILES) webpack.config.js
	tsc -b -f tsconfig.json
	npm run build
	touch .js_timestamp

dist/wasm.wasm: c/*.c c/Makefile
	cd c && make

clean:
	-$(RM) .js_timestamp
	-$(RM) -rf js
	-$(RM) dist/*.js
	cd c && make clean
