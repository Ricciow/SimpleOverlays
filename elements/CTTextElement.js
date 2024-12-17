import { BaseElement } from "./baseElement";
import { UICTText } from "../utils";

export class CTTextElement extends BaseElement {

    /**
     * Your ChatTriggers Text Element
     * @param {str} key
     * @param {float} X 
     * @param {float} Y 
     * @param {float} width 
     * @param {float} height 
     * @param {str} scalingMode Y for vertical, X for horizontal, BOTH for both, NONE for no scaling
     * @param {any} data The data in the form of a string
     * @param {GuiManager} manager The GuiManager Object
     */
    constructor(key = "", X = 0, Y = 0, width = 20, height = 20, scale = 1, scalingMode = 'Y', data, manager) {

        //Due to the Nature of this Element, scalingMode will forced to Y
        super(key, X, Y, width, height, scale, scalingMode, data, manager)

        //! Constant that must be changed when making custom elements
        this.type = "CTText"

        //Making a custom UIText with Chattrigger's drawing functionalities
        this.textElement = UICTText(this.data)
        .setHeight((100).percent())
        .setChildOf(this.boundingBox)
    }
}