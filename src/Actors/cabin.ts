import { Actor, ActorArgs, Color, Engine, ImageSource, Label, Sprite, Vector } from "excalibur";
import { world } from "../GOAP stuff/World/world";
//@ts-ignore
import cabinImage from "../assets/cabin.png";

const image = new ImageSource(cabinImage);

const cabinsprite = new Sprite({
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

const cabinConfig: ActorArgs = {
  name: "cabin",
  pos: new Vector(Math.random() * 800, Math.random() * 600),
  width: 16,
  height: 16,
};

class Cabin extends Actor {
  constructor(treeConfig: ActorArgs) {
    super(treeConfig);
  }
}

export const cabin = new Cabin(cabinConfig);
cabin.graphics.add(cabinsprite);
