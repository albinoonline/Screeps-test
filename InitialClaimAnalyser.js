
//functions 
function testAdjacentTiles(x,y, value){
	//new RoomVisual(Memory.ICA.room).text(".", x, y, {color: 'green'});
	//this contains the surrounding tiles
	let adjacent = [];
	//this stops checking tiles near the border.
	if (x < 49 && x > 0 && y < 49 && y > 0){
		//here we actually fill the array.
		adjacent.push(
		{x:x-1,y:y-1},
		{x:x,y:y-1},
		{x:x+1,y:y-1},
		{x:x-1,y:y},
		{x:x+1,y:y},
		{x:x-1,y:y+1},
		{x:x,y:y+1},
		{x:x+1,y:y+1});
	}
	//this gives us an empty array to send back
	let adjacent2 = [];
	for (i in adjacent){
		//this checks the roommap
		if (Memory.ICA.roomMap[adjacent[i].x][adjacent[i].y] == false) {
			//add value to object
			adjacent[i].value=value;
			//push object onto the returning array
			adjacent2.push(adjacent[i]);
			//save to memory
			Memory.ICA.roomDistanceMap[Memory.ICA.goal].push(adjacent[i]);
			Memory.ICA.roomMap[adjacent[i].x][adjacent[i].y] = true;
		}
	}
	//send back the tiles that are new
	return adjacent2;
}

function  plotBase(x,y){
	x=parseInt(x);
	y=parseInt(y);
	//this contains the surrounding tiles
	let area = [];
	//this stops checking tiles near the border.
	if (x < 49 && x > 0 && y < 49 && y > 0){
		//here we actually fill the array.
		area.push(
					   {x:x-1,y:y-2},{x:x,y:y-2},{x:x+1,y:y-2},// first row
		{x:x-2,y:y-1},{x:x-1,y:y-1},{x:x,y:y-1},{x:x+1,y:y-1},{x:x+2,y:y-1},// second row
		{x:x-2,y:y},  {x:x-1,y:y},  {x:x,y:y},  {x:x+1,y:y},  {x:x+2,y:y},// third row
		{x:x-2,y:y+1},{x:x-1,y:y+1},{x:x,y:y+1},{x:x+1,y:y+1},{x:x+2,y:y+1},// fourth row
					   {x:x-1,y:y+2},{x:x,y:y+2},{x:x+1,y:y+2}// fifth row
		);
	}
	//this gives us an empty array to send back
	let place = true;
	for (i in area){
		//this checks the roommap
		if (Memory.ICA.roomMap[area[i].x][area[i].y] == null) {
			place =false;
			new RoomVisual(Memory.ICA.room).rect(area[i].x-0.5, area[i].y-0.5, 1, 1, {fill:'red'});
		} else {
			new RoomVisual(Memory.ICA.room).rect(area[i].x-0.5, area[i].y-0.5, 1, 1, {fill:'green'});
		}
	}
	if(place){
		//make sure goals aren't too close
		Memory.ICA.goals
		let goals = [];
		for(i in Memory.ICA.goals){
			goals[i]=Game.getObjectById(Memory.ICA.goals[i]);
		}
		if (Game.rooms[Memory.ICA.room].getPositionAt(x,y).findInRange(goals,3).length !=0){
			place=false;
			for(i in goals){
				new RoomVisual(goals[i].roomName).rect(goals[i].x-0.5, goals[i].y-0.5, 1, 1, {fill:'red'});
			}
		}
	}
	return place;
}

