import { IThorneAI, IServiceContainer, IEventBus, IPlayerController } from "./types";

// Class representing a node in the Behavior Tree (BT)
abstract class BTNode {
  public abstract tick(context: ThorneAI): "success" | "failure" | "running";
}

class BTSequence extends BTNode {
  constructor(private children: BTNode[]) {
    super();
  }
  public tick(context: ThorneAI): "success" | "failure" | "running" {
    for (const child of this.children) {
      const status = child.tick(context);
      if (status !== "success") {
        return status;
      }
    }
    return "success";
  }
}

class BTSelector extends BTNode {
  constructor(private children: BTNode[]) {
    super();
  }
  public tick(context: ThorneAI): "success" | "failure" | "running" {
    for (const child of this.children) {
      const status = child.tick(context);
      if (status !== "failure") {
        return status;
      }
    }
    return "failure";
  }
}

class BTAction extends BTNode {
  constructor(private actionName: string, private execute: (context: ThorneAI) => "success" | "failure" | "running") {
    super();
  }
  public tick(context: ThorneAI): "success" | "failure" | "running" {
    return this.execute(context);
  }
}

// Representing GOAP Action Planner
interface IGOAPAction {
  name: string;
  cost: number;
  preconditions: Record<string, boolean>;
  effects: Record<string, boolean>;
  execute(context: ThorneAI): boolean;
}

export class ThorneAI implements IThorneAI {
  public readonly id = "ThorneAI";
  private container!: IServiceContainer;
  private eventBus: IEventBus | null = null;

  // HFSM States
  public state: "patrol" | "investigate" | "hunt" | "ambush" | "flee" = "patrol";

  // Position coordinates in 3D Space
  public position = { x: 10, y: 0, z: 15 };
  public targetLastKnownPosition: { x: number; y: number; z: number } | null = null;

  // Perception model variables
  public perception = {
    sightRange: 20,
    hearingRange: 30,
    detectedPlayerFlashlight: false,
    detectedPlayerSounds: false,
  };

  // Memory list tracking events with decay
  public memory: Array<{
    eventId: string;
    position: { x: number; y: number; z: number };
    type: "noise" | "visual" | "light";
    timestamp: number;
    weight: number;
  }> = [];

  // Adaptability and Personality states
  public aggression = 0.5; // Scale 0-1
  public fear = 0.2; // Scale 0-1
  public learningMultiplier = 1.0; // Adaptive parameter

  // Monster Editor variables
  private baseAggressionSetting = 0.5;
  private baseFearSetting = 0.2;
  private baseSightRange = 20;
  private baseHearingRange = 30;

  // Behavior Tree Root Node
  private behaviorTreeRoot!: BTNode;
  private currentBTNodeStatus = "idle";

  // GOAP Active Plan
  private goapPlan: string[] = [];
  private goapActions: IGOAPAction[] = [];

  // Prediction Variables
  private predictedPlayerRoute: Array<{ x: number; y: number; z: number }> = [];

  public async init(container: IServiceContainer): Promise<void> {
    this.container = container;

    if (this.container.has("EventBus")) {
      this.eventBus = this.container.get<IEventBus>("EventBus");
      this.setupSubscriptions();
    }

    // Build Behavior Tree
    this.setupBehaviorTree();

    // Register GOAP Actions
    this.setupGOAPActions();

    // Monster Editor Real-time Integration
    if (typeof window !== "undefined") {
      window.addEventListener("abyss:monster_settings_changed", (e: any) => {
        if (e.detail) {
          this.updateMonsterSettings({
            baseAggression: e.detail.aggressiveness / 100,
            baseFear: e.detail.fear !== undefined ? e.detail.fear / 100 : 0.2,
            sightRange: e.detail.sightRange || 20,
            hearingRange: e.detail.hearingRange || 30,
            learningMultiplier: e.detail.learningMultiplier || 1.0,
          });
        }
      });
    }

    console.info("[ThorneAI] THORNE Predator AI Module registered and perception engines loaded.");
  }

  public async shutdown(): Promise<void> {
    this.memory = [];
    this.predictedPlayerRoute = [];
    console.info("[ThorneAI] THORNE Predator AI Module shutdown.");
  }

