TESTS = test/*.js
REPORTER = spec
XML_FILE = reports/TEST-all.xml
HTML_FILE = reports/coverage.html

test:
	@NODE_ENV=test mocha \
	    --timeout 200 \
		--reporter $(REPORTER) \
		$(TESTS)

test-cov: istanbul

istanbul:
	istanbul cover _mocha -- -u exports -R spec $(TESTS)

istanbul2:
	istanbul cover _mocha --report lcovonly -- -R spec $(TESTS)

coveralls:
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

clean:
	rm -rf ./coverage

.PHONY: test test-cov 
