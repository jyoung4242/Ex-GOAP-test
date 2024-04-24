import { Actor, ActorArgs, Color, Engine, Label, Vector } from "excalibur";
import { world } from "../GOAP stuff/World/world";

const treeConfig: ActorArgs = {
  name: "tree3",
  pos: new Vector(400, 575),
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
    this.text = `tree: ${world.tree3}`;
  }
}

class Tree3 extends Actor {
  constructor(treeConfig: ActorArgs) {
    super(treeConfig);
  }
}

export const tree3 = new Tree3(treeConfig);
tree3.addChild(new TreeLabel());