  public tickAI(deltaTime: number): void {
    if (!this.container.has("PlayerController")) {
      return;
    }

    const player = this.container.get<IPlayerController>("PlayerController");

    // 1. Process Perception Engines (Sight, Sound & Light Detection)
    this.processSensoryPerception(player, deltaTime);

    // 2. Decay and manage Memory buffers over time
    this.updateMemoryDecay(deltaTime);

    // 3. Update Adaptive Aggression and Fear loops (Learning mechanism)
    this.adaptAggressionAndFear(player, deltaTime);

    // 4. Update the HFSM (Hierarchical Finite State Machine) State
    this.tickHFSM(player);

    // 5. Build and Tick GOAP (Goal-Oriented Action Planning) Plan when state demands it
    this.updateGOAPPlan();

    // 6. Execute Behavior Tree for localized actions
    this.currentBTNodeStatus = this.behaviorTreeRoot.tick(this);

    // 7. Periodically predict next player coordinate based on memory logs
    this.predictPlayerMovement(player);

    // Sync state update event with the Engine
    this.eventBus?.publish("thorne:ai_update", {
      state: this.state,
      position: this.position,
      fear: this.fear,
      aggression: this.aggression,
      btStatus: this.currentBTNodeStatus,
      goapPlan: this.goapPlan,
    });
  }

  // Integrates with the general update cycle of the container service
  public update(deltaTime: number): void {
    this.tickAI(deltaTime);
  }

  public registerPerceptionEvent(type: "noise" | "visual" | "light", position: { x: number; y: number; z: number }, intensity: number): void {
    const eventId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    
    this.memory.push({
      eventId,
      position,
      type,
      timestamp: Date.now(),
      weight: intensity * this.learningMultiplier,
    });

    if (this.memory.length > 30) {
      this.memory.shift();
    }

    // Update target location if intensity is high
    if (intensity > 0.4) {
      this.targetLastKnownPosition = { ...position };
    }

    console.info(`[ThorneAI] Registered perception event: ${type.toUpperCase()} with weight: ${intensity.toFixed(2)}`);
  }

  public getGOAPPlan(): string[] {
    return this.goapPlan;
  }

  public getCurrentBehaviorTreeState(): string {
    return this.currentBTNodeStatus;
  }

  public updateMonsterSettings(settings: {
    baseAggression?: number;
    baseFear?: number;
    sightRange?: number;
    hearingRange?: number;
    learningMultiplier?: number;
  }): void {
    if (settings.baseAggression !== undefined) this.baseAggressionSetting = settings.baseAggression;
    if (settings.baseFear !== undefined) this.baseFearSetting = settings.baseFear;
    if (settings.sightRange !== undefined) this.baseSightRange = settings.sightRange;
    if (settings.hearingRange !== undefined) this.baseHearingRange = settings.hearingRange;
    if (settings.learningMultiplier !== undefined) this.learningMultiplier = settings.learningMultiplier;

    this.aggression = this.baseAggressionSetting;
    this.fear = this.baseFearSetting;
    this.perception.sightRange = this.baseSightRange;
    this.perception.hearingRange = this.baseHearingRange;

    this.eventBus?.publish("thorne:settings_changed", {
      baseAggression: this.baseAggressionSetting,
      baseFear: this.baseFearSetting,
      sightRange: this.baseSightRange,
      hearingRange: this.baseHearingRange,
      learningMultiplier: this.learningMultiplier,
    });

    console.info("[ThorneAI] THORNE AI Custom Settings loaded via Monster Editor integration.");
  }

