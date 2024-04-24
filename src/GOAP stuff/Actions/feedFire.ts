import { Action, Actor, Entity, Blink, ActionCompleteEvent, World } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate } from "../GOAP";
import { player } from "../../Actors/Player";
import { fire } from "../../Actors/Fire";
import { playerState } from "../World/world";

const myAction = (player: GoapAgent, world: actionstate): Promise<void> => {
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
  cost: 1,
  effect: world => {
    world.campfire += 5;
    world.player -= 5;
    world.playerState = playerState.feedingFire;
  },
  precondition: world => {
    return (
      world.playerPosition.distance(world.firePosition) < 30 &&
      world.player > 0 &&
      (world.playerState === playerState.movingToFire || world.playerState === playerState.feedingFire)
    );
  },
  action: myAction,
  entity: player,
};

export const feedFireAction = new GoapAction(actionConfig);
