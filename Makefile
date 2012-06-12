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

deps:
	mkdir -p deps

external:
	mkdir -p external

deps/jsnes: deps
	cd deps &&\
		git clone https://github.com/bfirsh/jsnes.git

external/jsnes.js: deps/jsnes
	cd deps/jsnes/source && \
		cat header.js nes.js utils.js cpu.js keyboard.js mappers.js papu.js ppu.js rom.js ui.js > ../../../external/jsnes.js

external/path.min.js: deps/pathjs
	cp deps/pathjs/path.min.js external/

deps/pathjs: deps
	cd deps && \
		git clone https://github.com/mtrpcic/pathjs.git

external/codemirror.js: deps/codemirror.zip
	cd deps && \
		unzip codemirror.zip 
	cp deps/CodeMirror-2.25/lib/codemirror.js external/

deps/codemirror.zip: deps
	cd deps && \
		wget http://codemirror.net/codemirror.zip

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
	@rm -rf deps
	@rm -rf reports

run: node_modules
	./node_modules/.bin/supervisor ./app.js

ghpages: deploy
	rm -rf /tmp/ghpages
	mkdir -p /tmp/ghpages
	cp -Rv static/* /tmp/ghpages
	cp -Rv src/*.js /tmp/ghpages

	cd /tmp/ghpages && \
		git init && \
		git add . && \
		git commit -q -m "Automatic gh-pages"
	cd /tmp/ghpages && \
		git remote add remote git@github.com:gutomaia/nodeNES.git && \
		git push --force remote +master:gh-pages
	rm -rf /tmp/ghpages

.PHONY: clean run report ghpages