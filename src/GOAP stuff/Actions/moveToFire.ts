import { ActionCompleteEvent, EaseTo, EasingFunctions, Vector } from "excalibur";
import { GoapAction, GoapActionConfig, GoapAgent, actionstate } from "../GOAP";
import { player } from "../../Actors";
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
  cost: 5,
  effect: world => {
    world.playerPosition = new Vector(world.firePosition.x + 20, world.firePosition.y + 20);
    world.playerState = playerState.movingToFire;
  },
  precondition: world => {
    return (
      world.player >= 25 &&
      (world.playerPosition.distance(world.treePosition) < 30 ||
        world.playerPosition.distance(world.tree2Position) < 30 ||
        world.playerPosition.distance(world.tree3Position) < 30) &&
      (world.playerState === playerState.collectingWood1 ||
        world.playerState === playerState.collectingWood2 ||
        world.playerState === playerState.collectingWood3)
    );
  },
  action: myAction,
  entity: player,
};

export const moveToFireAction = new GoapAction(actionConfig);
