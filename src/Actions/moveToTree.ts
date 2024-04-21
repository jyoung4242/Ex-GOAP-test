import { ActionCompleteEvent, EaseTo, EasingFunctions, Vector } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate } from "../GOAP";
import { world } from "../world";
import { player } from "../Actors";

const myAction = (player: GoapAgent, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    const actionSub = player.events.on("actioncomplete", (e: ActionCompleteEvent) => {
      if (e.target === player && e.action instanceof EaseTo) {
        actionSub.close();
        resolve();
      }
    });
    player.actions.easeTo(new Vector(world.treePosition.x - 20, world.treePosition.y - 20), 1500, EasingFunctions.EaseInOutQuad);
  });
};

const actionConfig: GoapActionConfig = {
  name: "mtTree",
  cost: 5,
  effect: world => {
    world.playerPosition = new Vector(world.treePosition.x - 20, world.treePosition.y - 20);
  },
  precondition: world => {
    return world.player <= 5 && world.playerPosition.distance(world.treePosition) > 30 && world.campfire == 0 && world.time == 0;
  },
  action: myAction,
  entity: player,
};

export const moveToTreeAction = new GoapAction(actionConfig);
