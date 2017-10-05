export const DimensionTypes = {
  EnsemblID: "string",
  fc: "number",
  pValue: "number",
  pValueNegLog10: "number",
  FPKM: "number",
  name: "string",
  Name: "string",
  biotype: "string",
  sampleMean: "number",
  controlMean: "number",
  strand: "string",
  Start: "number",
  End: "number"
};

export const DefaultFilterSetting = {
  EnsemblID: "=",
  fc: ">",
  pValue: "<",
  pValueNegLog10: "<",
  FPKM: ">",
  qValue: "<",
  sampleMean: ">",
  controlMean: ">",
  name: "=",
  Name: "=",
  biotype: "=",
  strand: "=",
  Start: ">",
  End: "<"
};

export default DimensionTypes;