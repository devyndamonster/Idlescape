import { Actor } from "@/models/entities/Actor";
import { Blueprint } from "@/models/entities/Blueprint";
import { InventoryItem } from "@/models/InventoryItem";

export function getProvidableItems(blueprint: Blueprint, actor: Actor): InventoryItem[] {
    const providableItems = blueprint.requiredItems.filter(requiredItem => {
        const currentItem = blueprint.currentItems.find(i => i.itemType === requiredItem.itemType);
        const neededQuantity = requiredItem.quantity - (currentItem?.quantity ?? 0);
        const itemInInventory = actor.inventory.find(slot => slot.item?.itemType === requiredItem.itemType);

        return neededQuantity > 0 && ((itemInInventory?.quantity ?? 0) > 0);
    });

    return providableItems;
}

export function getRemainingRequiredItems(blueprint: Blueprint): InventoryItem[] {
    return blueprint.requiredItems.filter(requiredItem => {
        const currentItem = blueprint.currentItems.find(i => i.itemType === requiredItem.itemType);
        const neededQuantity = requiredItem.quantity - (currentItem?.quantity ?? 0);
        return neededQuantity > 0;
    });
}