var path = require('path');
var license = require('./license');

var BASENAMES_PRECEDENCE = [
    /^LICENSE(?:\.(?:md|txt))?$/,
    /^LICENSE\-\w+(?:\.(?:md|txt))?$/, // e.g. LICENSE-MIT
    /^LICENCE(?:\.(?:md|txt))?$/,
    /^LICENCE\-\w+(?:\.(?:md|txt))?$/, // e.g. LICENCE-MIT
    /^COPYING(?:\.(?:md|txt))?$/,
    /^README(?:\.(?:md|txt))?$/,
];


// Find and list license files in the precedence order
module.exports = function(dirFiles, licenses) {
    var basenames = BASENAMES_PRECEDENCE.slice();
    var files = [];
    if (licenses) {
        // If we've got a license, try and look for a matching file first
        var lic = license.best(licenses);   // in case it's an array
        switch (license.priority(lic)) {
        case license.priority.KNOWN:
            basenames.unshift(RegExp('^LICEN[CS]E-' + lic + '(?:\.(?:md|txt))?$'));
            break;
        case license.priority.GUESS:
            basenames.unshift(RegExp('^LICEN[CS]E-' + lic.slice(0, lic.length-1) + '(?:\.(?:md|txt))?$'));
            break;
        case license.priority.CUSTOM:
            if (!lic.startsWith('Custom: http')) {
                // it's a file
                files.push(lic.slice('Custom: '.length));
            }
            break;
        }
    }
    BASENAMES_PRECEDENCE.forEach(function(basenamePattern) {
        var found = false;
        dirFiles.forEach(function(filename) {
            if (!found) {
                var basename = path.basename(filename, path.extname(filename)).toUpperCase();
                if (basenamePattern.test(basename)) {
                    found = true;
                    if (files.indexOf(filename) < 0) {
                        files.push(filename);
                    }
                }
            }
        });
    });
    return files;
};
