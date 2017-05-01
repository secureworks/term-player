        .                                                           oooo
      .o8                                                           `888
    .o888oo  .ooooo.  oooo d8b ooo. .oo.  .oo.           oo.ooooo.   888   .oooo.   oooo    ooo  .ooooo.  oooo d8b
      888   d88' `88b `888""8P `888P"Y88bP"Y88b           888' `88b  888  `P  )88b   `88.  .8'  d88' `88b `888""8P
      888   888ooo888  888      888   888   888  8888888  888   888  888   .oP"888    `88..8'   888ooo888  888
      888 . 888    .o  888      888   888   888           888   888  888  d8(  888     `888'    888    .o  888
      "888" `Y8bod8P' d888b    o888o o888o o888o          888bod8P' o888o `Y888""8o     .8'     `Y8bod8P' d888b
                                                          888                       .o..P'
                                                         o888o                      `Y8P'

[![Build Status](https://img.shields.io/travis/secureworks/term-player/develop.svg?style=flat-square)](https://travis-ci.org/secureworks/term-player)
[![Dependency Status](https://img.shields.io/david/secureworks/term-player.svg?style=flat-square)](https://david-dm.org/secureworks/term-player)
[![Dev Dependency Status](https://img.shields.io/david/dev/secureworks/term-player.svg?style=flat-square)](https://david-dm.org/secureworks/term-player?type=dev)
[![License](https://img.shields.io/github/license/secureworks/term-player.svg?style=flat-square)](https://github.com/secureworks/term-player/blob/master/LICENSE.txt)
[![Release](https://img.shields.io/github/release/secureworks/term-player.svg?style=flat-square)](https://github.com/secureworks/term-player)

term-player was simply a fun project to create a media player for your terminal written in JavaScript.

---

Picture this; you've SSH'd into your media box to find the file name of your favorite Zombie film, Dawn of the Dead. But
wait, there's 2 and the only difference is their file extension. Nightmare! How do you know which one is Romero's
critically acclaimed 1978 classic and which one is Snyder's 2004 ripoff!?

term-player attempts to solve just that by allowing you to stream media directly on the terminal, through the terminal.
It isn't pretty, but it sure is fun!

## Prerequisites

Before you can install term-player, you need to ensure that you have the following:

* [Git](https://git-scm.com)
* [Node.js](https://nodejs.org) v4 or newer
* [npm](https://www.npmjs.com)
* [FFmpeg](https://www.ffmpeg.org) v2 or newer (not tested on v3)

The executables for all of these dependencies must be available on your system `PATH`. If you want to be able to access
globally installed npm modules from anywhere (recommended), you should also ensure that the appropriate directory is in
your `PATH`. You can find this directory easily by running the following command:

``` bash
$ npm config get prefix
```

## Install

First you need to checkout the code from Git:

``` bash
$ git clone https://github.com/secureworks/term-player.git
$ cd term-player
```

Then you need to install the project and its dependencies using npm:

``` bash
term-player$ npm install -g
```

## Usage

You can now play media right in your terminal using the `term-player` command!

### CLI

Here's how to use the `term-player` command:

    Usage: term-player [options] <file>

    Options:

      -h, --help            output usage information
      -V, --version         output the version number
      -c, --codec <name>    video codec
      -f, --format <name>   media format
      -r, --refresh <rate>  refresh rate in milliseconds

The video codec and media format is derived from the file if the options are not specified and the default refresh rate
is 60 milliseconds.

## Contributors

If you want to contribute, you're a legend! Information on how you can do so can be found in
[CONTRIBUTING.md](https://github.com/secureworks/term-player/blob/master/CONTRIBUTING.md). We want your suggestions and
pull requests!

A list of term-player contributors can be found in
[AUTHORS.md](https://github.com/secureworks/term-player/blob/master/AUTHORS.md).

## License

See [LICENSE.txt](https://github.com/secureworks/term-player/raw/master/LICENSE.txt) for more information on our Apache
License, Version 2.0.
