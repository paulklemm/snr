class Dataset {
	constructor(name, enabled = false) {
		this.name = name;
		this.enabled = enabled;
		this.loaded = false;
		this.loading = false;
	}
	setData(data) {
		this.data = data;
		this.loaded = true;
		this.loading = false;
	}
}

export default Dataset;