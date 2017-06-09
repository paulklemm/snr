export const DimensionTypes = {
	EnsemblID: "string",
	fc: "number",
	pValue: "number",
	pValueNegLog10: "number",
	fpkm_1: "number",
	fpkm_2: "number",
	name: "string",
	biotype: "string",
	strand: "string"
};

export const DefaultFilterSetting = {
	EnsemblID: "=",
	fc: ">",
	pValue: "<",
	pValueNegLog10: "<",
	qValue: "<",
	fpkm_1: ">",
	fpkm_2: ">",
	name: "=",
	biotype: "=",
	strand: "="
};

export default DimensionTypes;