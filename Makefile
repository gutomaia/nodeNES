PLATFORM = $(shell uname)

NODENES_VERSION = ${shell node -e "console.log(require('./package.json').version);"}

SELENIUM_VERSION = 2.40.0
CHROMEDRIVER_VERSION = 2.9

BOWER_BIN = ./node_modules/.bin/bower


ifeq "Linux" "${PLATFORM}"
CHROMEDRIVER_ZIP = chromedriver_linux64.zip
CHROMEDRIVER_BIN = chromedriver
else ifeq "Darwin" "${PLATFORM}"
CHROMEDRIVER_ZIP = chromedriver_mac32.zip
CHROMEDRIVER_BIN = chromedriver
endif

CHROMEDRIVER_URL = http://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/${CHROMEDRIVER_ZIP}

BOOTSTRAP_LESS = bower_components/bootstrap/less/bootstrap.less
BOOTSTRAP_RESPONSIVE_LESS = bower_components/bootstrap/less/responsive.less

OK=\033[32m[OK]\033[39m
FAIL=\033[31m[FAIL]\033[39m
CHECK=@if [ $$? -eq 0 ]; then echo "${OK}"; else echo "${FAIL}"; cat ${DEBUG} ; fi

DEBUG=/tmp/nodeNES_debug
ERROR=/tmp/nodeNES_error

WGET = wget -q --user-agent="Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"

SRC_JS = bin/nodenes \
         $(shell find lib tests -type f -iname "*.js") \
         app.js \
         tdd.js

NODE_CHECK=node_modules/.check
BOWER_CHECK=bower_components/.check

ifeq "" "$(shell which npm)"
default:
	@echo "Please install node.js"
	@echo "Visit http://nodejs.org/ for more details"
	exit 1
else
default: test
endif

.git/hooks/pre-commit: hooks/pre-commit
	@echo "Instaling pre-commit hook: \c"
	@mkdir -p .git/hooks && \
		cp hooks/pre-commit .git/hooks/pre-commit && \
		touch $@
	${CHECK}

${NODE_CHECK}: .git/hooks/pre-commit package.json
	@echo "NPM installing packages:"
	@npm install #> ${DEBUG} 2> ${ERROR}
	@touch $@
	${CHECK}

${BOWER_BIN}: ${NODE_CHECK}

${BOWER_CHECK}: bower.json ${BOWER_BIN}
	@${BOWER_BIN} install && touch $@

external:
	@echo "Creating external dir: \c"
	@mkdir -p external
	${CHECK}

deps/.done:
	@echo "Creating dependencies dir: \c"
	@mkdir -p deps
	@touch $@
	${CHECK}

external/jsnes.src.js: external ${BOWER_CHECK}
	@echo "Packing jsnes.src.js: \c"
	@cd bower_components/jsnes/source && \
		cat header.js nes.js utils.js cpu.js keyboard.js mappers.js papu.js ppu.js rom.js ui.js > ../../../external/jsnes.src.js
	${CHECK}
	@touch $@

external/dynamicaudio-min.js: external ${BOWER_CHECK}
	@echo "Copping dynamicaudio-min.js: \c"
	@cp bower_components/jsnes/lib/dynamicaudio-min.js $@ && touch $@
	${CHECK}

external/dynamicaudio.swf: external ${BOWER_CHECK}
	@echo "Copping dynamicaudio-swf.js: \c"
	@cp bower_components/jsnes/lib/dynamicaudio.swf $@ && touch $@
	${CHECK}

external/underscore.js: external ${BOWER_CHECK}
	@echo "Copping underscore.js: \c"
	@cp bower_components/underscore/underscore.js $@ && touch $@
	${CHECK}
	@touch $@

external/backbone.js: external ${BOWER_CHECK}
	@echo "Copping backbone.js: \c"
	@cp bower_components/backbone/backbone.js $@ && touch $@
	${CHECK}
	@touch $@

external/codemirror.js: external ${BOWER_CHECK}
	@echo "Copping codemirror.js: \c"
	@cp bower_components/codemirror/lib/codemirror.js $@ && touch $@
	${CHECK}

external/codemirror.css: external ${BOWER_CHECK}
	@echo "Copping codemirror.css: \c"
	@cp bower_components/codemirror/lib/codemirror.css $@ && touch $@
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
	@find deps/glyphicons_free/ -type f  -iname *.png | grep -P 'glyphicons\-\d+\-fast.backward' | \
		xargs -I []	cp [] $@
	${CHECK}

external/fast_forward.png: external deps/glyphicons_free/.done
	@echo "Copping $@: \c"
	@find deps/glyphicons_free/ -type f  -iname *.png | grep -P 'glyphicons\-\d+\-fast.forward' | \
		xargs -I []	cp [] $@
	${CHECK}

external/check.png: external deps/glyphicons_free/.done
	@echo "Copping $@: \c"
	@find deps/glyphicons_free/ -type f  -iname *.png | grep -P 'glyphicons\-\d+\-check' | \
		xargs -I []	cp [] $@
	${CHECK}

external/bootstrap.css: external ${BOWER_CHECK}
	#TODO: cp snippets/variables.less deps/bootstrap/less
	@echo "Compiling $@: \c"
	#@./node_modules/recess/bin/recess --compile ${BOOTSTRAP_LESS} > $@
	cp bower_components/bootstrap/docs/assets/css/bootstrap.css $@
	${CHECK}

external/bootstrap-responsive.css: external ${BOWER_CHECK}
	@echo "Compiling $@: \c"
	#@./node_modules/recess/bin/recess --compile ${BOOTSTRAP_RESPONSIVE_LESS} > $@
	@cp bower_components/bootstrap/docs/assets/css/bootstrap-responsive.css $@
	${CHECK}

external/bootstrap-tab.js: external ${BOWER_CHECK}
	@echo "Copping $@: \c"
	@cp bower_components/bootstrap/js/bootstrap-tab.js $@ && touch $@
	${CHECK}

external/bootstrap-dropdown.js: external ${BOWER_CHECK}
	@echo "Copping $@: \c"
	@cp bower_components/bootstrap/js/bootstrap-dropdown.js $@ && touch $@
	${CHECK}

external/jquery.js: external ${BOWER_CHECK}
	@echo "Copping $@: \c"
	@cp bower_components/jquery/jquery.min.js $@ && touch $@
	${CHECK}

external/require.js: external ${BOWER_CHECK}
	@echo "Copping $@: \c"
	@cp bower_components/requirejs/require.js $@ && touch $@
	${CHECK}

download_deps: external/jsnes.src.js \
	external/dynamicaudio-min.js \
	external/dynamicaudio.swf \
	external/underscore.js \
	external/backbone.js \
	external/codemirror.js \
	external/codemirror.css \
	external/jquery.js \
	external/fast_backward.png \
	external/fast_forward.png \
	external/check.png \
	external/bootstrap.css \
	external/bootstrap-dropdown.js \
	external/bootstrap-tab.js \
	external/require.js

jshint:
	@./node_modules/.bin/jshint ${SRC_JS} --config jshint.config

jslint:
	@./node_modules/.bin/jslint --indent 4 --predef "define, nodeunit" --vars --sloppy --nomen --todo --stupid ${SRC_JS}

build: ${NODE_CHECK} jshint

nodeunit:
	@./node_modules/.bin/nodeunit --reporter minimal tests/*_test.js

test: build nodeunit

tdd:
	@./node_modules/.bin/supervisor -q -i reports -w lib,tests -n error -n exit tdd.js

deploy:
	@cat lib/analyzer.js lib/cartridge.js lib/compiler.js > /tmp/nodeNES.js

reports/lconv.txt:
	mkdir -p reports
	./node_modules/.bin/jscoverage lib 
	mv lib lib-src
	ln -s lib-cov lib
	./node_modules/.bin/nodeunit --reporter lcov tests/*_test.js > reports/lconv.txt
	rm -rf lib lib-cov
	mv lib-src lib
	@touch $@

report:
	mkdir -p reports
	@./node_modules/.bin/nodeunit --reporter junit --output reports tests/*.js
	@./node_modules/.bin/jshint lib/*.js tests/*.js --jslint-reporter > reports/jslint.xml || exit 0
	@./node_modules/.bin/jshint lib/*.js tests/*.js --checkstyle-reporter > reports/checkstyle-jshint.xml || exit 0
	
coveralls: reports/lconv.txt
	(cat reports/lconv.txt | ./node_modules/.bin/coveralls) || echo "coverwalls have a problem"

codeclimate: reports/lconv.txt
	(cat reports/lconv.txt | CODECLIMATE_REPO_TOKEN=c4b0a7f6df854cda8d856ea8c574dda113dcd4dd52e0951de73d5ecdf58c6663 ./node_modules/.bin/codeclimate) || echo "codeclimate have a problem"

coverage: coveralls codeclimate

tests_browser/.check:
	mkdir -p tests_browser
	./node_modules/.bin/r.js -convert tests/ tests_browser/
	touch $@

browser_deps: external/underscore.js \
	external/jquery.js \
	external/require.js

browser: tests_browser/.check browser_deps
	./node_modules/karma/bin/karma start

deps/selenium-server-standalone-${SELENIUM_VERSION}.jar: deps/.done
	@echo "Downloading Selenium Server: \c"
	@cd deps && \
		${WGET} http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-${SELENIUM_VERSION}.jar
	${CHECK}
	@touch $@

${CHROMEDRIVER_BIN}:
	cd deps && ${WGET} ${CHROMEDRIVER_URL}
	unzip deps/${CHROMEDRIVER_ZIP}
	touch chromedriver

config-acceptance: deps/selenium-server-standalone-2.40.0.jar ${CHROMEDRIVER_BIN}
	$(eval export CI=1)
	$(eval export SELENIUM_SERVER_JAR=deps/selenium-server-standalone-2.40.0.jar)
	$(eval export SELENIUM_BROWSER=firefox npm test selenium-webdriver)

daemon:
	@(nohup node app.js > nodeNES.log) & echo "$$!" > nodeNES.pid </dev/null &

pre-test-acceptance: build download_deps
	@echo $@
	@rm -f nodeNES.log
	@(make daemon)

test-acceptance:
	@echo $@
	@./node_modules/.bin/nodeunit --reporter minimal tests/acceptance/*_test.js

post-test-acceptance:
	@echo $@
	@cat nodeNES.pid | xargs kill && rm nodeNES.pid

acceptance: config-acceptance
	@make pre-test-acceptance || (echo "error"; $(eval export PRE_ACCEPTANCE_FAIL=1))
ifneq "1" "${PRE_ACCEPTANCE_FAIL}"
	@make test-acceptance || (echo "error"; $(eval export ACCEPTANCE_FAIL=1))
endif
	@make post-test-acceptance
ifeq "1" "${ACCEPTANCE_FAIL}"
	exit(1)
endif

ci: test browser acceptance

clean:
	@find . -iname \*~ -delete
	@rm -rf external
	@rm -rf reports
	@rm -rf dist
	@rm -rf tests_browser

purge: clean
	@rm -rf node_modules
	@rm -rf bower_components
	@rm -rf deps
	@rm -f .git/hooks/pre-commit
	@rm -f ${CHROMEDRIVER_BIN}

run: download_deps
	@./node_modules/.bin/supervisor ./app.js

dist/.check:
	@mkdir -p $@
	touch $@

dist/nodenes-min.js: dist/.check ${SRC_JS}
	@./node_modules/.bin/r.js -o name=lib/compiler excludeShallow=jquery out=dist/nodenes-min.js baseUrl=.

dist/init-min.js: dist/.check  ${SRC_JS}
    @./node_modules/.bin/r.js -o name=lib/init excludeShallow=jquery out=dist/nodenes-min.js baseUrl=.

dist: ${NODE_CHECK} dist/nodenes-min.js dist/init-min.js


before-tag:
	rm /tmp/.nodeNES_commitMSG | echo "OK"
	@git branch | grep -P '\* \d+\.\d+\.x' || (echo "You must be in a version branch" && exit 1)
	@#TODO: you must be on a branch that matches the version
	@#TODO: you must be synced with the remote branch

patch: before-tag
	@node -e "console.log(require('./package.json').version.replace(/(\d+\.\d+\.)(\d+)/, function(s,p,m) {var v = parseInt(m) + 1; return p.concat(v);}));" | \
		xargs -I [] sed 's/"version" : "${NODENES_VERSION}",/"version" : "[]",/' package.json > tmp; mv tmp package.json
	@echo "patch" > /tmp/.nodeNES_commitMSG
	make create-tag

minor: before-tag
	echo $(NODENES_VERSION)
	@node -e "console.log(require('./package.json').version.replace(/(\d+\.)(\d+)\.\d+/, function(s,p,m) {var v = parseInt(m) + 1; return p.concat(v.toString()).concat('.0');}));" | \
		xargs -I [] sed 's/"version" : "${NODENES_VERSION}",/"version" : "[]",/' package.json > tmp;
	make create-tag

create-tag: /tmp/.nodeNES_commitMSG
	#never call this tag directly
	@git add package.json
	#TODO remove patch word from version tag...
	@node -e "console.log(require('./package.json').version);" | xargs -I [] git commit -m "New nodeNES patch version []"
	@node -e "console.log(require('./package.json').version);" | xargs -I [] git tag -a nodeNES-[] -m 'nodeNES version []'
	@git push --tags

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
