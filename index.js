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

export const Elements = {

}

export class GuiManager {
    constructor(moduleName, filename, moveCommand, elements = Elements, bgColor = new Color(0, 0, 0, 120/255), ...aliases) {
        this.module = moduleName
        this.filename = filename
        this.savePath = "../" + moduleName + "/" + filename

        this.Screen = new JavaAdapter(WindowScreen, {
            init() {
                return this.getWindow()
            }
        }, true, false);

        this.window = this.Screen.init()

        this.elements = []

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
                this.window.draw()
            }
        })

        register("guiClosed", (gui) => {
            if(gui.toString() == this.Screen.toString()) {
                this.close()
            }
        })
    }

    setMoveCommand(command, ...aliases) {
        this.command.setName(command)
        if(aliases) {
            this.command.setAliases(aliases)
        }
    }

    open() {
        this.moving = true
        this.background.setColor(this.bgColor)
        this.elements.forEach((element) => {
            element.open()
        })
        GuiHandler.openGui(this.Screen)
    }

    close() {
        this.moving = false
        this.elements.forEach((element) => {
            element.close()
        })
        this.background.setColor(invisibleColor)
    }

    loadData(){

    }
    
    saveData(){
        
    }

    addElement(elementName, type, x, y, ...extra) {

    }

    deleteElement(elementName) {

    }

    /**
     * Updates an element's position
     * @param {str} elementName The Name defined for that element
     * @param {X Constraint} x The X constraint to be defined
     * @param {Y Constraint} y The Y constraint to be defined
     */
    updateElementPos(elementName, x = undefined, y = undefined) {

    }

    /**
     * Updates an element's data
     * @param {str} elementName The Name defined for that element
     */
    updateElementData(elementName) {

    }
}