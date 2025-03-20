import { InventoryItem } from "./InventoryItem";

export interface InventorySlot {
    item: InventoryItem | null;
    quantity: number;
}