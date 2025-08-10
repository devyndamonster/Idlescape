import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemType } from "@/enums/ItemType";
import { Handle, NodeProps, Position } from "@xyflow/react";
import EnumSelect from "../enumSelect";
import { Input } from "@/components/ui/input";
import { Operator, QuantityConditionNodeType, QuantitySource } from "@/state/types";
import useStore from "@/state/store";

export function QuantityConditionNode({ id, data }: NodeProps<QuantityConditionNodeType>) {

  const updateQuantitySource = useStore((state) => state.updateQuantitySource);
  const updateItemType = useStore((state) => state.updateItemType);
  const updateOperator = useStore((state) => state.updateOperator);
  const updateQuantity = useStore((state) => state.updateQuantity);

  const isItem = data.quantitySource === "item";

  return (
    <div className="border-2 rounded-sm p-5 bg-white">
      <div className="flex flex-row gap-2">
        <Select value={data.quantitySource} onValueChange={(quantitySource => updateQuantitySource(id, quantitySource as QuantitySource))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Quantity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item">Of Item</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="hunger">Hunger</SelectItem>
            <SelectItem value="thirst">Thirst</SelectItem>
          </SelectContent>
        </Select>
        {isItem && (
          <EnumSelect 
            enumObject={ItemType}
            value={data.itemType}
            onChanged={(itemType) => updateItemType(id, itemType)}
            valueName="Item Type"
            className="w-full"
          />
        )}
        <Select value={data.operator} onValueChange={(operator) => updateOperator(id, operator as Operator)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="=">=</SelectItem>
            <SelectItem value=">">{">"}</SelectItem>
            <SelectItem value="<">{"<"}</SelectItem>
            <SelectItem value=">=">{">="}</SelectItem>
            <SelectItem value="<=">{"<="}</SelectItem>
            <SelectItem value="!=">!=</SelectItem>
          </SelectContent>
        </Select>
        <Input type="number" value={data.quantity} onChange={quantity => updateQuantity(id, parseInt(quantity.target.value))}/>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="condition-false" style={{ left: "25%" }} />
      <Handle type="source" position={Position.Bottom} id="condition-true" style={{ left: "75%" }} />
    </div>
  );
}