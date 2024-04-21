import { ExcaliburGraph, GraphNode } from "@excaliburjs/plugin-pathfinding";
import { Action, ActionCompleteEvent, ActionQueue, Actor, ActorArgs, Entity } from "excalibur";

/*
TODO
- modify GoapAction to not be an action
- modify goapAgent to NOT use the action queue
- add a 'execute' method to goapAction

*/

/**
 *
 * @module - GOAP AI Module
 * @author - Justin Young
 * @version - 0.0.1
 * @description - A GOAP planner module that includes actions and goals
 * @license - BSD 2-Clause License
 * @copyright - Copyright (c) 2024
 *
 */

/**
 * @Types
 * @description - Types for GOAP
 * actionstate - Key value pair of state
 * effectCallback - callback that is passed to an action to modify the worldstate
 * preconditionCallback - The precondition callback that is passed to an action to determine if the action can be done
 */
export type actionstate = Record<string, any>;
export type effectCallback = (worldstate: actionstate, agentState?: actionstate) => void;
export type preconditionCallback = (worldstate: actionstate, agentState?: actionstate) => boolean;
export type actionCallback = (actionEntity: GoapAgent, worldstate: actionstate) => Promise<void>;
export enum GoapActionStatus {
  waiting,
  complete,
  busy,
}
/**
 * @interfaces
 * @description - Interfaces for GOAP
 * iGoapAgent - Interface for GOAP agent
 * iGoapPlanner - Interface for GOAP planner
 *
 */
export interface GoapAgentConfig {
  world: actionstate;
  state: actionstate;
  actions: GoapAction[];
  goals: GoapGoal[];
  actorConfig: ActorArgs;
  onNewPlan: (s: actionstate) => void;
}
export interface GoapPlannerConfig {
  world: actionstate;
  agentState: actionstate;
  goals: GoapGoal[];
  actions: GoapAction[];
}
export interface GoapActionConfig {
  entity: GoapAgent;
  name: string;
  cost: number;
  effect: effectCallback;
  precondition: preconditionCallback;
  action: actionCallback;
}

export interface GoapGoalConfig {
  name: string;
  targetState: actionstate;
  weighting: (s: actionstate) => number;
}

/**
 * @classes
 * @description - Classes for GOAP
 * GoapAgent - Class for GOAP agent
 * GoapPlanner - Class for GOAP planner
 * GoapAction - Class for GOAP action
 * GoapGoal - Class for GOAP goal
 */

/**
 * @description - Class for GOAP agent
 * @param input - Input configuration for the agent.
 * @method cancelPlan - cancels the current plan
 * @method onPostUpdate - on post update (game loop update)
 * @method currentGoalFulfilled - current goal fulfilled
 */
export class GoapAgent extends Actor {
  isRunning = false;
  state: actionstate;
  world: actionstate;
  goals: GoapGoal[];
  goapActions: GoapAction[];
  planner: GoapPlanner | undefined;
  plan: GoapAction[] = [];
  queue: ActionQueue | undefined;
  cancelPlanFlag = false;

  constructor(input: GoapAgentConfig) {
    super(input.actorConfig);
    this.goals = input.goals;
    this.state = input.state;
    this.goapActions = input.actions;
    this.world = input.world;
    this.plan = [];
  }

  cancelPlan() {
    this.plan = [];
    this.cancelPlanFlag = true;
  }

  initialize() {
    this.planner = new GoapPlanner({ world: this.world, agentState: this.state, goals: this.goals, actions: this.goapActions });
  }

  async onPostUpdate() {
    if (!this.isRunning || !this.planner) return;

    if (this.plan.length === 0) {
      this.plan = this.planner.plan();
    } else {
      //run plan
      //grab first action, index 0 from plan
      const firstAction = this.plan[0];
      if (firstAction.status === GoapActionStatus.busy) return;
      await firstAction.execute(this.world);
      firstAction.reset();
      //remove first action from plan
      this.plan.shift();
    }
  }

