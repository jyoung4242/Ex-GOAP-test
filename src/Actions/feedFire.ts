import { Action, Actor, Entity, Blink, ActionCompleteEvent, World } from "excalibur";
import { GoapAction, GoapActionConfig, GoapActionStatus, GoapAgent, actionstate } from "../GOAP";
import { player } from "../Actors/Player";
import { fire } from "../Actors/Fire";

const myAction = (player: GoapAgent, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    const actionSub = player.events.on("actioncomplete", (e: ActionCompleteEvent) => {
      if (e.target === player && e.action instanceof Blink) {
        actionSub.close();
        resolve();
      }
    });
    fire.actions.blink(250, 250, 2);
    player.actions.blink(250, 250, 2);
  });
};

const actionConfig: GoapActionConfig = {
  name: "feedFire",
  cost: 1,
  effect: world => {
    world.campfire += 5;
    world.player -= 5;
  },
  precondition: world => {
    return world.playerPosition.distance(world.firePosition) < 30 && world.player > 0;
  },
  action: myAction,
  entity: player,
};

class FeedFireAction extends GoapAction {
  status: GoapActionStatus = GoapActionStatus.waiting;
  player = player;
  fire = fire;
  constructor(input: GoapActionConfig) {
    super(input);
  }

  update(delta: number): void {
    if (this.status === GoapActionStatus.waiting) {
      // blink player, and blink fire
      this.status = GoapActionStatus.busy;
      this.player.actions.blink(50, 50, 3);
      this.fire.actions.blink(50, 50, 3);
      this.status = GoapActionStatus.complete;
    }
  }
}

export const feedFireAction = new FeedFireAction(actionConfig);
