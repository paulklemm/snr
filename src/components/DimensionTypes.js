export const DimensionTypes = {
	EnsemblID: "string",
	fc: "number",
	pValue: "number",
	pValueNegLog10: "number",
	name: "string",
	biotype: "string",
	sampleMean: "number",
	controlMean: "number",
	strand: "string"
};

export const DefaultFilterSetting = {
	EnsemblID: "=",
	fc: ">",
	pValue: "<",
	pValueNegLog10: "<",
	qValue: "<",
	sampleMean: ">",
	controlMean: ">",
	name: "=",
	biotype: "=",
	strand: "="
};

export default DimensionTypes;