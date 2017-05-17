class Dataset {
	constructor(name, enabled = false) {
		this.name = name;
		this.enabled = enabled;
		this.loaded = false;
	}
	setData(data) {
		this.data = data;
		this.loaded = true;
	}
}

export default Dataset;