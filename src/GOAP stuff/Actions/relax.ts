import { Action, Actor, Entity, Blink, ActionCompleteEvent, World } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate } from "../GOAP";
import { player } from "../../Actors/Player";
import { playerState } from "../World/world";
import { cabin } from "../../Actors";

const myAction = (player: GoapAgent, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 3000);
  });
};

const actionConfig: GoapActionConfig = {
  name: "relax",
  cost: () => {
    return 1;
  },
  effect: world => {
    world.playerState = playerState.inCabin;
  },
  precondition: world => {
    return world.playerState === playerState.runningAway && world.playerPosition.equals(cabin.pos);
  },
  action: myAction,
  entity: player,
};

export const relaxAction = new GoapAction(actionConfig);
