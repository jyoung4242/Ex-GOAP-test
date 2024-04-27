import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, Color, EaseTo, Vector, EasingFunctions, Actor } from "excalibur";
import { player, fire, tree, tree2, tree3, bearActor, cabin } from "./Actors";
import {
  moveToFireAction,
  moveToTreeAction,
  feedFireAction,
  collectWoodAction,
  moveToTree2Action,
  moveToTree3Action,
  collectWood2Action,
  collectWood3Action,
} from "./GOAP stuff/Actions";

export class MyEaseTo extends EaseTo {
  UUID: string = "";
  constructor(who: Actor, where: Vector, duration: number, uuid: string) {
    super(who, where.x, where.y, duration, EasingFunctions.EaseInOutQuad);
    this.UUID = uuid;
  }
}

import { runAwayAction } from "./GOAP stuff/Actions/runaway";
import { relaxAction } from "./GOAP stuff/Actions/relax";

const model = {};
const template = `
<style> 
    canvas{ 
        position: fixed; 
        top:50%; 
        left:50%; 
        transform: translate(-50% , -50%); 
    }
</style> 
<div> 
    <canvas id='cnv'> </canvas> 
</div>`;
await UI.create(document.body, model, template).attached;

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
  backgroundColor: Color.fromHex("#3CA03C"),
});

game.timescale = 1.2;
await game.start();
game.add(tree);
game.add(tree2);
game.add(tree3);
game.add(fire);
game.add(player);
game.add(bearActor);
game.add(cabin);

player.goapActions = [
  feedFireAction,
  collectWoodAction,
  moveToTreeAction,
  moveToFireAction,
  moveToTree2Action,
  collectWood2Action,
  moveToTree3Action,
  collectWood3Action,
  runAwayAction,
  relaxAction,
];

player.initialize();
player.startGOAP();
