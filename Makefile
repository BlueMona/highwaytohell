PREFIX = /
BIN_DIR = $(PREFIX)/usr/bin
DOC_DIR = $(PREFIX)/usr/share/doc/highwaytohell
ETC_DIR = $(PREFIX)/etc
LIB_DIR = $(PREFIX)/var/lib/highwaytohell
MAN_DIR = $(PREFIX)/usr/share/man/man8
SHARE_DIR = $(PREFIX)/usr/share/highwaytohell

shrinkpack:
	if ! test -d node_modules; then \
	    npm install; \
	fi
	if ! test -x /usr/local/bin/shrinkpack -o -x /usr/bin/shrinkpack; then \
	    npm install -g shrinkpack; \
	    npm install -g shrinkwrap; \
	fi
	if npm shrinkwrap --dev; then \
	    shrinkpack -c || shrinkpack; \
	    git status || true; \
	fi

shrinkwrap: shrinkpack

rewrap:
	rm -fr node_modules node_shrinkwrap npm-shrinkwrap.json
	make shrinkpack

dbinit:
	test -f db/cassandra.init || return 0
	test "$$CASSANDRA_HOST" || return 0
	cat db/cassandra.init | cqlsh $$CASSANDRA_HOST

dbinittest: dbinit
	test -f db/cassandra.test || return 0
	test "$$CASSANDRA_HOST" || return 0
	cat db/cassandra.test | cqlsh $$CASSANDRA_HOST


install:
	test -d $(DOC_DIR) || mkdir -p $(DOC_DIR)
	install -c -m 0644 samples.d/apache.conf $(DOC_DIR)/apache-vhost.conf.sample
	install -c -m 0644 samples.d/haproxy/apiGW.cfg $(DOC_DIR)/haproxy.cfg.sample
	install -c -m 0644 samples.d/nginx.conf $(DOC_DIR)/nginx-vhost.conf.sample
	install -c -m 0644 samples.d/rsyslog.conf $(DOC_DIR)/rsyslog.conf.sample
	install -c -m 0644 samples.d/munin/hwth_multi $(DOC_DIR)/munin.hwth_multi
	install -c -m 0644 samples.d/munin/hwth_multi.conf $(DOC_DIR)/munin.conf.sample
	install -c -m 0644 samples.d/butters.cfg.sample $(DOC_DIR)/butters.cfg.sample
	install -c -m 0644 samples.d/redis-cleanup $(DOC_DIR)/redis-cleanup.cron
	install -c -m 0644 samples.d/nrpe/check_pm2 $(DOC_DIR)/nrpe-pm2-probe
	install -c -m 0644 samples.d/nrpe/check_pm2.cfg $(DOC_DIR)/nrpe-pm2-conf
	install -c -m 0644 samples.d/nrpe/sudoers-pm2 $(DOC_DIR)/nrpe-pm2-sudoers
	install -c -m 0644 samples.d/hwth-watchmark.service $(DOC_DIR)/hwth-watchmark.service
	for potentialDoc in API.md README.md; \
	    do \
		test -s $$potentialDoc || continue; \
		install -c -m 0644 $$potentialDoc $(DOC_DIR)/$$potentialDoc; \
	    done
	find db -type f | sed 's|^db/||' | while read file; \
	    do \
		install -c -m 0644 db/$$file $(DOC_DIR)/$$file; \
	    done
	for d in api lib templates static/fav workers node_shrinkwrap; \
	    do \
		test -d $(SHARE_DIR)/$$d || mkdir -p $(SHARE_DIR)/$$d; \
	    done
	find api lib templates static workers node_shrinkwrap -type f | while read file; \
	    do \
		install -c -m 0644 $$file $(SHARE_DIR)/$$file; \
	    done
	for file in revision package.json npm-shrinkwrap.json; \
	    do \
		test -f $$file || continue; \
		install -c -m 0644 $$file $(SHARE_DIR)/$$file; \
	    done
	test -d $(LIB_DIR) || mkdir -p $(LIB_DIR)
	install -c -m 0644 samples.d/hwth-profile $(LIB_DIR)/.profile-sample
	test -d $(BIN_DIR) || mkdir -p $(BIN_DIR)
	install -c -m 0755 samples.d/hwth-control $(BIN_DIR)/hwth
	install -c -m 0755 samples.d/hwth-watchmark $(BIN_DIR)/hwth-watchmark
	install -c -m 0755 samples.d/butters $(BIN_DIR)/butters

