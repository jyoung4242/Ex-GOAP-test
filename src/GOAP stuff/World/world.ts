import { Vector } from "excalibur";

export enum playerState {
  idle = 0,
  movingToTree1 = 1,
  movingToTree2 = 2,
  movingToTree3 = 3,
  collectingWood1 = 4,
  movingToFire = 5,
  collectingWood2 = 6,
  collectingWood3 = 7,
  feedingFire = 8,
}

export const world = {
  tree: 25,
  tree2: 25,
  tree3: 25,
  campfire: 0,
  player: 0,
  playerPosition: new Vector(300, 250),
  firePosition: new Vector(150, 100),
  treePosition: new Vector(600, 400),
  tree2Position: new Vector(600, 200),
  tree3Position: new Vector(400, 575),
  time: 0,
  playerState: playerState.idle,
};
