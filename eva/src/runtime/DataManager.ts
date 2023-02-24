import Singleton from "@/base/Singleton";
import { ITile } from "@/levels";
import DoorManager from "@/scenes/Battle/GameObjects/Door/Script/manager";
import PlayerManager from "@/scenes/Battle/GameObjects/Player/Script/manager";
import TileManager from "@/scenes/Battle/GameObjects/Tile/manager";
import WoodenSkeletonManager from "@/scenes/Battle/GameObjects/WoodenSkeleton/Script/manager";

export default class DataManager extends Singleton {
  static get Instance() {
    return super.GetInstance<DataManager>();
  }
  levelIndex: number = 1;
  mapInfo: ITile[][] = [];
  tileInfo: TileManager[][] = [];
  mapRowCount: number = 0;
  mapColumnCount: number = 0;
  enemies: WoodenSkeletonManager[] = [];
  player?: PlayerManager;
  door?: DoorManager;

  reset = () => {
    this.player = undefined;
    this.mapInfo = [];
    this.tileInfo = [];
    this.mapRowCount = 0;
    this.mapColumnCount = 0;
  };
}
