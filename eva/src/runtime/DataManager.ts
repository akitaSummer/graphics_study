import Singleton from "@/base/Singleton";
import { ITile } from "@/levels";

export default class DataManager extends Singleton {
  static get Instance() {
    return super.GetInstance<DataManager>();
  }
  levelIndex: number = 1;
  mapInfo: ITile[][] = [];
  mapRowCount: number = 0;
  mapColumCount: number = 0;
}
