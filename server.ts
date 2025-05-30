import type { PeerId } from "@libp2p/interface"
import { logger } from "@libp2p/logger"
import type { Libp2p } from "libp2p"
import { ChampionsEnabled, GameMapsEnabled, GameModesEnabled, Name, SummonerSpellsEnabled, TickRate } from "./utils/constants"
//import { Champion, GameMap, GameMode, SummonerSpell } from "./utils/constants"
import type { Peer } from "./message/peer"
import * as Data from './data'

export abstract class Server {

    protected node: Libp2p
    public id: PeerId

    public readonly name = new Name('Server')
    public readonly maps = new GameMapsEnabled()
    public readonly modes = new GameModesEnabled()
    public readonly tickRate = new TickRate(30)
    public readonly champions = new ChampionsEnabled()
    public readonly spells = new SummonerSpellsEnabled()

    protected constructor(node: Libp2p, id: PeerId){
        this.node = node
        this.id = id
    }

    public encode(): Peer.AdditionalData.ServerSettings {
        return {
            name: this.name.encode(),
            maps: this.maps.encode(),
            modes: this.modes.encode(),
            tickRate: this.tickRate.encode(),
            champions: this.champions.encode(),
            spells: this.spells.encode(),
        }
    }

    public decodeInplace(settings: Peer.AdditionalData.ServerSettings) {
        return this.name.decodeInplace(settings.name)
            && this.maps.decodeInplace(settings.maps)
            && this.modes.decodeInplace(settings.modes)
            && this.tickRate.decodeInplace(settings.tickRate)
            && this.champions.decodeInplace(settings.champions)
            && this.spells.decodeInplace(settings.spells)
    }

    public validate(){
        return this.maps.value.length > 0
            && this.modes.value.length > 0
            && this.champions.value.length > 0
            && this.spells.value.length > 0
    }
}

export class RemoteServer extends Server {
    private log = logger('launcher:server-remote')
    public static create(node: Libp2p, id: PeerId, settings: Peer.AdditionalData.ServerSettings){
        const server = new RemoteServer(node, id)
        server.decodeInplace(settings)
        return server
    }
}

export class LocalServer extends Server {
    private log = logger('launcher:server-local')
    public static async create(node: Libp2p){
        const server = new LocalServer(node, node.peerId)
        //await ufill(server)
        //server.maps.value = Object.keys(GameMap.values).map(key => Number(key))
        //server.modes.value = Object.keys(GameMode.values).map(key => Number(key))
        //server.champions.value = Object.keys(Champion.values).map(key => Number(key))
        //server.spells.value = Object.keys(SummonerSpell.values).map(key => Number(key))
        const ss = await Data.getServerSettings()
        server.maps.value = ss.maps
        server.modes.value = ss.modes
        server.champions.value = ss.champions
        server.spells.value = ss.spells
        return server
    }
}