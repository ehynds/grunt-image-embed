/*
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2014 Eric Hynds
 * Licensed under the MIT license.
 */
'use strict';

var request = require('request');
var stream = require('stream');
var buffers = require('buffers');

/**
  * Fetch a remote image.
  * @param {string} url - Remote path, like http://url.to/an/image.png
  * @param {function} done - Function to call once done with signature (err, Buffer, cacheable?)
  */
module.exports.image = function(url, done) {
  var buffList = buffers();
  var imageStream = new stream.Stream();
  var resultBuffer;

  imageStream.writable = true;
  imageStream.write = function(data) {
    buffList.push(new Buffer(data));
  };

  imageStream.end = function() {
    resultBuffer = buffList.toBuffer();
  };

  request(url, function(err, response) {
    if(err) {
      return done(new Error('Unable to get ' + url + '. Error: ' + err.message));
    }

    // Bail if we get anything other than 200 status code
    if(response.statusCode !== 200) {
      return done(new Error('Unable to get ' + url + ' because the URL did not return an image. Status code ' + response.statusCode + ' received'));
    }

    done(null, resultBuffer, true);
  }).pipe(imageStream);
};
