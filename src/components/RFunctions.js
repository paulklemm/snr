class RFunctions {
	constructor(openCPUBridge) {
		this.openCPUBridge = openCPUBridge;
	}

	PCA(dimensions) {
		return (this.openCPUBridge.runRCommand(
			'stats',
			'prcomp',
			{
				x: dimensions,
				'na.action': 'na.omit'
			}
		));
	}
}

export default RFunctions;