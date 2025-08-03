import { Handle, Position } from "@xyflow/react";

interface Props {

}

export function OnActorStrategyNode({}: Props) {
  return (
    <div className="border-2 rounded-sm p-5 bg-white">
      <h2>On Actor Strategy</h2>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}