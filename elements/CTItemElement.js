import { BaseElement } from "./baseElement";
import { AspectConstraint, UIBlock } from "../../Elementa";

const MCItemStack = Java.type("net.minecraft.item.ItemStack");

export class CTItemElement extends BaseElement {

    /**
     * Your Chattriggers Item Element
     * @param {str} key
     * @param {float} X 
     * @param {float} Y 
     * @param {float} width 
     * @param {float} height 
     * @param {str} scalingMode Y for vertical, X for horizontal, BOTH for both, NONE for no scaling
     * @param {Object|Item} data The data in the form of an objectified NBT tag or a CT Item
     * @param {GuiManager} manager The GuiManager Object
     */
    constructor(key = "", X = 0, Y = 0, width = 20, height = 20, scale = 1, scalingMode = 'BOTH', data, manager) {

        if(data instanceof Item) {
            data = data.getNBT().toObject()
        }
        
        //Due to the Nature of this Element, scalingMode will forced to Y
        super(key, X, Y, width, height, scale, scalingMode, data, manager)

        //! Constant that must be changed when making custom elements
        this.type = "CTItem"

        this.item = this.itemFromData()

        // Making a custom UIBlock with Chattrigger's Item drawing functionalities
        const outerThis = this
        this.itemElement = new JavaAdapter(UIBlock, {
            draw() {
                Tessellator.pushMatrix()
                outerThis.item.draw(this.getLeft(), this.getTop(), this.getHeight() / 16);
                Tessellator.popMatrix()
            }
        })
        .setHeight(new AspectConstraint(1))
        .setWidth((100).percent())
        .setChildOf(this.boundingBox)
    }

    itemFromData() {
        if(Object.keys(this.data).length > 0) {
            return new Item(MCItemStack.func_77949_a(NBT.parse(this.data).rawNBT))
        }
        let item = new Item("minecraft:dirt")
        this.data = item.getNBT().toObject()
        return item
    }
}

