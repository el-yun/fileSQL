/*
 * SQL
 */
(function(exports) {
    "use strict";

	var fs = require('fs')
		,util = require('util')
		,stream = require('stream')
		,es = require('event-stream');

	var separator;
    var cols = ['seq', 'first', 'last', 'age', 'street', 'city', 'state', 'zip', 'dollar', 'pick'];
    const pattern = /[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9)]/gi;

    // Error Handler
	function errorHandler(error){
	    this.errorMessage = error;
	}

	function getIndex(arr, value){
		for(var index in arr){
			if(arr[index] == value) return index;
		}
	}

	// Table Grouping
	function checkDuplicateAlias(files){
		try{
			var alias = [];
			files.forEach(function (d) {
				var name = d.toString().split("/");
				var filename = name[name.length-1];
				if(typeof alias[filename] === 'undefined') alias[filename] = d;
				else throw new errorHandler('Deplicate File Alias : ' + d);
			});
			return alias;
		} catch(e) {
			console.log("error :" + e.errorMessage);
			return null;
		}
	}

	// Query Execute
	function exec (queryData, fileAlias) {
		// Laod Table
		var process;
        // SQL
        switch(queryData.cmd){
            case "SELECT":
                // Table
                process = __condition(queryData, fileAlias);
                if(!process) process = __table(fileAlias, null);
                else process.then(function(condition){ __table(fileAlias, condition) }); // where
                process.then(function(records){ __cols(queryData, records);})
				.then(__print(queryData));
                break;
        }
	}

	function dataExtract (d, f){
		var logic = cond.logic;
		var pop = [];
		if(d.condition){
			d.condition.terms.forEach(function(c){
				// 단일 조건
				if(typeof c.left != "undefined"){
					var left = c.left.split(".");
					d.table.forEach(function(t){
						if(left.length > 1 && left[0] == t.as) pop.push(__table(f, {table : t.table, alias : t.as, keyIndex: getIndex(cols, left[1]), key: left[1], value : c.right.replace(pattern, "")}));
						else if(left.length == 1 && c.left == t.table) pop.push(__table(f, {table : t.table, alias : null, keyIndex: getIndex(cols, c.left), key: c.left, value : c.right.replace(pattern, "")}));
					});
				} else {
				// 복수 조건
					console.log(c);
				}
			});
		} else pop.push(__table(f, {table : t.table, alias : t.as, keyIndex: 0, key: null, value : null}));
	}

	// Query Print(Select)
    var __cols = function(d, reocrd){
        return new Promise(function(__callback, reject){
            setTimeout(function(){
                //console.log(reocrd);
            }, 1000);
        });
    }

	// Query Condition(Col)
    var __print = function(d){
        return new Promise(function(__callback, reject){
            setTimeout(function(){
                //console.log(d);
            }, 1000);
        });
    }

	// Query Condition(Where)
	var __condition = function(d, fileAlias){
		return new Promise(function(__callback, reject){
			setTimeout(function(){
                try{
					console.log(d);
					var where;
					where = dataExtract(d, fileAlias);
					if(where.length < 1)  reject('Invalid Condition');
					return __callback(where);
                }catch(e){
                    console.log("Invalid Query");
                    return null;
                }
			}, 1000);
		});
	}

	// Query Table(From)
	var __table = function(f, condition){
		return new Promise(function(_callback, reject){
			setTimeout(function(){
                var data = [];
                for(var i in f){
                    var stream = fs.createReadStream(f[i]);
                    stream.pipe(es.split())
                        .pipe(es.mapSync(function(line){
                            stream.pause();
                            var record = line.split(separator);
                            condition.forEach(function(cond){
                                if(record[cond.keyIndex] == cond.value) data.push(record);
                            });
                            stream.resume();
                        }))
                        .on('error', function(){
                            return reject('ReadStream Error');
                        })
                        .on('end', function(){
                            return _callback(data);
                        });
				}
			}, 1000);
		});
	}

	// Get Data
	exports.loadData = function (queryData, files, delimiter){
		try{
            separator = delimiter;
			var fileAlias = checkDuplicateAlias(files);
			var tables = queryData.table;
			for(var t in tables){
				var check = false;
				for(var f in fileAlias){
					if(tables[t].table == f) check = true;
				}
				if(!check) throw new errorHandler('Not Found File: ' + tables[t].table);
			}
			return exec(queryData, fileAlias);
		}catch(e){
			console.log("ERROR : " + e.errorMessage);
			return null;
		}
	}
}(typeof exports === "undefined" ? (this.sql = {}) : exports));
