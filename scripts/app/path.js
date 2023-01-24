define( ['app/shared','app/map','app/bheap','app/grid'], function (Shared,Map,Heap,Grid) {

	function Path () {
		console.log('creating Path');
		
		var self = this;
		var t = Shared.totalSize;

		//this.alfalfa = [];
		this.parent = new Uint32Array(t);

		//16bit
		this.x = new Uint16Array(t);
		this.y = new Uint16Array(t);

		//32bit
		this.timestamp = new Uint32Array(t);
		this.f = new Float32Array(t); // ;
		this.g = new Float32Array(t); //;
		this.h = new Float32Array(t);
		

		//8bit
		this.closed = new Uint8Array(t);
		this.open = new Uint8Array(t);
		this.occupied = new Uint8Array(t);
		this.clearance = new Uint8Array(t);


		this.scale = 1000;

		//my pretty little arrays
		
		var maxClearance = 6;
		var stop;
		var m;
		var z;
		for ( var o = 0;o < t;o++ ) {
			this.x[o] = o % Shared.gridWidth;
			this.y[o] = (o - this.x[o]) / Shared.gridWidth;
			
			stop = false;
			if ( Map.data[o] == 1 ) {
				for ( var h = 2 ; h < maxClearance; h++ ) {
					for ( var e = 0; e < h; e++ ) {
						for ( var f = 0; f < h; f++ ) {
							m = (this.y[o]-f) * Shared.gridWidth + this.x[o] + e;
							if ( m != o && Map.data[m] == 0 ) {
								stop = true;
							}
						}
					}
					if ( stop == true ) {
						// z = h;
						break;
					}
				}
				this.clearance[o] = h-1;
			} else
			{
				this.clearance[o] = 0;
			}		
		}

		Heap.setScoreArr(this.f);



		this.astar = function (start,goal,timeStamp,unit) {

			//translate center to top left
			var size = unit.size;

			/*if ( this.clearance[goal] < size ) {
				console.log('you cant go there mr.orc!');
				return Shared.totalSize;
			}*/

			//////console.log('starting astar');
			Heap.sizeNow = 1;
			Heap.insert(start);
			//this.alfalfa.length = 0;
			//this.alfalfa.push(start);

			//the initial node will be trusted so give it acceptable values
			this.parent[start] = Shared.totalSize;
			this.g[start] = 0;
			var dx = Math.abs(this.x[goal]-this.x[start]), dy = Math.abs(this.y[goal]-this.y[start]);
			this.h[start] = this.scale * ( dx + dy ) + (Math.sqrt(2)*this.scale - 2*this.scale) * Math.min(dx, dy);
			this.f[start] = this.h[start];//f = g + h(start,goal) 

			//Heap.dump(openHeap);

			var testcounter = 0;
			var lowestHNode = Shared.GridSize;
			while ( /*this.alfalfa.length > 0*/Heap.sizeNow > 1 /*&& testcounter < 150*/) {
				//console.log('counter at ' + testcounter);
				
				
				//fetch lowest f value
				var thisNode = Heap.theHeap[1];

				
				
				/*var min = Infinity;
				var nop;
				for(var i = 0; i < this.alfalfa.length; i++ ) {
					if (this.f[this.alfalfa[i]] < min) {
						min = this.f[this.alfalfa[i]];
						nop = i;
					}
				}*/




				/*if ( this.f[thisNode] != min ) {
					console.log('ive found a deviation of your heap ! min = ' + min + ' heapmin = ' + this.f[thisNode]);
				}*/

				/*for ( var i = 1 ; i < Heap.SizeNow; i ++ ) { 
					if ( this.f[Heap.theHeap[i]] == min ) {
						console.log('bingo, found it');
					}
				}


				var newmin = Infinity;
				for ( var i = 1; i < Heap.sizeNow; i++ ) {
					newmin = Math.min(newmin, this.f[Heap.theHeap[i]]);
					nop = Heap.theHeap[i];
				}

				if ( min != newmin ) {
					console.log('ive found a deviation of your heap ! min = ' + newmin + ' heapmin = ' + this.f[thisNode]);
				}*/
				
				//console.log('nop is ' + nop);
				//thisNode = this.alfalfa[nop];
				

				// Grid.appearCube(this.x[thisNode],this.y[thisNode],0xff0000);
				//console.log('ROLLING ON THE FLOOR LAUGHING ' + thisNode);
				//Grid.colorCell(currentNode.x,currentNode.y,0xffa500);
				//////console.log('F OF LOWEST = ' + currentNode.f);
				//////console.log('G OF LOWEST = ' + currentNode.g);
				if ( thisNode == goal ) {
					//////console.log('counter at ' + testcounter);
					console.log('found the goal');
					return goal;
				}

				this.open[thisNode] = 0;
				Heap.deinsert(1);
				//this.alfalfa.splice(nop,1);
				//add current to closed set
				this.closed[thisNode] = 1;

				//timestamp to trust its data
				this.timestamp[thisNode] = timeStamp;

				var n;
				//diagneighbours
				for ( var i=0;i<8;i++)
				{		
					n = getNodeWhere[i][0](thisNode);
					// if ( n < Shared.totalSize ) console.log('YEP ITS VALID ' + n);
					if ( n != null )
					{
						//console.log('n does not equal null');
						////console.log('laughing my fucking ass off !!!!!! ' + n.x + ' ' +  n.y);
						////console.log(n.closed);
						////console.log(Map.data[n.x][n.y]);
						if ( (this.closed[n] == 1 && this.timestamp[n] == timeStamp) || Map.data[n] == 0 
							|| (this.clearance[n] < size) || ( i > 3 && getNodeWhere[i][2](size,thisNode))) continue;

						
						//console.log('beyond the continue');
						var newDist = this.g[thisNode] + getNodeWhere[i][1]; // 10 = g_dist ( current,n);

						
						//console.log('oh ' + this.timestamp[n] + ' compared to ' + timeStamp + ' aahhh ' + this.f[n]);
						if ( (this.timestamp[n] < timeStamp) || (newDist < this.g[n] /*&& n.timestamp == timeStamp*/ && this.open[n] == 1) ) {
							//console.log('needs updating');
							//////console.log('n: ' + i + ' // ' + testcounter + ':');
							this.parent[n] = thisNode;
							this.g[n] = newDist;

							//this is f = g + h ... TODO: cache the heuristics
							dx = Math.abs(this.x[goal]-this.x[n]);
							dy = Math.abs(this.y[goal]-this.y[n]);

							this.h[n] = this.scale * ( dx + dy ) + (Math.sqrt(2)*this.scale - 2*this.scale) * Math.min(dx, dy);
							this.f[n] = this.g[n] + this.h[n];//f = g + h(start,goal)
							if ( lowestHNode == Shared.gridSize || this.h[n] < this.h[lowestHNode] ) {
								lowestHNode = n;
							}
							//////console.log('potential new open node smaller ones should grow = ' + n.f);
							if ( this.timestamp[n] < timeStamp ) {
								//console.log('adding a new biatch to the heap');
								this.timestamp[n] = timeStamp;
								//this.alfalfa.push(n);
								Heap.insert(n);
								this.open[n] = 1;
								this.closed[n] = 0;
								/*for ( var o = 1 ; o < openHeap.theArray.length;o++) {
									////console.log(openHeap.theArray[o]);
								}*/
								
							}
						}
					}
				}


				// Heap.dump();
				testcounter++;
			} // end while loop a*
			
			return lowestHNode;
		};

		//0 get node
		//1 cost
		//2 offset y
		//3 offset x
		var getNodeWhere = [
			[
				//down
				function ( fromNode ) {
					// don't traverse off map
					if ( self.y[fromNode] == 0 ) return null; 
					// decrement y value
					return (self.y[fromNode]-1)*Shared.gridWidth + self.x[fromNode];
				},
				1*this.scale
			],
			[
				//up
				function ( fromNode ) {
					// don't traverse off map
					if ( self.y[fromNode] == Shared.gridHeight-1 ) return null; 
					// increment y value
					return (self.y[fromNode]+1)*Shared.gridWidth + self.x[fromNode];
				},
				1*this.scale
			],
			[
				//right
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == Shared.gridWidth-1 ) return null;
					// increment x value
					return self.y[fromNode]*Shared.gridWidth + self.x[fromNode] + 1;
				},
				1*this.scale
			],
			[
				//left
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == 0 ) return null;
					// decrement x value
					return self.y[fromNode]*Shared.gridWidth + self.x[fromNode] - 1;
				},
				1*this.scale
			],
			[
				//down-left
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == 0 || self.y[fromNode] == 0 ) return null;
					// decrement x and y value
					return (self.y[fromNode]-1)*Shared.gridWidth + self.x[fromNode] - 1;
				},
				Math.sqrt(2)*this.scale,
				function ( soize,fromNode ) {
					return (	Map.data[fromNode+(((-1 - soize) *Shared.gridWidth) + (soize-1) )] == 0 || //southern 2
								Map.data[fromNode+(((-1 - soize) *Shared.gridWidth) )] == 0 ||
								Map.data[fromNode -1] == 0 || //western 2
								Map.data[fromNode-((soize-1) *Shared.gridWidth)  -1] == 0);
				}

			],
			[
				//up-right
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == Shared.gridWidth-1 || self.y[fromNode] == Shared.gridHeight-1 ) return null;
					// increment x and y value
					return (self.y[fromNode]+1)*Shared.gridWidth + self.x[fromNode] + 1;
				},
				Math.sqrt(2)*this.scale,
				function ( soize,fromNode ) {
					return (	Map.data[fromNode+Shared.gridWidth] == 0 || //northern 2
								Map.data[fromNode+Shared.gridWidth + (soize-1)] == 0 ||
								Map.data[fromNode + soize] == 0 || //eastern 2
								Map.data[fromNode-((soize-1) *Shared.gridWidth)  +soize] == 0);
				}

			],
			[
				//down-right
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == Shared.gridWidth-1 || self.y[fromNode] == 0 ) return null;
					// increment x value , decremeent y value
					return (self.y[fromNode]-1)*Shared.gridWidth + self.x[fromNode] + 1;
				},
				Math.sqrt(2)*this.scale,
				function ( soize,fromNode ) {
					return (	Map.data[fromNode+(((-1 - soize) *Shared.gridWidth) + (soize-1) )] == 0 || //southern 2
								Map.data[fromNode+(((-1 - soize) *Shared.gridWidth) )] == 0 ||
								Map.data[fromNode + soize] == 0 || //eastern 2
								Map.data[fromNode-((soize-1) *Shared.gridWidth)  +soize] == 0);
				}
			],
			[
				//up-left
				function ( fromNode ) {
					// don't traverse off map
					if ( self.x[fromNode] == 0 || self.y[fromNode] == Shared.gridHeight-1 ) return null;
					// decrement x value, increment y value
					return (self.y[fromNode]+1)*Shared.gridWidth + self.x[fromNode] - 1;
				},
				Math.sqrt(2)*this.scale,
				function ( soize,fromNode ) {
					return (	Map.data[fromNode+Shared.gridWidth] == 0 || //northern 2
								Map.data[fromNode+Shared.gridWidth + (soize-1)] == 0 ||
								Map.data[fromNode -1] == 0 || //western 2
								Map.data[fromNode-((soize-1) *Shared.gridWidth)  -1] == 0);
				}
			]
		];
	
	}
	return new Path();
});



