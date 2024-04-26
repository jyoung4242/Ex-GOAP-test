import { Vector } from "excalibur";
import { GoapGoal, GoapGoalConfig, actionstate } from "../GOAP";
import { playerState, world } from "../World/world";
import { cabin } from "../../Actors";

const goalConfig: GoapGoalConfig = {
  name: "keepfirealive",
  targetState: (s: actionstate) => {
    return s.campfire >= 25;
  },
  weighting: (s: actionstate) => {
    if (s.campfire <= 20) return 0.9;
    return 0.0;
  },
};

export const goal = new GoapGoal(goalConfig);

const avoidBearConfig: GoapGoalConfig = {
  name: "avoidBear",
  targetState: (s: actionstate) => {
    return s.playerState == playerState.inCabin && world.playerPosition.equals(cabin.pos);
  },
  weighting: (s: actionstate) => {
    if (s.bearDistance < 100) return 1.0;
    else return 0.0;
  },
};

export const avoidBearGoal = new GoapGoal(avoidBearConfig);
