/**
 * Created by JHYOON on 2017-03-21.
 * t
 */
var queryParser = require('./queryParser.js');
var readline = require('readline');
var util = require('util');
var sql = require('./sql.js');

var checkDate;
var files = ['sample/test.csv'];
var alias = [];
var config = ['test.config'];
var delimiter = ",";

function QueryData(){
	var cols = [];
	var table = [];
	var condition = [];
	var values = [];
	var cmd = null;
}

function QueryCommand(sql){
	try{
		if(sql !== 'undefined' || sql == ""){
			var query = queryParser.query(sql);
			//console.log(query);
			var data = new QueryData();
			for(var q in query){
				switch(q){
					case 'INSERT':
					case 'DELETE':
					case 'UPDATE':
						data.cmd = q;
					break;
                    case 'SELECT':
						data.cmd = q;
                    	data.cols = _select(query[q]);
                    break;
					case 'FROM':
						data.table = _from(query[q]);
					break;
					case 'WHERE':
						data.condition = _where(query[q]);
					break;
					case 'SET':
						data.values = _set(query[q]);
					break
					default:
					break;
				}
			}
			return data;
		} else throw new errorHandler('Invalid Query');
	}catch(e){
		e.displayErrors();
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
	var cols = [];
	for(var i in col){
		cols.push(col[i].name);
	}
	return cols;
}

function _from(p){
    return p;
}

function _where(cond){
	if(typeof cond.terms !== 'undefined'){
		return cond;
	} else {
		// Single
		return { logic : 'and', terms : [cond] };
	}
}

function _set(exps){
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
    console.log("Error : " + this.errorMessage);
	return false;
}

function init(){
	// Execute
	var requestParam = QueryCommand("select seqno, * from test.csv AS t1 where t1.pick = 'RED'");
	var tables = sql.loadData(requestParam, files, delimiter);
	var now = new Date();
}

init();
