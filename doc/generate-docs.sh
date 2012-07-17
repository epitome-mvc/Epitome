if [ -z $(git status --porcelain) ];
then
    echo "git status is clean. generating..."
    curl -X POST --data-urlencode content@Epitome.md --data-urlencode name=Epitome --data-urlencode twitter=D_mitar --data-urlencode repo=DimitarChristoff/Epitome/ http://documentup.com/compiled > index.html && open index.html
else
    echo "Please commit your changes first."
    git status
fi
