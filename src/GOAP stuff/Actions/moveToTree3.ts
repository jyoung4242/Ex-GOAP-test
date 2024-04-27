import { ActionCompleteEvent, EaseTo, EasingFunctions, Vector } from "excalibur";
import { GOAP_UUID, GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate, costCallback } from "../GOAP";
import { playerState, world } from "../World/world";
import { bearActor, cabin, player, tree3 } from "../../Actors";
import { MyEaseTo } from "../../main";

const myAction = (player: GoapAgent, currentAction: GoapAction, world: actionstate): Promise<void> => {
  let myUUID = GOAP_UUID.generateUUID();
  return new Promise(resolve => {
    const actionSub = player.events.on("actioncomplete", (e: ActionCompleteEvent) => {
      if (e.target === player && e.action instanceof MyEaseTo && e.action.UUID === myUUID) {
        actionSub.close();
        resolve();
      }
    });
    let pAction = new MyEaseTo(player, new Vector(tree3.pos.x - 20, tree3.pos.y - 20), 1500, myUUID);
    player.actions.runAction(pAction);
  });
};

const distance: costCallback = (agent: GoapAgent, world: actionstate): number => {
  return player.pos.distance(tree3.pos);
};

const actionConfig: GoapActionConfig = {
  name: "mtTree3",
  cost: distance,
  timeout: 6000,
  effect: world => {
    world.playerState = playerState.movingToTree3;
  },
  precondition: world => {
    let isPlayerEmpty = world.player == 0;
    let isFireLow = world.campfire < 15;
    let isBearNearTree = bearActor.pos.distance(tree3.pos) < 50;
    let isReadyToCollectWood =
      world.playerState == playerState.feedingFire ||
      world.playerState == playerState.idle ||
      world.playerState == playerState.inCabin;
    return isPlayerEmpty && !isBearNearTree && isFireLow && isReadyToCollectWood;
  },
  action: myAction,
  entity: player,
};

export const moveToTree3Action = new GoapAction(actionConfig);
