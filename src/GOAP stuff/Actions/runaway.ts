import { ActionCompleteEvent, EaseTo, EasingFunctions } from "excalibur";
import { GoapAction, GoapActionConfig, GoapAgent, actionstate } from "../GOAP";
import { playerState } from "../World/world";
import { player, bearActor, cabin } from "../../Actors";

const myAction = (player: GoapAgent, currentAction: GoapAction, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    const actionSub = player.events.on("actioncomplete", (e: ActionCompleteEvent) => {
      if (e.target === player && e.action instanceof EaseTo) {
        actionSub.close();
        bearActor.cancelLatch = false;
        resolve();
      }
    });

    player.actions.easeTo(cabin.pos, 500, EasingFunctions.Linear);
  });
};

const actionConfig: GoapActionConfig = {
  name: "runaway!",
  cost: () => {
    return 5;
  },
  timeout: 6000,
  effect: world => {
    world.playerState = playerState.runningAway;
  },
  precondition: world => {
    return world.bearDistance < 100 && world.playerState == playerState.scared;
  },
  action: myAction,
  entity: player,
};

export const runAwayAction = new GoapAction(actionConfig);
