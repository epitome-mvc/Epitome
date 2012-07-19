#!/usr/bin/env bash

echo "-----------------------------------------------------[gh-pages generator 0.0.1]-"
echo ""
echo "                                                             ('.')"
echo "                                                              <))=$"
echo "                                                              _/\_"
echo ""

if [ -n "$(git status --porcelain)" ]; then
    echo "PLEASE COMMIT YOUR CHANGE FIRST!!!"
    echo "--------------------------------------------------------------------------------"
    git status
else
    echo "Current branch is CLEAN, checking out gh-pages..."
    echo "--------------------------------------------------------------------------------"
    git checkout gh-pages
    echo "--------------------------------------------------------------------------------"
    echo "checking and getting dependencies..."

    npm install .
    echo "--------------------------------------------------------------------------------"
    echo "running build.js via npm test..."

    npm test
    rc=$?

    if [ rc != 0 ]; then
        echo "build.js has failed. check logs and package.json, exiting..."
        exit $rc
    fi

    git commit -m'automatically generated gh-pages'
    git push origin gh-pages

    echo "--------------------------------------------------------------------------------"
    echo "all done, going back to master now."

    git checkout master
fi
echo "--------------------------------------------------------------------------------"
