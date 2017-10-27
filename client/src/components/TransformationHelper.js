import { isUndefined } from './Helper';

/**
 * Checks if the transformation contains a `-`
 * @param {string} transformation Transformation name
 * @return {boolean} Transforation contains `-`
 */
function transformationNegates(transformation) {
  return transformation[0] === '-';
}

/**
 * Applies inverse transformation of `transformation` to data
 * @param {double} point Data to transform
 * @param {string} transformation Transfromation name
 * @return {double} Transformed data
 */
function inverseTransformation(point, transformation = 'linear') {
  switch (transformation) {
    case 'linear':
      return point;
    case '-linear':
      return point * -1;
    case 'sqrt': {
      const inverse = Math.pow(point, 2);
      return point < 0 ? inverse * -1 : inverse;
    }
    case '-sqrt': {
      const inverse = Math.pow(point, 2);
      return point < 0 ? inverse : inverse * -1;
    }
    case 'log10':
      return Math.pow(10, point);
    case '-log10':
      return Math.pow(10, point * -1);
    case 'log2':
      return Math.pow(2, point);
    // return Math.log2(point);
    case '-log2':
      return Math.pow(2, point * -1);
    default:
      throw new Error(`Transformation ${transformation} not known`);
  }
}

/**
  * Apply transformation to value
  * @param {double} point Point to transform
  * @param {string} transformation Type of transformation. Defaults to linear
  * @return {double} Transformed point
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
 * Apply transformation to x and y array and check of isFinite and filters out the according elements
 * @param {array} xArray 
 * @param {array} yArray 
 * @param {string} xTransformation 
 * @param {string} yTransformation 
 * @param {boolean} removeInvalid 
 * @param {array} data underlying data array 
 * @return {Object} xArray and yArray result as well as filtered data array
 */
function applyTransformationArrays(
  xArray,
  yArray,
  xTransformation,
  yTransformation,
  removeInvalid,
  data,
) {
  if (xTransformation === 'linear' && yTransformation === 'linear') {
    return { xArray, yArray };
  }
  // Apply transformation to the arrays
  const xArrayTransformed = xArray.map(x => applyTransformation(x, xTransformation));
  const yArrayTransformed = yArray.map(y => applyTransformation(y, yTransformation));
  if (!removeInvalid) {
    return { xArray, yArray };
  }
  // Now check for invalid values.
  // If there are some, we have to delete the element in the other array as well
  // Creat boolean values checking for validity
  const xIsValid = xArrayTransformed.map(x => isFinite(x));
  const yIsValid = yArrayTransformed.map(y => isFinite(y));
  // Filter based on the boolean arrays
  const xArrayValid = xArrayTransformed.filter((x, index) => xIsValid[index] && yIsValid[index]);
  const yArrayValid = yArrayTransformed.filter((y, index) => xIsValid[index] && yIsValid[index]);
  const dataFiltered = isUndefined(data)
    ? undefined
    : data.filter((entry, index) => xIsValid[index] && yIsValid[index]);
  return { xArray: xArrayValid, yArray: yArrayValid, data: dataFiltered };
}

/**
  * Apply transformation to a vector of values
  *
  * @param {array} data Dimension as vector of values
  * @param {string} transformation Type of transformation. Defaults to linear
  */
function applyTransformationArray(data, transformation = 'linear', removeInfinite = true) {
  if (transformation === 'linear') {
    return data;
  }
  return data.map(elem => applyTransformation(elem, transformation)).filter((elem) => {
    if (!removeInfinite) {
      return true;
    }
    return isFinite(elem);
  });
}

export {
  applyTransformation,
  applyTransformationArray,
  applyTransformationArrays,
  inverseTransformation,
  transformationNegates,
};
