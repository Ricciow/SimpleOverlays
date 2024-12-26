import {
    CenterConstraint,
    UIBlock,
    WindowScreen
} from "../Elementa";

import { Color, invisibleColor } from "./constants"
import { BaseElement } from "./elements/baseElement";
import { CTItemElement } from "./elements/CTItemElement";
import { CTTextElement } from "./elements/CTTextElement";
import { ImageElement } from "./elements/ImageElement";

export const ElementTypes = {
    Base: BaseElement,
    CTText: CTTextElement,
    CTItem: CTItemElement,
    Image: ImageElement
}

export class GuiManager {
    constructor(moduleName, filename, moveCommand, elementTypes = ElementTypes, bgColor = new Color(0, 0, 0, 120/255), ...aliases) {
        this.module = moduleName
        this.filename = filename

        this.Screen = new JavaAdapter(WindowScreen, {
            init() {
                return this.getWindow()
            }
        }, true, false);

        this.window = this.Screen.init()

        this.elementTypes = elementTypes

        this.elements = {}

        this.elementsData = {}

        this.moving = false

        this.bgColor = bgColor

        //Select Multiple Stuff Block
        this.dragStart = {x: 0, y: 0}

        this.isDragging = false

        this.selectArea = new UIBlock()
        .setColor(new Color(0.75, 0.75, 0.75, 0.5))
        
        //Moving Children Stuff
        this.selectedChildren = []
        this.clickedChildren = false

        this.background = new UIBlock()
        .setColor(invisibleColor)
        .setWidth((100).percent())
        .setHeight((100).percent())
        .setX(new CenterConstraint)
        .setY(new CenterConstraint)
        .onMouseClick((comp, event) => {
            this.clickedChildren = false
            this.background.children.forEach((child) => {
                if(this.clickedChildren) return 

                //Top left corner
                let x1 = child.getLeft()
                let y1 = child.getTop()
                //Bottom right corner
                let x2 = child.getRight()
                let y2 = child.getBottom()
                
                if(x1 < event.absoluteX && event.absoluteX < x2) {
                    if(y1 < event.absoluteY && event.absoluteY < y2) {
                        this.clickedChildren = true
                    }
                }
            })

            if(!this.clickedChildren) {
                this.selectedChildren.forEach((child) => {
                    child.setColor(new Color(1, 1, 1, 0.5))
                })
                this.selectedChildren = []
            }
            
            if(this.selectedChildren.length == 0 && !this.clickedChildren) {
                //Start Dragging
                this.isDragging = true;
                this.dragStart.x = event.absoluteX;
                this.dragStart.y = event.absoluteY;
                //Position the UIBlock for selection
                this.selectArea.setX(this.dragStart.x.pixels())
                this.selectArea.setY(this.dragStart.y.pixels())
                this.selectArea.setWidth((0).pixels())
                this.selectArea.setHeight((0).pixels())
                this.selectArea.unhide(true)
            }
        })
        .onMouseRelease(() => {
            if(this.selectedChildren.length == 0 && !this.clickedChildren) {
                //Stop Dragging
                this.isDragging = false;
                let selectArea = {
                    x1 : this.selectArea.getLeft(), 
                    y1 : this.selectArea.getTop(),
    
                    x2 : this.selectArea.getRight(),
                    y2 : this.selectArea.getBottom()
                }
    
                this.background.children.forEach((child) => {
                    let childArea = {
                        x1 : child.getLeft(), 
                        y1 : child.getTop(),
        
                        x2 : child.getRight(),
                        y2 : child.getBottom()
                    }
                    

                    if (!(selectArea.x2 < childArea.x1 || selectArea.x1 > childArea.x2 || selectArea.y2 < childArea.y1 || selectArea.y1 > childArea.y2)) {
                        if(child != this.selectArea) {
                            this.selectedChildren.push(child)
                            child.setColor(new Color(0.75, 0.75, 0.75, 0.5))
                        }
                    }
                })
                this.selectArea.hide()
            }
        })
        .onMouseDrag((comp, mx, my) => {
            if(this.selectedChildren.length == 0 && !this.clickedChildren) {
                //Dragging
                if (!this.isDragging) return;
                const absoluteX = mx + comp.getLeft();
                const absoluteY = my + comp.getTop();
    
                const dx = absoluteX - this.dragStart.x;
                const dy = absoluteY - this.dragStart.y;
            
                if(dx > 0 && dy > 0) {
                    this.selectArea.setX(this.dragStart.x.pixels())
                    this.selectArea.setY(this.dragStart.y.pixels())
                    this.selectArea.setWidth(dx.pixels())
                    this.selectArea.setHeight(dy.pixels())
                }
                else if(dx > 0) {
                    //Dx positive Dy negative
                    this.selectArea.setX(this.dragStart.x.pixels())
                    this.selectArea.setY((this.dragStart.y + dy).pixels())
                    this.selectArea.setWidth(dx.pixels())
                    this.selectArea.setHeight((-dy).pixels())
                }
                else if(dy > 0) {
                    //Dy positive Dx negative
                    this.selectArea.setX((this.dragStart.x + dx).pixels())
                    this.selectArea.setY(this.dragStart.y.pixels())
                    this.selectArea.setWidth((-dx).pixels())
                    this.selectArea.setHeight(dy.pixels())
                }
                else {
                    this.selectArea.setX((this.dragStart.x + dx).pixels())
                    this.selectArea.setY((this.dragStart.y + dy).pixels())
                    this.selectArea.setWidth((-dx).pixels())
                    this.selectArea.setHeight((-dy).pixels())
                }
            }
        })
        .setChildOf(this.window)
        
        this.selectArea
        .setChildOf(this.background)
        .hide()

        this.command = register("command", () => {
            this.open()
        }).setName(moveCommand)

        if(aliases) {
            this.command.setAliases(aliases)
        }

        register('renderOverlay', () => {
            if(!this.moving) {
                Object.values(this.elements).forEach((element) => {
                    element.onDraw()
                })
                this.window.draw()
            }
        })

        register("guiClosed", (gui) => {
            if(gui.toString() == this.Screen.toString()) {
                this.close()
            }
        })

        this.loadData()
        this.createElements()
    }

