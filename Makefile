all: install

clean:
	$(call clean)

install: package
	npm install
	$(call clean)

link: package
	npm link
	$(call clean)

package:
	./cli.js -c package.json5

publish: package
	npm publish
	$(call clean)

test: package
	npm test
	$(call clean)

# Helpers:

clean = rm -f package.json
