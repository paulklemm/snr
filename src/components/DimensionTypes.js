export const DimensionTypes = {
	fc: "number",
	pValue: "number",
	negLog10_p_value: "number",
	qValue: "number",
	fpkm_1: "number",
	fpkm_2: "number",
	name: "string",
	biotype: "string"
};

export const DefaultFilterSetting = {
	fc: ">",
	pValue: "<",
	negLog10_p_value: "<",
	qValue: "<",
	fpkm_1: ">",
	fpkm_2: ">",
	name: "=",
	biotype: "="
};

export default DimensionTypes;