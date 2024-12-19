import { ChildBasedSizeConstraint, UIBlock } from "../../Elementa";
import { invisibleColor, Color } from "../constants";

export class BaseElement {
    /**
     * Your basic Element
     * @param {str} key
     * @param {float} X 
     * @param {float} Y 
     * @param {float} width 
     * @param {float} height 
     * @param {str} scalingMode Y for vertical, X for horizontal, BOTH for both, NONE for no scaling
     * @param {any} data 
     * @param {GuiManager} manager The GuiManager Object
     */
    constructor(key = "", enabled = true, X = 0, Y = 0, width = 20, height = 20, scale = 1, scalingMode = 'X', data, manager) {

        this.key = key

        this.enabled = enabled
        //! Constant that must be changed when making custom elements
        this.type = "Base"

        this.isDragging = false;

        this.dragOffset = {x: 0, y: 0}

        this.width = width

        this.height = height

        this.x = X

        this.y = Y

        this.scale = scale

        this.scalingMode = scalingMode

        this.data = data

        this.manager = manager

        this.boundingBox = new UIBlock()
        .setColor(invisibleColor)
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
            //Dragging
            if (!this.isDragging) return;
            const absoluteX = mx + comp.getLeft();
            const absoluteY = my + comp.getTop();

            const dx = absoluteX - this.dragOffset.x;
            const dy = absoluteY - this.dragOffset.y;
        
            this.dragOffset.x = absoluteX;
            this.dragOffset.y = absoluteY;

            this.x = this.boundingBox.getLeft() + dx;
            this.y = this.boundingBox.getTop() + dy;

            this.updateState(true)
        })
        .onMouseScroll((comp, event) => {
            //Change Scale
            this.scale = Math.max(Math.round((this.scale + (Math.max(this.scale * 0.1, 0.1)) * event.delta)*10)/10, 0.1);
            this.updateState(true)
        })

        this.updateState()
    }

    setData(data) {
        this.data = data
        this.manager.updateElementInfo(this.key)
    }

    /**
    * Updates Both Position and Width/Height
    * @param {boolean} updateData should the data in the manager be updated
    **/
    updateState(updateData = false) {
        this.updateEnabled()
        this.updatePos()
        this.updateWidth()
        if(updateData) this.manager.updateElementInfo(this.key)
    }

    updateEnabled() {
        if(this.boundingBox.hasParent) {
            if(this.enabled) {
                this.unhide()
            }
            else {
                this.hide()
            }
        }
    }

    /**
     * Updates the Width/Height
     */
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
            default:
                this.boundingBox
                .setWidth(new ChildBasedSizeConstraint)
                .setHeight(new ChildBasedSizeConstraint)
                break;
        }
    }

    /**
     * Updates the X and Y Coordinates
     */
    updatePos() {
        this.boundingBox
        .setX(this.x.pixels())
        .setY(this.y.pixels())
    }

    /**
     * Method ran just before the window is drawn
     */
    onDraw() {
       
    }

    /**
     * Method ran when opening the move menu, meant for internal use
     */
    open() {
        this.boundingBox.setColor(new Color(1, 1, 1, 0.5))
    }

    /**
     * Method ran when closing the move menu, meant for internal use
     */
    close() {
        this.boundingBox.setColor(invisibleColor)
    }

    /**
     * Method that returns the boundingBox of the element
     */
    getBoundingBox() {
        return this.boundingBox
    }
    
    /**
     * Method that deletes this element, only removes the elementa object, use the GuiManager if you want to remove an item
     */
    deleteElement() {
        this.boundingBox.getParent().removeChild(this.boundingBox)
    }

    hide() {
        this.boundingBox.hide()
    }

    unhide() {
        this.boundingBox.unhide(true)
    }

    setChildOf(element) {
        this.boundingBox.setChildOf(element)
    }
}