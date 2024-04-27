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
  name: "tree3",
  pos: new Vector(400, 560),
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
class TreeLabel2 extends Label {
  constructor() {
    super({ text: "Tree3", pos: new Vector(-15, 20) });
    this.color = Color.White;
  }
}

class Tree3 extends Actor {
  constructor(treeConfig: ActorArgs) {
    super(treeConfig);
  }
}

export const tree3 = new Tree3(treeConfig);
tree3.addChild(new TreeLabel());
tree3.addChild(new TreeLabel2());
tree3.graphics.add(treesprite);
