import { ActorArgs, Color, Engine, Label, Vector } from "excalibur";
import { GoapAction, GoapAgent, GoapAgentConfig, actionstate } from "../GOAP";
import { world } from "../world";
import { goal, resetGoal, waitGoal } from "../Goal";

const playerActorConfig: ActorArgs = {
  pos: new Vector(300, 250),
  width: 16,
  height: 16,
  color: Color.Blue,
};

const loadPlayerActionQueue = (s: actionstate) => {
  player.cancelPlan();
  player.plan.forEach((a: GoapAction) => {
    console.log(a);
  });
};

const playerConfig: GoapAgentConfig = {
  world: world,
  state: {},
  actions: [],
  goals: [resetGoal, waitGoal, goal], //resetGoal, waitGoal,
  actorConfig: playerActorConfig,
  onNewPlan: loadPlayerActionQueue,
};

class playerLabel extends Label {
  constructor() {
    super({ text: "wood:", pos: new Vector(-15, -25) });
    this.color = Color.White;
  }
  onPostUpdate(engine: Engine<any>, delta: number): void {
    this.text = `wood: ${world.player}`;
  }
}

export const player = new GoapAgent(playerConfig);
player.addChild(new playerLabel());