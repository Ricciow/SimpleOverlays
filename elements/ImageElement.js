import { BaseElement } from "./baseElement";
import { UIImage } from "../../Elementa";

export class ImageElement extends BaseElement {

    /**
     * Your ChatTriggers Text Element
     * @param {str} key
     * @param {float} X 
     * @param {float} Y 
     * @param {float} width 
     * @param {float} height 
     * @param {str} scalingMode Y for vertical, X for horizontal, BOTH for both, NONE for no scaling
     * @param {any} data The data in the form of a string containing its path relative to the module's folder
     * @param {GuiManager} manager The GuiManager Object
     */
    constructor(key = "", X = 0, Y = 0, width = 20, height = 20, scale = 1, scalingMode = 'BOTH', data, manager) {

        super(key, X, Y, width, height, scale, scalingMode, data, manager)

        //! Constant that must be changed when making custom elements
        this.type = "Image"

        let file = new java.io.File(Config.modulesFolder + "\\" + this.manager.module + "\\" + data)
        console.log(file)
        this.imageElement = new UIImage.ofFile(file)
        .setChildOf(this.boundingBox)

        switch(this.scalingMode) {
            case "X":
                this.imageElement
                .setWidth((100).percent())
                .setHeight(this.height.pixels())
                break;
            case "Y":
                this.imageElement
                .setWidth(this.width.pixels())
                .setHeight((100).percent())
                break;
            case "BOTH":
                this.imageElement
                .setWidth((100).percent())
                .setHeight((100).percent())
                break;
            default:
                this.imageElement
                .setWidth(this.width.pixels())
                .setHeight(this.height.pixels())
                break;
        }
    }
}