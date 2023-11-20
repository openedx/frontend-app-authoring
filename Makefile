transifex_resource = frontend-app-course-authoring
export TRANSIFEX_RESOURCE = ${transifex_resource}
transifex_langs = "ar,de,de_DE,es_419,fa_IR,fr,fr_CA,hi,it,it_IT,pt,pt_PT,ru,uk,zh_CN"

intl_imports = ./node_modules/.bin/intl-imports.js
transifex_utils = ./node_modules/.bin/transifex-utils.js
i18n = ./src/i18n
transifex_input = $(i18n)/transifex_input.json

# This directory must match .babelrc .
transifex_temp = ./temp/babel-plugin-formatjs

precommit:
	npm run lint
	npm audit

requirements:
	npm ci

i18n.extract:
	# Pulling display strings from .jsx files into .json files...
	rm -rf $(transifex_temp)
	npm run-script i18n_extract

i18n.concat:
	# Gathering JSON messages into one file...
	$(transifex_utils) $(transifex_temp) $(transifex_input)

extract_translations: | requirements i18n.extract i18n.concat

# Despite the name, we actually need this target to detect changes in the incoming translated message files as well.
detect_changed_source_translations:
	# Checking for changed translations...
	git diff --exit-code $(i18n)

# Pushes translations to Transifex.  You must run make extract_translations first.
push_translations:
	# Pushing strings to Transifex...
	tx push -s
	# Fetching hashes from Transifex...
	./node_modules/@edx/reactifex/bash_scripts/get_hashed_strings_v3.sh
	# Writing out comments to file...
	$(transifex_utils) $(transifex_temp) --comments --v3-scripts-path
	# Pushing comments to Transifex...
	./node_modules/@edx/reactifex/bash_scripts/put_comments_v3.sh

ifeq ($(OPENEDX_ATLAS_PULL),)
# Pulls translations from Transifex.
pull_translations:
	tx pull -t -f --mode reviewed --languages=$(transifex_langs)
else
# Pulls translations using atlas.
pull_translations:
	rm -rf src/i18n/messages
	mkdir src/i18n/messages
	cd src/i18n/messages \
	   && atlas pull --filter=$(transifex_langs) \
	            translations/paragon/src/i18n/messages:paragon \
	            translations/frontend-component-footer/src/i18n/messages:frontend-component-footer \
	            translations/frontend-app-course-authoring/src/i18n/messages:frontend-app-course-authoring

	$(intl_imports) paragon frontend-component-footer frontend-app-course-authoring
endif

# This target is used by Travis.
validate-no-uncommitted-package-lock-changes:
	# Checking for package-lock.json changes...
	git diff --exit-code package-lock.json

.PHONY: validate
validate:
	make validate-no-uncommitted-package-lock-changes
	npm run i18n_extract
	npm run lint -- --max-warnings 0
	npm run types
	npm run test
	npm run build

.PHONY: validate.ci
validate.ci:
	npm ci
	make validate
