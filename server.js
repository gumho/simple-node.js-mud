var HOST = null;
var PORT = 8080;

var GRID_SIZE = 10;

//holds each user's position in dictionary for fast retrieval
// key is user's id, values are coordinates in form {row : '0', col: '2'}
var positions = new Array();

//the grid
var grid = new Array(GRID_SIZE);
for (i=0; i < grid.length; i++) {
	grid[i]=new Array(GRID_SIZE);
}

var mud = new function() {
	var callbacks = [];
	
	this.flush = function() {
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
	}, 30 * 1000);
}

function destroyID(id) {
	var p = getPos(id);
	
	//delete id from grid and positions dictionary
	grid[p.row][p.col] = null;
	delete positions[id];
}

function genCoordPoint() {
	return Math.floor(Math.random() * GRID_SIZE);
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
	//sys.puts('<' + id + '>: moving ' + direction + ' from (' + p.row + ', ' + p.col + ')');

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
fu.get("/style.css", fu.staticHandler("style.css"));

fu.get("/register", function(request, response) {
  	var id = qs.parse(url.parse(request.url).query).id;
	
	setPos(id, genCoordPoint() , genCoordPoint());
	
	response.simpleJSON(200, { 
		grid : grid
	});
	
	sys.puts('<' + id + '>: has joined');
	

	mud.flush();	
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

fu.get("/part", function(request, response) {
	var id = qs.parse(url.parse(request.url).query).id;
	
	destroyID(id);
	
	sys.puts('<' + id + '>: has parted');
	
	mud.flush();
});