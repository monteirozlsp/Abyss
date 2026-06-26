/**
 * @file SocialSystems.ts
 * @description Módulos Sociais preparados para co-op futuro.
 * Implementa LobbySystem, PartySystem, FriendsSystem e Guilds.
 */

export interface LobbyPlayer {
  playerId: string;
  name: string;
  isReady: boolean;
  selectedSkinId: string;
  pingMs: number;
}

export interface SocialFriend {
  friendId: string;
  name: string;
  status: "ONLINE" | "OFFLINE" | "IN_GAME";
  currentSessionId?: string;
}

export class LobbySystem {
  private static instance: LobbySystem | null = null;
  private players: LobbyPlayer[] = [];
  private activeLobbyId: string | null = null;

  private constructor() {}

  public static getInstance(): LobbySystem {
    if (!LobbySystem.instance) {
      LobbySystem.instance = new LobbySystem();
    }
    return LobbySystem.instance;
  }

  public createLobby(): void {
    this.activeLobbyId = "lobby_" + Math.random().toString(36).substring(2, 9);
    console.log(`[AbyssEngine] Novo lobby criado com ID: ${this.activeLobbyId}`);
  }

  public joinLobby(lobbyId: string): void {
    this.activeLobbyId = lobbyId;
    console.log(`[AbyssEngine] Jogador ingressou no lobby: ${lobbyId}`);
  }

  public leaveLobby(): void {
    console.log(`[AbyssEngine] Jogador saiu do lobby ativo: ${this.activeLobbyId}`);
    this.activeLobbyId = null;
    this.players = [];
  }

  public getPlayers(): LobbyPlayer[] {
    return this.players;
  }

  public getActiveLobbyId(): string | null {
    return this.activeLobbyId;
  }
}

export class PartySystem {
  private static instance: PartySystem | null = null;
  private partyMembers: string[] = [];
  private partyId: string | null = null;

  private constructor() {}

  public static getInstance(): PartySystem {
    if (!PartySystem.instance) {
      PartySystem.instance = new PartySystem();
    }
    return PartySystem.instance;
  }

  public createParty(): void {
    this.partyId = "party_" + Math.random().toString(36).substring(2, 9);
    console.log(`[AbyssEngine] Party criada: ${this.partyId}`);
  }

  public invitePlayer(playerId: string): void {
    console.log(`[AbyssEngine] Convite de party enviado para: ${playerId}`);
  }

  public getPartyId(): string | null {
    return this.partyId;
  }
}

export class FriendsSystem {
  private static instance: FriendsSystem | null = null;
  private friendsList: Map<string, SocialFriend> = new Map();

  private constructor() {}

  public static getInstance(): FriendsSystem {
    if (!FriendsSystem.instance) {
      FriendsSystem.instance = new FriendsSystem();
    }
    return FriendsSystem.instance;
  }

  public addFriend(friendId: string, name: string): void {
    this.friendsList.set(friendId, {
      friendId,
      name,
      status: "OFFLINE"
    });
  }

  public removeFriend(friendId: string): void {
    this.friendsList.delete(friendId);
  }

  public getFriends(): SocialFriend[] {
    return Array.from(this.friendsList.values());
  }
}

export class GuildsSystem {
  private static instance: GuildsSystem | null = null;
  private guildName: string | null = null;
  private guildId: string | null = null;

  private constructor() {}

  public static getInstance(): GuildsSystem {
    if (!GuildsSystem.instance) {
      GuildsSystem.instance = new GuildsSystem();
    }
    return GuildsSystem.instance;
  }

  public createGuild(name: string): void {
    this.guildName = name;
    this.guildId = "guild_" + Math.random().toString(36).substring(2, 9);
    console.log(`[AbyssEngine] Guild criada com sucesso: ${name} (${this.guildId})`);
  }

  public getGuildDetails(): { guildId: string | null; guildName: string | null } {
    return {
      guildId: this.guildId,
      guildName: this.guildName
    };
  }
}
