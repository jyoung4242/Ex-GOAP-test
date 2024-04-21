import { GoapAction, GoapActionConfig, actionstate } from "../GOAP";
import { Entity } from "excalibur";
import { player } from "../../Actors";

const myAction = (player: Entity, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    resolve();
  });
};

const actionConfig: GoapActionConfig = {
  name: "reset",
  cost: 1,
  effect: world => {
    world.time = 0;
  },
  precondition: world => {
    if (world.time == 25) return true;
    return false;
  },
  entity: player,
  action: myAction,
};

export const resetAction = new GoapAction(actionConfig);
