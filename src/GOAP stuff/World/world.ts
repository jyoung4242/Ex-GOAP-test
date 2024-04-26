import { Vector } from "excalibur";

export enum playerState {
  idle = "idle",
  movingToTree1 = "movingToTree1",
  movingToTree2 = "movingToTree2",
  movingToTree3 = "movingToTree3",
  collectingWood1 = "collectingWood1",
  movingToFire = "movingToFire",
  collectingWood2 = "collectingWood2",
  collectingWood3 = "collectingWood3",
  feedingFire = "feedingFire",
  scared = "scared",
  runningAway = "runningAway",
  inCabin = "inCabin",
}

export const world = {
  tree: 500,
  tree2: 500,
  tree3: 500,
  campfire: 0,
  player: 0,
  playerPosition: new Vector(300, 250),
  firePosition: new Vector(400, 300),
  treePosition: new Vector(100, 100),
  tree2Position: new Vector(600, 200),
  tree3Position: new Vector(400, 575),
  bearDistance: 300,
  time: 0,
  playerState: playerState.idle,
};
