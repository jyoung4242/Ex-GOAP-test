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
  name: "collectWood2",
  cost: 1,
  effect: world => {
    world.tree2 -= 5;
    world.player += 5;
    world.playerState = playerState.collectingWood2;
  },
  precondition: world => {
    return (
      world.playerPosition.distance(world.tree2Position) < 30 &&
      world.tree2 > 0 &&
      world.player < 25 &&
      (world.playerState === playerState.movingToTree2 || world.playerState === playerState.collectingWood2)
    );
  },
  entity: player,
  action: myAction,
};

export const collectWood2Action = new GoapAction(actionConfig);