  currentGoalFulfilled() {
    this.cancelPlan();
  }
}

/**
 * @description - Class for GOAP goal
 * @param input - Input configuration for the goal.
 * @method getPriority - get priority for this goal
 */
export class GoapGoal {
  name: string;
  targetState: actionstate;
  weighting: (s: actionstate) => number;

  constructor(input: GoapGoalConfig) {
    this.name = input.name;
    this.targetState = input.targetState;
    this.weighting = input.weighting;
  }

  getPriority(world: actionstate): number {
    return this.weighting(world);
  }
}

/**
 * @description - Class for GOAP action
 * @param input - Input configuration for the action.
 * @method isAchievable - is acheivable, returns true if the action can be done
 */

/*
export class GoapAction implements Action 
*/

export class GoapAction {
  owner: GoapAgent;
  status: GoapActionStatus = GoapActionStatus.waiting;
  name: string;
  cost: number;
  effect: effectCallback;
  precondition: preconditionCallback;
  substitueAction: Action | undefined;
  action: actionCallback;

  constructor(input: GoapActionConfig) {
    this.name = input.name;
    this.cost = input.cost;
    this.effect = input.effect;
    this.precondition = input.precondition;
    this.action = input.action;
    this.owner = input.entity;
  }

  async execute(s: actionstate) {
    if (this.status === GoapActionStatus.waiting) {
      this.status = GoapActionStatus.busy;
      await this.action(this.owner, s);
      this.effect(s);
      this.status = GoapActionStatus.complete;
    }
  }

  reset(): void {
    this.status = GoapActionStatus.waiting;
  }
  cancel(): void {
    this.status = GoapActionStatus.complete;
  }

  isAchievable(worldstate: actionstate): boolean {
    return this.precondition(worldstate);
  }
}

/**
 * @description - Class for GOAP planner
 * @param input - Input configuration for the planner.
 * @method buildGraph - builds, node tree for DFS search for goal
 * @method cheapestPath - cheapest path, based on action cost
 * @method plan - starts building the plan, returns array of actions
 * @method checkIfGoalReached - check if goal reached
 * @method modifyState - modify state, creates copy of state and returns new state object
 */
export class GoapPlanner {
  graph = new ExcaliburGraph();
  world: actionstate;
  agentState: actionstate;
  goals: GoapGoal[];
  actions: GoapAction[];
  numEndNodes = 0;
  constructor(input: GoapPlannerConfig) {
    this.world = input.world;
    this.agentState = input.agentState;
    this.goals = input.goals;
    this.actions = input.actions;
  }

  buildGraph(
    startnode: GraphNode,
    useableActions: GoapAction[],
    worldstate: actionstate,
    graph: ExcaliburGraph,
    goal: GoapGoal,
    levelcount: number,
    branch: number
  ) {
    let origState: actionstate = {};
    if (levelcount == 0) origState = Object.assign({}, worldstate);

    let level = levelcount + 1;
    let branchcnt = branch;

    let incomingstate = Object.assign({}, worldstate);

    for (let i = 0; i < useableActions.length; i++) {
      branchcnt = i;

      let nodestring = `node -> level:${level} branch:${branchcnt}`;
      const action = useableActions[i];
      if (level == 1) incomingstate = origState;

      const newState = this._modifyState(incomingstate, action.effect);
      const newuseableActions = this.actions.filter(action => action.isAchievable(newState));

      let nextnode;

      if (this._checkIfGoalReached(goal, newState)) {
        graph.addNode({ id: `endnode_${this.numEndNodes}`, value: { world: newState, state: this.agentState, action: action } });
        nextnode = graph.getNodes().get(`endnode_${this.numEndNodes}`);
        const edgeString = `edge from:${startnode.id} to:endnode_${this.numEndNodes}`;
        graph.addEdge({ name: edgeString, from: startnode, to: nextnode!, value: action.cost });
        this.numEndNodes++;
        continue;
      } else {
        graph.addNode({ id: nodestring, value: { world: incomingstate, state: this.agentState, action: action } });
        nextnode = graph.getNodes().get(nodestring);
        const edgeString = `edge from:${startnode.id} to:${nextnode?.id}`;
        graph.addEdge({ name: edgeString, from: startnode, to: nextnode!, value: action.cost });
      }
      if (newuseableActions.length === 0) continue;
      const newStateCopy = Object.assign({}, newState);
      this.buildGraph(nextnode!, newuseableActions, newStateCopy, graph, goal, level, branchcnt);
    }
  }

