import { ActionCompleteEvent, Actor, ActorArgs, EaseTo, EasingFunctions, Engine, ImageSource, Sprite, Vector } from "excalibur";
import { tree, cabin, tree2, tree3, player, fire } from "./index";

//@ts-ignore
import bear from "../assets/bear.png";

import { playerState, world } from "../GOAP stuff/World/world";

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

  getNewPosition() {
    const target: string[] = ["firePosition", "treePosition", "tree2Position", "tree3Position", "playerPosition", "random"];
    const random: number = Math.floor(Math.random() * target.length);

    const lookup = {
      firePosition: fire.pos,
      treePosition: tree.pos,
      tree2Position: tree2.pos,
      tree3Position: tree3.pos,
      playerPosition: player.pos,
      random: "random",
    };

    if (target[random] === "random") this.targetPosition = new Vector(Math.random() * 745 + 15, Math.random() * 545 + 15);
    //@ts-ignore
    else this.targetPosition = new Vector(lookup[target[random]].x, lookup[target[random]].y);
    this.targetPosition.x -= 20;
    this.targetPosition.y -= 20;
  }

  onPostUpdate(engine: Engine<any>, delta: number): void {
    //update worldstate for bear position
    world.bearDistance = this.pos.distance(player.pos);

    if (this.movingState === bearStates.idle) {
      this.idletik += delta;
      if (this.idletik > this.idlelimit) {
        this.idletik = 0;
        this.getNewPosition();
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

    let isPlayerInCabin = player.pos.equals(cabin.pos);
    if (
      world.bearDistance < 75 &&
      this.cancelLatch === false &&
      world.playerState != playerState.inCabin &&
      isPlayerInCabin === false
    ) {
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
