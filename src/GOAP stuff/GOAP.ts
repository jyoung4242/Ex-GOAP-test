import { ExcaliburGraph, GraphNode } from "@excaliburjs/plugin-pathfinding";
import { Action, ActionQueue, Actor, ActorArgs, Engine } from "excalibur";
import cytoscape from "./cyto";

/**
 *
 * @module - GOAP AI Module
 * @author - Justin Young
 * @version - 0.0.2
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
export type actionCallback = (actionEntity: GoapAgent, action: GoapAction, worldstate: actionstate) => Promise<void>;
export type costCallback = (actionEntity: GoapAgent, worldstate: actionstate) => number;

export enum GoapActionStatus {
  waiting,
  complete,
  busy,
}
/**
 * @interfaces
 * @description - Interfaces for GOAP
 * GoapAgentConfig - Interface for GOAP agent
 * GoapPlannerConfig - Interface for GOAP planner
 * GoapActionConfig - Interface for GOAP actions
 * GoapGoalConfig - Interface for GOAP goals
 */
export interface GoapAgentConfig {
  world: actionstate;
  state: actionstate;
  actions: GoapAction[];
  goals: GoapGoal[];
  actorConfig: ActorArgs;
  delayedPlanning?: number;
  debugMode?: boolean;
}
export interface GoapPlannerConfig {
  agent: GoapAgent;
  world: actionstate;
  agentState: actionstate;
  goals: GoapGoal[];
  actions: GoapAction[];
  mode?: boolean;
}
export interface GoapActionConfig {
  entity: GoapAgent;
  name: string;
  cost: costCallback;
  effect: effectCallback;
  precondition: preconditionCallback;
  action: actionCallback;
  timeout?: number;
}

export interface GoapGoalConfig {
  name: string;
  targetState: (s: actionstate) => boolean;
  weighting: (s: actionstate) => number;
}

/**
 * @classes
 * @description - Classes for GOAP
 * GoapAgent - Class for GOAP agent
 * GoapPlanner - Class for GOAP planner
 * GoapAction - Class for GOAP action
 * GoapGoal - Class for GOAP goal
 * Goap_UUID - Class for GOAP UUID
 * GOAP_PlanReport - Class for GOAP plan report
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
  planningTiks = 0;
  planningSchedule = 0;
  debug = false;
  firstTime = true;

  constructor(input: GoapAgentConfig) {
    super(input.actorConfig);
    this.goals = input.goals;
    this.state = input.state;
    this.goapActions = input.actions;
    this.world = input.world;
    this.plan = [];
    if (input.delayedPlanning && input.delayedPlanning != 0) this.planningSchedule = input.delayedPlanning;
    if (input.debugMode) this.debug = true;
  }

  public cancelPlan() {
    this.plan.forEach((a: GoapAction) => {
      a.cancel();
    });
    this.plan = [];
    this.cancelPlanFlag = true;
  }

  get isGOAPRunning() {
    return this.isRunning;
  }

  startGOAP() {
    this.isRunning = true;
  }

  stopGOAP() {
    this.isRunning = false;
  }

  initialize() {
    this.planner = new GoapPlanner({
      agent: this,
      world: this.world,
      agentState: this.state,
      goals: this.goals,
      actions: this.goapActions,
      mode: this.debug,
    });
  }

  async onPostUpdate(engine: Engine, deltaTime: number) {
    if (!this.isRunning || !this.planner) return;
    if (this.debug && !this.firstTime) return;

    if (this.plan.length === 0) {
      if (this.planningSchedule > 0) {
        this.planningTiks++;
        if (this.planningTiks >= this.planningSchedule) {
          this.planningTiks = 0;
          this.plan = this.planner.plan();
          this.firstTime = false;
        }
      } else {
        this.plan = this.planner.plan();
        this.firstTime = false;
      }
    } else {
      //run plan
      //grab first action, index 0 from plan
      const firstAction = this.plan[0];
      if (firstAction.status === GoapActionStatus.busy) {
        firstAction.update(deltaTime);
        return;
      } else {
        await firstAction.execute(firstAction, this.world);
      }

      firstAction.reset();
      //remove first action from plan
      this.plan.shift();
    }
  }
}

/**
 * @description - Class for GOAP goal
 * @param input - Input configuration for the goal.
 * @method getPriority - get priority for this goal
 */
