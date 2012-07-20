#!/usr/bin/env bash

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
MAGENTA='\033[35m'
CYAN='\033[36m'
WHITE='\033[37m'
GRAY="\033[1;30m"
LIGHT_GRAY="\033[37m"
NO_COLOUR="\033[0m"

LINE="$GRAY--------------------------------------------------------------------------------$NO_COLOUR"

echo -e "$GRAY-------------------------------------------[$CYAN epitome gh-pages generator$YELLOW 0.0.2$GRAY ]-"
echo -e ""
echo -e "                                                             $YELLOW($BLUE'$MAGENTA.$BLUE'$YELLOW)"
echo -e "                                                              $YELLOW<$WHITE))$YELLOW=$ "
echo -e "                                                             $BLUE _/\_ $GRAY foo[tm]$NO_COLOUR"

if [ -n "$(git status --porcelain)" ]; then
	echo -e $RED
	echo -e "ERROR:$WHITE git status$RED was not clean. Please, commit your changes first."
	echo -e $LINE

	git status

	echo -e $LINE
	exit 1
else
    echo -e $GREEN
	echo -e "Current branch is$WHITE clean$GREEN, checking out$CYAN gh-pages$GREEN..."
	echo -e
	git checkout gh-pages

	if [ -n "$(git status --porcelain)" ]; then
		git reset --hard HEAD
	fi

	echo -e $LINE
	echo -e "Checking and getting dependencies via npm install..."

	npm install .
	echo -e $LINE
	echo -e "running$CYAN build.js$LIGHT_GRAY via$CYAN npm run-script build$NO_COLOUR..."

	npm run-script build
	rc=$?

	if [[ $rc != 0 ]]; then
		echo -e $RED
		echo "ERROR: build.js has failed (exit code $rc). check logs and package.json, exiting..."
		echo -e $LINE
		exit $rc
	fi

	git add index.html
	git commit -m'automatically generated gh-pages'
	git push origin gh-pages

	echo -e $LINE
	echo -e "All done, going back to$CYAN master$NO_COLOUR now."

	git checkout master
fi
echo -e $LINE