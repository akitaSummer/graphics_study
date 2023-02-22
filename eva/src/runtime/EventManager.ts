import Singleton from "@/base/Singleton";

interface IItem {
  func: Function;
  ctx: unknown;
}

export default class EventManager extends Singleton {
  static get Instance() {
    return super.GetInstance<EventManager>();
  }

  eventDic: Map<string, IItem[]> = new Map();

  on = (event: string, func: Function, ctx?: unknown) => {
    if (this.eventDic.has(event)) {
      this.eventDic.get(event)!.push({ func, ctx });
    } else {
      this.eventDic.set(event, [{ func, ctx }]);
    }
  };

  off = (event: string, func: Function) => {
    if (this.eventDic.has(event)) {
      const index = this.eventDic.get(event)!.findIndex((i) => i.func === func);
      if (index > -1) {
        this.eventDic.get(event)!.splice(index, 1);
      }
    }
  };

  emit = (event: string, ...params: unknown[]) => {
    if (this.eventDic.has(event)) {
      this.eventDic
        .get(event)!
        .forEach(({ func, ctx }) =>
          ctx ? func.apply(ctx, params) : func(...params)
        );
    }
  };

  clear = () => {
    this.eventDic.clear();
  };
}
