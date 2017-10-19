class LayoutFactory {
  constructor(spacingSize) {
    this.windowWidth = -1;
    this.windowHeight = -1;
    this.smallMultiplesCount = 0;
    // This is estimated roughly by all the padding settings there are horizontal in the app.
    // This could easily change during the development.
    this.heigthPadding = 120;
    this.spacingSize = spacingSize;
    this.staticElementsHeights = {
      table: 500,
      header: 64,
    };
    this.heights = {
      mainView: -1,
      smallMultiples: -1,
    };
  }

  updateWindowSize(windowWidth, windowHeight) {
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    this.updateHeights();
  }
  setSmallMultiplesCount(smallMultiplesCount) {
    this.smallMultiplesCount = smallMultiplesCount;
    this.updateHeights();
  }
  increaseSmallMultiplesCount() {
    this.smallMultiplesCount += 1;
    this.updateHeights();
  }
  decreaseSmallMultiplesCount() {
    this.smallMultiplesCount -= 1;
    this.updateHeights();
  }

  updateHeights(debug = false) {
    this.heights.mainView =
      this.windowHeight -
      this.staticElementsHeights.header -
      this.staticElementsHeights.table -
      this.heigthPadding;
    const numTileRows = Math.ceil(this.smallMultiplesCount / 2);
    // Weirdly enough the height must be adjusted by a constant factor
    this.heights.smallMultiples =
      // eslint-disable-next-line no-mixed-operators
      (this.heights.mainView + 10 - this.spacingSize * numTileRows) / numTileRows;
    if (debug) {
      console.log('--------------------------------------');
      console.log(`smallMultiplesCount: ${this.smallMultiplesCount}`);
      console.log(`numTileRows: ${numTileRows}, spacingSize: ${this.spacingSize}`);
      console.log(
        `MainView height: ${this.heights.mainView}, SmallMultiplesHeight: ${this.heights
          .smallMultiples}`,
      );
      console.log(
        'this.heights.smallMultiples = (this.heights.mainView - (this.spacingSize * numTileRows)) / numTileRows',
      );
      console.log(
        `${this.heights.smallMultiples} = (${this.heights.mainView} - (${this
          .spacingSize} * ${numTileRows})) / ${numTileRows}`,
      );
    }
  }
}

export default LayoutFactory;
