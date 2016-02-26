#!/usr/bin/env node

'use strict';

var fs      = require('fs');
var path    = require('path');
var mkdirp  = require('mkdirp');
var request = require('request');
var unzip   = require('unzip');
var Promise = require('bluebird');

var TARBALL_URLS = {
    'linux': {
        'ia32': "http://download.cdn.yandex.net/mystem/mystem-3.0-linux3.5-32bit.tar.gz",
        'x64': "http://download.cdn.yandex.net/mystem/mystem-3.0-linux3.1-64bit.tar.gz"
    },
    'darwin': {
        'x64': "http://download.cdn.yandex.net/mystem/mystem-3.0-macosx10.8.tar.gz"
    },
    'win32': {
        'ia32': "http://download.cdn.yandex.net/mystem/mystem-3.0-win7-32bit.zip",
        'x64': "http://download.cdn.yandex.net/mystem/mystem-3.0-win7-64bit.zip"
    },
    'freebsd': {
        'x64': "http://download.cdn.yandex.net/mystem/mystem-3.0-freebsd9.0-64bit.tar.gz"
    }
};

var targetDir  = path.join(__dirname, '..', 'vendor', process.platform);
var tmpFile    = path.join(targetDir, 'mystem.tar.gz');
var url        = TARBALL_URLS[process.platform][process.arch];

new Promise((resolve, reject) => {
        mkdirp(targetDir, err => {
            err ? reject(err) : resolve();
        });
    })
    .then(() => downloadFile(url, tmpFile))
    .then(() => fs.createReadStream(tmpFile).pipe(unzip.Extract({path: targetDir})))
    .catch(err => {
        console.log(err);
    });

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        console.log('Downloading %s', url);
        var file = fs.createWriteStream(dest);
        request.get(url)
            .pipe(file)
            .on('error', err => {
                fs.unlink(dest);
                reject(err);
            })
            .on('finish', () => {
                file.close(resolve());
            });
    });
}
