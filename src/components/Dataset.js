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
		// Attach 'filtered' element
		this.filtered = [];
		for (let i in this.data)
			this.filtered[i] = false
	}
	getData() {
		// TODO: This should me more efficiently, recalculate data array on filter, not on getData
		if (this.isFiltered()) {
			let dataFiltered = [];
			for (let i in this.data)
				if (!this.filtered[i])
					dataFiltered.push(this.data[i]);
			return dataFiltered;
		} else {
			return this.data;
		}
	}
	filterFPKM(val) {
		for (let i in this.data) {
			if (this.data[i].fpkm_1 < val || this.data[i].fpkm_2 < val)
				this.filtered[i] = true;
		}
	}
	isFiltered() {
		for (let i in this.filtered)
			if (this.filtered[i] === true)
				return true;
		return false;
	}
}

export default Dataset;
