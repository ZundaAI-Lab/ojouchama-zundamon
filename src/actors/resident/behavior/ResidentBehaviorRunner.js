/**
 * 責務: Resident が選んだ汎用行動IDをコマンド列として実行する。
 * 更新ルール: 個別の住民名を分岐条件にせず、BehaviorCatalog と behaviorParams だけで行動を決める。
 */
import { RESIDENT_BEHAVIOR_CATALOG } from './ResidentBehaviorCatalog.js';
import { tickBlackboardTimers } from './ResidentBlackboard.js';
import { RESIDENT_COMMANDS, COMMAND_RESULT } from './commands/ResidentBehaviorCommands.js';
import { canRunCommand } from './conditions/ResidentBehaviorConditions.js';

export class ResidentBehaviorRunner {
  static update(resident, dt, ctx) {
    tickBlackboardTimers(resident.blackboard, dt);

    const behavior = this.getBehavior(resident);
    if (behavior.states) {
      this.updateStateMachine(resident, dt, ctx, behavior);
      return;
    }

    this.runCommands(resident, dt, ctx, behavior.update || []);
  }

  static handleProjectile(resident, projectile, ctx) {
    const behavior = this.getBehavior(resident);
    const result = this.runCommands(resident, 0, ctx, behavior.onProjectile || [], { projectile });
    return result.handled ? result : COMMAND_RESULT.NONE;
  }

  static getBehavior(resident) {
    return RESIDENT_BEHAVIOR_CATALOG[resident.behaviorId] || RESIDENT_BEHAVIOR_CATALOG.ground_patrol;
  }

  static updateStateMachine(resident, dt, ctx, behavior) {
    const blackboard = resident.blackboard;
    if (!blackboard.state || !behavior.states[blackboard.state]) {
      blackboard.state = behavior.initialState || Object.keys(behavior.states)[0];
      blackboard.stateEntered = false;
    }

    let guard = 0;
    while (guard < 3) {
      guard += 1;
      const state = behavior.states[blackboard.state];
      if (!blackboard.stateEntered) {
        this.runCommands(resident, dt, ctx, state.enter || []);
        blackboard.stateEntered = true;
      }

      delete blackboard.nextState;
      this.runCommands(resident, dt, ctx, state.update || []);
      if (!blackboard.nextState || blackboard.nextState === blackboard.state) return;

      this.runCommands(resident, dt, ctx, state.exit || []);
      blackboard.state = blackboard.nextState;
      blackboard.stateEntered = false;
      delete blackboard.nextState;
    }
  }

  static runCommands(resident, dt, ctx, commands, io = {}) {
    let lastResult = COMMAND_RESULT.NONE;
    let lastCommandHandled = false;

    for (const commandDef of commands) {
      const commandIo = { ...io, lastCommandHandled };
      if (!canRunCommand(resident, commandDef, ctx, commandIo)) {
        lastCommandHandled = false;
        lastResult = COMMAND_RESULT.NONE;
        continue;
      }

      const command = RESIDENT_COMMANDS[commandDef.command];
      if (!command) {
        lastCommandHandled = false;
        lastResult = COMMAND_RESULT.NONE;
        continue;
      }

      lastResult = command(resident, dt, ctx, commandDef, commandIo) || COMMAND_RESULT.NONE;
      lastCommandHandled = !!lastResult.handled;
    }

    return lastResult;
  }
}
