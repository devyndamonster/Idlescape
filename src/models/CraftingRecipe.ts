import { ItemType } from "@/enums/ItemType";

export interface CraftingRecipe {
    recipeId: number;
    requiredItems: { itemType: ItemType; quantity: number }[];
    resultItemType: ItemType;
    resultQuantity: number;
    craftingTimeSeconds: number;
}