/*
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2012 Eric Hynds
 * Licensed under the MIT license.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var mime = require('mime');
var grunt = require('grunt');
var fetch = require('./fetch');
var _ = grunt.util._;

// Cache regex's
var rImages = /([\s\S]*?)(url\(([^)]+)\))(?!\s*[;,]?\s*\/\*\s*ImageEmbed:skip\s*\*\/)|([\s\S]+)/img;
var rExternal = /^http/;
var rSchemeless = /^\/\//;
var rData = /^data:/;
var rQuotes = /['"]/g;
var rParams = /([?#].*)$/g;

/**
 * Base64 encodes an image and builds the data URI string
 *
 * @param {string} mimeType - Mime type of the image
 * @param {string} img - The source image
 * @returns {string} base64 encoded string
 */
var getDataURI = function(mimeType, img) {
  var ret = 'data:';
  ret += mimeType;
  ret += ';base64,';
  ret += img.toString('base64');
  return ret;
};

/**
 * Takes a CSS file as input, goes through it line by line, and base64
 * encodes any images it finds.
 *
 * @param srcFile Relative or absolute path to a source stylesheet file.
 * @param opts Options object
 * @param done Function to call once encoding has finished.
 */
module.exports.stylesheet = function(srcFile, opts, done) {
  opts = opts || {};

  // Regular expressions to check inclusion or exclusion of embedded files
  var rInclude = opts.regexInclude || /.*/g;
  var rExclude = opts.regexExclude || /$^/g;

  // Cache of already converted images
  var cache = {};

  // Shift args if no options object is specified
  if(grunt.util.kindOf(opts) === 'function') {
    done = opts;
    opts = {};
  }

  var src = grunt.file.read(srcFile);
  var result = '';
  var img, group;

  grunt.util.async.whilst(function() {
    group = rImages.exec(src);
    return group != null;
  }, function(complete) {
    // if there is another url to be processed, then:
    //    group[1] will hold everything up to the url declaration
    //    group[2] will hold the complete url declaration (useful if no encoding will take place)
    //    group[3] will hold the contents of the url declaration
    //    group[4] will be undefined
    // if there is no other url to be processed, then group[1-3] will be undefined
    //    group[4] will hold the entire string

    // Will skip processing if file is not included or is excluded
    var process = group[3] && (group[3].match(rInclude) !== null || group[3].match(rExclude) === null);

    if(group[4] == null && process) {
      result += group[1];

      img = group[3].trim()
      .replace(rQuotes, '') // remove quotation marks
      .replace(rParams, ''); // remove query string/hash parmams in the filename, like foo.png?bar or foo.png#bar

      // Throw a warning if this image has already been encoded elsewhere
      // in the stylesheet
      if(cache[img]) {
        grunt.log.warn('The image ' + img + ' has already been encoded elsewhere in your stylesheet. I\'m going to do it again, but it\'s going to make your stylesheet a lot larger than it needs to be.');
        result = result += cache[img];
        return complete();
      }

      // process it and put it into the cache
      var loc = img;
      var isLocalFile = !rData.test(img) && !rExternal.test(img) && !rSchemeless.test(img);

      // Resolve the image path relative to the CSS file
      if(isLocalFile) {
        // local file system.. fix up the path
        loc = img.charAt(0) === '/' ?
          (opts.baseDir || '') + loc :
          path.join(path.dirname(srcFile),  (opts.baseDir || '') + img);

        // If that didn't work, try finding the image relative to
        // the current file instead.
        if(!fs.existsSync(loc)) {
          loc = path.resolve(__dirname + img);
        }
      }

      // Test for scheme less URLs => "//example.com/image.png"		
      if(!isLocalFile && rSchemeless.test(loc)) {
        loc = 'http:' + loc;
      }

      // Encode the image
      exports.image(loc, opts, function(err, resp, cacheable) {
        if(err == null) {
          var url = 'url(' + resp + ')';
          result += url;

          if(cacheable !== false) {
            cache[img] = url;
          }

          if(opts.deleteAfterEncoding && isLocalFile) {
            grunt.log.writeln('Deleting file ' + loc);
            fs.unlinkSync(loc);
          }
        } else {
          result += group[2];
        }

        complete();
      });
    } else if (group[4] === undefined && !process) {
      result += group[1] + group[2];
      complete();
    } else {
      result += group[4];
      complete();
    }
  }, function(err) {
    done(err, result);
  });
};


/**
 * Takes an image (absolute path or remote) and base64 encodes it.
 * @param {string} img -  Absolute, resolved path to an image
 * @param {object} opts - Options object
 * @param {function} done - Callback function
 * @returns {string} A data URI string (mime type, base64 img, etc.) that a browser can interpret as an image
 */
exports.image = function(img, opts, done) {
  // Shift args
  if(grunt.util.kindOf(opts) === 'function') {
    done = opts;
    opts = {};
  }

  // Set default, helper-specific options
  opts = _.extend({
    maxImageSize: 32768
  }, opts);

  /**
   * Callback when the image has been base64 encoded.
   */
  var complete = function(err, encoded, cacheable) {
    // Did the dataURI exceed the max length?
    if(cacheable && encoded && opts.maxImageSize && encoded.length > opts.maxImageSize) {
      err = new Error("Skipping " + img + " (greater than " + opts.maxImageSize + " bytes)");
    }

    // Return the original source if an error occurred
    if(err) {
      return done(err, img, false);
    }

    done(null, encoded, cacheable);
  };

  /**
   * Function to base64 encode the image
   */
  var process = function() {
    // If the image is already base64 encoded, pass it directly
    // through to the callback.
    if(rData.test(img)) {
      return complete(null, img, false);
    }

    // External URL?
    if(rExternal.test(img)) {
      grunt.log.writeln('Encoding file: ' + img);

      return fetch.image(img, function(err, src, cacheable) {
        if(err) {
          return complete(err);
        }

        var type = mime.lookup(img);
        var encoded = getDataURI(type, src);
        complete(null, encoded, cacheable);
      });
    }

    // If we get this far we can assume the image is a local file.
    // Does the image actually exist?
    if(!fs.existsSync(img)) {
      return complete(new Error('File ' + img + ' does not exit'));
    }

    // Read the local file, and convert it, and cache it.
    grunt.log.writeln('Encoding file: ' + img);
    var src = fs.readFileSync(img);
    var type = mime.lookup(img);
    var encoded = getDataURI(type, src);
    complete(null, encoded, true);
  };

  // Ask optional callback what to do with the image
  // return values
  //  false: do not encode
  //  true: process images as ususal
  //  String: replace the image with the returned string
  if(opts.preEncodeCallback) {
    var rv = opts.preEncodeCallback(img);

    // do not encode
    if(rv === false) {
      return complete(new Error('Image encoding is declined by callback'));
    }

    // continue as usual
    if(rv === true) {
      return process();
    }

    // replace the image with the callback-provided value
    complete(null, rv, false); // false == non-cacheable
  } else {
    process();
  }
};
