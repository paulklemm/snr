class R {
	constructor(openCPUBridge) {
		this.openCPUBridge = openCPUBridge;
	}

	PcaAsciiToJson(pcaAscii) {

	}

	PCA(dimensions) {
		return (this.openCPUBridge.runRCommand(
			'sonaR',
			'PCA',
			{
				data: dimensions
			},
			'json'
		));
	}
}

export default R;