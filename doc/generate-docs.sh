if [ -z $(git status --porcelain) ];
then
    echo "git status is clean. generating..."
    curl -X POST --data-urlencode content@Epitome.md \
    --data-urlencode name=Epitome \
    --data-urlencode twitter=D_mitar \
    --data-urlencode travis=true \
    --data-urlencode "repo=git@github.com:DimitarChristoff/Epitome.git" \
    http://documentup.com/compiled > index.html && open index.html
else
    echo "Please commit your changes first."
    git status
fi