export class GoapGoal {
  name: string;
  targetState: (s: actionstate) => boolean;
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
 * @method execute - executes the action
 * @method cancel - cancels the action
 * @method reset - resets the action
 * @method update - updates the action
 * @method getCost - get cost of the action
 */

export class GoapAction {
  owner: GoapAgent;
  status: GoapActionStatus = GoapActionStatus.waiting;
  name: string;
  cost: costCallback;
  effect: effectCallback;
  precondition: preconditionCallback;
  substitueAction: Action | undefined;
  action: actionCallback;
  timeout: number = -1;
  currentTime: number = 0;

  constructor(input: GoapActionConfig) {
    this.name = input.name;
    this.cost = input.cost;
    this.effect = input.effect;
    this.precondition = input.precondition;
    this.action = input.action;
    this.owner = input.entity;
    if (input.timeout) this.timeout = input.timeout;
  }

  async execute(action: GoapAction, s: actionstate) {
    if (this.status === GoapActionStatus.waiting) {
      this.currentTime = 0;
      this.status = GoapActionStatus.busy;
      await this.action(this.owner, action, s);
      this.effect(s);
      this.status = GoapActionStatus.complete;
    }
  }

  getCost(state: actionstate): number {
    return this.cost(this.owner, state);
  }

  update(deltaTime: number) {
    this.currentTime += deltaTime;
    if (this.currentTime >= this.timeout) {
      console.error("Action Timed Out!", this.name);
      this.status = GoapActionStatus.complete;
    }
  }

