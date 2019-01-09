var ICA = require('InitialClaimAnalyser');
/*
TODO:

*/
module.exports.loop = function () {
	var start = Date.now();
    //seems usefull, keep around
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('[memcheck] Clearing non-existing creep from memory: ', name);
        }
    }
	
	//end cleanup code
	for (let flag in Game.flags){
		switch(flag) {
			case "ICA":
				ICA.run(Game.flags[flag].room);
			break;
			case "IOA":
				// code block
			break;
		}
	}
	console.log("time: "+(Date.now() - start));
}