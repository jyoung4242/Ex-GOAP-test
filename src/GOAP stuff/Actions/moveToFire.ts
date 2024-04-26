import { ActionCompleteEvent, EaseTo, EasingFunctions, Vector } from "excalibur";
import { GoapAction, GoapActionConfig, GoapAgent, actionstate } from "../GOAP";
import { cabin, player } from "../../Actors";
import { playerState } from "../World/world";

const myAction = (player: GoapAgent, world: actionstate): Promise<void> => {
  return new Promise(resolve => {
    const actionSub = player.events.on("actioncomplete", (e: ActionCompleteEvent) => {
      if (e.target === player && e.action instanceof EaseTo) {
        actionSub.close();
        resolve();
      }
    });

    player.actions.easeTo(new Vector(world.firePosition.x + 20, world.firePosition.y + 20), 1500, EasingFunctions.EaseInOutQuad);
  });
};

const actionConfig: GoapActionConfig = {
  name: "mtFire",
  cost: () => {
    return 5;
  },
  effect: world => {
    world.playerPosition = new Vector(world.firePosition.x + 20, world.firePosition.y + 20);
    world.playerState = playerState.movingToFire;
  },
  precondition: world => {
    let hasWood = world.player > 0;
    let isFull = world.player >= 25;
    let inCabin = world.playerState == playerState.inCabin;
    let readyToFeedFire =
      world.playerState == playerState.collectingWood1 ||
      world.playerState == playerState.collectingWood2 ||
      world.playerState == playerState.collectingWood3;

    return (isFull && readyToFeedFire) || (inCabin && hasWood);
  },
  action: myAction,
  entity: player,
};

export const moveToFireAction = new GoapAction(actionConfig);
