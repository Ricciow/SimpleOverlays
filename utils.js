import { UIText } from "../Elementa"

export function UICTText(textPlaceholder) {
    let text = new Text("")

    return new JavaAdapter(UIText, {
        draw() {
            Tessellator.pushMatrix()
            text.setString(this.getText()).setShadow(this.getShadow()).setScale(1)
            text.setScale(this.getHeight()/text.getHeight())
            LongestLine = Math.max(...text.getLines().map((line) => Renderer.getStringWidth(line) * text.getScale()))
            this.setWidth((LongestLine).pixels())
            text.draw(this.getLeft(), this.getTop())
            Tessellator.popMatrix()
    }
    }).setText(textPlaceholder)
}

class ModifiableItem extends Item {
    constructor(itemstack) {
        super(itemstack)
    }

    /**
     * Change the Item
     * @param {MCTItemStack} itemstack 
     */
    changeItem(itemstack) {
        this.item = itemstack.item
        this.itemstack = itemstack
    }
}

