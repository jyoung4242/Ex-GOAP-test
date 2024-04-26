import { ActorArgs, Color, Engine, ImageSource, Label, Sprite, Vector } from "excalibur";
import { GoapAction, GoapAgent, GoapAgentConfig, actionstate } from "../GOAP stuff/GOAP";
import { world } from "../GOAP stuff/World/world";
import { avoidBearGoal, goal } from "../GOAP stuff/Goals/Goal";
//@ts-ignore
import jackSprite from "../assets/jack.png";

const image = new ImageSource(jackSprite);

const jacksprite = new Sprite({
  image: image,
  sourceView: {
    // Take a small slice of the source image starting at pixel (10, 10) with dimension 20 pixels x 20 pixels
    x: 0,
    y: 0,
    width: 20,
    height: 20,
  },
  destSize: { width: 20, height: 20 },
});

await image.load();
const playerActorConfig: ActorArgs = {
  name: "player",
  pos: new Vector(300, 250),
  width: 16,
  height: 16,
  color: Color.Blue,
};

const loadPlayerActionQueue = (s: actionstate) => {
  player.cancelPlan();
  player.actions.clearActions();
  player.plan.forEach((a: GoapAction) => {
    console.log(a);
  });
};

const playerConfig: GoapAgentConfig = {
  world: world,
  state: {},
  actions: [],
  goals: [goal, avoidBearGoal], //resetGoal, waitGoal,
  actorConfig: playerActorConfig,
  onNewPlan: loadPlayerActionQueue,
  delayedPlanning: 10,
  debugMode: false,
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

class PlayerLabel2 extends Label {
  constructor() {
    super({ text: "state", pos: new Vector(-15, 20) });
    this.color = Color.White;
  }
  onPreUpdate(engine: Engine<any>, delta: number): void {
    this.text = `${world.playerState}`;
  }
}

export const player = new GoapAgent(playerConfig);
player.addChild(new playerLabel());
player.addChild(new PlayerLabel2());
player.graphics.add(jacksprite);

player.onPreUpdate = (engine: Engine<any>, delta: number) => {
  world.playerPosition.x = player.pos.x;
  world.playerPosition.y = player.pos.y;
};

player.on("collisionstart", event => {
  if (event.other.name === "cabin") {
    player.graphics.visible = false;
  }
});
player.on("collisionend", event => {
  if (event.other.name === "cabin") {
    player.graphics.visible = true;
  }
});
