import { ActionCompleteEvent, Blink } from "excalibur";
import { GoapAction, GoapActionConfig, GoapAgent, actionstate } from "../GOAP";
import { player } from "../../Actors/Player";
import { playerState } from "../World/world";

const myAction = (player: GoapAgent, currentAction: GoapAction, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    const actionSub = player.events.on("actioncomplete", (e: ActionCompleteEvent) => {
      if (e.target === player && e.action instanceof Blink) {
        actionSub.close();
        resolve();
      }
    });
    player.actions.blink(250, 250, 1);
  });
};

const actionConfig: GoapActionConfig = {
  name: "collectWood3",
  cost: () => {
    return 1;
  },
  timeout: 2000,
  effect: world => {
    world.tree3 -= 5;
    world.player += 5;
    world.playerState = playerState.collectingWood3;
  },
  precondition: world => {
    let isTreeEmpty = world.tree3 <= 0;
    let isPlayerFull = world.player >= 25;
    let isReadyToCollectWood = world.playerState == playerState.movingToTree3 || world.playerState == playerState.collectingWood3;
    return !isTreeEmpty && !isPlayerFull && isReadyToCollectWood;
  },
  entity: player,
  action: myAction,
};

export const collectWood3Action = new GoapAction(actionConfig);
