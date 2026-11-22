.DEFAULT_GOAL := help
.PHONY: help install run build test test-browser check
PORT ?= 4173
help:
	@printf 'make install       Install locked test dependencies\nmake run           Build and serve locally (PORT=4173)\nmake check         Model tests and static PWA build\nmake test-browser  Browser flows, responsive and offline\n'
install:
	npm ci --ignore-scripts
run: build
	python3 -m http.server $(PORT) --bind 127.0.0.1 --directory dist
build:
	npm run build
test:
	npm test
test-browser: build
	npm run test:e2e
check:
	npm run check
