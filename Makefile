REPORTER = dot

basic-test:
	@./node_modules/.bin/mocha

test:
  @NODE_ENV=test ./node_modules/.bin/mocha \
    --reporter $(REPORTER) \

test-w:
  @NODE_ENV=test ./node_modules/.bin/mocha \
    --reporter $(REPORTER) \
    --growl \
    --watch

.PHONY: basic-test test test-w
