define(['app/shared','app/path','app/map','app/util','app/path','app/gl','app/shapes'], function (Shared,Path,Map,Util,Path,Gl,Shapes) {

	function Line() {
		console.log('creating Line');
		this.isWalkable = function ( fromx,fromy,tox,toy) {
			var dx = Math.abs(tox - fromx);
			var dy = Math.abs(toy - fromy);
			    
		
			var fromInt = [~~(fromx),~~(fromy)];
			var toInt = [~~(tox),~~(toy)];

			var x = Util.getTileFromReal(fromx);
			var y = Util.getTileFromReal(fromy);

			var numberOfSteps = 1;
			var xDir, yDir;

			var error;
			    
			if ( dx == 0 ) {
				xDir = 0;
				error = Number.POSITIVE_INFINITY;
			}
			else if ( tox > fromx ) {
				xDir = 1;
				numberOfSteps += Util.getTileFromReal(tox) - x;
				//initial distance till first intersection with vertical border
				//convert distance into a ratio of the total line :) because 1/dy == dx/dx*dy
				error = (((x+1)*Shared.cellSize) - fromx) * dy;
			}
			else
			{
				xDir = -1;
				numberOfSteps += x - Util.getTileFromReal(tox);
				//initial distance till first intersection with vertical border
				//convert distance into a ratio of the total line :) because 1/dy == dx/dx*dy
				error = (fromx - ((x)*Shared.cellSize)) *dy;
			}


		    if (dy == 0) {
		        yDir = 0;
		        error -= Number.POSITIVE_INFINITY;
		    }
		    else if (toy > fromy) {
		        yDir = 1;
		        numberOfSteps += Util.getTileFromReal(toy) - y;
		        //initial distance till first intersection with horizontal border
		        //convert distance into a ratio of the total line :)
		        error -= (((y+1)*Shared.cellSize) - fromy) * dx; // dx , because 1/dy == dx/dx*dy
		    }
		    else
		    {
		        yDir = -1;
		        numberOfSteps += y - Util.getTileFromReal(toy);
		        //initial distance till first intersection with horizontal border
		        //convert distance into a ratio of the total line :) because 1/dy == dx/dx*dy
		        error -= (fromy - ((y)*Shared.cellSize)) * dx;
		    }

		    //console.log('yikes = ' + numberOfSteps);
		    // numberOfSteps = Math.ceil(numberOfSteps/Shared.cellSize) + 1;
		    for (; numberOfSteps > 0; --numberOfSteps)
		    {
		        //visit(x, y);
		        var n = Util.twoarrayToone(x,y);
		        

	        	var m = Shapes.cube(8);

	        	// Gl.debugObjs.push(m);
	        	// m.position.x = Path.x[n] * Shared.cellSize + Shared.cellSize/2;
	        	// m.position.y = Path.y[n] * Shared.cellSize + Shared.cellSize/2;
	        	// Gl.scene.add(m);


		        


	        	// console.log('visitted x = ' + x + ' and y = ' + y);
		        if ( Path.occupied[n] == true || Map.data[n] == 0 ) {
		        	console.log('ahhhh a black square!');	        	
		        	return false;
		        }

		        //move into a next grid, either horizontal or vertical
		        if (error > 0) {
		            y += yDir; // move in direction towards destination y
		            error -= dx * Shared.cellSize;
		        }
		        else {
		            x += xDir; // move in direction towards destination x
		            error += dy * Shared.cellSize;
		        }
		    }
		    return true;
		};
	}
	return new Line();
});


	// this.isWalkable = function ( fromx,fromy,tox,toy) {
	// 	var dx = Math.abs(tox - fromx);
	// 	var dy = Math.abs(toy - fromy);
		    
	
	// 	var fromInt = [~~(fromx),~~(fromy)];
	// 	var toInt = [~~(tox),~~(toy)];

	// 	var x = Util.getTileFromReal(fromx);
	// 	var y = Util.getTileFromReal(fromy);

	// 	var numberOfSteps = 1;
	// 	var xDir, yDir;

	// 	var error;
		    
	// 	if ( dx == 0 ) {
	// 		xDir = 0;
	// 		error = Number.POSITIVE_INFINITY;
	// 	}
	// 	else if ( tox > fromx ) {
	// 		xDir = 1;
	// 		numberOfSteps += toInt[0] - fromInt[0];
	// 		//initial distance till first intersection with vertical border
	// 		//convert distance into a ratio of the total line :) because 1/dy == dx/dx*dy
	// 		error = (fromInt[0] + 1 - fromx) * dy;
	// 	}
	// 	else
	// 	{
	// 		xDir = -1;
	// 		numberOfSteps += fromInt[0] - toInt[0];
	// 		//initial distance till first intersection with vertical border
	// 		//convert distance into a ratio of the total line :) because 1/dy == dx/dx*dy
	// 		error = (fromx - fromInt[0]) *dy;
	// 	}


	//     if (dy == 0) {
	//         yDir = 0;
	//         error -= Number.POSITIVE_INFINITY;
	//     }
	//     else if (toy > fromy) {
	//         yDir = 1;
	//         numberOfSteps += toInt[1] - fromInt[1];
	//         //initial distance till first intersection with horizontal border
	//         //convert distance into a ratio of the total line :)
	//         error -= (fromInt[1] + 1 - fromy) * dx; // dx , because 1/dy == dx/dx*dy
	//     }
	//     else
	//     {
	//         yDir = -1;
	//         numberOfSteps += fromInt[1] - toInt[1];
	//         //initial distance till first intersection with horizontal border
	//         //convert distance into a ratio of the total line :) because 1/dy == dx/dx*dy
	//         error -= (fromy - fromInt[1]) * dx;
	//     }

	//     //console.log('yikes = ' + numberOfSteps);
	//     numberOfSteps = Math.ceil(numberOfSteps/Shared.cellSize) + 1;
	//     for (; numberOfSteps > 0; --numberOfSteps)
	//     {
	//         //visit(x, y);
	//         var n = Util.twoarrayToone(x,y);
	        

 //        	var m = Shapes.cube(8);

 //        	Gl.debugObjs.push(m);
 //        	m.position.x = Path.x[n] * Shared.cellSize + Shared.cellSize/2;
 //        	m.position.y = Path.y[n] * Shared.cellSize + Shared.cellSize/2;
 //        	Gl.scene.add(m);


	        


 //        	// console.log('visitted x = ' + x + ' and y = ' + y);
	//         if ( Path.occupied[n] == true || Map.data[n] == 0 ) {
	//         	console.log('ahhhh a black square!');	        	
	//         	return false;
	//         }

	//         //move into a next grid, either horizontal or vertical
	//         if (error > 0) {
	//             y += yDir; // move in direction towards destination y
	//             error -= dx;
	//         }
	//         else {
	//             x += xDir; // move in direction towards destination x
	//             error += dy;
	//         }
	//     }
	//     return true;
	// };