class LayoutFactory {
  constructor(gutterSize) {
    this.windowWidth = -1;
    this.windowHeight = -1;
    this.smallMultiplesCount = 0;
    // This is estimated roughly by all the padding settings there are horizontal in the app.
    // This could easily change during the development.
    this.heigthPadding = 120;
    this.gutterSize = gutterSize;
    this.staticElementsHeights = {
      table: 500,
      header: 64
    };
    this.heights = {
      mainView: -1,
      smallMultiples: -1
    }
  }

  updateWindowSize(windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    this.updateHeights()
  }
  updateSmallMultiplesCount(smallMultiplesCount) {
    this.smallMultiplesCount = smallMultiplesCount;
    this.updateHeights()
  }
  increaseSmallMultiplesCount() {
    this.smallMultiplesCount++;
    this.updateHeights()
  }
  decreaseSmallMultiplesCount() {
    this.smallMultiplesCount--;
    this.updateHeights()
  }

  updateHeights(debug = false) {
    this.heights.mainView =         this.windowHeight - this.staticElementsHeights.header - this.staticElementsHeights.table - this.heigthPadding;
    const numTileRows = Math.ceil(this.smallMultiplesCount / 2);
    // Added +9 to account for pixels added through the "Paper" component
    this.heights.smallMultiples = (this.heights.mainView + 9 - (this.gutterSize * numTileRows)) / numTileRows;
    if (debug) {
      console.log(`numTileRows: ${numTileRows}, gutterSize: ${this.gutterSize}`);
      console.log(`MainView height: ${this.heights.mainView}, SmallMultiplesHeight: ${this.heights.smallMultiples}`);
      console.log("this.heights.smallMultiples = (this.heights.mainView - (this.gutterSize * numTileRows)) / numTileRows");
      console.log(`${this.heights.smallMultiples} = (${this.heights.mainView} - (${this.gutterSize} * ${numTileRows})) / ${numTileRows}`);
    }
  }
}

export default LayoutFactory;