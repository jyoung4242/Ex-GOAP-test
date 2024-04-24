import { ActionCompleteEvent, EaseTo, EasingFunctions, Vector } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate } from "../GOAP";
import { playerState, world } from "../World/world";
import { player } from "../../Actors";

const myAction = (player: GoapAgent, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    const actionSub = player.events.on("actioncomplete", (e: ActionCompleteEvent) => {
      if (e.target === player && e.action instanceof EaseTo) {
        actionSub.close();
        resolve();
      }
    });
    player.actions.easeTo(new Vector(world.tree2Position.x - 20, world.tree2Position.y - 20), 1500, EasingFunctions.EaseInOutQuad);
  });
};

const distance = (world: actionstate): number => {
  return world.playerPosition.distance(world.tree2Position);
};

const actionConfig: GoapActionConfig = {
  name: "mtTree2",
  cost: distance(world),
  effect: world => {
    world.playerPosition = new Vector(world.tree2Position.x - 20, world.tree2Position.y - 20);
    world.playerState = playerState.movingToTree2;
  },
  precondition: world => {
    return (
      world.player <= 5 &&
      world.playerPosition.distance(world.tree2Position) > 30 &&
      world.campfire <= 10 &&
      (world.playerState === playerState.feedingFire || world.playerState === playerState.idle)
    );
  },
  action: myAction,
  entity: player,
};

export const moveToTree2Action = new GoapAction(actionConfig);
