if [ -z $(git status --porcelain) ];
then
    echo "git status is clean. generating..."
    curl -X POST http://documentup.com/DimitarChristoff/Epitome/recompile/ > index.html
else
    echo "Please commit your changes first."
    git status
fi
