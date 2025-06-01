import { MapTile, TerrainType } from "@/models/MapTile";
import { perlin2, seed } from "@/lib/noise";

export function generateMapTiles(worldSizeX: number, worldSizeY: number, zoomFactor: number): MapTile[][] {
    const mapTiles: MapTile[][] = [];

    const seedContext = seed(1);

    for(let y = 0; y < worldSizeY; y++) {
        mapTiles.push([]);
        for(let x = 0; x < worldSizeX; x++) {
            const height = perlin2(x / zoomFactor, y / zoomFactor, seedContext) * 0.5 + 0.5; // Normalize to [0, 1]
            
            let terrainType: TerrainType = TerrainType.Water;
            if(height > 0.4) {
                terrainType = TerrainType.Sand;
            }
            if(height > 0.45) {
                terrainType = TerrainType.Soil;
            }
            if(height > 0.75) {
                terrainType = TerrainType.Rock;
            }

            mapTiles[y].push({
                height: height,
                terrainType: terrainType
            });
        }
    }

    return mapTiles;
}