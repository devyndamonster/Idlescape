import { OnActorStrategyNodeType } from "@/state/types";
import { Handle, NodeProps, Position } from "@xyflow/react";

export function OnActorStrategyNode({}: NodeProps<OnActorStrategyNodeType>) {
  return (
    <div className="border-2 rounded-sm p-5 bg-white">
      <h2>On Actor Strategy</h2>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}