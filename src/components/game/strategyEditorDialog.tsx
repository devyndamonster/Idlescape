import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type DefaultEdgeOptions,
  Background,
  BackgroundVariant,
  useViewport,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { OnActorStrategyNode } from "./strategyNodes/onActorStrategyNode";
import { QuantityConditionNode } from "./strategyNodes/quantityConditionNode";
import { EndStrategyNode } from "./strategyNodes/endStrategyNode";

const initialNodes: Node[] = [
  { id: '1', type: "onActorStrategy", data: { label: 'Node 1' }, position: { x: 5, y: 5 } },
];
 
const initialEdges: Edge[] = [];
 
const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 
const nodeTypes = {
  onActorStrategy: OnActorStrategyNode,
  quantityConditionNode: QuantityConditionNode,
  endStrategyNode: EndStrategyNode
};

function StrategyContent() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const { x, y } = useViewport();
    
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );

    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges],
    );

    const addNode = (nodeType: string) => {
        const newNode: Node = {
            id: `${nodes.length + 1}`,
            type: nodeType,
            data: { label: `Node ${nodes.length + 1}` },
            position: { x: -x, y: -y },
        };

        setNodes((nds) => nds.concat(newNode));
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Edit Strategy</DialogTitle>
            </DialogHeader>
            <div className="h-[500px] w-full border rounded-md overflow-hidden">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    fitViewOptions={fitViewOptions}
                    defaultEdgeOptions={defaultEdgeOptions}
                >
                    <Background variant={BackgroundVariant.Dots} />
                </ReactFlow>
            </div>
            
            <DialogFooter>
                <Button variant="default" onClick={() => addNode("quantityConditionNode")}>Add Condition Node</Button>
                <Button variant="default" onClick={() => addNode("endStrategyNode")}>Add End Node</Button>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </>
    )
}

export default function StrategyEditorDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    className="mt-4 w-full" 
                >
                    Edit Strategy
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1200px] p-3">
                <ReactFlowProvider>
                    <StrategyContent/>
                </ReactFlowProvider>
            </DialogContent>
        </Dialog>
    )
}