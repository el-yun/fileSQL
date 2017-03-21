/**
 * Created by JHYOON on 2017-03-21.
 */
var queryParser = require('./queryParser.js');
var fs = require('fs');
var readline = require('readline');
var util = require('util');

var files = ['sample/test.csv'];
var config = ['test.config'];
var query = queryParser.sql2ast('select * from dual');
console.log(query);
console.log(query.SELECT);

function load(d, condition){
    var data = [];
    var lineReader = readline.createInterface({
        input: fs.createReadStream(d),
        end: fileLength - 1
    });
    lineReader.on('line', function (line) {
        ev.emit("line", line);
        console.log(ev);
    });
    lineReader.on('close', function() {
        console.log('Finished!');
    });
}

files.forEach(function (d, i) {
    var d = new load(d, null);
    console.log(d);
});