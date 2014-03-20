JQUERY_VERSION = ${shell node -e "console.log(require('./package.json').dependencies.jquery);"}
UNDERSCORE_VERSION = 1.4.4
BACKBONE_VERSION = 0.9.10
REQUIREJS_VERSION = 2.0.4
BOOTSTRAP_VERSION = v2.2.2
CODEMIRROR_VERSION = 3.1

BOOTSTRAP_LESS = deps/bootstrap-${BOOTSTRAP_VERSION}/less/bootstrap.less
BOOTSTRAP_RESPONSIVE_LESS = deps/bootstrap-${BOOTSTRAP_VERSION}/less/responsive.less

OK=\033[32m[OK]\033[39m
FAIL=\033[31m[FAIL]\033[39m
CHECK=@if [ $$? -eq 0 ]; then echo "${OK}"; else echo "${FAIL}"; cat ${DEBUG} ; fi

DEBUG=/tmp/nodeNES_debug
ERROR=/tmp/nodeNES_error

WGET = wget -q --user-agent="Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"

ifeq "" "$(shell which npm)"
default:
	@echo "Please install node.js"
	@echo "Visit http://nodejs.org/ for more details"
	exit 1
else
default: test
endif

node_modules: package.json
	@echo "NPM installing packages: \c"
	@npm install #> ${DEBUG} 2> ${ERROR}
	@touch $@
	${CHECK}

external:
	@echo "Creating external dir: \c"
	@mkdir -p external
	${CHECK}

deps/.done:
	@echo "Creating dependencies dir: \c"
	@mkdir -p deps
	@touch $@
	${CHECK}

deps/jsnes/.done: deps/.done
	@echo "Cloning jsNES project: \c"
	@cd deps && \
		git clone https://github.com/bfirsh/jsnes.git > /dev/null 2>&1
	${CHECK}
	@touch $@

external/jsnes.src.js: external deps/jsnes/.done
	@echo "Packing jsnes.src.js: \c"
	@cd deps/jsnes/source && \
		cat header.js nes.js utils.js cpu.js keyboard.js mappers.js papu.js ppu.js rom.js ui.js > ../../../external/jsnes.src.js
	${CHECK}
	@touch $@

external/dynamicaudio-min.js: external deps/jsnes/.done
	@echo "Copping dynamicaudio-min.js: \c"
	@cp deps/jsnes/lib/dynamicaudio-min.js external/ && touch $@
	${CHECK}

external/dynamicaudio.swf: external deps/jsnes/.done
	@echo "Copping dynamicaudio-swf.js: \c"
	@cp deps/jsnes/lib/dynamicaudio.swf external/ && touch $@
	${CHECK}

deps/underscore.js: deps/.done
	@echo "Downloading underscore.js: \c"
	@cd deps && \
		${WGET} http://raw.github.com/documentcloud/underscore/${UNDERSCORE_VERSION}/underscore.js
	${CHECK}
	@touch $@

external/underscore.js: external deps/underscore.js
	@echo "Copping underscore.js: \c"
	@cp deps/underscore.js external/ && touch $@
	${CHECK}
	@touch $@

deps/backbone.js: deps/.done
	@echo "Downloading backbone.js: \c"
	@cd deps && \
		${WGET} http://raw.github.com/documentcloud/backbone/${BACKBONE_VERSION}/backbone.js
	${CHECK}
	@touch $@

external/backbone.js: external deps/backbone.js
	@echo "Copping backbone.js: \c"
	@cp deps/backbone.js external/ && touch $@
	${CHECK}
	@touch $@

deps/codemirror-${CODEMIRROR_VERSION}.zip: deps/.done
	@echo "Downloading CodeMirror ${CODEMIRROR_VERSION}: \c"
	@cd deps && \
		${WGET} http://codemirror.net/codemirror-${CODEMIRROR_VERSION}.zip
	${CHECK}
	@touch $@

deps/codemirror-${CODEMIRROR_VERSION}/.done: deps/.done deps/codemirror-${CODEMIRROR_VERSION}.zip
	@echo "Unpacking codemirror-${CODEMIRROR_VERSION}.zip: \c"
	@cd deps && \
		unzip -q codemirror-${CODEMIRROR_VERSION}.zip
	@touch $@
	${CHECK}


external/codemirror.js: external deps/codemirror-${CODEMIRROR_VERSION}/.done
	@echo "Copping codemirror.js: \c"
	@cp deps/codemirror-${CODEMIRROR_VERSION}/lib/codemirror.js external/ && touch $@
	${CHECK}

external/codemirror.css: external deps/codemirror-${CODEMIRROR_VERSION}/.done
	@echo "Copping codemirror.css: \c"
	@cp deps/codemirror-${CODEMIRROR_VERSION}/lib/codemirror.css external/ && touch $@
	${CHECK}

deps/glyphicons_free.zip: deps/.done
	@echo "Downloading glyphicons_free.zip: \c"
	@cd deps && \
		${WGET} http://glyphicons.com/files/glyphicons_free.zip
	${CHECK}
	@touch $@

deps/glyphicons_free/.done: deps/.done deps/glyphicons_free.zip
	@echo "Unpacking glyphicons_free.zip: \c"
	@cd deps && \
		unzip -q glyphicons_free.zip
	${CHECK}
	@touch $@

external/fast_backward.png: external deps/glyphicons_free/.done
	@echo "Copping $@: \c"
	@cp deps/glyphicons_free/glyphicons/png/glyphicons_171_fast_backward.png external/fast_backward.png
	${CHECK}

external/fast_forward.png: external deps/glyphicons_free/.done
	@echo "Copping $@: \c"
	@cp deps/glyphicons_free/glyphicons/png/glyphicons_177_fast_forward.png external/fast_forward.png
	${CHECK}

external/check.png: external deps/glyphicons_free/.done
	@echo "Copping $@: \c"
	@cp deps/glyphicons_free/glyphicons/png/glyphicons_152_check.png external/check.png
	${CHECK}

deps/bootstrap-${BOOTSTRAP_VERSION}: deps/.done
	@echo "Cloning Bootstrap: \c"
	@cd deps && \
		git clone https://github.com/twitter/bootstrap.git bootstrap-${BOOTSTRAP_VERSION} > /dev/null 2>&1
	${CHECK}
	@echo "Switching Bootstrap Version to ${BOOTSTRAP_VERSION}: \c"
	@cd $@ && \
		git checkout ${BOOTSTRAP_VERSION} > /dev/null 2>&1
	${CHECK}
	@touch $@

external/bootstrap.css: deps/bootstrap-${BOOTSTRAP_VERSION}
	#TODO: cp snippets/variables.less deps/bootstrap/less
	@echo "Compiling $@: \c"
	@./node_modules/recess/bin/recess --compile ${BOOTSTRAP_LESS} > $@
	${CHECK}

external/bootstrap-responsive.css: deps/bootstrap-${BOOTSTRAP_VERSION}
	@echo "Compiling $@: \c"
	@./node_modules/recess/bin/recess --compile ${BOOTSTRAP_RESPONSIVE_LESS} > $@
	${CHECK}

external/bootstrap-tab.js: deps/bootstrap-${BOOTSTRAP_VERSION}
	@echo "Copping $@: \c"
	@cp deps/bootstrap-${BOOTSTRAP_VERSION}/js/bootstrap-tab.js external/ && touch $@
	${CHECK}

external/bootstrap-dropdown.js: deps/bootstrap-${BOOTSTRAP_VERSION}
	@echo "Copping $@: \c"
	@cp deps/bootstrap-${BOOTSTRAP_VERSION}/js/bootstrap-dropdown.js external/ && touch $@
	${CHECK}

deps/jquery-${JQUERY_VERSION}.min.js: deps/.done
	@cd deps && \
		${WGET} http://code.jquery.com/jquery-${JQUERY_VERSION}.min.js
	@touch $@

external/jquery-${JQUERY_VERSION}.min.js: external deps/jquery-${JQUERY_VERSION}.min.js
	@echo "Copping $@: \c"
	@cp deps/jquery-${JQUERY_VERSION}.min.js external/ && touch $@
	${CHECK}

deps/require.js: deps/.done
	@cd deps && \
		${WGET} http://requirejs.org/docs/release/${REQUIREJS_VERSION}/minified/require.js
	@touch $@

external/require.js: external deps/require.js
	@echo "Copping $@: \c"
	@cp deps/require.js external/ && touch $@
	${CHECK}

download_deps: external/jsnes.src.js \
	external/dynamicaudio-min.js \
	external/dynamicaudio.swf \
	external/underscore.js \
	external/backbone.js \
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

jshint:
	@./node_modules/.bin/jshint lib/*.js --config jshint.config
	@./node_modules/.bin/jshint tests/*.js --config jshint.config

jslint:
	@./node_modules/.bin/jslint --indent 2 --undef lib/*
	@./node_modules/.bin/jslint --indent 2 --undef tests/*

build: node_modules jshint

nodeunit:
	@./node_modules/.bin/nodeunit --reporter minimal tests/*

test: build nodeunit

deploy:
	@cat lib/analyzer.js lib/cartridge.js lib/compiler.js > /tmp/nodeNES.js

report:
	mkdir -p reports
	@./node_modules/.bin/nodeunit --reporter junit --output reports tests/*.js
	@./node_modules/.bin/jshint lib/*.js tests/*.js --jslint-reporter > reports/jslint.xml || exit 0
	@./node_modules/.bin/jshint lib/*.js tests/*.js --checkstyle-reporter > reports/checkstyle-jshint.xml || exit 0

clean:
	@rm -rf external
	@rm -rf reports

purge: clean
	@rm -rf node_modules
	@rm -rf deps

run: node_modules download_deps
	@./node_modules/.bin/supervisor ./app.js

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
