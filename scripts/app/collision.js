define( ['app/line','app/shared','app/util','app/map','app/path'],function (Line,Shared,Util,Map,Path) {
	function Collision () {
		console.log('creating Collision');
		//currently requires center of 'rect'
		this.lineRect = function (rect1x,rect1y,rect2x,rect2y,size) {
			var c1 = [], c2 = [];
			
			// var padding = 0.4;
			var s = size * 0.5;
			var c = Shared.cellSize;

			var i;
			var rect1KK = rect1x - s * c;
			var rect2KK = rect2x - s * c;
			var rect1LL = rect1y + s * c;
			var rect2LL = rect2y + s * c;
			
			//clockwise
			for ( i = 0 ; i < size*2; i+=2 ) {
				//top
				//large static y
				//dynamic increasing x

				rect1KK = rect1KK + c;
				rect2KK = rect2KK + c;			

				c1[i] = rect1KK;
				c1[i+1] = rect1LL;

				c2[i] = rect2KK;
				c2[i+1] = rect2LL;
			} 
			for ( i = size*2; i < 2  * size*2; i+=2 ) {
				//right
				//large static x
				//dynamic decreasing y
				rect1LL = rect1LL - c;
				rect2LL = rect2LL - c;
				
				c1[i] = rect1KK;
				c1[i+1] = rect1LL;

				c2[i] = rect2KK;
				c2[i+1] = rect2LL;

			}
			for ( i = 2  * size*2 ; i < 3 * size*2; i+=2 ) {
				//bottom
				//small static y
				//dynamic decreasing x
				
				rect1KK = rect1KK - c;
				rect2KK = rect2KK - c;
				
				c1[i] = rect1KK;
				c1[i+1] = rect1LL;

				c2[i] = rect2KK;
				c2[i+1] = rect2LL;

			}

			for ( i = 3 * size*2 ; i < 4 * size*2; i+=2 ) {
				//left
				//small static x
				//dynamic increasing y

				rect1LL = rect1LL + c;
				rect2LL = rect2LL + c;

				c1[i] = rect1KK;
				c1[i+1] = rect1LL;

				c2[i] = rect2KK;
				c2[i+1] = rect2LL;

			}
			


			var walkable = true;
			var dog = false;
			for ( var h = 0; h < (size*4)*2; h+=2 ) {
				
				if ( !Line.isWalkable(c1[h],c1[h+1],c2[h],c2[h+1]) ) {
					walkable = false;
					//console.log('rect2 to rect1 not walkable lol, why?');
					break;
				}
			}
			return walkable;
		};


		//centers an object into a tile
		this.boundRect = function (locX,locY,unit,outArr,clearanceTile) {
			var ret = false;

			outArr[0] = locX;
			outArr[1] = locY;
			var lolx = Util.getTileFromReal(locX);
			var loly = Util.getTileFromReal(locY);
			var n = Util.twoarrayToone(lolx,loly);
			var s = unit.size;

			//check top left tile's clearance value
			if ( Path.clearance[Util.twoarrayToone(lolx - unit.radius,loly + unit.radius)] < s) {
				console.log('Hey , Cannot fit there!');
				//DO NOT SNAP BECAUSE ITS NOT A VALID LOCATION, HERE MUST DO A FLOOD FILL
				return ret;
			}

			
			var r = unit.radius;

			//array of booleans
			var bb = [];

			var i;
			var j = 0;

			//translate to top outside!!! left most hmmm
			n = n + (Shared.gridWidth *(r + 1)) - r;
			//clockwise
			for ( i = 0 ; i < s; i++ ) {
				//top
				//large static y
				//dynamic increasing x
				bb[j+i] = (Map.data[n+i] == 0);
				//move across horizontal right
				n++;
			}
			j +=s;

			//DIAGONAL SNAP TEST HERE (TOP RIGHT)
			bb[j] = ( Map.data[n] == 0 )
			j++;
			//translate down 1 tile
			n = n - Shared.gridWidth;
			for ( i = 0 ; i < s; i++ ) {
				//right
				//large static x
				//dynamic decreasing y
				bb[j+i] = (Map.data[n-(Shared.gridWidth * i)] == 0);
				//move vertical down
				n = n - Shared.gridWidth;
			}
			j +=s;

			//DIAGONAL SNAP TEST HERE (BOTTOM RIGHT)
			bb[j] = ( Map.data[n] == 0 )
			j++;
			//translate left 1 tile
			n = n - 1;
			for ( i = 0 ; i < s; i++ ) {
				//bottom
				//small static y
				//dynamic decreasing x
				bb[j+i] = (Map.data[n-i] == 0);
				//move horizontal left
				n = n - 1;
			}
			j +=s;

			//DIAGONAL SNAP TEST HERE (BOTTOM LEFT)
			bb[j] = ( Map.data[n] == 0 )
			j++;
			//translate up 1 tile
			n = n + Shared.gridWidth;
			
			for ( i = 0 ; i < s; i++ ) {
				//left
				//small static x
				//dynamic increasing y
				bb[j+i] = (Map.data[n+(Shared.gridWidth * i)] == 0);
				n = n + Shared.gridWidth;
			}
			j +=s;
			//DIAGONAL SNAP TEST HERE (TOP LEFT)
			bb[j] = ( Map.data[n] == 0 )
			j++;
			
			
			var aa = [];
			Util.getCenterReal(lolx,loly,1,aa);

			var a = unit.size*0.5 * Shared.cellSize;
			/*
			check outer planes of new position ( bound box ) are beyond the sitting in tiles' boundary and that offending tile is a collision tile
			*/
			//if outer edge overlaps into a bad tile

			//top
			var ex = false;
			var top = 0,bot = 0,right = 0, left = 0;
			top = (locY + a) - (loly+1+r)*Shared.cellSize;
			if ( top > 0 ) {
				for ( i = 0; i < s; i++ ) {
					 if (bb[i]) {
					 	ex = true;
					 	break;
					 }
				}
				if ( ex == true ) {
					console.log('snapping detected above collision');
					outArr[1] = aa[1]- 0.1 * Shared.cellSize;
					ret = true;
				}
			} else {
				//bottom
				bottom = (loly-r)*Shared.cellSize - (locY - a); 
				if ( bottom > 0 ) {
					for ( i = 0; i < s; i++ ) {
						 if (bb[s*2+2+i]) {
						 	ex = true;
						 	break;
						 }
					}
					if ( ex == true ) {
						console.log('snapping detected below collision');
						outArr[1] = aa[1] + 0.1 * Shared.cellSize;
						ret = true;
					}
				}
			}

			//right
			ex = false;
			right = (locX + a) - (lolx+1+r)*Shared.cellSize;
			if (  right > 0 ) {
				for ( i = 0; i < s; i++ ) {
					 if (bb[s+1+i]) {
					 	ex = true;
					 	break;
					 }
				}
				if ( ex == true ) {
					console.log('snapping detected right collision');
					outArr[0] = aa[0] - 0.1 * Shared.cellSize;
					ret = true;
				}
			} else {
				//left
				left =  (lolx-r)*Shared.cellSize - (locX - a);
				if ( left > 0 ) {
					for ( i = 0; i < s; i++ ) {
						 if (bb[s*3+3+i]) {
						 	ex = true;
						 	break;
						 }
					}
					if ( ex == true ) {
						console.log('snapping detected left collision');
						outArr[0] = aa[0] + 0.1 * Shared.cellSize;
						ret = true;
					}
				}
			}

			if ( top > 0 && right > 0 && bb[s] ) {
				// console.log('detected TOP-RIGHT baby!');
				// console.log('right =  ' + right);
				// console.log('top =  ' + top);
				if ( top < right ) {
					outArr[1] = aa[1] - 0.1 * Shared.cellSize;
				} else
				{
					outArr[0] = aa[0] - 0.1 * Shared.cellSize;
				}
				// outArr[0] = aa[0] - 0.1 * Shared.cellSize;
				// outArr[1] = aa[1] - 0.1 * Shared.cellSize;
				ret = true;
			}
			if ( bot > 0 && right > 0 && bb[2*s+1]) {
				// console.log('detected BOT-RIGHT baby!');
				// outArr[0] = aa[0] - 0.1 * Shared.cellSize;
				// outArr[1] = aa[1] + 0.1 * Shared.cellSize;
				ret = true;
			}
			if ( bot > 0 && left > 0 && bb[3*s+2]) {
				// console.log('detected BOT-LEFT baby!');
				// outArr[0] = aa[0] + 0.1 * Shared.cellSize;
				// outArr[1] = aa[1] + 0.1 * Shared.cellSize;
				ret = true;
			}
			if ( top > 0 && left > 0 && bb[4*s+3]) {
				// console.log('detected TOP-LEFT baby!');
				// outArr[0] = aa[0] + 0.1 * Shared.cellSize;
				// outArr[1] = aa[1] - 0.1 * Shared.cellSize;
				ret = true;
			}
			// console.log('return is ' + ret);
			return ret;
			
		};

		this.pointInPolygon = function(vertArray,px,py) {
			var bbox = new THREE.Box3().setFromPoints(vertArray);
			var min = bbox.min;
			var max = bbox.max;

			if (px < min.x || px > max.x || py < min.y || py > max.y) {
			    return false;
			}
			var n = vertArray.length;
			var i,j,c = 0;
			for (i = 0, j = n-1; i < n; j = i++) {
			  if ( ((vertArray[i].y>py) != (vertArray[j].y>py)) &&
			   (px < (vertArray[j].x-vertArray[i].x) * (py-vertArray[i].y) / (vertArray[j].y-vertArray[i].y) + vertArray[i].x) )
			     c = !c;
			}
			return c;
		};
	}

	return new Collision();
});