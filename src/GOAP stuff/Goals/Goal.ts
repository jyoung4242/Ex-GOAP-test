import { GoapGoal, GoapGoalConfig, actionstate } from "../GOAP";

const goalConfig: GoapGoalConfig = {
  name: "keepfirealive",
  targetState: {
    campfire: 25,
  },
  weighting: (s: actionstate) => {
    if (s.campfire == 0) return 1.0;
    return 0.0;
  },
};

export const goal = new GoapGoal(goalConfig);

const goalConfigWait: GoapGoalConfig = {
  name: "wait",
  targetState: {
    time: 25,
  },
  weighting: (s: actionstate) => {
    return s.campfire / 25;
  },
};

export const waitGoal = new GoapGoal(goalConfigWait);

const goalResetWait: GoapGoalConfig = {
  name: "resetWait",
  targetState: {
    time: 0,
  },
  weighting: (s: actionstate) => {
    return s.time / 25;
  },
};

export const resetGoal = new GoapGoal(goalResetWait);
