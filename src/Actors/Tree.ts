import { Actor, ActorArgs, Color, Engine, Label, Vector } from "excalibur";
import { world } from "../GOAP stuff/World/world";

const treeConfig: ActorArgs = {
  pos: new Vector(600, 400),
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
    this.text = `tree: ${world.tree}`;
  }
}

class Tree extends Actor {
  constructor(treeConfig: ActorArgs) {
    super(treeConfig);
  }
}

export const tree = new Tree(treeConfig);
tree.addChild(new TreeLabel());