module.exports = {
	run:function(room){
		//force rebuilding?
		if (false){
			Memory.ICA.room = "dave";
		}
		
		
		
		//init values
		//check to se if ICA exists in memory
		if (typeof Memory.ICA === "undefined"){
			Memory.ICA = {
				// by setting rom the roomcheck will fill the rest out
				room:"noroom"
			}
		}
		//check if ICA is in the room it thinks its in, if not clear ica and populate new room data
		if (Memory.ICA.room !== room.name){
			console.log("[ICA]Rebuilging ICA in Memory");
			delete Memory.ICA;
			//get roomMap
			let terrain = room.getTerrain();
			let roomMap = [];
			for(let x = 0; x < 50; x++){
				roomMap[x] = [];
				for(let y = 0; y < 50; y++){
					if (terrain.get(x,y) !=1){
						roomMap[x][y] = false;
					} else {
						roomMap[x][y] = null;
					}
				}
			}
			//find goals
			let goals = room.find(FIND_SOURCES);//find sources
			//ad controller, if presentadd as goal
			if (typeof room.controller !== "undefined"){
				goals.push(room.controller);//find controller
			}
			//freate a 2d array for roomDistanceMap, and convert goals to store ids instead of objects.
			let roomDistanceMap = [];
			for(i in goals){
				roomDistanceMap[i] = [{
					x:goals[i].pos.x,
					y:goals[i].pos.y,
					value:0
				}];
				goals[i]=goals[i].id;
			}
			//set ICA
			Memory.ICA = {
				room:room.name,//name of the working room
				go:false,//this is to be semi namually changed to aprove the biuld area
				goals:goals,//array of points to plot roads to
				goal: 0,//which goal we are currently working on, currently used for maping only
				mode: "map", //which mode we are in
				roomMap: roomMap, //a terrain map of the room
				roomDistanceMap:roomDistanceMap, //where mapped data is stored
				fullMap:Array(50).fill().map(a=>[])
			}
		}
		//end init values
		switch(Memory.ICA.mode) {
		//scanning code
		case "map":
			console.log("[ICA]Calculating distances");
			/*
			save a "next" array, results of testAdjacentTiles are concat() together, and will be placed in the queue
			*/
			let next=[Memory.ICA.roomDistanceMap[Memory.ICA.goal][0]];//new next array
			//this quese system looks at the first value in the array commutates the surrounding areas and removes the value from the array. the surrounding values are placed at the end of the array.
			while (next.length !=0){
				let result = testAdjacentTiles(next[0].x,next[0].y,next[0].value+1);
				next = next.concat(result);
				next.shift();
			}
			//reset the roommap
			for(let i in Memory.ICA.roomMap){
				for(let j in Memory.ICA.roomMap[i]){
					if (Memory.ICA.roomMap[i][j] ==true){
						Memory.ICA.roomMap[i][j] = false;
					}
				}
			}
			//display
			for(let i in Memory.ICA.roomDistanceMap[Memory.ICA.goal]){
				let tile = Memory.ICA.roomDistanceMap[Memory.ICA.goal][i];
				new RoomVisual().text(tile.value, tile.x, tile.y+.25, {color:'green'});
			}
			Memory.ICA.goal++;
			if (Memory.ICA.goal == Memory.ICA.goals.length){
				Memory.ICA.mode = "agragate";
				Memory.ICA.goal = 0;
			}
			break;
			//end scanning code
		case "agragate":
			console.log("[ICA]Adding values");
			//new idea mixed nuke, pop off parts of the array making a value heat map
			let holder = Memory.ICA.fullMap;
			while (Memory.ICA.roomDistanceMap[Memory.ICA.goal].length !=0){
				let lost = Memory.ICA.roomDistanceMap[Memory.ICA.goal].shift();
				if (typeof holder[lost.x][lost.y] =="undefined"){
					holder[lost.x][lost.y] = lost.value;
				} else {
					holder[lost.x][lost.y] += lost.value;
				}
			}
			//save progress
			Memory.ICA.fullMap = holder;
			Memory.ICA.goal++
			
			//se if we're done
			if (Memory.ICA.goal == Memory.ICA.goals.length){
				Memory.ICA.mode = "sort";
				Memory.ICA.goal = 0;
			}
			break;
		case "sort":
			console.log("[ICA]Sorting values");
			//get map
			let map = Memory.ICA.fullMap;
			let sortMap=[];
			//reformat map
			for(let x in map){
				for(let y in map[x]){
					if (map[x][y] !== null){
						if (map[x][y] !==0){
							sortMap.push({x:x,y:y,value:map[x][y]});
							//optional display
							new RoomVisual(room.name).text(map[x][y], (x-0), (y-(-0.175)), {color:'green', font:.5});
						}
					}
				}
			}
			//sort values by... er, value...
			Memory.ICA.fullMap = sortMap.sort(function(a, b) {
				return a.value -b.value;
			});
			Memory.ICA.mode = "location";
			Memory.ICA.goal=0;
			break;
		case "location":
			console.log("[ICA]Finding hub location");
			//graphic
			for(let i in Memory.ICA.fullMap){
				let tile = Memory.ICA.fullMap[i];
				new RoomVisual(room.name).text(tile.value, (tile.x-0), (tile.y-(-0.175)), {color:'green', font:.5});
			}
			if (plotBase(Memory.ICA.fullMap[Memory.ICA.goal].x,Memory.ICA.fullMap[Memory.ICA.goal].y) ==true){
				Memory.ICA.mode = "roadPlot";
				Memory.ICA.goal=0;
			} else {
				Memory.ICA.goal++;
			}
			break;
		case "roadPlot":
			console.log("[ICA]Plotting paths");
			break;
		case "other":
			console.log("[ICA]Unknown");
			break;
		}
		
		
		/*
		TODO
		convert the find good place code to read the roomMap, aswell as design the centerpiece construct.
		place centerconstruct, and use the pathing tools to connect eacg goal to the closest road conection
		place sites
		*/
		
		
			
			
		
		/*	
		//init values
		if (typeof Memory.ICA === "undefined"){
			Memory.ICA = {
				room:"noroom"
			}
		}
		if (Memory.ICA.room !== room.name){
			Memory.ICA = {
				go:false,
				mode: "map",
				search: [],
				count: 5,
				room:room.name,
				pointZero:{x:1,y:1}
			}
		}
		//get sources and the controller as goals
		//in future add exit waypoints to goals
		var goals = room.find(FIND_SOURCES);
		goals.push(room.controller);
		var pointZero = new RoomPosition(Memory.ICA.pointZero.x, Memory.ICA.pointZero.y, Memory.ICA.room);
		
		switch(Memory.ICA.mode) {
		case "map":// generate heat map of total distance cost
			
			//make memory acces esier
			let search = Memory.ICA.search;
			let count = Memory.ICA.count;
			//save the area we are scanning
			let area = room.lookForAtArea(LOOK_TERRAIN,count,5,count,44,true);
			//look through serch area
			for(let j = 0; j < area.length; j++){
				let adjacent = area[j];
				//set the position to test
				let testPos = new RoomPosition(adjacent.x, adjacent.y, room.name);
				//run distance tests
				if (adjacent.terrain != "wall") {
					//set pathcount
					let totalLength=0;
					//make measure pathcount to goals
					let record = [];
					for (let goalid in goals){
						let goal = goals[goalid];
						//path length costs
						let path = room.findPath(testPos, goal.pos, {swampCost:1,plainCost:1,ignoreCreeps:true,ignoreDestructibleStructures:true});
						totalLength +=path.length;
						record.push(path);
					}
					//log final length
					search.push({
						x:adjacent.x,
						y:count,
						value:totalLength
					});
				}
			}
			//update memory and move flag
			Memory.ICA.search = search;
			if (Memory.ICA.count++ == 44){
				Memory.ICA.mode = "sort";
			}
			console.log("[ICA]Scanning: "+(count-5)+"/40.");
			
			//optional display
			for(let tileNum in Memory.ICA.search){
				let tile = Memory.ICA.search[tileNum];
				new RoomVisual().text(tile.value, tile.x, tile.y-.25);
			}
			break;
		case "sort":
			console.log("[ICA]Sorting through data.");
			Memory.ICA.search.sort(function(a, b) {
				return a.value -b.value;
			});
			Memory.ICA.count = 0;
			Memory.ICA.mode = "test";
			break;
		case "test"://test scanned locations to find best suited spot
			console.log("[ICA]Finding valid point zero.");
			
			//optional display
			
			for(let tileNum in Memory.ICA.search){
				if (tileNum < Memory.ICA.count && tileNum > Memory.ICA.count-50) {
					let tile = Memory.ICA.search[tileNum];
					new RoomVisual().text(tile.value, tile.x, tile.y+0.25, {color:"red"});
				} else if (tileNum >= Memory.ICA.count && tileNum < Memory.ICA.count+50) {
					let tile = Memory.ICA.search[tileNum];
					new RoomVisual().text(tile.value, tile.x, tile.y+0.25);
				}
			}
			
			//set test position, place flag for visual indicator
			let testPos = new RoomPosition(Memory.ICA.search[Memory.ICA.count].x, Memory.ICA.search[Memory.ICA.count].y, room.name);
			Game.flags.ICA.setPosition(testPos);
			
			//desired clear pace
			const range = 2
			
			//test for clear space
			let space = lookForNear(testPos,LOOK_TERRAIN, range);
			if (testPos.findInRange(goals, range*2).length == 0 && _.filter(space, function(o) { return o.terrain == "wall"; }).length == 0){
				//^^big if statement
				Memory.ICA.pointZero = {x:testPos.x,y:testPos.y};
				Memory.ICA.mode = "road_plot";
			} else {
				Memory.ICA.count++
			}
			break;
		case "road_plot":			
			
			delete Memory.ICA.search;
			//iterate through goals
			let paths = [];
			for (let goalid in goals){
				let goal = goals[goalid];
				//plot path
				let path = room.findPath(pointZero, goal.pos, {swampCost:1,plainCost:1,ignoreCreeps:true,ignoreDestructibleStructures:true});
				//lay roads
				for(let i = 0; i < path.length; i++){
					let tile = path[i];
					room.visual.line(tile.x,tile.y, tile.x-tile.dx, tile.y-tile.dy,{color: 'red'});
				}
				paths.push(path);
			}
			Memory.ICA.pointZero.paths=paths;
			console.log("[ICA]Plotting roads.");
			Memory.ICA.mode = "base_pre_plot";
			break;
		case "base_pre_plot":
			console.log("[ICA]Sorting through additional data.");
			let zone = lookForNear(pointZero, LOOK_TERRAIN, 3);
			for(let id in zone){
				let tile = zone[id];
				zone[id].distance = pointZero.getRangeTo(tile.x,tile.y);
			}
			zone.sort(function(a, b) {
				return a.distance -b.distance;
			});
			Memory.ICA.pointZero.zone = zone;
			Memory.ICA.count = 0;
			Memory.ICA.mode = "base_plot";
			break;
		case "base_plot":
			console.log("[ICA]Finding structure locations.");
			
			//record path locations
			let occupied = [new RoomPosition(Memory.ICA.pointZero.x, Memory.ICA.pointZero.y, room.name)];
			
			
			//find all road placement positions
			for (let pathid in Memory.ICA.pointZero.paths){
				let path = Memory.ICA.pointZero.paths[pathid];
				for(let i = 0; i < path.length-1; i++){
					let tile = path[i];
					let pos = new RoomPosition(tile.x, tile.y, room.name);
					occupied.push(pos);
				}
			}
			
			structure check code
			
			//set serch zone and update flag
			let test = new RoomPosition(Memory.ICA.pointZero.zone[Memory.ICA.count].x,Memory.ICA.pointZero.zone[Memory.ICA.count].y, room.name);
			//Game.flags.ICA.setPosition(test);
			
			
			
			//actial condition tesding
			if (test.findInRange(occupied, 0).length==0) {
				//optional display
				let binPos = new RoomPosition(Memory.ICA.pointZero.zone[Memory.ICA.count].x, Memory.ICA.pointZero.zone[Memory.ICA.count].y, room.name)
				new RoomVisual().text('U', binPos.x, binPos.y+0.25, {color:"yellow"});
				for(let i = 0; i < occupied.length; i++){
					new RoomVisual().text('.', occupied[i]);
				}
				//add placed zone to occupied
				occupied.push(test);
				Memory.ICA.roads=occupied;
				//look for valid landing zones
				let posSpawnPos = lookForNear(test, LOOK_TERRAIN, 1);
				for (let i = 0; i < posSpawnPos.length; i++){
					let testSpawnPos = new RoomPosition(posSpawnPos[i].x,posSpawnPos[i].y, room.name);
					if(testSpawnPos.findInRange(occupied, 0).length==0){
						if( testSpawnPos.getRangeTo(test) ==1 && testSpawnPos.getRangeTo(pointZero)==2){
							let posIdlePos = lookForNear(test, LOOK_TERRAIN, 1);
							for (let i = 0; i < posIdlePos.length; i++){
								let testIdlePos = new RoomPosition(posIdlePos[i].x,posIdlePos[i].y, room.name);
								if(testIdlePos.findInRange(occupied, 0).length==0){
									if( testIdlePos.getRangeTo(test) ==1 && testIdlePos.getRangeTo(testSpawnPos)==1){
										Memory.ICA.spawn=testSpawnPos;
										Memory.ICA.bin=binPos;
										Memory.ICA.spnTender=testIdlePos;
										Memory.ICA.mode = "Validate";
									}
								}
							}
						}
					}
				}
				new RoomVisual().text('0', Memory.ICA.spawn.x, Memory.ICA.spawn.y+0.25, {color:"yellow"});
				new RoomVisual().text('I', Memory.ICA.spnTender.x, Memory.ICA.spnTender.y+0.25, {color:"yellow"});
			} else {
				Memory.ICA.count++
				//optional display
				for(let tileNum in Memory.ICA.pointZero.zone){
					if (tileNum < Memory.ICA.count) {
						let tile = Memory.ICA.pointZero.zone[tileNum];
						new RoomVisual().text('O', tile.x, tile.y+0.25, {color:"red"});
					} else if (tileNum >= Memory.ICA.count) {
						let tile = Memory.ICA.pointZero.zone[tileNum];
						new RoomVisual().text('O', tile.x, tile.y+0.25, {color:"green"});
					}
				}
			}
			break;
		case "Validate":
			console.log('[ICA]Valid plot location found. Set Memory.ICA.go to true for construction.');
			new RoomVisual().text('0', Memory.ICA.spawn.x, Memory.ICA.spawn.y+0.25, {color:"yellow"});
			new RoomVisual().text('U', Memory.ICA.bin.x, Memory.ICA.bin.y+0.25, {color:"yellow"});
			new RoomVisual().text('I', Memory.ICA.spnTender.x, Memory.ICA.spnTender.y+0.25, {color:"yellow"});
			for (let i in Memory.ICA.roads){
				let road = Memory.ICA.roads[i];
				new RoomVisual().text('.', road.x, road.y);
			}
			if(Memory.ICA.go == true){
				Memory.ICA.mode = "Build";
			}
			break;
		case "Build":
			console.log("[ICA]Placing build zones.");
			
			console.log('[ICA]Valid plot location found. Set Memory.ICA.go to true for construction.');
			new RoomVisual().text('0', Memory.ICA.spawn.x, Memory.ICA.spawn.y+0.25, {color:"yellow"});
			new RoomVisual().text('U', Memory.ICA.bin.x, Memory.ICA.bin.y+0.25, {color:"yellow"});
			new RoomVisual().text('I', Memory.ICA.spnTender.x, Memory.ICA.spnTender.y+0.25, {color:"yellow"});
			for (let i in Memory.ICA.roads){
				let road = Memory.ICA.roads[i];
				new RoomVisual().text('.', road.x, road.y);
			}
			if(Memory.ICA.go == true){
				Memory.ICA.mode = "Build";
			}
			break;
		}
		*/
	}
};





