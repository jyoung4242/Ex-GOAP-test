import { Actor, ActorArgs, Color, Engine, Label, Vector } from "excalibur";
import { world } from "../GOAP stuff/World/world";

const treeConfig: ActorArgs = {
  name: "tree2",
  pos: new Vector(600, 200),
  width: 16,
  height: 16,
  color: Color.Green,
};

class TreeLabel extends Label {
  constructor() {
    super({ text: "tree:", pos: new Vector(-15, -25) });
    this.color = Color.White;
  }
  onPostUpdate(engine: Engine<any>, delta: number): void {
    this.text = `tree: ${world.tree2}`;
  }
}

class Tree2 extends Actor {
  constructor(treeConfig: ActorArgs) {
    super(treeConfig);
  }
}

export const tree2 = new Tree2(treeConfig);
tree2.addChild(new TreeLabel());
