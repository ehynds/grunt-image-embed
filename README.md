This task converts all data found within a stylesheet (those within a `url( ... )` declaration) into base64-encoded data URI strings.  This includes images and fonts.

## Features

* Supports both local & remote images.
* Ability to specify a size limit. Default is 32kb, or IE8's limit.
* Existing data URIs will be ignored.
* Skip specific images by specifying a directive comment.
* Ability to purge images that have been encoded
* Includes two helpers: `encode_stylesheet` to encode a stylesheet, and `encode_image` to encode an image.

## Getting Started

Install this plugin with: `grunt install grunt-image-embed`

Next, add this line to your project's `grunt.js` file:

`grunt.loadNpmTasks("grunt-image-embed");`

Lastly, add the configuration settings to your grunt.js file.

## Documentation

This task has two required properties, `src` and `dest`. `src` is the path to your stylesheet and `dest` is the file this task will write to (relative to the grunt.js file). If this file already exists **it will be overwritten**.

An example configuration looks like this:

```` javascript
grunt.initConfig({
  imageEmbed: {
    dist: {
      src: [ "css/styles.css" ],
      dest: "css/output.css",
      deleteAfterEncoding : false
    }
  }
});
````

### Optional Configuration Properties

ImageEmbed can be customized by specifying the following options:

* `maxImageSize`: The maximum size of the base64 string in bytes. This defaults to `32768`, or IE8's limit. Set this to `0` to remove the limit and allow any size string.
* `baseDir`: If you have absolute image paths in your stylesheet, the path specified in this option will be used as the base directory.
* `deleteAfterEncoding`: Set this to true to delete images after they've been encoded.  You'll want to do this in a staging area, and not in your source directories.  Be careful.

### Skipping Images

Specify that an image should be skipped by adding the following comment *after* the image:

`background: url(image.gif); /*ImageEmbed:skip*/`

## Known Issues

* if you minify your file before running this task, most likely you've stripped comments.  In this case, /*ImageEmbed:skip*/ will not work.

## License

Copyright (c) 2012 Eric Hynds (@erichynds)
Licensed under the MIT License.
