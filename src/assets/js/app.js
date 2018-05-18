import "babel-polyfill";
import GlobalUi from "./globalUi";

export default class App {
    constructor() {
        new GlobalUi();
    }
}

new App();