  reset(): void {
    this.currentTime = 0;
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
 * @method plan - starts building the plan, returns array of actions
 */
export class GoapPlanner {
  agent: GoapAgent;
  graph = new ExcaliburGraph();
  world: actionstate;
  agentState: actionstate;
  goals: GoapGoal[];
  actions: GoapAction[];
  numEndNodes = 0;
  debug: boolean = false;

  constructor(input: GoapPlannerConfig) {
    this.agent = input.agent;
    this.world = input.world;
    this.agentState = input.agentState;
    this.goals = input.goals;
    this.actions = input.actions;
    if (input.mode) this.debug = true;
  }

  _buildGraph(
    startnode: GraphNode,
    useableActions: GoapAction[],
    worldstate: actionstate,
    graph: ExcaliburGraph,
    goal: GoapGoal,
    levelcount: number,
    branch: number,
    depthLimit: number
  ) {
    let origState: actionstate = {};
    if (levelcount == 0) origState = Object.assign({}, worldstate);

    let level = levelcount + 1;
    let branchcnt = branch;

    let incomingstate = Object.assign({}, worldstate);

    for (let i = 0; i < useableActions.length; i++) {
      branchcnt = i;
      let nodestring = `node: ${GOAP_UUID.generateUUID()} -> level:${level} branch:${branchcnt}`;

      const action = useableActions[i];
      if (level == 1) incomingstate = origState;

      const newState = this._modifyState(incomingstate, action.effect);
      const newuseableActions = this.actions.filter(action => action.isAchievable(newState));

      let nextnode;

      if (this._checkIfGoalReached(goal, newState)) {
        graph.addNode({
          id: `endnode_${this.numEndNodes}`,
          value: { world: newState, state: { incomingstate, newState }, action: action },
        });
        nextnode = graph.getNodes().get(`endnode_${this.numEndNodes}`);
        const edgeString = `edge from:${startnode.id} to:endnode_${this.numEndNodes}`;
        graph.addEdge({ name: edgeString, from: startnode, to: nextnode!, value: action.getCost(incomingstate) });
        this.numEndNodes++;
        continue;
      } else {
        graph.addNode({ id: nodestring, value: { world: incomingstate, state: { incomingstate, newState }, action: action } });
        nextnode = graph.getNodes().get(nodestring);
        const edgeString = `edge from:${startnode.id} to:${nextnode?.id}`;
        graph.addEdge({ name: edgeString, from: startnode, to: nextnode!, value: action.getCost(incomingstate) });
      }
      if (newuseableActions.length === 0) continue;
      const newStateCopy = Object.assign({}, newState);

      if (depthLimit > 0 && level > depthLimit) continue;
      this._buildGraph(nextnode!, newuseableActions, newStateCopy, graph, goal, level, branchcnt, depthLimit);
    }
  }

  private _checkIfGoalReached(goal: GoapGoal, state: actionstate): boolean {
    return goal.targetState(state);
    //loop through goal keys and find key in state
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
    //pick best goal
    // best goal will be determined by highest weighting

    //reset all actions
    this.actions.forEach(action => action.reset());

    //randomly pick a goal of the max weighting

    let goalsTested = [];
    let goalTestIndex = 0;
    for (const goal of this.goals) {
      goalsTested.push({ index: goalTestIndex, name: goal.name, weight: goal.weighting(this.world) });
      goalTestIndex++;
    }

    const maxWeight = Math.max(...goalsTested.map(goal => goal.weight));

    const maxWeightGoals = goalsTested.filter(goal => goal.weight === maxWeight);
    const randomlySelectedGoalofMaxWeight = maxWeightGoals[Math.floor(Math.random() * maxWeightGoals.length)];
    const bestGoal = this.goals.find(goal => goal.name === randomlySelectedGoalofMaxWeight.name)!;

    this.graph.resetGraph();

    let useableActions = [];
    for (const action of this.actions) {
      if (action.isAchievable(this.world)) {
        useableActions.push(action);
      }
    }

    if (useableActions.length === 0) return [];

    this.graph.addNode({
      id: "startnode",
      value: { world: this.world, state: { incomingstate: this.world, newstate: {} }, action: null },
    });

    this._buildGraph(this.graph.getNodes().get("startnode")!, useableActions, this.world, this.graph, bestGoal, 0, 0, 20);
    // iterate over tree graph and find cheapest path that satisfies all goals

    const actionplan = this._cheapestPath(this.graph);
    if (this.debug) {
      GOAP_PlanReport.generate(this.graph, actionplan, bestGoal, this.agent);
    }
    return actionplan;
  }
}

/**
 * @description - Generates a UUID
 * @memberof GOAP
 * @method generateUUID - generates a UUID
 */
export class GOAP_UUID {
  static generateUUID(): string {
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return uuid.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/** *
 * @description - Class for GOAP plan report
 * @memberof GOAP
 * @method generate - generates and consoles out a plan report
 * @method showGraph - shows the graph in the console
 */

class GOAP_PlanReport {
  reportString: string = "";

  static async generate(graph: ExcaliburGraph, actionplan: GoapAction[], goal: GoapGoal, agent: GoapAgent) {
    let reportString;
    reportString = `\n************************************************************************** \n`;
    //append formated date string to report string
    const now = Date.now();
    const date = new Date(now);
    reportString = reportString + `GOAP PLAN REPORT - Agent: ${agent.name} - When: ${date.toLocaleString()} \n`;
    reportString = reportString + `**************************************************************************\n\n`;
    console.info(reportString);

    // add world state to report string
    let world = graph.getNodes().get("startnode")!.value.state.incomingstate;
    console.info(`World State: \n`, world);

    console.info(`Selected Goal: \n`, goal);

    let _plan = actionplan.map(act => act.name);

    if (actionplan.length > 0) {
      console.info(`Plan Generated: `, _plan);
    } else {
      console.warn("No plan generated");
    }

    console.log(`*****************************************************************`);
    console.log(`Graph Generated: \n`);
    console.log(`*****************************************************************`);

    await GOAP_PlanReport.showGraph(graph);
    await wait(2000);

    for (const node of graph.getNodes()) {
      if (node[0] == "startnode") {
        let startNodeLogObject = {};
        console.log(`Start Node:`);
        //find where startnode is the .from node in each edge and list children to nodes
        let childcount = 0;
        for (const edge of graph.getEdges()) {
          if (edge[1].from.id == node[0]) {
            Object.assign(startNodeLogObject, {
              [`Child ${childcount}`]: { node: edge[1].to.id, action: edge[1].to.value.action.name },
            });
            childcount++;
          }
        }
        console.log("     Children: ", startNodeLogObject);
      } else if (node[0].includes("endnode")) {
        console.log(`*****************************************************************`);
        console.log(`ENDNODE -  ${node[0]}  action -> ${node[1].value.action.name} \n`);
        let nodeLogObject = {};
        Object.assign(nodeLogObject, { incomingState: node[1].value.state.incomingstate });
        Object.assign(nodeLogObject, { endingState: node[1].value.state.newState });
        console.log("     Node Data: ", nodeLogObject);
        console.log(`*****************************************************************`);
      } else {
        let nodeLogObject = {};
        console.log(`NEXT NODE -  ${node[0]} action -> ${node[1].value.action.name} \n`);
        let childcount = 0;
        for (const edge of graph.getEdges()) {
          if (edge[1].from.id == node[0]) {
            Object.assign(nodeLogObject, { [`Child ${childcount}`]: { node: edge[1].to.id, action: edge[1].to.value.action.name } });
            childcount++;
          }
        }
        Object.assign(nodeLogObject, { incomingState: node[1].value.state.incomingstate });
        Object.assign(nodeLogObject, { outgoingState: node[1].value.state.newState });
        console.log("     Node Data: ", nodeLogObject);
      }
    }
  }

  static async showGraph(mygraph: ExcaliburGraph): Promise<void> {
    //iterate over mygraph data to create the elements array to fee into the cytoscape graph
    const elements: any[] = [];
    const nodes = mygraph.getNodes();
    const edges = mygraph.getEdges();

    const newTab = document.createElement("div");

    newTab.setAttribute("id", "cy");
    newTab.setAttribute("style", "width: 500px; height: 500px; display: block; opacity: 0;");
    newTab.setAttribute("width", "500px");
    newTab.setAttribute("height", "500px");
    window.document.body.appendChild(newTab);

    for (const node of nodes) {
      if (node[0] == "startnode") {
        elements.push({
          data: {
            id: node[0],
            description: "Start",
            type: "startnode",
          },
        });
      } else if (node[0].includes("endnode")) {
        elements.push({
          data: {
            id: node[0],
            description: `End - ${node[1].value.action.name}`,
            type: "endnode",
          },
        });
      } else {
        elements.push({
          data: {
            id: node[0],
            description: node[1].value.action.name,
            type: "node",
          },
        });
      }
    }

    for (const edge of edges) {
      elements.push({
        data: {
          id: edge[0],
          source: edge[1].from.id,
          target: edge[1].to.id,
        },
      });
    }

    let cy = cytoscape({
      container: newTab, // container to render in
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#000",
            label: "data(description)",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#000",
            "target-arrow-color": "#000",
            "target-arrow-shape": "triangle",
          },
        },
      ],
      layout: {
        name: "breadthfirst",
        fit: true,
        center: true,
        directed: true,
      },
    });

    //modify background color of node based on type
    cy.nodes().map((node: any) => {
      if (node.data().type == "startnode") {
        node.style("background-color", "green");
      } else if (node.data().type == "endnode") {
        node.style("background-color", "red");
      } else {
        node.style("background-color", "blue");
      }
    });

    setTimeout(async () => {
      cy.center();

      let myimagePromise = await cy.png({
        full: true,
        bg: "white",
        scale: 2,
        output: "blob-promise",
      });

      var reader = new FileReader();
      reader.readAsDataURL(myimagePromise);

      reader.onloadend = function () {
        var base64data = reader.result;
        var style = [
          "font-size: 1px;",
          "padding: 250px 250px;",
          `background: url(${base64data}) no-repeat;`,
          "background-size: contain;",
        ].join(" ");
        console.log("%c ", style);
        return;
      };
    }, 1000);
  }
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
