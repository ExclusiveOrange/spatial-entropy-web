# Spatial Entropy Web

Based on my [Spatial Entropy Qt](https://github.com/ExclusiveOrange/spatial-entropy-qt) application, but for the web.

Given a source image, calculates something similar to [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory))
in a small region around each pixel, for each color channel, which produces an entropy image.
This can be thought of as a measure of the level of information around each pixel, or you can think of it as the inverse compressibility of the region around each pixel.

The produced image can look similar to the output of an edge filter, but unlike an edge filter can reveal hidden detail in visually smooth or solid parts of the input image.

## Building

### Requires

- Unix or Linux
  - I use WSL2 and MacOS
- Clang
  - But not Apple Clang, you'll have to install non-Apple Clang on MacOS.
    Check out [Homebrew](https://brew.sh/) and then use it to install a recent version of LLVM which includes Clang [(it's simple)](https://stackoverflow.com/a/64226003).
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- GNU Make
  - You probably already have this if you're on a Linux or Unix system.


### First Time Build

From a Linux terminal in the root of this repo:

```
npm install
make
```

### Subsequent Builds

```
make
```

### Running

The build produces static web page files in `dist/`, and you can host it locally with [http-server](https://www.npmjs.com/package/http-server).


### License

I provide this software under the [MIT License](./LICENSE.md).

