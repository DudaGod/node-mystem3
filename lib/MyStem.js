'use strict';

var spawn = require('child_process').spawn;
var Promise = require('bluebird');
var byline = require('byline');
var join = require('path').join;

function MyStem(args) {
    args = args || {};
    this.path = args.path || join(__dirname, '..', 'vendor', process.platform, 'mystem');
    this.flags = args.flags || '-dig --format json --eng-gr --fixlist fixlist.txt';
    this.handlers = [];
}

MyStem.prototype = {
    start: function () {
        if (this.mystemProcess) {
            console.log('mystem process has alredy run');
            return;
        }
        this.mystemProcess = spawn(this.path, this.flags.split(' '));
        byline(this.mystemProcess.stdout).on('data', line => {
            var handler = this.getHandler();
            if (handler) {
                line = line.toString();
                line = /json/.test(this.flags) ? JSON.parse(line) : line;
                handler.resolve(this.getLemma(line));
            }
        });
        byline(this.mystemProcess.stderr).on('data', err => {
            var handler = this.getHandler();
            if (handler) {
                handler.reject(err);
            }
        });
        this.mystemProcess.on('error', err => {
            var handler = this.getHandler();
            if (handler) {
                handler.reject(err);
            }
        });
        process.on('exit', (err) => {
            console.log(err);
            this.stop();
        });
    },
    getHandler: function () {
        return this.handlers.shift();
    },
    stop: function () {
        if (this.mystemProcess) {
            this.mystemProcess.kill();
            this.mystemProcess = null;
        }
    },
    analyze: function (text) {
        return new Promise((resolve, reject) => {
            this.handlers.push({
                resolve: resolve,
                reject: reject
            });
            this.mystemProcess.stdin.write(text + '\n');
        });
    },
    getLemma: function (data) {
        return data.map(item => {
            return item.analysis.length ? item.analysis[0].lex : item.text;
        });
    }
};

module.exports = MyStem;
