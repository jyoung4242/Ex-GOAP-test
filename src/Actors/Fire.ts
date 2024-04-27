import { Actor, ActorArgs, Color, Engine, ImageSource, Label, Sprite, Vector } from "excalibur";
import { world } from "../GOAP stuff/World/world";
//@ts-ignore
import fireSprite from "../assets/campfire.png";

const image = new ImageSource(fireSprite);

const firesprite = new Sprite({
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

const fireConfig: ActorArgs = {
  pos: new Vector(400, 300),
  width: 16,
  height: 16,
  color: Color.Red,
};

class FireLabel extends Label {
  constructor() {
    super({ text: "fire:", pos: new Vector(-15, -25) });
    this.color = Color.White;
  }
  onPostUpdate(engine: Engine<any>, delta: number): void {
    this.text = `fire: ${world.campfire}`;
  }
}

class Fire extends Actor {
  burnTimerTik: number = 0;
  burnTimerLimit: number = 2500;
  colorflashtik: number = 0;
  colorflashlimit: number = 250;

  constructor(fireConfig: ActorArgs) {
    super(fireConfig);
  }

  onPostUpdate(engine: Engine<any>, delta: number): void {
    if (world.campfire > 0) {
      this.burnTimerTik += delta;
      if (this.burnTimerTik > this.burnTimerLimit) {
        world.campfire -= 5;
        this.burnTimerTik = 0;
      }
    }
  }
}

export const fire = new Fire(fireConfig);
fire.addChild(new FireLabel());
fire.graphics.add(firesprite);
