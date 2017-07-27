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

    return (<rect x={x} y={y} width={width} height={height} style={styleSheet.rectangle} />);
	}
}

export default SelectionRectangle;