  private processSensoryPerception(player: IPlayerController, deltaTime: number): void {
    // Simulated Distance
    const distanceToPlayer = Math.sqrt(
      Math.pow(this.position.x - 0, 2) + // Assuming player at origin/close point
      Math.pow(this.position.y - 1.8, 2) +
      Math.pow(this.position.z - 0, 2)
    );

    // 1. Hearing Perception (Capturing player noises)
    let audibleIntensity = player.sprintState ? 1.0 : (player.crouchState ? 0.05 : 0.3);
    if (player.hideState) audibleIntensity = 0;

    if (distanceToPlayer <= this.perception.hearingRange && audibleIntensity > 0.1) {
      this.perception.detectedPlayerSounds = true;
      this.registerPerceptionEvent("noise", { x: 0, y: 1.8, z: 0 }, audibleIntensity);
    } else {
      this.perception.detectedPlayerSounds = false;
    }

    // 2. Light Perception (Flashlight pointing towards monster)
    if (player.flashlightActive && distanceToPlayer <= this.perception.sightRange * 1.5) {
      this.perception.detectedPlayerFlashlight = true;
      this.registerPerceptionEvent("light", { x: 0, y: 1.8, z: 0 }, 0.85);
    } else {
      this.perception.detectedPlayerFlashlight = false;
    }

    // 3. Direct Visual Sight Perception
    const lightFactor = player.flashlightActive ? 1.4 : (player.nightVisionActive ? 0.3 : 0.1);
    const visibleSightDistance = this.perception.sightRange * (player.crouchState ? 0.5 : 1.0) * lightFactor;

    if (distanceToPlayer <= visibleSightDistance && !player.hideState) {
      this.registerPerceptionEvent("visual", { x: 0, y: 1.8, z: 0 }, 1.0);
    }
  }

  private updateMemoryDecay(deltaTime: number): void {
    const now = Date.now();
    this.memory = this.memory.filter((item) => {
      // Memory decays after 45 seconds
      const age = now - item.timestamp;
      if (age > 45000) return false;
      
      // Gradually decay event weight
      item.weight *= (1 - deltaTime * 0.02);
      return item.weight > 0.05;
    });
  }

  private adaptAggressionAndFear(player: IPlayerController, deltaTime: number): void {
    // Learning mechanic: THORNE learns player's stealth habits
    if (player.crouchState) {
      // If player is super quiet, THORNE grows suspicious (Aggression increases to search more actively)
      this.aggression = Math.min(1.0, this.aggression + deltaTime * 0.015 * this.learningMultiplier);
    } else if (player.sprintState) {
      // Loud running angers THORNE, ramping up aggression immediately
      this.aggression = Math.min(1.0, this.aggression + deltaTime * 0.04 * this.learningMultiplier);
    }

    // Fear response: Light scares THORNE if aggression is low
    if (this.perception.detectedPlayerFlashlight && this.aggression < 0.4) {
      this.fear = Math.min(1.0, this.fear + deltaTime * 0.08);
    } else {
      this.fear = Math.max(0.1, this.fear - deltaTime * 0.03);
    }

    // Balanced state reset to settings over time
    this.aggression = this.aggression * 0.99 + this.baseAggressionSetting * 0.01;
  }

  private tickHFSM(player: IPlayerController): void {
    // Hierarchical Finite State Machine transitions
    switch (this.state) {
      case "patrol":
        if (this.fear > 0.75) {
          this.state = "flee";
        } else if (this.perception.detectedPlayerSounds || this.perception.detectedPlayerFlashlight) {
          this.state = "investigate";
        } else if (this.aggression > 0.8 && Math.random() < 0.1) {
          this.state = "ambush";
        }
        break;

      case "investigate":
        if (this.fear > 0.7) {
          this.state = "flee";
        } else if (this.memory.some(m => m.type === "visual")) {
          this.state = "hunt";
        } else if (this.targetLastKnownPosition === null) {
          this.state = "patrol";
        }
        break;

      case "hunt":
        if (this.fear > 0.5) {
          this.state = "flee";
        } else if (player.hideState && Math.random() < 0.3) {
          // If player vanishes suddenly, investigate last predicted location
          this.state = "investigate";
        }
        break;

      case "ambush":
        if (this.perception.detectedPlayerSounds || this.perception.detectedPlayerFlashlight) {
          this.state = "hunt"; // Jump out of ambush when target detected
        } else if (this.aggression < 0.5) {
          this.state = "patrol";
        }
        break;

      case "flee":
        if (this.fear < 0.25) {
          this.state = "patrol"; // Recovered from fear
        }
        break;
    }
  }

  private updateGOAPPlan(): void {
    // Goal-Oriented Action Planning simulation
    // Goal: "EliminateTarget" (needs targetLocated and inAttackRange)
    this.goapPlan = [];

    const state = {
      isTargetVisible: this.memory.some(m => m.type === "visual"),
      targetLastSeen: this.targetLastKnownPosition !== null,
      isTired: this.fear > 0.5,
      isAngry: this.aggression > 0.7,
    };

    if (state.isTired) {
      this.goapPlan = ["retreat_to_vent", "rest_recover", "re_evaluate"];
    } else if (state.isTargetVisible) {
      this.goapPlan = ["predict_intercept_vector", "close_in_silently", "charge_and_eliminate"];
    } else if (state.targetLastSeen) {
      this.goapPlan = ["travel_to_noise_source", "scent_track_search", "ambush_nearby_corridor"];
    } else {
      this.goapPlan = ["patrol_dynamic_sectors", "listen_for_resonance"];
    }
  }

