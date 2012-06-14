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

external:
	mkdir -p external

deps/jsnes:
	mkdir -p deps
	cd deps && \
		git clone https://github.com/bfirsh/jsnes.git
	touch $@

external/jsnes.src.js: external deps/jsnes
	cd deps/jsnes/source && \
		cat header.js nes.js utils.js cpu.js keyboard.js mappers.js papu.js ppu.js rom.js ui.js > ../../../external/jsnes.src.js
	touch $@

external/dynamicaudio-min.js: external deps/jsnes
	cp deps/jsnes/lib/dynamicaudio-min.js external/ && touch $@

external/dynamicaudio.swf: external deps/jsnes
	cp deps/jsnes/lib/dynamicaudio.swf external/ && touch $@

deps/pathjs:
	mkdir -p deps
	cd deps && \
		git clone https://github.com/mtrpcic/pathjs.git
	touch $@

external/path.min.js: external deps/pathjs
	cp deps/pathjs/path.min.js external/

deps/CodeMirror2:
	mkdir -p deps
	cd deps && \
			git clone https://github.com/marijnh/CodeMirror2.git
	touch $@

external/codemirror.js: external deps/CodeMirror2
	cp deps/CodeMirror2/lib/codemirror.js external/

external/codemirror.css: external deps/CodeMirror2
	cp deps/CodeMirror2/lib/codemirror.css external/

deps/glyphicons_free:
	mkdir -p deps
	cd deps && \
		wget http://glyphicons.com/files/glyphicons_free.zip && \
		unzip glyphicons_free.zip
	touch $@

external/fast_backward.png: external deps/glyphicons_free
	cp deps/glyphicons_free/glyphicons/png/glyphicons_171_fast_backward.png external/fast_backward.png

external/fast_forward.png: external deps/glyphicons_free
	cp deps/glyphicons_free/glyphicons/png/glyphicons_177_fast_forward.png external/fast_forward.png

deps/bootstrap:
	mkdir -p deps
	cd deps && \
		git clone https://github.com/twitter/bootstrap.git
	touch $@

external/jquery-1.7.2.min.js: external
	cd external && \
		wget http://code.jquery.com/jquery-1.7.2.min.js
	touch $@

download_deps: external/jsnes.src.js \
	external/dynamicaudio-min.js \
	external/dynamicaudio.swf \
	external/path.min.js \
	external/codemirror.js \
	external/codemirror.css \
	external/jquery-1.7.2.min.js \
	external/fast_backward.png \
	external/fast_forward.png
	#TODO add bootstrap that way

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
	@rm -rf external
	@rm -rf reports

run: node_modules download_deps
	./node_modules/.bin/supervisor ./app.js

ghpages: deploy
	rm -rf /tmp/ghpages
	mkdir -p /tmp/ghpages
	cp -Rv static/* /tmp/ghpages
	cp -Rv external/* /tmp/ghpages
	cp -Rv src/*.js /tmp/ghpages

	cd /tmp/ghpages && \
		git init && \
		git add . && \
		git commit -q -m "Automatic gh-pages"
	cd /tmp/ghpages && \
		git remote add remote git@github.com:gutomaia/nodeNES.git && \
		git push --force remote +master:gh-pages
	rm -rf /tmp/ghpages

.PHONY: clean run report ghpages download_deps