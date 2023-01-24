	define(['app/gl','app/map','app/util','app/shared'],function (Gl,Map,Util,Shared) {

	function Grid () {
		console.log('creating Grid');

		//store size
		var mat = new THREE.MeshBasicMaterial({vertexColors: true});
		var geom = new THREE.Geometry();
		var pf = Shared.cellSize;
		geom.vertices.push(new THREE.Vector3( pf,  pf, 0.0));
		geom.vertices.push(new THREE.Vector3( 0.0,  pf, 0.0));
		geom.vertices.push(new THREE.Vector3( 0.0,  0.0, 0.0));
		geom.vertices.push(new THREE.Vector3( pf,  0.0, 0.0));
		geom.faces.push(new THREE.Face3(0, 1, 2));
		geom.faces.push(new THREE.Face3(2, 3, 0));
		

		var group;
		var mergedGeo = new THREE.Geometry();
		//initialise the 2 dimensional array

		var color = new THREE.Color(0xffffff);

		var mesh = new THREE.Mesh( geom, mat );
		//this creates a grid shape, all y's for each x
		for ( var i=0;i<Shared.totalSize;i++ )
		{
			
			if ( Map.data[i] == 0) {
				color.setHex(0x000000);
			} else
			{
				color.setHex(Math.random() * 0xffffff);
				// color.setHex(0xffffff);
			}

			
		    // For each face of the cube, I assign the color
		    for ( var k = 0; k < geom.faces.length; k ++ ) {
		        geom.faces[ k ].color = color;
		    }
			
			Util.onearrayTotwo(i,Util.iconvArr);
			//move the cell into appropriate position
			mesh.position.set(Util.iconvArr[0]*Shared.cellSize, Util.iconvArr[1]*Shared.cellSize, 0.0);
			// THREE.GeometryUtils.merge(mergedGeo, mesh);

			mesh.updateMatrix();
			mergedGeo.merge(mesh.geometry,mesh.matrix);
			
		}
		group = new THREE.Mesh( mergedGeo, mat );
		group.matrixAutoUpdate = false;
		group.updateMatrix();

		Shared.flatground = group;

		Gl.scene.add(group);

		//center camera to middle of grid
		Gl.camera.position.x = Shared.cellSize * Shared.gridWidth/2;
		Gl.camera.position.y = Shared.cellSize * Shared.gridHeight/2;


		this.appearCube = function(x,y,color) {
			var geometry = new THREE.SphereGeometry( Shared.cellSize/2, 32, 32 );
			var material = new THREE.MeshBasicMaterial( {color: color} );
			var sphere = new THREE.Mesh( geometry, material );
			sphere.position.set(x * Shared.cellSize + Shared.cellSize/2, y * Shared.cellSize + Shared.cellSize/2,Shared.cellSize/2);
			Gl.scene.add( sphere );
		};
	}


	return new Grid();
});
