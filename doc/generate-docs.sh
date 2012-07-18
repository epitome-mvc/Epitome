if [ -z $(git status --porcelain) ];
then
    echo "git status is clean. generating..."
    curl -X POST http://documentup.com/DimitarChristoff/Epitome/recompile/ > index.html
    git checkout gh-pages
    git commit -am'updating docs'
    git push
else
    echo "Please commit your changes first."
    git status
fi
