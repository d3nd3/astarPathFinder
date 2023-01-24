define(['app/waypoints','app/grid','app/map','app/util','app/shared','app/line'],function (Waypoints,Grid,Map,Util,Shared,Line) {

	/*
	primitive unit -- expects to have its fields updated for a unit-type , eg. runner class or chaser
	*/
	function Units() {
		console.log('creating Units');
		var self = this;
		this.newUnit = function Unit (type) {
			this.wpsystem = new Waypoints.newWaypoint();
			this.spawnTile = [];
			this.revivePos = {};
			this.alive = false;
			this.size = 0;
			this.speed = 0;
			this.mesh = {};
			this.type = type;
			this.radius = 0;
		};

		//lol this is a recursive function BEAUTIFUL
		this.newUnit.prototype.moveStraight = function ( destx,desty , allowedDistance) {

			//check if can get to next waypoint by walking straight without collision
			/*var size = Shared.cellSize/2;
			var startx = this.mesh.position.x;
			var starty = this.mesh.position.y;

			cornersFrom[0] = startx+size;
			cornersFrom[1] = starty-size;
			cornersFrom[2] = startx+size;
			cornersFrom[3] = starty+size;
			cornersFrom[4] = startx-size;
			cornersFrom[5] = starty+size;
			cornersFrom[6] = startx-size;
			cornersFrom[7] = starty-size;

			cornersTo[0] = destx+size;
			cornersTo[1] = desty-size;
			cornersTo[2] = destx+size;
			cornersTo[3] = desty+size;
			cornersTo[4] = destx-size;
			cornersTo[5] = desty+size;
			cornersTo[6] = destx-size;
			cornersTo[7] = desty-size;
			var walkable = true;
			for ( var h = 0; h < 8; h+=2 ) {
				if ( !Line.isWalkable(cornersFrom[h],cornersFrom[h+1],cornersTo[h],cornersTo[h+1]) ) {
					walkable = false;
					break;
			}

			if ( !walkable ) {
				//insert an extra waypoint to first center on current node ( condition startx = off-center )
				//or
				//
			}*/







			var dy = desty - this.mesh.position.y;
			var dx = destx - this.mesh.position.x;

			var distThere = Math.sqrt(dx*dx+dy*dy);

			var newpos;
			var newposTile;

			/*
				the distance is too far, so only move what u can .. even tho u wont reach the complete dest
				dist to get there is more than allowed distance, so move allowed distance ONLY.
				because this is allowed distance per 'frame' or 'tick', so to speak, so job done. easy.
			*/
			if ( distThere > allowedDistance ) {
				var ratio = allowedDistance / distThere;
				


				var aNewPosX = this.mesh.position.x + dx * ratio;
				var aNewPosY = this.mesh.position.y + dy * ratio;

				var lolx = Util.getTileFromReal(aNewPosX);
				var loly = Util.getTileFromReal(aNewPosY);
				var n = Util.twoarrayToone(lolx,loly);

				
				/*
				check outer planes of new position ( bound box ) are beyond the sitting in tiles' boundary and that offending tile is a collision tile
				*/
				// if ( ( ( aNewPosY - Shared.cellSize/2 < (loly)*Shared.cellSize ) && ( Map.data[n-Shared.gridWidth] == 0) ) ||
				//   ( ( aNewPosY + Shared.cellSize/2 > (Math.ceil(aNewPosY/Shared.cellSize))*Shared.cellSize ) && (Map.data[n+Shared.gridWidth] == 0) ) ) {
				// 	//clamp vertical
				// 	//console.log('vertical overlap detected');
				// 	aNewPosY = loly * Shared.cellSize + Shared.cellSize/2;
				// 	// this.wpsystem.sizeNow = 0;
				// }
				// if ( ( ( aNewPosX - Shared.cellSize/2 < (lolx)*Shared.cellSize ) && ( Map.data[n-1] == 0) ) ||
				//   ( ( aNewPosX + Shared.cellSize/2 > (Math.ceil(aNewPosX/Shared.cellSize))*Shared.cellSize ) && (Map.data[n+1] == 0) ) ) {
				// 	//clamp horizontal
				// 	//console.log('horizontal overlap detected');
				// 	aNewPosX = lolx * Shared.cellSize + Shared.cellSize/2;
				// 	//console.log('new x is ' + lolx + ' * ' + Shared.cellSize + ' + ' + Shared.cellsize/2);
				// 	// this.wpsystem.sizeNow = 0;
				// }


				//console.log('troll1');
				this.setPos(aNewPosX,aNewPosY);


				//waypoints remain the same, because haven't actually reached the next waypoint yet, only got closer/nearer
			} 
			/*
				you can make it one step
				you can make it in self tick, and you might even have left over ( if distThere != allowedDistance && distThere < allowedDistance )
			*/
			else {
				var lolx = Util.getTileFromReal(destx);
				var loly = Util.getTileFromReal(desty);
				var n = Util.twoarrayToone(lolx,loly);
				/*
				check outer planes of new position ( bound box ) are beyond the sitting in tiles' boundary and that offending tile is a collision tile
				*/
				// if ( ( ( desty - Shared.cellSize/2 < (loly)*Shared.cellSize ) && ( Map.data[n-Shared.gridWidth] == 0) ) ||
				//   ( ( desty + Shared.cellSize/2 > (Math.ceil(desty/Shared.cellSize))*Shared.cellSize ) && (Map.data[n+Shared.gridWidth] == 0) ) ) {
				// 	//clamp vertical
				// 	//console.log('vertical overlap detected');
				// 	desty = loly * Shared.cellSize + Shared.cellSize/2;
				// 	// this.wpsystem.sizeNow = 0;
				// }
				// if ( ( ( destx - Shared.cellSize/2 < (lolx)*Shared.cellSize ) && ( Map.data[n-1] == 0) ) ||
				//   ( ( destx + Shared.cellSize/2 > (Math.ceil(destx/Shared.cellSize))*Shared.cellSize ) && (Map.data[n+1] == 0) ) ) {
				// 	//clamp horizontal
				// 	//console.log('horizontal overlap detected');
				// 	destx = lolx * Shared.cellSize + Shared.cellSize/2;
				// 	//console.log('new x is ' + lolx + ' * ' + Shared.cellSize + ' + ' + Shared.cellsize/2);
				// 	// this.wpsystem.sizeNow = 0;
				// }
				
				//make the move
				//console.log('troll2');
				this.setPos(destx,desty); // tweak self .. you need interpolate carefully.
				//get rid of that dest rally point so a new one(the next one) can be retrieved
				this.wpsystem.sizeNow -=2;


				//you have left over allowed distance
				if ( distThere < allowedDistance ) {
					//returns the remainder
					var distRemain = allowedDistance - distThere;

					//fetch a new destination + recurse	only if one exists
					if ( this.wpsystem.sizeNow > 1 ) {
						this.moveStraight(this.wpsystem.points[this.wpsystem.sizeNow-2],this.wpsystem.points[this.wpsystem.sizeNow-1],distRemain);	
					}
					
				}
			}
		};

		/*
			steps towards a point in a straight line at max stepsize of unit's speed
		*/
		this.newUnit.prototype.step = function () {

			//if there is a queued path
			if ( this.wpsystem.sizeNow > 1 ) {
				// console.log('still moving');
				//get the one at the end
				//take a chunk out of the line
				this.moveStraight(this.wpsystem.points[this.wpsystem.sizeNow-2],this.wpsystem.points[this.wpsystem.sizeNow-1],this.speed);

			}
			
		};

		this.newUnit.prototype.setPos = function (x,y) 
		{
			//console.log('old pos is ' + this.mesh.position.x);
			//console.log('new pos is ' + x);
			this.mesh.position.x = x;// + this.radius;
			this.mesh.position.y = y;// - this.radius;
		};

		this.newUnit.prototype.setColor = function (color) {
			this.mesh.material.color.setHex( color );
		};

	};
	

	return new Units();
});






