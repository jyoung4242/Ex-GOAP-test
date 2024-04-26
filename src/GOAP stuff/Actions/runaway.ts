import { ActionCompleteEvent, EaseTo, EasingFunctions, Engine, Vector } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate } from "../GOAP";
import { playerState, world } from "../World/world";
import { player } from "../../Actors";
import { bearActor } from "../../Actors/bear";
import { cabin } from "../../Actors";

const myAction = (player: GoapAgent, world: actionstate): Promise<void> => {
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
  effect: world => {
    world.playerState = playerState.runningAway;
    world.playerPosition.x = cabin.pos.x;
    world.playerPosition.y = cabin.pos.y;
  },
  precondition: world => {
    return world.bearDistance < 100 && world.playerState == playerState.scared;
  },
  action: myAction,
  entity: player,
};

export const runAwayAction = new GoapAction(actionConfig);
