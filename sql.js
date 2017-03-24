/*
 * SQL
 */
(function(exports) {
    "use strict";

	var fs = require('fs');
	// Error Handler
	function errorHandler(error){
	    this.errorMessage = error;
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
		}catch(e){
			console.log(e.errorMessage);
			return null;
		}
	}

	// Query Execute
	function exec (queryData, fileAlias) {
		// Laod Table
		var process;
		for(var i in fileAlias){
			__table(fileAlias[i], function(d){
				console.log(d)
			})
			// Table
			if(!process) process = __table(fileAlias[i]);
			else process.then(__table(fileAlias[i])); // Join Table
		}
		// SQL
		switch(queryData.cmd){
			case "select":
				process.then(__condition)
				.then(__cols)
				.then(__print);
			break;

		}
	}

	// Query Condition(Where)
	var __condition = function(where){
		return new Promise(function(__callback, reject){
			setTimeout(function(){
				//console.log(where);
			}, 1000);
		});
	}

	// Query Table(From)
	var __table = function(f){
		return new Promise(function(_callback, reject){
			setTimeout(function(){
				var stream = fs.createReadStream(f);
				var data;
				stream.on('readable', function () {
					// Readable Stream
					console.time(f + " Time");
					data += stream.read();
				});

				stream.on('end', function () {
					console.timeEnd(f + " Time");
					return _callback(data);
				});
			}, 1000);
		});
	}

	// Get Data
	exports.loadData = function (queryData, files){
		try{
			console.log(queryData);
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
			console.log(e.errorMessage);
			return null;
		}
	}
}(typeof exports === "undefined" ? (this.sql = {}) : exports));
