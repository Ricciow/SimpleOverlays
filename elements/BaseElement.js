import { ChildBasedSizeConstraint, UIBlock} from "../../Elementa";
import { invisibleColor, Color } from "../constants";

export class BaseElement {
    /**
     * Your basic Element
     * @param {float} X 
     * @param {float} Y 
     * @param {float} width 
     * @param {float} height 
     * @param {str} scalingMode Y for vertical, X for horizontal, BOTH for both, NONE for no scaling
     * @param {GuiManager} manager 
     */
    constructor(key = "", X = 0, Y = 0, width = 20, height = 20, scale = 1, scalingMode = 'X', manager) {

        this.key = key

        this.isDragging = false;

        this.dragOffset = {x: 0, y: 0}

        this.width = width

        this.height = height

        this.x = X

        this.y = Y

        this.scale = scale

        this.scalingMode = scalingMode

        this.manager = manager

        this.boundingBox = new UIBlock()
        .setColor(invisibleColor)
        .setX(this.x.pixels())
        .setY(this.y.pixels())
        .onMouseClick((comp, event) => {
            //Start Dragging
            this.isDragging = true;
            this.dragOffset.x = event.absoluteX;
            this.dragOffset.y = event.absoluteY;
        })
        .onMouseRelease(() => {
            //Stop Dragging
            this.isDragging = false;
        })
        .onMouseDrag((comp, mx, my) => {
            //Dragging Features
            if (!this.isDragging) return;
            const absoluteX = mx + comp.getLeft();
            const absoluteY = my + comp.getTop();

            const dx = absoluteX - this.dragOffset.x;
            const dy = absoluteY - this.dragOffset.y;
        
            this.dragOffset.x = absoluteX;
            this.dragOffset.y = absoluteY;

            this.x = this.boundingBox.getLeft() + dx;
            this.y = this.boundingBox.getTop() + dy;

            this.updateState()
        })
        .onMouseScroll((comp, event) => {
            //Change Scale
            this.scale = Math.max(Math.round((this.scale + (Math.max(this.scale * 0.1, 0.1)) * event.delta)*10)/10, 0.1);
            this.updateState()
        })

        this.updateWidth()
    }

    updateState() {
        this.updatePos()
        this.updateWidth()
        this.manager.updateElementData(this.key)
    }

    updateWidth() {
        switch(this.scalingMode) {
            case "X":
                this.boundingBox
                .setWidth((this.width * this.scale).pixels())
                .setHeight(new ChildBasedSizeConstraint)
                break;
            case "Y":
                this.boundingBox
                .setWidth(new ChildBasedSizeConstraint)
                .setHeight((this.height * this.scale).pixels())
                break;
            case "BOTH":
                this.boundingBox
                .setWidth((this.width * this.scale).pixels())
                .setHeight((this.height * this.scale).pixels())
                break;
            case "NONE":
            default:
                .setWidth(new ChildBasedSizeConstraint)
                .setHeight(new ChildBasedSizeConstraint)
                break;
        }
    }

    updatePos() {
        this.boundingBox
        .setX(this.x.pixels())
        .setY(this.y.pixels())
    }

    open() {
        this.boundingBox.setColor(new Color(1, 1, 1, 0.5))
    }

    close() {
        this.boundingBox.setColor(invisibleColor)
    }

    hide() {
        this.boundingBox.hide()
    }

    unhide() {
        this.boundingBox.unhide(true)
    }
}