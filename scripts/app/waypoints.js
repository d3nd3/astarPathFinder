define(['app/path','app/line','app/shared','app/map','app/util','app/gl','app/shapes','app/collision'],function (Path,Line,Shared,Map,Util,Gl,Shapes,Collision) {
	function Waypoints() {
		console.log('creating Waypoints');
		var posOfNode = new Float32Array(2);
		var posOfParentNode = new Float32Array(2);


		/*
			a waypoint this will be created for each unit
		*/
		this.newWaypoint = function() {
			this.points = new Float32Array(Shared.gridWidth * Shared.gridHeight);
			this.sizeNow = 0;
		};

		this.newWaypoint.prototype.generate = function(clickPosX,clickPosY,unit) {
			this.sizeNow = 0;

			var origPosX = unit.mesh.position.x;
			var origPosY = unit.mesh.position.y;
			var size = unit.size;


			// snap clickedClearanceTile if breaks a collision rule
			if ( Collision.boundRect(clickPosX,clickPosY,unit,Util.fconvArr,clickedClearanceTile) ) {
				clickPosX = Util.fconvArr[0];
				clickPosY = Util.fconvArr[1];
			}

			//translate origClearanceTile and clickedClearanceTile tiles to the top left ( positive y and negative x)
			var origClearanceTile = Util.twoarrayToone(Util.getTileFromReal(origPosX) - unit.radius,Util.getTileFromReal(origPosY) + unit.radius);
			var clickedClearanceTile = Util.twoarrayToone(Util.getTileFromReal(clickPosX) - unit.radius,Util.getTileFromReal(clickPosY) + unit.radius);

			

			var timeStamp = Date.now() & 0x3FFFFFFF; // hopefully this is more efficient 'number'

			// Right click on same path-finding tile
			if ( origClearanceTile == clickedClearanceTile ) {
				////console.log('dont need to call astar for this one');
				this.points[this.sizeNow++] = clickPosX;
				this.points[this.sizeNow++] = clickPosY;
				return;
			}
			var endNode = Path.astar(origClearanceTile,clickedClearanceTile,timeStamp,unit);

			//error?
			if ( endNode == Shared.totalSize ) return;

			if ( endNode != clickedClearanceTile ) {
				//case: converted back to centre

				console.log("couldn't get to the destination for some reason");
				Util.getCenterReal(Path.x[endNode],Path.y[endNode],size,posOfNode);
				clickPosX = posOfNode[0];
				clickPosY = posOfNode[1];
			}

			// uncomment below to see the path generated
			var thisNode = endNode;
			while ( thisNode != Shared.totalSize ) {
				var m = Shapes.cube(8);
				m.position.x = Path.x[thisNode] * Shared.cellSize + Shared.cellSize/2;
				m.position.y = Path.y[thisNode] * Shared.cellSize + Shared.cellSize/2;
				Gl.scene.add(m);
				Gl.debugObjs.push(m);
				thisNode = Path.parent[thisNode];
			}
			
			////console.log('finished astar function ' + endNode);

			//iterate through the linked list
			var totalDist = 0;
			//copy clickedClearanceTileination array
			var prevX = clickPosX;
			var prevY = clickPosY;

			var childNode = endNode;

			//push the clickedClearanceTile so it will be the final point of the route
			//wp.points.push(clickedClearanceTile);

			// filter only change in direction nodes
			var node = Path.parent[endNode];
			while ( node != Shared.totalSize /*&& node.timestamp == timeStamp*/ ) {
				
				//get real world co ordinates of tile
				Util.getCenterReal(Path.x[node],Path.y[node],size,posOfNode);
				
				//distance between parent and child points  (oldpos = parent)
				var dx = posOfNode[0] - prevX;
				var dy = posOfNode[1] - prevY;

				//keep track of distance of route
				totalDist = totalDist + Math.sqrt((dx*dx)+(dy*dy));
				
				//update oldpos for next iteration/frame	
				prevX = posOfNode[0];
				prevY = posOfNode[1];

				//requires 3 nodes to detect a change in direction , so use old , current, future ( child , node, parent )
				var a = Path.parent[node];
				if ( a != Shared.totalSize ) {
					Util.getCenterReal(Path.x[a],Path.y[a],size,posOfParentNode);
					var dx2 = posOfParentNode[0] - posOfNode[0];
					var dy2 = posOfParentNode[1] - posOfNode[1];

					//only push the nodes which change direction
					if ( dx/dy != dx2/dy2 ) {
						Path.parent[childNode] = node;
						childNode = node;
						//wp.points.push(posOfNode);
						
					}
				} /*else {
					//console.log("pushing origClearanceTile");
					wp.points.push(origClearanceTile);
				}*/									

				node = Path.parent[node];
				//console.log('while 1');
			}
				
			var first = true;

			//MAKE SHORTCUTS
			var dNode = endNode;
			var sNode = origClearanceTile;

			//THIS CODE IS FINDING THE PARTNER TO THE SOURCE TILE , IT DOESN'T WANT TO USE THE DEFAULT SOURCE TILE
			//if first parent is not the starting tile ( there are more than just start and dest in pathfinding route.)
			if ( Path.parent[endNode] != origClearanceTile ) {
				//check if can go directly to dest ...
				if ( Collision.lineRect(origPosX,origPosY,clickPosX,clickPosY,size) == true ) {
					//console.log('hey its walkable clickedClearanceTile to origClearanceTile!');

					//CAN GO DIRECTLY TO DEST SO CONNECT THEM :D
					Path.parent[endNode] = origClearanceTile;
					//qwerk to get out of fail safe lol
					//sNode = dNode.parent;
					console.log('Unit can go directly from start to finish.');
				}	
				else {
					console.log('Unit cannot go directly from start to finish.');
					dNode = Path.parent[dNode];
					while ( 1 ) {
						if ( Path.parent[dNode] == origClearanceTile ) {
							//does this change the start tile ?
							//yes this ignores start tile ...
							//fetches child of start tile...
							sNode = dNode;
							break;
						}
						//case:converted back to centre
						Util.getCenterReal(Path.x[dNode],Path.y[dNode],size,posOfNode);
						//check if can go directly from parent of dest+++ to start
						if ( Collision.lineRect(origPosX,origPosY,posOfNode[0],posOfNode[1],size) == true ) {
							//console.log('inner walkablE!');
							//can walk fine to here, so reparent
							Path.parent[dNode] = origClearanceTile;
							sNode = dNode;
							break;
						}
						dNode = Path.parent[dNode];
					}
				}
			}			
			

			//s does not get too close to clickedClearanceTile
			while ( Path.parent[endNode] != sNode && endNode != sNode ) {
				//reset d , always origClearanceTileing at clickedClearanceTile
				dNode = endNode;
				first = true;
				//d does not get too close to s
				//s is mostly static incrementing in outer loop
				//d is more dynamic, incrementing in inner loop
				while ( 1 ) {
					walkable = true;
					if ( Path.parent[dNode] == sNode ) {
						//save this bitch lol
						//console.log("the d value reached as close it can to s value, now snode is decremented to this d value");
						sNode = dNode;
						break;
					}
					
					if ( first == false )
					{

						Util.getCenterReal(Path.x[dNode],Path.y[dNode],size,Util.fconvArr);	
					} else
					{
						first = false;
						Util.fconvArr[0] = clickPosX;
						Util.fconvArr[1] = clickPosY;
					}
					
					Util.getCenterReal(Path.x[sNode],Path.y[sNode],size,posOfNode);
					if ( Collision.lineRect(posOfNode[0],posOfNode[1],Util.fconvArr[0],Util.fconvArr[1],size) == true ) {
						//console.log('some intricate walkable found!');
						Path.parent[dNode] = sNode;
						sNode = dNode;
						break;
					}

					dNode = Path.parent[dNode];
				}
			}

			
			//PUSH clickedClearanceTile FIRST
			this.points[this.sizeNow++] = clickPosX;
			this.points[this.sizeNow++] = clickPosY;

			
			//SPECIAL CONDITION origClearanceTile TO clickedClearanceTile NODE COLLISION TEST
			if ( Path.parent[endNode] == origClearanceTile ) {
				if ( Collision.lineRect(origPosX,origPosY,clickPosX,clickPosY,size) == false ) {
					//insert extra 'center' node for clickedClearanceTile node becos its dodgy, thanks
					Util.getCenterReal(Path.x[origClearanceTile],Path.y[origClearanceTile],size,posOfNode);
					this.points[this.sizeNow++] = posOfNode[0];
					this.points[this.sizeNow++] = posOfNode[1];
					console.log('Detected origClearanceTile to clickedClearanceTile collision');

					//NOW CONTINUE TO CHECK NEW WAYPOINT TO clickedClearanceTile
					if ( Collision.lineRect(posOfNode[0],posOfNode[1],clickPosX,clickPosY,size) == false ) {
						//insert extra 'center' node for clickedClearanceTile node becos its dodgy, thanks
						Util.getCenterReal(Path.x[endNode],Path.y[endNode],size,posOfNode);
						this.points[this.sizeNow++] = posOfNode[0];
						this.points[this.sizeNow++] = posOfNode[1];
						console.log('Detected collision with newly added waypoint');

						//IF REACHES HERE, 2 WAYPOINTS TURNED INTO 4 , ( 2 EXTRA ADDED )
					}
				}
				// console.log('Clean from origClearanceTile to end');
				return;
			} 
			
			
			//LOL this is funny code :D it fixed a big probem ROFL !!! 

			//SPECIAL CONDITION MID NODE TO clickedClearanceTile NODE COLLISION TEST
			Util.getCenterReal(Path.x[Path.parent[endNode]],Path.y[Path.parent[endNode]],size,posOfNode);
			if ( Collision.lineRect(posOfNode[0],posOfNode[1],clickPosX,clickPosY,size) == false ) {
				//INSERT CENTER OF END NODE TO FIX
				Util.getCenterReal(Path.x[endNode],Path.y[endNode],size,posOfNode);
				this.points[this.sizeNow++] = posOfNode[0];
				this.points[this.sizeNow++] = posOfNode[1];
				// console.log('Detected mid to clickedClearanceTile collision');
			}
			
			
			
			//BUILD THE WAYPOINT ARRAY XD
			node = Path.parent[endNode];
			while ( node != origClearanceTile ) {
				
				
				Util.getCenterReal(Path.x[node],Path.y[node],size,posOfNode);
				this.points[this.sizeNow++] = posOfNode[0];
				this.points[this.sizeNow++] = posOfNode[1];
				
				
				//SPECIAL CONDITION origClearanceTile NODE TO CENTER-NODE COLLISION TEST
				if ( Path.parent[node] == origClearanceTile ) {
					Util.getCenterReal(Path.x[node],Path.y[node],size,posOfNode);
					if ( Collision.lineRect(origPosX,origPosY,posOfNode[0],posOfNode[1],size) == false ) {
						//insert extra 'center' node for origClearanceTile node becos its dodgy, thanks
						Util.getCenterReal(Path.x[origClearanceTile],Path.y[origClearanceTile] ,size,posOfNode);
						this.points[this.sizeNow++] = posOfNode[0];
						this.points[this.sizeNow++] = posOfNode[1];
						// console.log('Detected origClearanceTile to mid collision');
					}
				}

				//console.log('groovy');
				node = Path.parent[node];	
			}

			// for ( var t = 0 ; t < this.sizeNow; t+=2 ) {
			// 	var m = Shapes.cube(8);
			// 	m.position.x = this.points[t];
			// 	m.position.y = this.points[t+1];

			// 	Gl.scene.add(m);
			// }
				
		}; // end of wp.generate function
	
	} // end of Waypoints constructor

	return new Waypoints();
});