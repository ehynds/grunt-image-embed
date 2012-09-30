/*
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2012 Eric Hynds
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    "use strict";

    // Node modules
    var fs = require("fs");
    var path = require("path");
    var mime = require("mime");
    var url = require("url");
    var http = require("http");

    // Grunt utils
    var utils = grunt.utils;
    var file = grunt.file;
    var _ = utils._;
    var async = utils.async;

    // Cache regex's
    var rImages = /([\s\S]*?)(url\(([^)]+)\))(?!\s*\/\*\s*ImageEmbed:skip\s*\*\/)|([\s\S]+)/img;
    var rExternal = /^http/;
    var rData = /^data:/;
    var rQuotes = /['"]/g;

    // Cache of already converted images
    var cache = {};

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
                grunt.helper("encode_stylesheet", srcFile, opts, callback);
            };
        });

        // Once all files have been processed write them out.
        async.parallel(tasks, function(err, output) {
            grunt.file.write(dest, output);
            grunt.log.writeln('File "' + dest + '" created.');
            done();
        });
    });

    /**
     * Takes a CSS file as input, goes through it line by line, and base64
     * encodes any images it finds.
     *
     * @param srcFile Relative or absolute path to a source stylesheet file.
     * @param opts Options object
     * @param done Function to call once encoding has finished.
     */
    grunt.registerHelper("encode_stylesheet", function(srcFile, opts, done) {

        // Shift args if no options object is specified
        if(utils.kindOf(opts) === "function") {
            done = opts;
            opts = {};
        }

        var deleteAfterEncoding = opts.deleteAfterEncoding;
        var src = file.read(srcFile);
        var result, match, img, line, tasks;

        var group;
        var exec = function(str) {
            group = rImages.exec(str);
            return group !== null;
        };

        // store css in result
        result = "";

        var on_encode = function(err, resp) {
            if (err === null) {
                result += "url('" + resp + "')";
                if (deleteAfterEncoding) {
                    grunt.log.writeln("deleting " + loc);
                    fs.unlinkSync(loc);
                }
            }
            else {
                result += group[2];
            }
        };

        while (exec(src)) {

            // if there is another url to be processed, then:
            //    group[1] will hold everything up to the url declaration
            //    group[2] will hold the complete url declaration (useful if no encoding will take place)
            //    group[3] will hold the contents of the url declaration
            //    group[4] will be undefined
            // if there is no other url to be processed, then group[1-3] will be undefined
            //    group[4] will hold the entire string

            if (group[4] === undefined)
            {
                result += group[1];
                img = group[3].trim().replace(rQuotes, "");

                // see if this img was already processed before...
                if(cache[img]) {
                    grunt.log.error("The image " + img + " has already been encoded elsewhere in your stylesheet. I'm going to do it again, but it's going to make your stylesheet a lot larger than it needs to be.");
                    result = result += cache[img];
                }
                else {
                    // process it and put it into the cache
                    var loc = img;

                    // Resolve the image path relative to the CSS file
                    if(!rData.test(img) && !rExternal.test(img)) {
                        loc = img.charAt(0) === "/" ?
                            (opts.baseDir || "") + loc :
                            path.join(path.dirname(srcFile), img);

                        // If that didn't work, try finding the image relative to
                        // the current file instead.
                        if(!fs.existsSync(loc)) {
                            loc = path.resolve(__dirname + img);
                        }

                        grunt.helper("encode_image", loc, opts, on_encode);

                    }
                }
            }
            else {
                result += group[4];
            }
        }
        done(null, result);
    });

    /**
     * Takes an image (absolute path or remote) and base64 encodes it.
     *
     * @param img Absolute, resolved path to an image
     * @param opts Options object
     * @return A data URI string (mime type, base64 img, etc.) that a browser can interpret as an image
     */
    grunt.registerHelper("encode_image", function(img, opts, done) {
        // Shift args
        if(utils.kindOf(opts) === "function") {
            done = opts;
            opts = {};
        }

        // Set default, helper-specific options
        opts = _.extend({
            maxImageSize: 32768
        }, opts);

        var complete = function(err, encoded, cacheable) {
            // Too long?
            if(encoded && opts.maxImageSize && encoded.length > opts.maxImageSize) {
                err = img + " -- skipped (gt " + opts.maxImageSize + " bytes)";
            }

            // Return the original source if an error occurred
            if(err) {
                grunt.log.error(err);
                done(err, img);

                // Otherwise cache the processed image and return it
            } else {
                if(cacheable !== false) {
                    cache[img] = encoded;
                }

                done(null, encoded);
            }
        };

        // Already base64 encoded?
        if(rData.test(img)) {
            complete(null, img, false);

            // External URL?
        } else if(rExternal.test(img)) {
            fetchImage(img, complete);

            // Local file?
        } else {
            // Does the image actually exist?
            if(!fs.existsSync(img)) {
                grunt.fail.warn(img + " does not exist");
                complete(null, img, false);
            }

            grunt.log.writeln("Encoding file: " + img);

            // Read the file in and convert it.
            var src = fs.readFileSync(img);
            var type = mime.lookup(img);
            var encoded = encode(type, src);
            complete(null, encoded);
        }
    });

    /**
     * Fetches a remote image and encodes it.
     *
     * @param img Remote path, like http://url.to/an/image.png
     * @param done Function to call once done
     */
    function fetchImage(img, done) {
        var opts = url.parse(img);

        var req = http.request(opts, function(res) {
            res.setEncoding("binary");

            var mime = res.headers["content-type"];
            var data = "";

            // Bail if we get anything other than 200
            if(res.statusCode !== 200) {
                done("Unable to convert " + img + " because the URL did not return an image. Staus code " + res.statusCode + " received");
                return;
            }

            res.on("data", function(chunk) {
                data += chunk;
            });

            res.on("end", function() {
                data = new Buffer(data, "binary");
                done(null, encode(mime, data));
            });
        });

        req.on("error", function(err) {
            done("Unable to convert " + img + ". Error: " + err.code);
        });

        req.end();
    }

    /**
     * Base64 encodes an image and builds the data URI string
     *
     * @param mimeType Mime type of the image
     * @param img The source image
     * @return Data URI string
     */
    function encode(mimeType, img) {
        var ret = "data:";
        ret += mimeType;
        ret += ";base64,";
        ret += img.toString("base64");
        return ret;
    }


};
