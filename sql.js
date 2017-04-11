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
		var left = value.split(".");
		var v = (typeof left[1] !== 'undefined') ? left[1] : value;
		for(var index in arr){
			if(arr[index] == v) return index;
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
				console.log(queryData);
                process = __condition(queryData, fileAlias);
                if(!process) process = __table(fileAlias, null);
                else process.then(function(condition){ return __table(fileAlias, condition) }) // where
				.then(function(res){ return __operator(res); }) // Joining
				.then(function(res){ return __print(res); }); // result
                break;
        }
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

	var __operator = function(group){
		var pop = [];
		group.forEach(function(d, i){
			if(pop.length < 1){
				pop = d.data;
			}
			else {
				if(d.logic == 'and'){
					// and
					var res = [];
					d.data.forEach(function(row){
						pop.forEach(function(p){
							if(JSON.stringify(row) === JSON.stringify(p)){
								res.push(row);
							}
						});
					});
					pop = res;
				} else {
					// Or
					var res = [];
					d.data.forEach(function(row){
						pop.forEach(function(p, i){
							if(JSON.stringify(row) === JSON.stringify(p)) pop.splice(i, 1);
						});
					});
				}
			}
		});
		return pop;
	}

	function ConditionParser(cond, logic){
		var stack = [];
		cond.terms.forEach(function(c){
			if(typeof c.logic !== 'undefined'){
				if(c.terms.length > 1){
					c.terms.forEach(function(t){
						stack.push({ logic : c.logic, operator: t.operator, column: t.left, idx: getIndex(cols, t.left), value: t.right, data: [] });
					});
				} else stack.push(ConditionParser(c, logic));
			}
			else {
				stack.push({ logic : logic, operator: c.operator, column: c.left, idx: getIndex(cols, c.left), value: c.right, data: [] });
			}
		})
		return stack;
	}

	// Query Condition(Where)
	var __condition = function(d, fileAlias){
		return new Promise(function(__callback, reject){
			setTimeout(function(){
                try{
					var stack = ConditionParser(d.condition, d.condition.logic);
					return __callback(stack);
                }catch(e){
                    console.log("Invalid Query : " + e);
                    return null;
                }
			}, 1000);
		});
	}

	// Query Table(From)
	var __table = function(f, condition){
		return new Promise(function(_callback, reject){
			setTimeout(function(){
                for(var i in f){
                    var stream = fs.createReadStream(f[i]);
                    stream.pipe(es.split())
                        .pipe(es.mapSync(function(line){
                            stream.pause();
                            var record = line.split(separator);
                            condition.forEach(function(c, i){
								var value = c.value.replace(pattern, "")
								if(record[c.idx] == value){
									condition[i].data.push(record);
								}
                            });
                            stream.resume();
                        }))
                        .on('error', function(){
                            return reject('ReadStream Error');
                        })
                        .on('end', function(){
                            return _callback(condition);
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
