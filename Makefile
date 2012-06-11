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

pathjs:
	git clone https://github.com/mtrpcic/pathjs.git

static/path.min.js: pathjs
	cp pathjs/path.min.js static/

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

run: node_modules static/path.min.js
	./node_modules/.bin/supervisor ./app.js



ghpages: deploy
	mkdir -p /tmp/ghpages
	cp -Rv static /tmp/ghpages
	cd /tmp/ghpages && \
		git init && \
		git add . && \
		git commit -q -m "Automatic gh-pages"
	cd /tmp/ghpages && \
		git remote add remote git@github.com:gutomaia/nodeNES.git && \
		git push --force remote +master:gh-pages
	rm -rf /tmp/ghpages


.PHONY: clean run
