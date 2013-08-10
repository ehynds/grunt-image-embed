/*
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2013 Eric Hynds
 * Licensed under the MIT license.
 */

// External libs
var path = require('path');

// Internal libs
var grunt_encode = require("./lib/encode");

module.exports = function (grunt) {
  "use strict";

  // Grunt lib init
  var encode = grunt_encode.init(grunt);

  // Grunt utils
  var async = grunt.util.async;

  grunt.registerMultiTask("imageEmbed", "Embed images as base64 data URIs inside your stylesheets", function () {
    var opts = this.options();
    var done = this.async();

    // Process each src file
    this.files.forEach(function (file) {
      var cwd = file.cwd;
      var dest = file.dest;
      var destIsFile = !!path.extname(dest);

      var src = file.src.filter(function(src) {
        if (cwd) {
          src = path.join(cwd, src);
        }

        if (grunt.file.isFile(src)) {
          return true;
        } else {
          grunt.log.warn('Source file "' + src + '" not found.');
          return false;
        }
      });

      if (src.length > 1 && destIsFile) {
        grunt.log.warn('Source file cannot be more than one when dest is a file.');
      }


      var tasks = file.src.map(function (srcFile) {
        return function (callback) {
          if (cwd) {
            srcFile = path.join(cwd, srcFile);
          }
          encode.stylesheet(srcFile, opts, callback);
        };
      });

      // Once all files have been processed write them out.
      async.parallel(tasks, function (err, output) {
        if (destIsFile) {
          grunt.file.write(dest, content);
          grunt.log.writeln('File "' + dest + '" created.');
        } else {
          output.forEach(function (content, index) {
            var outputPath = path.join(dest, src[index]);
            grunt.file.write(outputPath, content);
            grunt.log.writeln('File "' + outputPath + '" created.');
          });
        }

        done();
      });
    });
  });

};
