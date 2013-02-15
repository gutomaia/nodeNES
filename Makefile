JQUERY_VERSION = 1.8.3
REQUIREJS_VERSION = 2.0.4
BOOTSTRAP_VERSION = v2.2.2


BOOTSTRAP_LESS = deps/bootstrap-${BOOTSTRAP_VERSION}/less/bootstrap.less
BOOTSTRAP_RESPONSIVE_LESS = deps/bootstrap-${BOOTSTRAP_VERSION}/less/responsive.less

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

deps/.done:
	@mkdir -p deps
	touch $@

deps/jsnes: deps/.done
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

deps/pathjs: deps/.done
	cd deps && \
		git clone https://github.com/mtrpcic/pathjs.git
	touch $@

external/path.min.js: external deps/pathjs
	cp deps/pathjs/path.min.js external/ && touch $@

deps/CodeMirror: deps/.done
	cd deps && \
			git clone https://github.com/marijnh/CodeMirror.git
	touch $@

external/codemirror.js: external deps/CodeMirror
	cp deps/CodeMirror/lib/codemirror.js external/ && touch $@

external/codemirror.css: external deps/CodeMirror
	cp deps/CodeMirror/lib/codemirror.css external/ && touch $@

deps/glyphicons_free: deps/.done
	cd deps && \
		wget http://glyphicons.com/files/glyphicons_free.zip && \
		unzip glyphicons_free.zip
	touch $@

external/fast_backward.png: external deps/glyphicons_free
	cp deps/glyphicons_free/glyphicons/png/glyphicons_171_fast_backward.png external/fast_backward.png

external/fast_forward.png: external deps/glyphicons_free
	cp deps/glyphicons_free/glyphicons/png/glyphicons_177_fast_forward.png external/fast_forward.png

external/check.png: external deps/glyphicons_free
	cp deps/glyphicons_free/glyphicons/png/glyphicons_152_check.png external/check.png

deps/bootstrap-${BOOTSTRAP_VERSION}: deps/.done
	cd deps && \
		git clone https://github.com/twitter/bootstrap.git bootstrap-${BOOTSTRAP_VERSION}
	cd $@ && \
		git checkout ${BOOTSTRAP_VERSION}
	touch $@

external/bootstrap.css: deps/bootstrap-${BOOTSTRAP_VERSION}
	#TODO: cp snippets/variables.less deps/bootstrap/less
	./node_modules/recess/bin/recess --compile ${BOOTSTRAP_LESS} > $@

external/bootstrap-responsive.css: deps/bootstrap-${BOOTSTRAP_VERSION}
	./node_modules/recess/bin/recess --compile ${BOOTSTRAP_RESPONSIVE_LESS} > $@

external/bootstrap-tab.js: deps/bootstrap-${BOOTSTRAP_VERSION}
	cp deps/bootstrap-${BOOTSTRAP_VERSION}/js/bootstrap-tab.js external/ && touch $@

external/bootstrap-dropdown.js: deps/bootstrap-${BOOTSTRAP_VERSION}
	cp deps/bootstrap-${BOOTSTRAP_VERSION}/js/bootstrap-dropdown.js external/ && touch $@

deps/jquery-${JQUERY_VERSION}.min.js: deps/.done
	cd deps && \
		wget http://code.jquery.com/jquery-${JQUERY_VERSION}.min.js
	touch $@

external/jquery-${JQUERY_VERSION}.min.js: external deps/jquery-${JQUERY_VERSION}.min.js
	cp deps/jquery-${JQUERY_VERSION}.min.js external/ && touch $@

deps/require.js: deps/.done
	cd deps && \
		wget http://requirejs.org/docs/release/${REQUIREJS_VERSION}/minified/require.js
	touch $@

external/require.js: external deps/require.js
	cp deps/require.js external/ && touch $@

download_deps: external/jsnes.src.js \
	external/dynamicaudio-min.js \
	external/dynamicaudio.swf \
	external/path.min.js \
	external/codemirror.js \
	external/codemirror.css \
	external/jquery-${JQUERY_VERSION}.min.js \
	external/fast_backward.png \
	external/fast_forward.png \
	external/check.png \
	external/bootstrap.css \
	external/bootstrap-dropdown.js \
	external/bootstrap-tab.js \
	external/require.js

build: node_modules
	@./node_modules/jshint/bin/hint lib/*.js --config jshint.config
	@./node_modules/jshint/bin/hint tests/*.js --config jshint.config

test: build
	@node runner.js

deploy:
	@cat lib/analyzer.js lib/cartridge.js lib/compiler.js > /tmp/nodeNES.js

report:
	@node junit.js

clean:
	@rm -rf node_modules
	@rm -rf deps
	@rm -rf external
	@rm -rf reports

run: node_modules download_deps
	./node_modules/.bin/supervisor ./app.js

ghpages: deploy download_deps
	rm -rf /tmp/ghpages
	mkdir -p /tmp/ghpages
	cp -Rv static/* /tmp/ghpages
	cp -Rv external/* /tmp/ghpages
	cp -Rv lib/*.js /tmp/ghpages

	cd /tmp/ghpages && \
		git init && \
		git add . && \
		git commit -q -m "Automatic gh-pages"
	cd /tmp/ghpages && \
		git remote add remote git@github.com:gutomaia/nodeNES.git && \
		git push --force remote +master:gh-pages
	rm -rf /tmp/ghpages

.PHONY: clean run report ghpages download_deps
