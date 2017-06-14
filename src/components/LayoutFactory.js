class LayoutFactory {
  constructor() {
    this.windowWidth = -1;
    this.windowHeight = -1;
    this.smallMultiplesCount = 0;
    // This is estimated roughly by all the padding settings there are horizontal in the app.
    // This could easily change during the development.
    this.heigthPadding = 120;
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
    // TODO: Fix the formula for the small multiples!
    // TODO: Put Gutter width into the App
    this.heights.mainView =         this.windowHeight - this.staticElementsHeights.header - this.staticElementsHeights.table - this.heigthPadding;
    this.heights.smallMultiples = ((this.windowHeight - this.staticElementsHeights.header - this.staticElementsHeights.table - this.heigthPadding - (16 * Math.floor(this.smallMultiplesCount / 2) - 16)) / Math.ceil(this.smallMultiplesCount / 2));
    if (debug) {
      console.log(`MainView height: ${this.heights.mainView}, SmallMultiplesHeight: ${this.heights.smallMultiples}`);
      console.log("this.heights.mainView = this.windowHeight - this.staticElementsHeights.header - this.staticElementsHeights.table - this.heigthPadding");
      console.log(`${this.heights.mainView} = ${this.windowHeight} - ${this.staticElementsHeights.header} - ${this.staticElementsHeights.table} - ${this.heigthPadding};`);
    }
  }
}

export default LayoutFactory;