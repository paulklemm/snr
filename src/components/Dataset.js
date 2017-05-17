class Dataset {
	constructor(name, enabled = false) {
		this.name = name;
		this.enabled = enabled;
	}
	setData(data) {
		this.data = data;
	}
}

export default Dataset;