var HOST = null;
var PORT = 8080;

var GRID_SIZE = 10;

var positions = new Array();
var grid = new Array(GRID_SIZE);
for (i=0; i < grid.length; i++) {
	grid[i]=new Array(GRID_SIZE);
}

var mud = new function() {
	var callbacks = [];
	
	this.flush = function() {
		sys.puts('flushing');
		while(callbacks.length > 0) {
			callbacks.shift().call();
		}
	}
	
	this.addCallback = function(callback) {
		callbacks.push(callback);
	}
		
	setInterval(function() {		
		while(callbacks.length > 0) {
			callbacks.shift().call();
		}
	}, 3 * 1000);
}

function setPos(id, row, col) {
	grid[row][col] = id;
	positions[id] = {row : row, col : col};
}

function getPos(id) {
	return positions[id];
}

function movePos(id, direction) {
	var p = getPos(id);
	sys.puts('<' + id + '>: ' + p.row + ' ' + p.col);

	//wipe out old position
	grid[p.row][p.col] = null;
	
	switch(direction) {
		case 'down':
			if(p.row + 1 <= GRID_SIZE - 1) {setPos(id, p.row + 1, p.col);} 
			else { grid[p.row][p.col] = id;}
			break;
		case 'up':
			if(p.row - 1 >= 0) {setPos(id, p.row - 1, p.col);} 
			else { grid[p.row][p.col] = id;}
			break;
		case 'right':
			if(p.col + 1 <= GRID_SIZE - 1) {setPos(id, p.row, p.col + 1);} 
			else { grid[p.row][p.col] = id;}
			break;
		case 'left':
			if(p.col - 1 >= 0) {setPos(id, p.row, p.col - 1);} 
			else { grid[p.row][p.col] = id;}
			break;
	}
}

var fu = require("./fu"),
	sys = require("sys"),
	http = require("http"),
	url = require("url"),
	path = require("path"),
	qs = require("querystring");

fu.listen(PORT, HOST);

fu.get("/", fu.staticHandler("index.html"));

fu.get("/register", function(request, response) {
  	var id = qs.parse(url.parse(request.url).query).id;
	
	setPos(id, 0, 0);
	
	response.simpleJSON(200, { 
		grid : grid
	});
});

fu.get("/move", function(request, response) {
	var id = qs.parse(url.parse(request.url).query).id;
  	var direction = qs.parse(url.parse(request.url).query).direction;
		
	movePos(id, direction);
	
	response.simpleJSON(200, { 
		grid : grid
	});
	
	mud.flush();
});

fu.get("/recv", function(request, response) {
	
	mud.addCallback(function() {
		response.simpleJSON(200, { 
			grid : grid
		});
	});

});