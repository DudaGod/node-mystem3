'use strict';

var Promise = require('bluebird');
var MyStem = require('../lib/MyStem');

var sentences = [
    'Морфологический анализатор для русского языка — это что-то заумное?',
    'Программа, которая приводит слово к начальной форме, определяет падеж, находит словоформы — непонятно, как и подступиться?',
    'Бабуленька идет на помощь!!!'
];

var mystem = new MyStem({
    flags: '-dig --format json --eng-gr --fixlist fixlist.txt'
});
mystem.start();


var word = str.replace(/[^а-яё\s-]+/gi, '').replace(/\s+/g, ' ');
console.log(word);
//var word = 'котик';
mystem.analyze(word)
.then(res => {
    mystem.stop();
    console.log(res.join(',').split(','));
});

/*Promise.all(sentences.map(item => mystem.analyze(item)))
.then(res => {
    mystem.stop();
    console.log(res.join(',').split(','));
});*/
