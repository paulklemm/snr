import React from 'react';
import { applyTransformation } from './TransformationHelper';

// https://www.w3schools.com/graphics/svg_rect.asp
const styleSheet = {
  rectangle: {
    fillOpacity: '0.1',
  },
};

/**
 * Class for building the selection Rectangle
 * Use it by settings start and end coordinates
 */
class SelectionRectangle {
  constructor() {
    this.reset();
    // state variable to store whether the user is currently drawing a rectangle
    this.isDrawing = false;
    this.boundsSet = false;
  }

  /**
   * Set the canvas size to limit the selection
   * @param {Integer} canvasWidth: Width of the canvas in pixels
   * @param {Integer} canvasHeight: Height of the canvas in pixels
   */
  setCanvasSize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Set the start coordinates, usually on mouse-down
   * @param {Integer} startX: Start coordinate in x
   * @param {Integer} startY: Start coordinate in y
   */
  setStart(startX, startY) {
    this.startX = startX;
    this.startY = startY;
    this.calculateBounds();
  }

  /**
   * Set the end coordinates, usually on mouse-move
   * @param {Integer} currentX: End coordinate in x
   * @param {Integer} currentY: End coordinate in y
   */
  setEnd(currentX, currentY) {
    this.currentX = currentX;
    this.currentY = currentY;
    this.calculateBounds();
  }

  /**
   * Reset the start and stop coordinates
   */
  reset() {
    this.startX = '';
    this.startY = '';
    this.currentX = '';
    this.currentY = '';
    this.bounds = undefined;
    this.boundsSet = false;
  }

  /**
   * Set rectangle according to the filters set in the `Filter` object.
   * @param {String} dimensionX: Name of X dimension
   * @param {String} dimensionY: Name of Y dimension
   * @param {Function} xScale: xScale function mapping X dimension space to pixel space
   * @param {Function} yScale yScale function mapping Y dimension space to pixel space
   * @param {Filter} filter: Filter object
   */
  setRectangleByFilter(
    dimensionX,
    dimensionY,
    xScale,
    yScale,
    filter,
    xTransformation,
    yTransformation,
  ) {
    if (!this.isDrawing) {
      // Reset the current drawing
      this.reset();
      const filterX = filter.getFilterOfDimension(dimensionX);
      const filterY = filter.getFilterOfDimension(dimensionY);
      let minDefault = 0,
        maxXDefault = this.canvasWidth,
        maxYDefault = this.canvasHeight;
      let minX = minDefault,
        maxX = maxXDefault;
      let minY = minDefault,
        maxY = maxYDefault;
      if (filterX.length > 0) {
        // Iterate over filter
        for (const i in filterX) {
          const value = applyTransformation(filterX[i].value, xTransformation);
          if (filterX[i].operator === '<') maxX = xScale(value);
          else if (filterX[i].operator === '>') {
            minX = xScale(value);
          }
        }
      }
      if (filterY.length > 0) {
        // Iterate over filter
        for (const i in filterY) {
          const value = applyTransformation(filterY[i].value, yTransformation);
          if (filterY[i].operator === '<') minY = yScale(value);
          else if (filterY[i].operator === '>') {
            maxY = yScale(value);
          }
        }
      }

      // If all values do not correspond to the default values, draw the rectangle
      if (
        minX !== minDefault ||
        maxX !== maxXDefault ||
        minY !== minDefault ||
        maxY !== maxYDefault
      ) {
        this.setStart(minX, minY);
        this.setEnd(maxX, maxY);
      }
    }
  }

  /**
   * Calculate bounds of rectangle.
   */
  calculateBounds() {
    // If start or end positions are not set, return nothing
    if (this.startX === '' || this.startY === '' || this.currentX === '' || this.currentY === '') { return; }
    let x = 0;
    let width = 0;
    let y = 0;
    let height = 0;
    if (this.currentX > this.startX) {
      x = this.startX;
      width = this.currentX - this.startX;
    } else {
      x = this.currentX;
      width = this.startX - this.currentX;
    }

    if (this.currentY > this.startY) {
      y = this.startY;
      height = this.currentY - this.startY;
    } else {
      y = this.currentY;
      height = this.startY - this.currentY;
    }

    // Limit maximum size
    if (x + width > this.canvasWidth) {
      width = this.canvasWidth - x;
    }
    if (y + height > this.canvasHeight) {
      height = this.canvasHeight - y;
    }

    // Limit minimum size
    if (x < 0) {
      width -= Math.abs(x);
      x = 0;
    }
    if (y < 0) {
      height -= Math.abs(y);
      y = 0;
    }

    // Handle negative x and width
    if (width < 0 || height < 0) return;

    // Set global bounds to be used for filtering
    this.bounds = { minX: x, maxX: x + width, minY: y, maxY: y + height };
    this.boundsSet = true;
  }

  /**
   * Get the rectangle SVG element
   * @return {HTML} rectangle
   */
  getRectangle() {
    if (this.boundsSet) {
      return (
        <rect
          x={this.bounds.minX}
          y={this.bounds.minY}
          width={this.bounds.maxX - this.bounds.minX}
          height={this.bounds.maxY - this.bounds.minY}
          style={styleSheet.rectangle}
        />
      );
    }
  }
}

export default SelectionRectangle;
