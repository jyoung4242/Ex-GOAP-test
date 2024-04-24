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
    player.actions.easeTo(new Vector(world.tree3Position.x - 20, world.tree3Position.y - 20), 1500, EasingFunctions.EaseInOutQuad);
  });
};

const distance = (world: actionstate): number => {
  return world.playerPosition.distance(world.tree3Position);
};

const actionConfig: GoapActionConfig = {
  name: "mtTree3",
  cost: distance(world),
  effect: world => {
    world.playerPosition = new Vector(world.tree3Position.x - 20, world.tree3Position.y - 20);
    world.playerState = playerState.movingToTree3;
  },
  precondition: world => {
    return (
      world.player <= 5 &&
      world.playerPosition.distance(world.tree3Position) > 30 &&
      world.campfire <= 10 &&
      (world.playerState === playerState.feedingFire || world.playerState === playerState.idle)
    );
  },
  action: myAction,
  entity: player,
};

export const moveToTree3Action = new GoapAction(actionConfig);
