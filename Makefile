ifeq "" "$(shell which npm)"
default:
	@echo "Please install node.js"
	@echo "Visit http://nodejs.org/ for more details"
	exit 1
else
default: test
endif

node_modules: package.json
	npm install
	@touch $@

build: node_modules
	@./node_modules/jshint/bin/hint src/*.js --config jshint.config
	@./node_modules/jshint/bin/hint tests/*.js --config jshint.config

test: build
	@node runner.js

deploy:
	@cat src/browser_require.js src/analyzer.js src/cartridge.js src/compiler.js > /tmp/nodeNES.js

report:
	@node junit.js

clean:
	@rm -rf node_modules
	@rm -rf reports

run: node_modules
	./node_modules/.bin/supervisor ./app.js

.PHONY: clean run
