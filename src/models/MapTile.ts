export interface MapTile {
    height: number;
    terrainType: TerrainType;
}

export enum TerrainType {
    Soil = 1,
    Water = 2,
    Rock = 3,
    Sand = 4
}