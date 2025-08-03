import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemType } from "@/enums/ItemType";
import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import EnumSelect from "../enumSelect";
import { Input } from "@/components/ui/input";

interface Props {

}

export function QuantityConditionNode({ }: Props) {

  const [quantitySource, setQuantitySource] = useState<string>();
  const [itemType, setItemType] = useState<ItemType>(ItemType.Blueberry);
  const [operator, setOperator] = useState<string>("=");
  
  const isItem = quantitySource === "item";

  return (
    <div className="border-2 rounded-sm p-5 bg-white">
      <div className="flex flex-row gap-2">
        <Select value={quantitySource} onValueChange={setQuantitySource}>
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
            value={itemType}
            onChanged={setItemType}
            valueName="Item Type"
            className="w-full"
          />
        )}
        <Select value={operator} onValueChange={setOperator}>
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
        <Input type="number"/>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="condition-false" style={{ left: "25%" }} />
      <Handle type="source" position={Position.Bottom} id="condition-true" style={{ left: "75%" }} />
    </div>
  );
}