build:
	@/bin/echo nothing to be done

favicon:
	if ! test -s logo.png; then \
	    echo "please install initial logo into repository root, as logo.png"; >&2\
	    exit 1; \
	fi
	for size in 16 32 57 60 64 70 72 76 96 114 120 128 144 150 152 160 180 196 256 310; \
	    do \
		convert logo.png -resize "$${size}x$$size" static/fav/icon$$size.png; \
	    done
	for size in 16 32 48 64
	    do \
		convert logo.png -resize "$${size}x$$size" static/fav/icon$$size.ico; \
	    done
	for size in 128 256; \
	    do \
		convert logo.png -resize "$${size}x$$size" static/logo$size.png; \
	    done
	find static/fav -type f

sourceismissing:
	for dep in node_shrinkwrap/*; \
	do \
	    if ! grep "source-is-missing $$dep" debian/source.lintian-overrides >/dev/null; then \
		echo "highwaytohell source: source-is-missing $$dep" >>debian/source.lintian-overrides; \
	    fi; \
	done

clean:
	if test -s .gitignore; then \
	    grep -vE '^(#|$$)' .gitignore | while read line; \
		do \
		    rm -fr ./$$line; \
		done; \
	fi
	rm -fr *log node_modules

cleanCI: clean
	rm -rf zones.d keys.d nsd.conf.d


createdebsource:
	LANG=C debuild -S -sa

createdebbin:
	LANG=C dpkg-buildpackage -us -uc

createinitialarchive: sourceismissing
	if test -d .git; then \
	    case "`git branch | awk '/^\*/{print $$2}'`" in \
		master|production|oldbear-prod)	suffix=		;; \
		oldbear-preprod|preprod)	suffix=rc	;; \
		staging)			suffix=beta	;; \
		*)				suffix=alpha	;; \
	    esac; \
	else \
	    suffix=; \
	fi; \
	if test -s .gitignore; then \
	    grep -vE '^(#|$$)' .gitignore | while read line; \
		do \
		    rm -fr ./$$line; \
		done; \
	fi; \
	git rev-parse HEAD >revision 2>/dev/null || echo alpha >revision; \
	rm -fr .git .gitignore .gitrelease circle.yml samples.d/diags debian/highwaytohell debian/highwaytohell.debhelper.log; \
	sed -i "s|(\([0-9]*\.[0-9]*\.[0-9]*-\)\([0-9]*\)) unstable;|(\1$${suffix}\2) unstable;|" debian/changelog
	version=`awk '/^highwaytohell/{print $$2;exit}' debian/changelog | sed -e 's|^[^0-9]*\([0-9]*\.[0-9]*\.[0-9]*\)-.*|\1|'`; \
	( cd .. ; tar -czf highwaytohell_$$version.orig.tar.gz highwaytohell )

release:
ifeq ($(GITHUB_USER),)
	@/bin/echo "CRITICAL: missing GITHUB_USER env var" >&2;
	@exit 1;
else
    ifeq ($(GITHUB_TOKEN),)
	@/bin/echo "CRITICAL: missing GITHUB_TOKEN env var" >&2;
	@exit 1;
    else
        ifeq (, $(shell which debuild))
	@/bin/echo "CRITICAL: missing debuild, can not build debian packages" >&2;
	@exit 1;
        else
	branch=`test -d .git && git branch | awk '/^\*/{print $$2}'`; \
	test -z "$$branch" && branch=master; \
	if ! git pull; then \
	    echo "CRITICAL: failed pulling from GitHub" >&2; \
	    exit 1; \
	elif ! git push -u origin $$branch; then \
	    echo "CRITICAL: failed pushing to GitHub" >&2; \
	    exit 1; \
	elif ! ./.gitrelease; then \
	    exit $$?; \
	fi
        endif
    endif
endif

all: build
