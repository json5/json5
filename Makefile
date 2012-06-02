all: install

install: package
	npm install

link: package
	npm link

package:
	./cli.js -c package.json5

publish: package
	npm publish

test: package
	npm test
