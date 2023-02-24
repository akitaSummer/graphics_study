import DataManager from "@/runtime/DataManager";
import EntityManager from "@/base/EntityManager";
import EventManager from "@/runtime/EventManager";
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, EVENT_ENUM } from "@/utils/enums";
import DoorStateMachine from "./stateMachine";

export default class DoorManager extends EntityManager {
  static componentName = "DoorManager"; // 设置组件的名字

  init = () => {
    this.fsm = this.gameObject.addComponent(new DoorStateMachine());
    this.x = 7;
    this.y = 8;
    this.state = ENTITY_STATE_ENUM.IDLE;
    this.direction = DIRECTION_ENUM.BOTTOM;

    EventManager.Instance.on(EVENT_ENUM.DOOR_OPEN, this.onOpen, this);
  };

  onDestroy = () => {
    EventManager.Instance.off(EVENT_ENUM.DOOR_OPEN, this.onOpen);
  };

  onOpen = () => {
    if (
      DataManager.Instance.enemies.every(
        (enemy: EntityManager) => enemy.state === ENTITY_STATE_ENUM.DEATH
      ) &&
      this.state !== ENTITY_STATE_ENUM.DEATH
    ) {
      this.state = ENTITY_STATE_ENUM.DEATH;
    }
  };
}
