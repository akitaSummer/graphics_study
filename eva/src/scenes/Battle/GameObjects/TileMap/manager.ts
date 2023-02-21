import { Component } from "@eva/eva.js";
import DataManager from "@/runtime/DataManager";
import { renderByRange } from "@/utils/tools";
import Tile from "../Tile";

export class TileMapManager extends Component {
  static componentName = "TileMapManager";

  init = () => {
    this.initTile();
  };

  initTile = () => {
    const { mapInfo } = DataManager.Instance;

    for (let i = 0; i < mapInfo.length; i++) {
      const column = mapInfo[i];
      for (let j = 0; j < column.length; j++) {
        const item = column[j];

        if (item.src === null || item.type === null) {
          continue;
        }

        let number = item.src;

        // 1,5,9tile时，如果横纵坐标均为偶数，进行做旧
        if (
          (number === 1 || number === 5 || number === 9) &&
          i % 2 === 0 &&
          j % 2 === 0
        ) {
          number += renderByRange(0, 4);
        }

        const imgSrc = `bg (${number}).png`;

        const tile = Tile(item.type, imgSrc, i, j);
        this.gameObject.addChild(tile);
      }
    }
  };
}
