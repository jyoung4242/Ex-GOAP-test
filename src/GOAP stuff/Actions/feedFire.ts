import { Blink, ActionCompleteEvent } from "excalibur";
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
  name: "feedFire",
  cost: () => {
    return 1;
  },
  timeout: 2000,
  effect: world => {
    if (world.player != 0) {
      world.player -= 5;
      world.campfire += 5;
    }
    world.playerState = playerState.feedingFire;
    if (world.player <= 0) {
      world.playerState = playerState.idle;
    }
  },
  precondition: world => {
    let isPlayerEmpty = world.player == 0;
    let isPlayerReadyToFeedFire = world.playerState === playerState.movingToFire || world.playerState === playerState.feedingFire;
    return !isPlayerEmpty && isPlayerReadyToFeedFire;
  },
  action: myAction,
  entity: player,
};

export const feedFireAction = new GoapAction(actionConfig);
