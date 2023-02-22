import { FSM_PARAM_TYPE_ENUM } from "@/utils/enums";
import { Component } from "@eva/eva.js";
import State from "./State";
import SubStateMachine from "./SubStateMachine";

export const getInitParamsTrigger = () => {
  return {
    type: FSM_PARAM_TYPE_ENUM.TRIGGER,
    value: false,
  } as IParams<FSM_PARAM_TYPE_ENUM.TRIGGER>;
};

export const getInitParamsNumber = () => {
  return {
    type: FSM_PARAM_TYPE_ENUM.NUMBER,
    value: 0,
  } as IParams<FSM_PARAM_TYPE_ENUM.NUMBER>;
};

export interface IParams<
  T extends FSM_PARAM_TYPE_ENUM = FSM_PARAM_TYPE_ENUM,
  V = T extends FSM_PARAM_TYPE_ENUM.NUMBER ? number : boolean
> {
  type: T;
  value: V;
}

export default abstract class StateMachine extends Component {
  static componentName: string = "StateMachine";
  private _currentState?: State | SubStateMachine;
  params: Map<string, IParams> = new Map();
  stateMachines: Map<string, State | SubStateMachine> = new Map();

  // 当前状态
  get currentState() {
    return this._currentState;
  }

  // 设置状态并运行
  set currentState(state) {
    this._currentState = state;
    this._currentState?.run();
  }

  getParams = <T extends FSM_PARAM_TYPE_ENUM = FSM_PARAM_TYPE_ENUM>(
    paramName: string
  ) => {
    if (this.params.has(paramName)) {
      return (this.params.get(paramName) as IParams<T>).value;
    }
    return undefined;
  };

  setParams = (paramName: string, value: number | boolean) => {
    if (this.params.has(paramName)) {
      this.params.get(paramName)!.value = value;
      this.run();
      this.resetTrigger();
    }
  };

  resetTrigger = () => {
    for (const [, value] of this.params) {
      if (value.type === FSM_PARAM_TYPE_ENUM.TRIGGER) {
        value.value = false;
      }
    }
  };

  abstract run: () => void;
}
