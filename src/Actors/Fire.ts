import { Actor, ActorArgs, Color, Engine, Label, Vector } from "excalibur";
import { world } from "../GOAP stuff/World/world";

const fireConfig: ActorArgs = {
  pos: new Vector(150, 100),
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
      this.colorflashtik += delta;
      if (this.colorflashtik > this.colorflashlimit) {
        if (this.color.equal(Color.Red)) {
          this.color = Color.Orange;
        } else {
          this.color = Color.Red;
        }
        this.colorflashtik = 0;
      }

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
