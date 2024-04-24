import { Action, ActionCompleteEvent, Actor, Blink, Entity } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate } from "../GOAP";
import { tree } from "../../Actors/Tree";
import { player } from "../../Actors/Player";
import { playerState, world } from "../World/world";

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
  name: "collectWood",
  cost: 1,
  effect: world => {
    world.tree -= 5;
    world.player += 5;
    world.playerState = playerState.collectingWood1;
  },
  precondition: world => {
    return (
      world.playerPosition.distance(world.treePosition) < 30 &&
      world.tree > 0 &&
      world.player < 25 &&
      (world.playerState === playerState.movingToTree1 || world.playerState === playerState.collectingWood1)
    );
  },
  entity: player,
  action: myAction,
};

export const collectWoodAction = new GoapAction(actionConfig);
