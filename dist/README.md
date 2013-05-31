![Epitome](https://github.com/DimitarChristoff/Epitome/raw/master/example/epitome-logo.png)


## Epitome Build Server

The experimental build server is a simple node.js script that relies on a local npm dependency of requirejs (for the Epitome root).

Start the server by doing:
```
./build.js &
> Server running at http://127.0.0.1:39170/
```

It will bind to any vhost your machine has on port `39170`

If you then visit `http://127.0.0.1:39170/`, the full version of Epitome will be returned.

For example, to get a build with epitome-model and all of its dependencies, you'd request:

`http://127.0.0.1:39170/?build=epitome-model`

This ought to return something like this (with content type `application/javascript`):

```
/*Epitome hash: 4H5M7B1JY
  Download: http://127.0.0.1:39170/4H5M7B1JY
  Selected: epitome-model */
... minified ver here
```

You can re-request this build by simply using `http://127.0.0.1:39170/4H5M7B1JY` afterwards.