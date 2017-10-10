function transformationNegates(transformation) {
  return transformation[0] === '-';
}

function inverseTransformation(point, transformation = 'linear') {
  switch (transformation) {
    case 'linear':
      return point;
    case '-linear':
      return point * -1;
    case 'sqrt':
      return;
      // return point < 0 ? Math.sqrt(point * -1) * -1 : Math.sqrt(point);
    case '-sqrt':
      return;
      // return point < 0 ? Math.sqrt(point * -1) : Math.sqrt(point) * -1;
    case 'log10':
      return Math.pow(10, point);
    case '-log10':
      return Math.pow(10, point * -1);
    case 'log2':
      return;
      // return Math.log2(point);
    case '-log2':
      return Math.log2(point * -1);
    default:
      throw new Error(`Transformation ${transformation} not known`);
  }
}

/**
  * Apply transformation to value
  *
  * @param {array} point Point to transform
  * @param {string} transformation Type of transformation. Defaults to linear
  */
function applyTransformation(point, transformation = 'linear') {
  switch (transformation) {
    case 'linear':
      return point;
    case '-linear':
      return point * -1;
    case 'sqrt':
      return point < 0 ? Math.sqrt(point * -1) * -1 : Math.sqrt(point);
    case '-sqrt':
      return point < 0 ? Math.sqrt(point * -1) : Math.sqrt(point) * -1;
    case 'log10':
      return Math.log10(point);
    case '-log10':
      return Math.log10(point) * -1;
    case 'log2':
      return Math.log2(point);
    case '-log2':
      return Math.log2(point) * -1;
    default:
      throw new Error(`Transformation ${transformation} not known`);
  }
}

/**
  * Apply transformation to a vector of values
  *
  * @param {array} data Dimension as vector of values
  * @param {string} transformation Type of transformation. Defaults to linear
  */
function applyTransformationArray(data, transformation = 'linear') {
  if (transformation === 'linear') { return data; }
  return data.map(elem => applyTransformation(elem, transformation));
}

export {
  applyTransformation,
  applyTransformationArray,
  inverseTransformation,
  transformationNegates
};
