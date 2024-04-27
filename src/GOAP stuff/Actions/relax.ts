import { Action, Actor, Entity, Blink, ActionCompleteEvent, World, Vector } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate } from "../GOAP";
import { player } from "../../Actors/Player";
import { playerState } from "../World/world";
import { cabin } from "../../Actors";

const myAction = (player: GoapAgent, currentAction: GoapAction, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 2000);
  });
};

const actionConfig: GoapActionConfig = {
  name: "relax",
  cost: () => {
    return 1;
  },
  timeout: 4000,
  effect: world => {
    world.playerState = playerState.inCabin;
  },
  precondition: world => {
    return world.playerState === playerState.runningAway;
  },
  action: myAction,
  entity: player,
};

export const relaxAction = new GoapAction(actionConfig);