    /**
     * Set the command to open the moving UI
     * @param {str} command 
     * @param  {...str} aliases 
     */
    setMoveCommand(command, ...aliases) {
        this.command.setName(command)
        if(aliases) {
            this.command.setAliases(aliases)
        }
    }

    /**
     * Used to allow the moving state of the Elements, meant for internal use.
     */
    open() {
        this.moving = true
        this.background.setColor(this.bgColor)
        Object.values(this.elements).forEach((element) => {
            element.open()
        })
        GuiHandler.openGui(this.Screen)
    }

    /**
     * Used to disable the moving state of the Elements, meant for internal use.
     */
    close() {
        this.moving = false
        Object.values(this.elements).forEach((element) => {
            element.close()
        })
        this.background.setColor(invisibleColor)
        this.saveData()
    }

    /**
     * Reads the data from the json file ../modulename/filename
     */
    loadData(){
        this.elementsData = JSON.parse(FileLib.read(this.module, this.filename))??{}
    }
    
    /**
     * Saves the data to the json file ../modulename/filename
     */
    saveData(){
        FileLib.write(this.module, this.filename, JSON.stringify(this.elementsData, null, 4))
    }

    /**
     * Creates elements from the currently known data 
    */
    createElements(){
        Object.keys(this.elementsData).forEach((key) => {
            let data = this.elementsData[key]
            this.addElement(key, data.type, data.enabled, data.x, data.y, data.width, data.height, data.scale, data.scalingMode, data.data)
        })
    }

    /**
     * Add an element to the Overlay, meant for internal use
     * @param {str} elementName 
     * @param {str} type 
     * @param {float} x 
     * @param {float} y 
     * @param {float} width 
     * @param {float} height 
     * @param {float} scale 
     * @param {"X"|"Y"|"BOTH"|"NONE"} scalingMode 
     * @param {...any} data 
     */
    addElement(elementName, type, enabled, x, y, width, height, scale, scalingMode, data) {
        let Element = this.elementTypes[type]
        if(Element) {
            let newElement = new Element(elementName, enabled, x, y, width, height, scale, scalingMode, data, this)
            this.elements[elementName] = newElement
            newElement.setChildOf(this.background)
        }
    }
    