  private _checkIfGoalReached(goal: GoapGoal, state: actionstate): boolean {
    //loop through goal keys and find key in state
    for (const key in goal.targetState) {
      //check if entry is a primitive in targetState
      if (typeof goal.targetState[key] !== "object") {
        if (state[key] !== goal.targetState[key]) {
          return false;
        }
      } else {
        //if it is an object, convert to Goal and recursively check next level of object
        const tempGoalstate: GoapGoal = new GoapGoal({
          name: key,
          targetState: goal.targetState[key] as actionstate,
          weighting: () => {
            return 1;
          },
        });
        const tempCurrentState = state[key] as actionstate;
        if (!this._checkIfGoalReached(tempGoalstate, tempCurrentState)) return false;
        else continue;
      }
    }
    return true;

    //return JSON.stringify(state) === JSON.stringify(goal.targetState);
  }

  private _modifyState(world: actionstate, effect: effectCallback): actionstate {
    const newState = Object.assign({}, world);
    effect(newState);
    return newState;
  }

  private _cheapestPath(graph: ExcaliburGraph): GoapAction[] {
    const startnode = graph.getNodes().get("startnode");
    const endnodes: GraphNode[] = [];

    graph.nodes.forEach(node => {
      let testString: string[] = [];
      if (typeof node.id == "string") testString = node.id.split("_");
      if (testString[0] === "endnode") endnodes.push(node);
    });
    if (endnodes.length === 0) return [];

    //test each shortest path between startnode and each endnode and return the lowest cost path
    let lowestCost = Infinity;
    let cheapestEndNode: GraphNode | undefined;

    endnodes.forEach(node => {
      const path = graph.shortestPath(startnode!, node);

      //add up costs of path
      let cost = 0;
      path.reduce((node, nextnode) => {
        const edge = graph.getEdges().get(`edge from:${node.id} to:${nextnode.id}`);
        if (edge) {
          cost += edge.value!;
        }
        return nextnode;
      });
      if (cost < lowestCost) {
        lowestCost = cost;
        cheapestEndNode = node;
      }
    });

    let cheapestPlan = graph.shortestPath(startnode!, cheapestEndNode!);
    let actionPlan = cheapestPlan.map(node => {
      return node.value.action;
    });
    actionPlan.splice(0, 1);
    return actionPlan;
  }

  plan(): GoapAction[] {
    //debugger;
    //pick best goal
    // best goal will be determined by highest weighting

    //reset all actions
    this.actions.forEach(action => action.reset());

    const bestGoal = this.goals.reduce((prev, curr) => (prev.weighting(this.world) > curr.weighting(this.world) ? prev : curr));
    this.graph.resetGraph();

    //get list of usable actions

    const useableActions = this.actions.filter(action => action.isAchievable(this.world));
    if (useableActions.length === 0) throw new Error("No actions are achievable");
    this.graph.addNode({
      id: "startnode",
      value: { world: this.world, state: this.agentState, action: null },
    });

    this.buildGraph(this.graph.getNodes().get("startnode")!, useableActions, this.world, this.graph, bestGoal, 0, 0);
    // iterate over tree graph and find cheapest path that satisfies all goals

    const actionplan = this._cheapestPath(this.graph);
    return actionplan;
  }
}
