import {
    AdditiveConstraint,
    animate,
    Animations,
    CenterConstraint,
    ChildBasedMaxSizeConstraint,
    ChildBasedSizeConstraint,
    ConstantColorConstraint,
    FillConstraint,
    ScissorEffect,
    SiblingConstraint,
    SubtractiveConstraint,
    UIBlock,
    UIMultilineTextInput,
    UIText,
    WindowScreen,
    MarkdownComponent,
    Inspector,
    UITextInput,
    RelativeWindowConstraint,
    RelativeConstraint,
    UIRoundedRectangle,
    ScrollComponent,
    UIContainer,
    UIWrappedText
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

        this.background = new UIBlock()
        .setColor(invisibleColor)
        .setWidth((100).percent())
        .setHeight((100).percent())
        .setX(new CenterConstraint)
        .setY(new CenterConstraint)
        .setChildOf(this.window)
        
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
            this.addElement(key, data.type, data.x, data.y, data.width, data.height, data.scale, data.scalingMode, data.data)
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
    addElement(elementName, type, x, y, width, height, scale, scalingMode, data) {
        let Element = this.elementTypes[type]
        if(Element) {
            let newElement = new Element(elementName, x, y, width, height, scale, scalingMode, data, this)
            this.elements[elementName] = newElement
            newElement.setChildOf(this.background)
        }
    }
    
    /**
     * Deletes an element from the Overlay
     * @param {str} elementName 
     */
    deleteElement(elementName) {
        this.elements[elementName]?.deleteElement()
        delete this.elements[elementName]
        delete this.elementsData[elementName]
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
    createElement(elementName, type, x, y, width, height, scale, scalingMode, data) {
        if(!Object.keys(this.elements).includes(elementName)) {
            this.addElement(elementName, type, x, y, width, height, scale, scalingMode, data)
            this.updateElementInfo(elementName)
        }
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
    updateElement(elementName, x, y, width, height, scale, scalingMode, data) {
        let element = this.getElement(elementName)
        if(element) {
            if(x) element.x = x
            if(y) element.y = y
            if(width) element.width = width;
            if(height) element.height = height;
            if(scale) element.scale = scale;
            if(scalingMode) element.scalingMode = scalingMode;
            if(data) element.data = data;
            this.updateElementInfo()
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
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                scale: element.scale,
                scalingMode: element.scalingMode,
                data: element.data
            }
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
}