/*
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2012 Eric Hynds
 * Licensed under the MIT license.
 */

// Internal libs
var grunt_encode = require( "./lib/encode" );

exports = function(grunt) {
  "use strict";

  // Grunt lib init
  var encode = grunt_encode.init(grunt);

  // Grunt utils
  var utils = grunt.utils || grunt.util;
  var file = grunt.file;
  var async = utils.async;


  grunt.registerMultiTask("imageEmbed", "Embed images as base64 data URIs inside your stylesheets", function() {
    var opts = this.data.options;
    var src = this.file.src;
    var dest = this.file.dest;
    var tasks, done;

    if(!src) {
      grunt.fatal("Missing src property.");
      return;
    }

    if(!dest) {
      grunt.fatal("Missing dest property");
      return;
    }

    done = this.async();

    // Process each src file
    tasks = file.expandFiles(src).map(function(srcFile) {
      return function(callback) {
        encode.stylesheet(srcFile, opts, callback);
      };
    });

    // Once all files have been processed write them out.
    async.parallel(tasks, function(err, output) {
      grunt.file.write(dest, output);
      grunt.log.writeln('File "' + dest + '" created.');
      done();
    });
  });

};
