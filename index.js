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
			console.log(query);
			var col = [];
			var table = [];
			var condition = [];
			var values = [];
			for(var q in query){
				switch(q){
					case 'SELECT':
						//col = _select(query[q]);
					break;
					case 'INSERT':
						//values = _insert(query[q]);
					break;
					case 'DELETE':
						//condition = _delete(query[q]);
					break;
					case 'UPDATE':
						//values = _update(query[q]);
					break;
					case 'FROM':
						//_from(query[q]);
					break;
					case 'WHERE':
						_where(query[q]);
					break;
					case 'SET':
						//_set(query[q]);
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

function _select(p){
	files.forEach(function (d, i) {
		var d = new load(d, null, function(data){
				//console.log(data);
		});
	});
}

function _update(p){

}
function _delete(p){

}
function _insert(p){

}
function _from(p){

}
function _where(cond){
	console.log("WHERE:");

	if(typeof cond.terms !== 'undefined'){
		// Multiple
		console.log(cond.terms);
	} else {
		// Single
		console.log(cond.left);
		console.log(cond.right);
	}
}
function _set(exps){
	console.log("SET:");
	for(var e in exps){
		console.log(exps[e].expression);
	}
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
	QueryCommand("update table set name='aa', company='bb' where seq = '1'");
}

init();
