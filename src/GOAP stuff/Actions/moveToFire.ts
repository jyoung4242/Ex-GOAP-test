import { ActionCompleteEvent, Vector } from "excalibur";
import { GOAP_UUID, GoapAction, GoapActionConfig, GoapAgent, actionstate } from "../GOAP";
import { player, fire } from "../../Actors";
import { playerState } from "../World/world";
import { MyEaseTo } from "../../main";

const myAction = (player: GoapAgent, currentAction: GoapAction, world: actionstate): Promise<void> => {
  let myUUID = GOAP_UUID.generateUUID();
  return new Promise(resolve => {
    const actionSub = player.events.on("actioncomplete", (e: ActionCompleteEvent) => {
      if (e.target === player && e.action instanceof MyEaseTo && e.action.UUID === myUUID) {
        actionSub.close();
        resolve();
      }
    });
    let pAction = new MyEaseTo(player, new Vector(fire.pos.x + 20, fire.pos.y + 20), 1500, myUUID);
    player.actions.runAction(pAction);
  });
};

const actionConfig: GoapActionConfig = {
  name: "mtFire",
  timeout: 6000,
  cost: () => {
    return 5;
  },
  effect: world => {
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
