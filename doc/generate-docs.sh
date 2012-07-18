if [ -z $(git status --porcelain) ];
then
    echo "git status is clean. generating..."
    curl -X POST http://documentup.com/DimitarChristoff/Epitome/recompile/ > index.html
    git br -D gh-pages
    git push origin :gh-pages
    git checkout --orphan gh-pages
    git add index.html
    git commit -m'updating docs'
    git push
else
    echo "Please commit your changes first."
    git status
fi
