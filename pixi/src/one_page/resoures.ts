let resources = {
  common: {
    bg: "/one_page/images/bg.jpg",
    qrcode: "/one_page/images/ewm.png",
    musicoff: "/one_page/images/musicoff.png",
    musicon: "/one_page/images/musicon.png",
  },
  p1: {
    bg: "/one_page/images/p1-bg.png",
    cloud1: "/one_page/images/p1-cloud1.png",
    cloud2: "/one_page/images/p1-cloud2.png",
    grass1: "/one_page/images/p1-grass1.png",
    grass2: "/one_page/images/p1-grass2.png",
    house: "/one_page/images/p1-house.png",
    family: "/one_page/images/p1-p1.png",
    star: "/one_page/images/p1-star.png",
    tree: "/one_page/images/p1-tree.png",
  },
  p2: {
    grass: "/one_page/images/p2-1.png",
    boy: "/one_page/images/p2-boy.png",
    huati: "/one_page/images/p2-huati.png",
    lotsofyinfu: "/one_page/images/p2-lotsofyinfu.png",
    mother: "/one_page/images/p2-mother.png",
    school: "/one_page/images/p2-school.png",
    shitou: "/one_page/images/p2-shitou.png",
    tree4: "/one_page/images/p2-tree4.png",
    wutai: "/one_page/images/p2-wutai.png",
    yinfu: "/one_page/images/p2-yinfu.png",
  },
  w: [
    "/one_page/images/w1.png",
    "/one_page/images/w2.png",
    "/one_page/images/w3.png",
    "/one_page/images/w4.png",
    "/one_page/images/w5.png",
    "/one_page/images/w6.png",
    "/one_page/images/w7.png",
    "/one_page/images/w8.png",
    "/one_page/images/w9.png",
    "/one_page/images/w10.png",
    "/one_page/images/w11.png",
    "/one_page/images/w12.png",
    "/one_page/images/w13.png",
    "/one_page/images/w14.png",
    "/one_page/images/w15.png",
    "/one_page/images/w16.png",
    "/one_page/images/w17.png",
    "/one_page/images/w18.png",
    "/one_page/images/w19.png",
    "/one_page/images/w20.png",
    "/one_page/images/w21.png",
    "/one_page/images/w22.png",
    "/one_page/images/w23.png",
    "/one_page/images/w24.png",
    "/one_page/images/w25.png",
    "/one_page/images/w26.png",
    "/one_page/images/w27.png",
    "/one_page/images/w28.png",
    "/one_page/images/w29.png",
    "/one_page/images/w30.png",
    "/one_page/images/w31.png",
    "/one_page/images/w32.png",
    "/one_page/images/w33.png",
    "/one_page/images/w34.png",
  ],
  p3: [
    "/one_page/images/p3-1.png",
    "/one_page/images/p3-2.png",
    "/one_page/images/p3-3.png",
    "/one_page/images/p3-childbirth.png",
  ],
  p4: [
    "/one_page/images/p4-1.png",
    "/one_page/images/p4-bg.png",
    "/one_page/images/p4-house3.png",
    "/one_page/images/p4-start.png",
  ],
  x: [
    "/one_page/images/x1.png",
    "/one_page/images/x2.png",
    "/one_page/images/x3.png",
    "/one_page/images/x4.png",
    "/one_page/images/x5.png",
    "/one_page/images/x6.png",
    "/one_page/images/x7.png",
    "/one_page/images/x8.png",
    "/one_page/images/x9.png",
    "/one_page/images/x10.png",
    "/one_page/images/x11.png",
    "/one_page/images/x12.png",
    "/one_page/images/x13.png",
    "/one_page/images/x14.png",
    "/one_page/images/x15.png",
    "/one_page/images/x16.png",
    "/one_page/images/x17.png",
    "/one_page/images/x18.png",
    "/one_page/images/x19.png",
    "/one_page/images/x20.png",
    "/one_page/images/x21.png",
    "/one_page/images/x22.png",
    "/one_page/images/x23.png",
    "/one_page/images/x24.png",
    "/one_page/images/x25.png",
    "/one_page/images/x26.png",
    "/one_page/images/x27.png",
    "/one_page/images/x28.png",
    "/one_page/images/x29.png",
    "/one_page/images/x30.png",
    "/one_page/images/x31.png",
    "/one_page/images/x32.png",
    "/one_page/images/x33.png",
    "/one_page/images/x34.png",
    "/one_page/images/x35.png",
    "/one_page/images/x36.png",
    "/one_page/images/x37.png",
    "/one_page/images/x38.png",
    "/one_page/images/x39.png",
    "/one_page/images/x40.png",
    "/one_page/images/x41.png",
    "/one_page/images/x42.png",
    "/one_page/images/x43.png",
    "/one_page/images/x44.png",
    "/one_page/images/x45.png",
    "/one_page/images/x46.png",
    "/one_page/images/x47.png",
    "/one_page/images/x48.png",
    "/one_page/images/x49.png",
    "/one_page/images/x50.png",
    "/one_page/images/x51.png",
  ],
  music: {
    bg: "/one_page/audios/bg.mp3",
    ding: "/one_page/audios/ding.mp3",
    huanhu: "/one_page/audios/huanhu.mp3",
  },
};

