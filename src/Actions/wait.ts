import { GoapAction, GoapActionConfig, GoapAgent, actionstate } from "../GOAP";
import { player } from "../Actors";

const myAction = (player: GoapAgent, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

const actionConfig: GoapActionConfig = {
  name: "wait",
  cost: 1,
  effect: world => {
    world.time += 5;
  },
  precondition: world => {
    if (world.campfire > 0 && world.player == 0 && world.time < 25) return true;
    return false;
  },
  entity: player,
  action: myAction,
};

export const waitAction = new GoapAction(actionConfig);
