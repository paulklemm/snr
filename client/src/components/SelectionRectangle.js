import React from 'react';

class SelectionRectangle {
	constructor() {
    this.reset();
	}
	setStart(startX, startY) {
		this.startX = startX;
		this.startY = startY;
  }
  
  setCurrent(currentX, currentY) {
    this.currentX = currentX;
    this.currentY = currentY;
  }

  reset() {
    this.startX = '';
    this.startY = '';
    this.currentX = '';
    this.currentY = '';
  }

	getRectangle() {
		if (this.startX == '' || this.startY == '' || this.currentX == '' || this.currentY == '')
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

    return (<rect x={x} y={y} width={width} height={height} />);
    // return (<rect x={this.startX} y={this.startY} width={this.currentX - this.startX} height={this.currentY - this.startY} />);
	}
}

export default SelectionRectangle;

// startx currentX   x   width
//   20      25     20     5
//   20      10     10