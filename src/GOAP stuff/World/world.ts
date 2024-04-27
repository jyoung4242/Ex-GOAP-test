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
  playerState: playerState.idle,
  bearDistance: 300,
};
