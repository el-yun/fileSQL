/**
 * Created by JHYOON on 2017-03-21.
 * t
 */
var queryParser = require('./queryParser.js');
var fs = require('fs');
var readline = require('readline');
var util = require('util');
var chokidar = require('chokidar');

var files = ['sample/test.csv'];
var alias = [];
var config = ['test.config'];

var watcher = chokidar.watch(files, {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

function QueryCommand(sql){
	try{
		if(sql !== 'undefined' || sql == ""){
			var query = queryParser.query(sql);
			//console.log(query);
			var cols = [];
			var table = [];
			var condition = [];
			var values = [];
			var cmd = null;
			for(var q in query){
				switch(q){
					case 'INSERT':
					case 'DELETE':
					case 'UPDATE':
						cmd = q;
						console.log(q);
					break;
                    case 'SELECT':
                    	cols = _select(query[q]);
                    	console.log(cols);
                    break;
					case 'FROM':
						table = _from(query[q]);
                        console.log(table);
					break;
					case 'WHERE':
						condition = _where(query[q]);
                        console.log(condition);
					break;
					case 'SET':
						values = _set(query[q]);
						console.log(values);
					break
					default:
					break;
				}
			}
		} else throw new errorHandler('Invalid Query');
	}catch(e){
		e.displayErrors();
	}
}

function checkDuplicateAlias(){
	try{
		alias = [];
		files.forEach(function (d) {
			var name = d.toString().split("/");
			if(alias.indexOf(name[name.length-1]) < 0) alias.push(name[name.length-1]);
			else throw new errorHandler('Deplicate File Alias : ' + d);
		});
		return true;
	}catch(e){
		return e.displayErrors();
	}
}

function load(d, condition, _callback){
	try{
	    var data = [];
	    var lineReader = readline.createInterface({
	        input: fs.createReadStream(d)
	    });
	    lineReader.on('line', function (line) {
	        data.push(line);
	    });
	    lineReader.on('close', function() {
			return _callback(data);
	    });
	}catch(e){
		e.displayErrors();
	}
}

/*
 files.forEach(function (d, i) {
 var d = new load(d, null, function(data){
 //console.log(data);
 });
 });
 */

function _select(col){
    console.log("SELECT:");
	var cols = [];
	for(var i in col){
		cols.push(col[i].name);
	}
	return cols;
}

function _from(p){
    console.log("FROM:");
    return p;

}
function _where(cond){
    console.log("WHERE:");
	if(typeof cond.terms !== 'undefined'){
		// Multiple
		return cond.terms;
	} else {
		// Single
		return [cond];
	}
}
function _set(exps){
	console.log("SET:");
	var values = [];
	for(var i in exps){
        var e = exps[i].expression.split('=');
        values[e[0]] = e[1].replace(/'/gi, "");
	}
	return values;
}
// Error Handler
function errorHandler(error){
    this.errorMessage = error;
}

errorHandler.prototype.displayErrors = function(){
    console.log(this.errorMessage);
	return false;
}

function init(){
	// Execute
	checkDuplicateAlias();
	QueryCommand("update table set name='aa', company='bb' where seq = '1' or seq = '2'");
	console.log("====================================");
	QueryCommand("select seqno, * from table AS t1, table2 AS t2 where seq = '1'");
}

init();
