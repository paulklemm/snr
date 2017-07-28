import React from 'react';

// https://www.w3schools.com/graphics/svg_rect.asp
const styleSheet = {
  rectangle: {
    fillOpacity: '0.1'
  }
}

/**
 * Class for building the selection Rectangle
 * Use it by settings start and end coordinates
 */
class SelectionRectangle {
	constructor() {
    this.reset();
    // state variable to store whether the user is currently drawing a rectangle
    this.isDrawing = false;
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
  }
  
  /**
   * Set the end coordinates, usually on mouse-move
   * @param {Integer} currentX: End coordinate in x
   * @param {Integer} currentY: End coordinate in y
   */
  setEnd(currentX, currentY) {
    this.currentX = currentX;
    this.currentY = currentY;
  }

  /**
   * Reset the start and stop coordinates
   */
  reset() {
    this.startX = '';
    this.startY = '';
    this.currentX = '';
    this.currentY = '';
  }

  /**
   * Get the rectangle SVG element
   * @return {HTML} rectangle
   */
	getRectangle() {
		if (this.startX === '' || this.startY === '' || this.currentX === '' || this.currentY === '')
      return
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
      width = width - Math.abs(x);
      x = 0;
    }
    if (y < 0) {
      height = height - Math.abs(y);
      y = 0;
    }

    // Handle negative x and width
    if (width < 0 || height < 0)
      return;

    return (<rect x={x} y={y} width={width} height={height} style={styleSheet.rectangle} />);
	}
}

export default SelectionRectangle;