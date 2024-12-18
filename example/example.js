import { UIBlock } from "../../Elementa";
import { GuiManager, ElementTypes } from "../../SimpleOverlays";
import { BaseElement } from "../elements/baseElement";

/**
 * This is the manager, the only thing you'll ever need to use this library
 * It has a few parameters:
 * Module Name, Save file path, Open Command, A thing called ElementTypes, bgColor, and as many aliases for the command you like
 */
const manager = new GuiManager("SimpleOverlays", "example/example.json", "simpleoverlay", undefined, undefined, "so", "test")

//This library supports 2 ways of creating elements, through the json file or through code:

/**CODE
 * This will create an element to be rendered on screen
 * The element consists of a key, type, x, y, width, height, scale, scaling mode, and the data
 * 
 * There are 4 types of scaling accepted, X, Y, BOTH and NONE:
 * X will only scale the Width when scrolled
 * Y will only scale the Height when scrolled
 * BOTH will scale Width and Height when scrolled
 * NONE will not scale with width and height
 * 
 * The data parameter will vary from element to element, this library currently supports 3 elements,
 * which have their accepted data kinds as the following:
 * CTText - Accepts a string as their data corresponding to the text
 * CTImage - Accepts an Objectified NBT or a CT Item
 * Image - Accepts a string, which is the path to the image
 * 
 * Elements created through code will only be created if the key does not exist.
 */
manager.createElement("testItem", "CTItem", true, 0, 0, 10, 10, 1, "BOTH", new Item("minecraft:emerald"))

/**JSON
 * The other way to create the elements is through the Save file json
 * They follow a simple structure that represent the same parameters as CreateElement,
 * Here's an example of the same element as above:
 */
const example = 
{
    "testItem": {
        "type": "CTItem",
        "x": 0,
        "y": 0,
        "width": 10,
        "height": 10,
        "scale": 1,
        "scalingMode": "BOTH",
        "data": {
            "id": "minecraft:emerald",
            "Count": 1,
            "Damage": 0
        }
    }
}

/**
 * You can also modify an element's data through the manager,
 * useful when you need to change it based on other events.
 */
manager.updateElementData("testItem", new Item("minecraft:diamond"))

/**
 ** Now on how to create Custom Elements:
 * You'll need to make a custom ElementTypes object and a custom class,
 * this class must inherit the BaseElement Class found on SimpleOverlays/elements/BaseElement.js
 * See an example below:
 */

//Create a custom class
class ExampleNewElement extends BaseElement {
    /**
     * Your custom class Element, keep in mind the constructor must have these parameters
     * @param {str} key
     * @param {float} X 
     * @param {float} Y 
     * @param {float} width 
     * @param {float} height 
     * @param {str} scalingMode Y for vertical, X for horizontal, BOTH for both, NONE for no scaling
     * @param {Object|Item} data The data in the form of an objectified NBT tag or a CT Item
     * @param {GuiManager} manager The GuiManager Object
     */
    constructor(key = "", enabled = true, X = 0, Y = 0, width = 20, height = 20, scale = 1, scalingMode = 'BOTH', data, manager) {
        super(key, enabled, X, Y, width, height, scale, scalingMode, data, manager)

        /**
         *!Constant that must be changed when making custom elements
         * This constant refers to the type on the ElementTypes, it must have the same name here as it
         * has on the ElementTypes.
        */
        this.type = "ExampleNew"

        this.newThing = new UIBlock()
        /**
         * By default the bounding box is the base of an element, it has different width and height
         * behaviour depending on scaling mode, with the side that's not being scaled being a 
         * childBasedSizeConstraint.
         * 
         * The width and height must be in an agreement with the boundingBox's constraints
         * so (100).percent() will not work on the childBasedSizeConstraint, which means this
         * UIComponent will work in the BOTH scaling mode but not on the X, Y or NONE modes
         */
        .setWidth((100).percent())
        .setHeight((100).percent())
        .setChildOf(this.boundingBox)
    }

    /**
     * This is a function you can use, it is called for every element before its rendered on the renderOverlay Register
     * but will not be ran when the UI is on the moving state
     * Use this as you please to add custom behaviour to your elements.
     */
    onDraw() {

    }

    /**
     * This method is built in the BaseElement and may need to be modified if you want to be able to use the
     * manager.updateElementData() function, by default it only replaces the this.data to what has been sent
     * and saves it to the JSON file
     * @param {any} data 
     */
    setData(data) {
        //Do your code here
        super.setData(data)
    }
}

//Create a new Element Types with the new Object Included
const newElementTypes = Object.assign(ElementTypes, {
    ExampleNew: ExampleNewElement
})

/**
 * Now after all these steps just create a manager using your newElementTypes
 */
const newManager = new GuiManager("SimpleOverlays", "example/example.json", "simpleoverlay", newElementTypes, undefined, "so", "test")

/**
 * You may want to delete an element too so you can do that with the deleteElement(name)
 */
newManager.deleteElement("Insert the key name here")

/**
 * There are other functions for the manager, you can check its code for them, these are the more relevant information bits you'll
 * probably need.
 */