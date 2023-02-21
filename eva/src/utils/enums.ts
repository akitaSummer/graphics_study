/***
 * 全局枚举
 */

/***
 * 地图瓦片枚举
 */
export enum TILE_TYPE_ENUM {
  /** 横着的墙壁 */
  WALL_ROW = "WALL_ROW",
  /** 竖着的墙壁 */
  WALL_COLUMN = "WALL_COLUMN",
  /** 左上角 */
  WALL_LEFT_TOP = "WALL_LEFT_TOP",
  /** 右上角 */
  WALL_RIGHT_TOP = "WALL_RIGHT_TOP",
  /** 左下角 */
  WALL_LEFT_BOTTOM = "WALL_LEFT_BOTTOM",
  /** 右下角 */
  WALL_RIGHT_BOTTOM = "WALL_RIGHT_BOTTOM",
  /** 左侧悬崖 */
  CLIFF_LEFT = "CLIFF_ROW_START",
  /** 中间悬崖 */
  CLIFF_CENTER = "CLIFF_ROW_CENTER",
  /** 右侧悬崖 */
  CLIFF_RIGHT = "CLIFF_ROW_END",
  /** 地板 */
  FLOOR = "FLOOR",
}
