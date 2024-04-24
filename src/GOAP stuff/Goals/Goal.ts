import { GoapGoal, GoapGoalConfig, actionstate } from "../GOAP";

const goalConfig: GoapGoalConfig = {
  name: "keepfirealive",
  targetState: {
    campfire: 25,
  },
  weighting: (s: actionstate) => {
    if (s.campfire <= 15) return 1.0;
    return 0.0;
  },
};

export const goal = new GoapGoal(goalConfig);
