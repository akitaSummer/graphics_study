import DataManager from "@/runtime/DataManager";
import { Component } from "@eva/eva.js";
import levels from "@/levels";
import TileMap from "./GameObjects/TileMap";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/utils/constants";
import { TILE_HEIGHT, TILE_WIDTH } from "./GameObjects/Tile";

export class BattleManager extends Component {
  static componentName = "BattleManager";

  init = () => {
    this.initLevel();
  };

  initLevel = () => {
    const { levelIndex } = DataManager.Instance;
    const level = levels[`level${levelIndex}`];
    DataManager.Instance.mapInfo = level.mapInfo;
    DataManager.Instance.mapRowCount = level.mapInfo[0].length;
    DataManager.Instance.mapColumCount = level.mapInfo.length;
    this.generateTileMap();
  };

  // 生成地图
  generateTileMap = () => {
    this.gameObject.addChild(TileMap());
    this.adapPos();
  };

  // 调整位置
  adapPos = () => {
    const { mapRowCount, mapColumCount } = DataManager.Instance;
    const disx = (SCREEN_WIDTH - TILE_WIDTH * mapRowCount) / 2;
    const disy = (SCREEN_HEIGHT - TILE_HEIGHT * mapColumCount) / 2 - 50;

    this.gameObject.transform.position.x = disx;
    this.gameObject.transform.position.y = disy;
  };
}
