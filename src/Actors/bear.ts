import { ActionCompleteEvent, Actor, ActorArgs, Color, EaseTo, EasingFunctions, Engine, ImageSource, Sprite, Vector } from "excalibur";
import { player } from "./Player";

//@ts-ignore
import bear from "../assets/bear.png";
import { playerState, world } from "../GOAP stuff/World/world";
import { cabin } from "./cabin";

const image = new ImageSource(bear);

//need two states for the bear
enum bearStates {
  idle = "idle",
  moving = "moving",
}

const bearsprite = new Sprite({
  image: image,
  sourceView: {
    // Take a small slice of the source image starting at pixel (10, 10) with dimension 20 pixels x 20 pixels
    x: 0,
    y: 0,
    width: 16,
    height: 16,
  },
  destSize: { width: 20, height: 20 },
});

await image.load();

const playerActorConfig: ActorArgs = {
  name: "bear",
  pos: new Vector(Math.random() * 800, Math.random() * 600), //random vector
  width: 16,
  height: 16,
};

class Bear extends Actor {
  targetPosition: Vector = new Vector(0, 0);
  movingState: bearStates = bearStates.idle;
  idletik: number = 0;
  idlelimit: number = 3000;
  cancelLatch: boolean = false;

  constructor(input: ActorArgs) {
    super(input);
  }

  getNewPosittion() {
    const target: string[] = ["firePosition", "treePosition", "tree2Position", "tree3Position", "playerPosition", "random"];
    const random: number = Math.floor(Math.random() * target.length);

    if (target[random] === "random") this.targetPosition = new Vector(Math.random() * 800, Math.random() * 600);
    //@ts-ignore
    else this.targetPosition = new Vector(world[target[random]].x, world[target[random]].y);
    this.targetPosition.x -= 20;
    this.targetPosition.y -= 20;
    // this.targetPosition = new Vector(Math.random() * 800, Math.random() * 600);
  }

  onPostUpdate(engine: Engine<any>, delta: number): void {
    //update worldstate for bear position

    world.bearDistance = this.pos.distance(player.pos);

    if (this.movingState === bearStates.idle) {
      this.idletik += delta;
      if (this.idletik > this.idlelimit) {
        this.idletik = 0;
        this.getNewPosittion();
        this.movingState = bearStates.moving;
        this.events.on("actioncomplete", (e: ActionCompleteEvent) => {
          if (e.target === this && e.action instanceof EaseTo && this.movingState === bearStates.moving) {
            this.movingState = bearStates.idle;
          }
        });
        this.actions.easeTo(this.targetPosition, 2500, EasingFunctions.Linear);
      }
    }

    //cancel check for player
    //measure distance between bear and player
    const distanceToPlayer = this.pos.distance(player.pos);
    let isPlayerInCabin = world.playerPosition.equals(cabin.pos);
    if (
      distanceToPlayer < 100 &&
      this.cancelLatch === false &&
      world.playerState != playerState.inCabin &&
      isPlayerInCabin === false
    ) {
      bear.blink(250, 250, 3);

      this.cancelLatch = true;
      this.actions.clearActions();
      player.actions.clearActions();
      player.cancelPlan();
      this.events.clear();
      this.movingState = bearStates.idle;
      world.playerState = playerState.scared;
    }
  }
}

export const bearActor = new Bear(playerActorConfig);
bearActor.graphics.add(bearsprite);