    /**
     * Deletes an element from the Overlay and removes it from the data.
     * @param {str} elementName 
     */
    deleteElement(elementName) {
        this.elements[elementName]?.deleteElement()
        delete this.elements[elementName]
        delete this.elementsData[elementName]
        this.saveData()
    }

    /**
     * Creates an element, adding it to the overlay and to the save data, only creates it if it doesnt exist already.
     * @param {str} elementName 
     * @param {str} type 
     * @param {float} x 
     * @param {float} y 
     * @param {float} width 
     * @param {float} height 
     * @param {float} scale 
     * @param {"X"|"Y"|"BOTH"|"NONE"} scalingMode
     * @param {...any} data 
     */
    createElement(elementName, type, enabled, x, y, width, height, scale, scalingMode, data) {
        if(!Object.keys(this.elements).includes(elementName)) {
            this.addElement(elementName, type, enabled, x, y, width, height, scale, scalingMode, data)
            this.updateElementInfo(elementName)
        }
    }
    
    /**
     * Creates an element, adding it to the overlay and to the save data, replaces old element if it exists already.
     * @param {str} elementName 
     * @param {str} type 
     * @param {float} x 
     * @param {float} y 
     * @param {float} width 
     * @param {float} height 
     * @param {float} scale 
     * @param {"X"|"Y"|"BOTH"|"NONE"} scalingMode
     * @param {...any} data 
     */
    replaceElement(elementName, type, enabled, x, y, width, height, scale, scalingMode, data) {
        this.elements[elementName]?.deleteElement()
        this.addElement(elementName, type, enabled, x, y, width, height, scale, scalingMode, data)
        this.updateElementInfo(elementName)
    }

    /**
     * Updates an element
     * @param {str} elementName The Name defined for that element
     * @param {float|null} x The x position
     * @param {float|null} y The y position
     * @param {float|null} width 
     * @param {float|null} height
     * @param {float|null} scale The scale multiplier
     * @param {float|null} scalingMode The Scaling Mode
     * @param {float|null} data The data of that element
     */
    updateElement(elementName, enabled, x, y, width, height, scale, scalingMode, data) {
        let element = this.getElement(elementName)
        if(element) {
            if(typeof enabled === 'boolean') element.enabled = enabled
            if(x || x === 0) element.x = x
            if(y || y === 0) element.y = y
            if(width || width === 0) element.width = width;
            if(height || height === 0) element.height = height;
            if(scale || scale === 0) element.scale = scale;
            if(scalingMode) element.scalingMode = scalingMode;
            if(data) element.data = data;
            this.updateElementInfo(elementName)
        }
    }

    /**
     * Updates an element's data internally
     * @param {str} elementName The Name defined for that element
     */
    updateElementInfo(elementName) {
        let element = this.getElement(elementName)
        if(element) {
            this.elementsData[elementName] = {
                type: element.type,
                enabled: element.enabled,
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                scale: element.scale,
                scalingMode: element.scalingMode,
                data: element.data
            }
            element.updateState()
        }
    }

    /**
     * Updates an element's data
     * @param {str} elementName The Name defined for that element
     */
    updateElementData(elementName, data) {
        let element = this.getElement(elementName)
        if(element) {
            element.setData(data)
        }
    }


    /**
     * Returns an element's object
     * @param {str} elementName The Name defined for that element
     */
    getElement(elementName) {
        return this.elements[elementName]
    }

    /**
     * Returns an element's data
     * @param {str} elementName The Name defined for that element
     */
    getElementData(elementName) {
        return this.getElement(elementName).data
    }

    /**
     * Returns an array of all keys for the elements.
     */
    getElementKeys() {
        return Object.keys(this.elements)
    }
}