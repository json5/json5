all: install

clean:
	$(call clean)

install: package
	@npm install
	$(call clean)

link: package
	@npm link
	$(call clean)

package:
	@./lib/cli.js -c package.json5

publish: package
	@npm publish
	$(call clean)

test: package
	@npm test || :	# don't fail on test errors; TODO still fail after clean?
	$(call clean)

# Helpers:

clean = @rm -f package.json
