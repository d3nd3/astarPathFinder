define( function () {

	function Shared() {
		console.log('creating Shared');
		this.gridWidth = 320;
		this.gridHeight = 320;
		this.cellSize = 32;
		this.flatground = undefined;
		this.totalSize = this.gridWidth * this.gridHeight;
	}
	return new Shared();
});