var image_embed = require("../tasks/grunt-image-embed");
var grunt = require("grunt");

var linefeed = grunt.utils.linefeed;
var encoded_gif = "data:image/gif;base64,R0lGODlhAQABAPcAAMzMzJaWlgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjEgNjQuMTQwOTQ5LCAyMDEwLzEyLzA3LTEwOjU3OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgTWFjaW50b3NoIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjNEQTlEQTcyRjEzQjExRTE5NEIzQjMwOTc5NTREMzQ2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjNEQTlEQTczRjEzQjExRTE5NEIzQjMwOTc5NTREMzQ2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6M0RBOURBNzBGMTNCMTFFMTk0QjNCMzA5Nzk1NEQzNDYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6M0RBOURBNzFGMTNCMTFFMTk0QjNCMzA5Nzk1NEQzNDYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAAIBAABBAQAOw==";

/*
  Assumptions: test_image_encoder tests pass.
*/

exports['test css encoding'] = {

  "trivial case -- can process a basic css file": function(test) {
    test.expect(1);
    var input = __dirname + "/css/test_trivial.css";
    grunt.helper("encode_stylesheet", input, function(err, str) {
      test.equal(str, "body { }" + linefeed);
      test.done();
    });
  },

  //
  // If an encoding takes place, then single quotes will be added,
  // whether or not they existed.  We could change this behavior based
  // on an option, or maybe retain things to match what the user did.
  //
  "can encode single url on a line -- no quotes": function(test) {
    test.expect(1);
    var input = __dirname + "/css/test_singleurl.css";
    grunt.helper("encode_stylesheet", input, function(err, str) {
      test.equal(str, "body { background-image: url(" + encoded_gif + "); }" + linefeed);
      test.done();
    });
  },

  "can encode single url on a line -- with quotes": function(test) {
    test.expect(1);
    var input = __dirname + "/css/test_singleurl_withquotes.css";
    grunt.helper("encode_stylesheet", input, function(err, str) {
      test.equal(str, "body { background-image: url(" + encoded_gif + "); }" + linefeed);
      test.done();
    });
  },

  "can encode more than one url on a line": function(test) {
    test.expect(1);
    var input = __dirname + "/css/test_multiurl_oneline.css";
    grunt.helper("encode_stylesheet", input, function(err, str) {
      test.equal(str, "body { background-image: url(" + encoded_gif + "); background-image: url(" + encoded_gif + "); }" + linefeed);
      test.done();
    });
  },

  "issue: can't do more than one url": function(test) {
    test.expect(1);
    //
    // the only thing different from "can encode more than one url on a line" is that there was
    // parent directory notation.
    //
    var input = __dirname + "/css/sub/test_multiurl_oneline.css";
    grunt.helper("encode_stylesheet", input, function(err, str) {
      test.equal(str, "body { background-image: url(" + encoded_gif + "); background-image: url(" + encoded_gif + "); }" + linefeed);
      test.done();
    });
  }

};
