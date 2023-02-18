import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import PhyTouch from "phy-touch";
import resoures, { spriteObjects, AddingSprite } from "./resoures";
import { Sound } from "@pixi/sound";
import "./index.css";

interface SkeletonProps {
  el: HTMLElement;
  muted?: boolean;
}

class OnePgage {
  container: HTMLElement;
  loaderDom: HTMLDivElement;
  loaderProgressDOM: HTMLDivElement;
  musicIcon: HTMLButtonElement;
  muted: boolean;

  timeline: gsap.core.Timeline;

  progess: number;
  touch: PhyTouch;

  app: PIXI.Application;
  textures: Record<string, any>;
  music: Record<string, Sound>;
  sizes: {
    width: number;
    height: number;
  };

  constructor({ el, muted = false }: SkeletonProps) {
    this.container = el;

    // load
    this.loaderDom = document.createElement("div");
    this.loaderDom.id = "loader";
    this.loaderProgressDOM = document.createElement("div");
    this.loaderProgressDOM.id = "loaderProgress";
    this.loaderDom.appendChild(this.loaderProgressDOM);
    this.container.appendChild(this.loaderDom);

    // 音频按钮
    this.musicIcon = document.createElement("button");
    this.musicIcon.id = "musicIcon";
    this.muted = muted;
    if (this.muted) {
      this.musicIcon.classList.add("mpause");
    } else {
      this.musicIcon.classList.add("mplay");
    }
    this.container.appendChild(this.musicIcon);

    // timeline
    this.timeline = gsap.timeline({ paused: true });

    this.textures = {};
    this.music = {};

    this.sizes = {
      width: 750,
      height: 1448, // 场景高度
    };
    this.app = new PIXI.Application({
      width: this.sizes.width,
      height: this.sizes.height,
    });
    this.container.appendChild(this.app.view as unknown as HTMLElement);

    // 设置滑动（开启舞台之后再添加触屏进度）
    this.progess = 0;
    this.touch = new PhyTouch({
      touch: "body",
      maxSpeed: 0.8,
      min: -(10800 - 750), // 场景长度 减 留下一个屏幕宽度，这里之所以用负值，是为了将画布向左移动
      max: 0,
      bindSelf: false,
      value: 0,
      change: (value) => {
        if (value > 0 || value < this.touch.min) {
          return;
        }
        this.progess = value / this.touch.min;
        console.log(value, (this.progess * 100).toFixed(2) + "%");
        // 更新动画进度
        this.timeline.seek(this.progess);
        // 更新序列帧动画
        this.animate(this.progess);
        // 更新序列音频
        this.audioAction(this.progess);
      },
    });
  }

  start = async () => {
    const { common, p1, p2, w, p3, p4, x, music } = resoures;
    const urls = [
      ...Object.values(common),
      ...Object.values(p1),
      ...Object.values(p2),
      ...w,
      ...p3,
      ...p4,
      ...x,
      //   ...Object.values(music),
    ] as string[];
    for (let i = 0; i < urls.length; i++) {
      PIXI.Assets.add(urls[i], urls[i]);
    }
    this.textures = await PIXI.Assets.load(urls, (progress) => {
      this.loaderProgressDOM.innerText = `${Math.round(progress * 100)}%`;
    });

    console.log(`All loaded.`);
    // 设置音频
    this.setupAudio();

    // 设置资源加载完毕提示
    this.loaderProgressDOM.style.opacity = `0`;
    const tip = document.createElement("div");
    tip.id = "tip";
    tip.classList.add("upTip");
    tip.style.display = "block";
    tip.innerText = "向上滑动屏幕，观看你我故事";
    this.loaderDom.appendChild(tip);

    this.loaderDom.addEventListener("touchstart", (_) => {
      // 用户开始触屏后，开启舞台
      this.loaderDom.style.display = "none";
      // 设置精灵
      this.setupSprites();

      // 时间轴动画
      this.setupAnimation();
    });
  };

