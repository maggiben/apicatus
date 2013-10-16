TESTS = test/*.js
REPORTER = spec
XML_FILE = reports/TEST-all.xml
HTML_FILE = reports/coverage.html

test: test-mocha

test-mocha:
	@NODE_ENV=test mocha \
	    --timeout 200 \
		--reporter $(REPORTER) \
		$(TESTS)

test-w:
	@NODE_ENV=test mocha \
		--reporter $(REPORTER) \
		--growl \
		--watch

test-cov: istanbul

istanbul:
	istanbul cover _mocha -- -u exports -R spec $(TESTS)

coveralls:
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

clean:
	rm -rf ./coverage

.PHONY: basic-test test test-w
