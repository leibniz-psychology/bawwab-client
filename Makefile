PREFIX:=/usr/local
SHAREDIR:=$(PREFIX)/share/bawwab-client
#NODE_ENV:=development
NODE_ENV:=production

# We support:
# Chrome: Last three versions. No LTS release.
# Edge: Last three versions.
# Firefox: Latest ESR release.
# Safari: Last three versions.
TARGETS:=chrome87,firefox78,safari12,edge87

build: _build/html/assets _build/html/index.html
	
_build/html/assets:
	esbuild src/app.js \
			--bundle \
			--sourcemap \
			--loader:.png=file \
			--loader:.jpg=file \
			--loader:.svg=file \
			--loader:.md=text \
			--loader:.html=text \
			--splitting \
			--format=esm \
			--target=$(TARGETS) \
			--define:process.env.NODE_ENV=\"$(NODE_ENV)\" \
			--define:__VUE_OPTIONS_API__=true \
			--define:__VUE_PROD_DEVTOOLS__=false \
			--define:__VUE_I18N_FULL_INSTALL__=true \
			--define:__VUE_I18N_LEGACY_API__=true \
			--define:__INTLIFY_PROD_DEVTOOLS__=false \
			--outdir=$@

_build/html/index.html:
	cp src/app.html $@
	
install: build
	install -d $(SHAREDIR)
	cp -Rv _build/html $(SHAREDIR)

run: build _build/server.pem
	nginx -c `pwd`/contrib/nginx.conf -p _build

_build/server.pem:
	openssl req -new -x509 -nodes -out $@ -keyout _build/server.key -subj "/C=XX/ST=Universe/L=Universe/O=Test/OU=IT/CN=local.psychnotebook.org"

# Do not dependency-track _build/assets
.PHONY: _build/assets build install run

