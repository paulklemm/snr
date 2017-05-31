import DimensionTypes from './DimensionTypes';

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

	setFilter(filter) {
		const debug = false;
		const filterKeys = Object.keys(filter);
		if (debug) console.log(`Setfilter for ${this.name}`);
		if (debug) console.log(filter);
		for (let i in this.data) {
			// Init value with 'false' statement
			this.filtered[i] = false;
			for (let j in filterKeys) {
				let filterKey = filterKeys[j];
				if (DimensionTypes[filterKey] === 'number') {
					// Process Numbers
					if (filter[filterKey].operator === '<') {
						if (this.data[i][filterKey] > filter[filterKey].value)
							this.filtered[i] = true;
					} else if (filter[filterKey].operator === '>') {
						if (this.data[i][filterKey] < filter[filterKey].value)
							this.filtered[i] = true;
					}
				// Not a number
				} else {
					if (this.data[i][filterKey] === undefined || this.data[i][filterKey].indexOf(filter[filterKey].value) === -1)
						this.filtered[i] = true;
				}
			}
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
