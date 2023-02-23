import DataManager from "@/runtime/DataManager";
import { Component } from "@eva/eva.js";
import levels from "@/levels";
import TileMap from "./GameObjects/TileMap";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/utils/constants";
import { TILE_HEIGHT, TILE_WIDTH } from "./GameObjects/Tile";
import EventManager from "@/runtime/EventManager";
import { EVENT_ENUM } from "@/utils/enums";
import Player from "./GameObjects/Player";
import WoodenSkeleton from "./GameObjects/WoodenSkeleton";
import PlayerManager from "./GameObjects/Player/Script/manager";

export class BattleManager extends Component {
  static componentName = "BattleManager";

  init = () => {
    EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this);
    this.initLevel();
  };

  // 初始化关卡
  initLevel = () => {
    this.clearLevel();
    const { levelIndex } = DataManager.Instance;
    const level = levels[`level${levelIndex}`];
    DataManager.Instance.mapInfo = level.mapInfo;
    DataManager.Instance.mapRowCount = level.mapInfo.length;
    DataManager.Instance.mapColumnCount = level.mapInfo[0].length;
    this.generateTileMap();
    this.generatePlayer();
    this.generateEnemies();
  };

  // 生成地图
  generateTileMap = () => {
    this.gameObject.addChild(TileMap());
    this.adapPos();
  };

  // 生成角色
  generatePlayer = () => {
    const player = Player();
    this.gameObject.addChild(player);
    DataManager.Instance.player = player.getComponent(PlayerManager);
  };

  // 生成敌人
  generateEnemies = () => {
    this.gameObject.addChild(WoodenSkeleton());
  };

  // 调整位置
  adapPos = () => {
    const { mapRowCount, mapColumnCount } = DataManager.Instance;
    const disx = (SCREEN_WIDTH - TILE_WIDTH * mapRowCount) / 2;
    const disy = (SCREEN_HEIGHT - TILE_HEIGHT * mapColumnCount) / 2 - 50;

    this.gameObject.transform.position.x = disx;
    this.gameObject.transform.position.y = disy;
  };

  // 清空关卡数据
  clearLevel = () => {
    this.gameObject.transform.children.forEach(({ gameObject }) => {
      gameObject.destroy();
    });

    DataManager.Instance.reset();
  };

  // 下一关
  nextLevel = () => {
    DataManager.Instance.levelIndex++;
    this.initLevel();
  };
}