  setupAnimation() {
    const spriteGroupScenes = this.app.stage.getChildByName(
      "spriteGroupScenes"
    ) as PIXI.Container;
    const scene1 = spriteGroupScenes.getChildByName("scene1") as PIXI.Container;
    const scene2 = spriteGroupScenes.getChildByName("scene2") as PIXI.Container;
    const scene3 = spriteGroupScenes.getChildByName("scene3") as PIXI.Container;
    const spriteGroupLast = this.app.stage.getChildByName(
      "spriteGroupLast"
    ) as PIXI.Container;
    // 滑动调整画布显示
    const sceneMoveTimeline = gsap.to(spriteGroupScenes.position, {
      x: this.touch.min,
      duration: 1,
    });
    this.timeline.add(sceneMoveTimeline);
    // 星星显现 spriteGroupScenes/scene1/p1Star
    const starTimeline = gsap.to(
      scene1.getChildByName("p1Star") as PIXI.Sprite,
      {
        alpha: 1,
        delay: -15 / this.touch.min,
        duration: -25 / this.touch.min,
      }
    );
    this.timeline.add(starTimeline, 0); // 0 不基于上个动画执行  https://greensock.com/docs/v3/GSAP/Timeline/add()
    // 场景1放大和透明 spriteGroupScenes/scene1/p1House
    const scene1Timeline1 = gsap.to(scene1.scale, {
      x: 3,
      y: 3,
      delay: -600 / this.touch.min,
      duration: -200 / this.touch.min,
    });
    const scene1Timeline2 = gsap.to(scene1, {
      alpha: 0,
      delay: -600 / this.touch.min,
      duration: -200 / this.touch.min,
    });
    this.timeline.add(scene1Timeline1, 0);
    this.timeline.add(scene1Timeline2, 0);
    // 小孩显现出来
    const childTimeline = gsap.to(scene2, {
      alpha: 1,
      delay: -680 / this.touch.min,
      duration: -100 / this.touch.min,
    });
    this.timeline.add(childTimeline, 0);
    // 音符飘动 spriteGroupScenes/scene2/p2Yinfu
    const yinfuSprite = scene2.getChildByName("p2Yinfu") as PIXI.Sprite;
    const yinfuTimeline1 = gsap.to(yinfuSprite.position, {
      x: 3400,
      y: 300,
      delay: -2450 / this.touch.min,
      duration: -200 / this.touch.min,
    });
    const yinfuTimeline2 = gsap.to(yinfuSprite, {
      alpha: 0,
      delay: -2450 / this.touch.min,
      duration: -200 / this.touch.min,
    });
    this.timeline.add(yinfuTimeline1, 0);
    this.timeline.add(yinfuTimeline2, 0);
    // 黑夜缩小为窗户 spriteGroupScenes/scene3/p32
    const windowSprite = scene3.getChildByName("p32") as PIXI.Sprite;
    const windowTimeline1 = gsap.from(windowSprite.position, {
      x: 0,
      y: 0,
      delay: -2580 / this.touch.min,
      duration: -800 / this.touch.min,
    });
    const windowTimeline2 = gsap.from(windowSprite.scale, {
      x: 5,
      y: 5,
      delay: -2580 / this.touch.min,
      duration: -800 / this.touch.min,
    });
    this.timeline.add(windowTimeline1, 0);
    this.timeline.add(windowTimeline2, 0);

    // 工作中的小男孩 spriteGroupScenes/scene3/p31
    const manSprite = scene3.getChildByName("p31") as PIXI.Sprite;
    const manTimeline = gsap.to(manSprite, {
      alpha: 1,
      delay: -2780 / this.touch.min,
      duration: -600 / this.touch.min,
    });
    this.timeline.add(manTimeline, 0);
    // 漩涡显示
    const xwSprite = gsap.to(spriteGroupLast.getChildByName("bgLast"), {
      alpha: 1,
      delay: -6613 / this.touch.min,
      duration: -50 / this.touch.min,
    });
    this.timeline.add(xwSprite, 0);
  }

  setupAudio = () => {
    const bgMusic = Sound.from(resoures.music.bg);
    bgMusic.loop = true;
    const dingMusic = Sound.from(resoures.music.ding);
    const huanhuMusic = Sound.from(resoures.music.huanhu);
    this.music = { bgMusic, dingMusic, huanhuMusic };

    this.musicIcon.onclick = () => {
      this.muted = !this.muted;
      if (this.muted) {
        this.musicIcon.classList.remove("mplay");
        this.musicIcon.classList.add("mpause");
        bgMusic.pause();
        dingMusic.stop();
        huanhuMusic.stop();
      } else {
        this.musicIcon.classList.add("mplay");
        this.musicIcon.classList.remove("mpause");
        bgMusic.resume();
      }
    };
    this.playAudio(this.music.bgMusic);
  };