interface AddingSpriteProps {
  img: string;
  x: number;
  y: number;
  alpha?: number;
  name: string;
  groupName: string;
}

export class AddingSprite {
  constructor(
    public img: string,
    public x: number,
    public y: number,
    public name: string,
    public groupName: string,
    public alpha = 1
  ) {}
}

export const spriteGroupBgObjects = [
  new AddingSprite(resources.common.bg, 0, 0, "bgSpr", "spriteGroupBg"),
];

export const scene1Objects = [
  new AddingSprite(
    resources.p1.bg,
    0,
    0,
    "p1BgSpr",
    "spriteGroupScenes/scene1"
  ),
  new AddingSprite(
    resources.p1.cloud1,
    -20,
    177,
    "p1Cloud1",
    "spriteGroupScenes/scene1"
  ),
  new AddingSprite(
    resources.p1.cloud2,
    752,
    5,
    "p1Cloud2",
    "spriteGroupScenes/scene1"
  ),
  new AddingSprite(
    resources.p1.grass1,
    0,
    1098,
    "p1Grass1",
    "spriteGroupScenes/scene1"
  ),
  new AddingSprite(
    resources.p1.grass2,
    836,
    1166,
    "p1Grass2",
    "spriteGroupScenes/scene1"
  ),
  new AddingSprite(
    resources.p1.house,
    732,
    0,
    "p1House",
    "spriteGroupScenes/scene1"
  ),
  new AddingSprite(
    resources.p1.family,
    996,
    343,
    "p1Family",
    "spriteGroupScenes/scene1"
  ),
  new AddingSprite(
    resources.p1.star,
    424,
    419,
    "p1Star",
    "spriteGroupScenes/scene1",
    0
  ),
  new AddingSprite(
    resources.p1.tree,
    0,
    604,
    "p1Tree",
    "spriteGroupScenes/scene1"
  ),
];

export const scene2Objects = [
  new AddingSprite(
    resources.p2.grass,
    0,
    816,
    "p2Grass",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.school,
    613,
    31,
    "p2School",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.huati,
    1298,
    567,
    "p2Huati",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.boy,
    1516,
    414,
    "p2Boy",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.mother,
    144,
    768,
    "p2Mother",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.shitou,
    1200,
    1149,
    "p2Shitou",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.tree4,
    1937,
    46,
    "p2Tree4",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.wutai,
    2243,
    349,
    "p2Wutai",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.lotsofyinfu,
    1932,
    307,
    "p2Lotsofyinfu",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(
    resources.p2.yinfu,
    3009,
    273,
    "p2Yinfu",
    "spriteGroupScenes/scene2"
  ),
  new AddingSprite(resources.w[0], 0, 0, "p2Child", "spriteGroupScenes/scene2"),
];

export const scene3Objects = [
  new AddingSprite(
    resources.p3[1],
    826,
    142,
    "p32",
    "spriteGroupScenes/scene3"
  ),
  new AddingSprite(
    resources.p3[0],
    0,
    80,
    "p31",
    "spriteGroupScenes/scene3",
    0
  ),
  new AddingSprite(resources.p3[2], 971, 24, "p33", "spriteGroupScenes/scene3"),
  new AddingSprite(
    resources.p3[3],
    2397,
    453,
    "p3Childbirth",
    "spriteGroupScenes/scene3"
  ),
];
export const scene4Objects = [
  new AddingSprite(resources.p4[1], 388, 0, "p4bg", "spriteGroupScenes/scene4"),
  new AddingSprite(
    resources.p4[2],
    0,
    0,
    "p4House3",
    "spriteGroupScenes/scene4"
  ),
  new AddingSprite(
    resources.p4[0],
    701,
    535,
    "p41",
    "spriteGroupScenes/scene4"
  ),
  new AddingSprite(
    resources.p4[3],
    1401,
    0,
    "p4Star",
    "spriteGroupScenes/scene4"
  ),
];

export const spriteGroupLastObjects = [
  new AddingSprite(resources.x[0], 0, 0, "bgLast", "spriteGroupLast", 0),
];

export const spriteObjects = [
  ...spriteGroupBgObjects,
  ...scene1Objects,
  ...scene2Objects,
  ...scene3Objects,
  ...scene4Objects,
  ...spriteGroupLastObjects,
];
export default resources;