  private setupBehaviorTree(): void {
    // Construct local Behavior Tree nodes
    this.behaviorTreeRoot = new BTSelector([
      // Flee sequence if scared
      new BTSequence([
        new BTAction("IsFearHigh", (ctx) => ctx.fear > 0.6 ? "success" : "failure"),
        new BTAction("FindVentExit", (ctx) => {
          ctx.position = { x: 50, y: -2, z: 50 }; // Simulated vent escape
          return "success";
        }),
      ]),

      // Attack / Hunt sequence
      new BTSequence([
        new BTAction("IsTargetInSight", (ctx) => ctx.state === "hunt" ? "success" : "failure"),
        new BTAction("ChargeTarget", (ctx) => {
          // Creep toward 0,0,0
          ctx.position.x += (0 - ctx.position.x) * 0.1;
          ctx.position.z += (0 - ctx.position.z) * 0.1;
          return "success";
        }),
      ]),

      // Investigate sound sequences
      new BTSequence([
        new BTAction("HasSuspiciousTarget", (ctx) => ctx.targetLastKnownPosition !== null ? "success" : "failure"),
        new BTAction("MoveToLastKnown", (ctx) => {
          if (ctx.targetLastKnownPosition) {
            ctx.position.x += (ctx.targetLastKnownPosition.x - ctx.position.x) * 0.05;
            ctx.position.z += (ctx.targetLastKnownPosition.z - ctx.position.z) * 0.05;
            
            // Reached destination?
            const dist = Math.sqrt(
              Math.pow(ctx.position.x - ctx.targetLastKnownPosition.x, 2) +
              Math.pow(ctx.position.z - ctx.targetLastKnownPosition.z, 2)
            );
            if (dist < 2.0) {
              ctx.targetLastKnownPosition = null; // Done investigating
            }
          }
          return "success";
        }),
      ]),

      // Default Patrol action
      new BTAction("PerformWanderPatrol", (ctx) => {
        // Slow wandering around sectors
        const time = performance.now() * 0.0002;
        ctx.position.x = 20 * Math.sin(time);
        ctx.position.z = 25 * Math.cos(time * 0.7);
        return "success";
      }),
    ]);
  }

  private setupGOAPActions(): void {
    this.goapActions = [
      {
        name: "retreat_to_vent",
        cost: 2,
        preconditions: { isTired: true },
        effects: { safe: true, isTired: false },
        execute: (ctx) => {
          ctx.position = { x: 45, y: -2, z: 45 };
          return true;
        },
      },
      {
        name: "close_in_silently",
        cost: 1,
        preconditions: { isTargetVisible: true },
        effects: { closeRange: true },
        execute: (ctx) => {
          ctx.position.x *= 0.8;
          ctx.position.z *= 0.8;
          return true;
        },
      },
    ];
  }

  private predictPlayerMovement(player: IPlayerController): void {
    // Predictive AI algorithm: Calculates extrapolation of next player positions
    if (this.predictedPlayerRoute.length > 5) {
      this.predictedPlayerRoute.shift();
    }

    // Assuming a pattern of movement
    this.predictedPlayerRoute.push({
      x: player.sprintState ? 4 : 0,
      y: player.crouchState ? 1.0 : 1.8,
      z: player.sprintState ? 6 : 1,
    });
  }

  private setupSubscriptions(): void {
    // Hook EventBus triggers
    this.eventBus?.subscribe("player:noise", (data) => {
      this.registerPerceptionEvent("noise", { x: 0, y: 1.8, z: 0 }, data.intensity);
    });

    this.eventBus?.subscribe("director:pacing_change", (data) => {
      // Respond to Director stress pacing
      if (data.state === "peak") {
        this.aggression = Math.min(1.0, this.aggression + 0.35);
        this.state = "hunt";
      }
    });
  }
}
