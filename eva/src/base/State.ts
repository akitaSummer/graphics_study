import { SpriteAnimation } from "@eva/plugin-renderer-sprite-animation";

export const ANIMATION_SPEED = 1000 / 8;

export default class State {
  constructor(
    public spriteAnimation: SpriteAnimation,
    public animationName: string,
    public times?: number
  ) {}

  run = () => {
    this.spriteAnimation.resource = this.animationName;

    // 修复动画闪动
    // @ts-ignore
    this.spriteAnimation.complete = false;
    this.spriteAnimation.play(this.times);
  };
}
