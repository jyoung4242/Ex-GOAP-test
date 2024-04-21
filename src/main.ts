import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, KeyEvent, Debug, TestClock } from "excalibur";
import { player, fire, tree } from "./Actors";
import { waitAction, moveToFireAction, moveToTreeAction, feedFireAction, collectWoodAction, resetAction } from "./Actions";

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
});

await game.start();
game.add(tree);
game.add(fire);
game.add(player);
player.goapActions = [feedFireAction, collectWoodAction, moveToTreeAction, moveToFireAction, waitAction, resetAction];
player.initialize();
player.isRunning = true;
