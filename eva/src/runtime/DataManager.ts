import Singleton from "@/base/Singleton";
import { ITile } from "@/levels";
import PlayerManager from "@/scenes/Battle/GameObjects/Player/Script/manager";
import TileManager from "@/scenes/Battle/GameObjects/Tile/manager";

export default class DataManager extends Singleton {
  static get Instance() {
    return super.GetInstance<DataManager>();
  }
  levelIndex: number = 1;
  mapInfo: ITile[][] = [];
  tileInfo: TileManager[][] = [];
  mapRowCount: number = 0;
  mapColumnCount: number = 0;
  player?: PlayerManager;

  reset = () => {
    this.player = undefined;
    this.mapInfo = [];
    this.tileInfo = [];
    this.mapRowCount = 0;
    this.mapColumnCount = 0;
  };
}
