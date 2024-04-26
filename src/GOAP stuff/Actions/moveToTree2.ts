import { ActionCompleteEvent, EaseTo, EasingFunctions, Vector } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate, costCallback } from "../GOAP";
import { playerState, world } from "../World/world";
import { bearActor, cabin, player } from "../../Actors";

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

const distance: costCallback = (agent: GoapAgent, world: actionstate): number => {
  return world.playerPosition.distance(world.tree2Position);
};

const actionConfig: GoapActionConfig = {
  name: "mtTree2",
  cost: distance,
  effect: world => {
    world.playerPosition = new Vector(world.tree2Position.x - 20, world.tree2Position.y - 20);
    world.playerState = playerState.movingToTree2;
  },
  precondition: world => {
    let isPlayerEmpty = world.player == 0;
    let isFireLow = world.campfire < 15;
    let isBearNearTree = bearActor.pos.distance(world.tree2Position) < 50;
    let isReadyToCollectWood =
      world.playerState == playerState.feedingFire ||
      world.playerState == playerState.idle ||
      world.playerState == playerState.inCabin;
    return isPlayerEmpty && !isBearNearTree && isFireLow && isReadyToCollectWood;
  },
  action: myAction,
  entity: player,
};

export const moveToTree2Action = new GoapAction(actionConfig);
