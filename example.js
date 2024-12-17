//Reserved For Testing
import { GuiManager } from "../SimpleOverlays";
import { CTItemElement } from "./elements/CTItemElement";

const manager = new GuiManager("SimpleOverlays", "test.json", "simpleoverlay", undefined, undefined, "so", "test")

manager.createElement("testItem", "CTItem", 0, 0, 10, 10, 1, "BOTH", new Item("minecraft:emerald"))