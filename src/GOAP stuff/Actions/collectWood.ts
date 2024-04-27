import { ActionCompleteEvent, Blink } from "excalibur";
import { GoapAction, GoapActionConfig, GoapAgent, actionstate } from "../GOAP";
import { player } from "../../Actors";
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
  name: "collectWood",
  cost: () => {
    return 1;
  },
  timeout: 2000,
  effect: world => {
    world.tree -= 5;
    world.player += 5;
    world.playerState = playerState.collectingWood1;
  },
  precondition: world => {
    let isTreeEmpty = world.tree <= 0;
    let isPlayerFull = world.player >= 25;
    let isReadyToCollectWood = world.playerState == playerState.movingToTree1 || world.playerState == playerState.collectingWood1;
    return !isTreeEmpty && !isPlayerFull && isReadyToCollectWood;
  },
  entity: player,
  action: myAction,
};

export const collectWoodAction = new GoapAction(actionConfig);
