import { BaseElement } from "./baseElement";
import { UICTText } from "../utils";

export class CTTextElement extends BaseElement {

    constructor(key = "", X = 0, Y = 0, width = 20, height = 20, scale = 1, scalingMode = 'X', data, manager) {

        //Due to the Nature of this Element, scalingMode will forced to X
        super(key, X, Y, width, height, scale, "X", data, manager)

        //! Constant that must be changed when making custom elements
        this.type = "CTText"

        //Making a custom UIText with Chattrigger's drawing functionalities
        this.textElement = UICTText(this.data)
        .setWidth((100).percent())
        .setChildOf(this.boundingBox)
    }
}