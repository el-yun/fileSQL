/*
 * SQL
 */
(function(exports) {
    "use strict";

	// Error Handler
	function errorHandler(error){
	    this.errorMessage = error;
	}

	function checkDuplicateAlias(files, fc){
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

	exports.loadData = function (queryData, files, fc){
		try{
			var fileAlias = checkDuplicateAlias(files, fc);
			var tables = queryData.table;
			for(var t in tables){
				var check = false;
				for(var f in fileAlias){
					if(tables[t].table == f) check = true;
				}
				if(!check) throw new errorHandler('Not Found File: ' + tables[t].table);
			}
			console.log(fileAlias);
			for(var i in fileAlias){
				fc.load(fileAlias[i], function(err, cache) {
				  console.log(cache['/' + i]);
				})
			}

			return {table : fileAlias};
		}catch(e){
			console.log(e.errorMessage);
			return null;
		}
	}

	exports.exec = function (queryData, files) {
		console.log(queryData);
		// Create a cache for a specific file
		fc.load('sample/test.csv', function(err, cache) {
		  console.log(cache)
		})
	}
}(typeof exports === "undefined" ? (this.sql = {}) : exports));