  setupSprites = () => {
    // 创建精灵组
    const spriteGroupBg = new PIXI.Container();
    spriteGroupBg.position.set(0, 0);
    spriteGroupBg.name = "spriteGroupBg";
    this.app.stage.addChild(spriteGroupBg);
    const spriteGroupScenes = new PIXI.Container();
    spriteGroupScenes.name = "spriteGroupScenes";
    this.app.stage.addChild(spriteGroupScenes);

    const scene1 = new PIXI.Container();
    scene1.pivot.set(1730, 730); // 设置场景1的基点
    scene1.position.set(scene1.pivot.x, scene1.pivot.y); // 用于场景1放大
    scene1.name = "scene1";
    const scene2 = new PIXI.Container();
    scene2.position.set(1773, 0);
    scene2.name = "scene2";
    scene2.alpha = 0;
    const scene3 = new PIXI.Container();
    scene3.position.set(4960, 0);
    scene3.name = "scene3";
    const scene4 = new PIXI.Container();
    scene4.position.set(7902, 0);
    scene4.name = "scene4";
    spriteGroupScenes.addChild(scene1);
    spriteGroupScenes.addChild(scene2);
    spriteGroupScenes.addChild(scene3);
    spriteGroupScenes.addChild(scene4);

    const spriteGroupLast = new PIXI.Container();
    spriteGroupLast.position.set(-203, 0); // 由于Container的层级是叠加的，后添加的会覆盖前添加的显示，所以这里position不需要考虑总宽(10800)
    spriteGroupLast.name = "spriteGroupLast";
    this.app.stage.addChild(spriteGroupLast);

    // 添加精灵
    spriteObjects.forEach((obj) => this.addSprite(obj));
  };

  animate = (progess: number) => {
    const spriteGroupScenes = this.app.stage.getChildByName(
      "spriteGroupScenes"
    ) as PIXI.Container;
    const scene2 = spriteGroupScenes.getChildByName("scene2") as PIXI.Container;
    const spriteGroupLast = this.app.stage.getChildByName(
      "spriteGroupLast"
    ) as PIXI.Container;

    // 孩子学走路 spriteGroupScenes/scene2/p2Child
    const childStepStart = -1093 / this.touch.min;
    const childDuring = -1000 / this.touch.min;
    if (progess >= childStepStart) {
      const frames = resoures.w.length;
      const index = Math.floor(
        ((progess - childStepStart) / childDuring) * frames
      );
      if (index < frames && index >= 0) {
        (scene2.getChildByName("p2Child") as PIXI.Sprite).texture =
          this.textures[resoures.w[index]];
      }
    }
    // 漩涡扣题 spriteGroupScenes/scene4/bgLast
    const xwStepStart = -6613 / this.touch.min;
    const xwDuring = -1000 / this.touch.min;
    if (progess >= xwStepStart) {
      const frames = resoures.x.length;
      const index = Math.floor(((progess - xwStepStart) / xwDuring) * frames);
      if (index < frames && index >= 0) {
        console.log(spriteGroupLast, this.textures[resoures.w[index]]);
        (spriteGroupLast.getChildByName("bgLast") as PIXI.Sprite).texture =
          this.textures[resoures.x[index]];
      }
    }
  };

  audioAction = (progess: number) => {
    // 星星结束后ding
    const timeDuring = 20;
    const auStarStart = -40 / this.touch.min;
    const auStarEnd = -(40 + timeDuring) / this.touch.min;
    if (progess > auStarStart && progess <= auStarEnd) {
      this.playAudio(this.music.dingMusic);
    }
    if (progess < auStarStart) {
      this.stopAudio(this.music.dingMusic);
    }

    const auHuanhuStart = -2270 / this.touch.min;
    const auHuanhuEnd = -(2270 + timeDuring) / this.touch.min;
    if (progess > auHuanhuStart && progess <= auHuanhuEnd) {
      this.playAudio(this.music.huanhuMusic);
    }
    if (progess < auHuanhuStart) {
      this.stopAudio(this.music.huanhuMusic);
    }
  };

  playAudio(sound: Sound) {
    if (!this.muted) {
      sound.play();
    }
  }

  stopAudio(sound: Sound) {
    sound.stop();
  }

  addSprite = (as: AddingSprite) => {
    const groupArr = as.groupName.split("/");
    let group = this.app.stage.getChildByName(
      groupArr.shift()!
    ) as PIXI.Container;
    while (groupArr.length > 0) {
      group = group.getChildByName(groupArr.shift()!) as PIXI.Container;
    }

    const sprite = PIXI.Sprite.from(this.textures[as.img]);
    sprite.position.set(as.x, as.y);
    sprite.alpha = as.alpha;
    sprite.name = as.name;
    group.addChild(sprite);
    return sprite;
  };
}

new OnePgage({ el: document.querySelector("#app")!, muted: true }).start();
