import { Actor, ActorArgs, Color, Engine, ImageSource, Label, Sprite, Vector } from "excalibur";
import { world } from "../GOAP stuff/World/world";
//@ts-ignore
import treeSprite from "../assets/tree.png";

const image = new ImageSource(treeSprite);

const treesprite = new Sprite({
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
tree2.graphics.add(treesprite);
