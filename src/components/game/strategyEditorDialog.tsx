import { useCallback, useEffect, useState } from "react";
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
    ReactFlowInstance,
    ReactFlowJsonObject,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { OnActorStrategyNode } from "./strategyNodes/onActorStrategyNode";
import { QuantityConditionNode } from "./strategyNodes/quantityConditionNode";
import { EndStrategyNode } from "./strategyNodes/endStrategyNode";
import useStore from "@/state/store";
import { useShallow } from 'zustand/react/shallow';
import { AppNode, AppState, EndStrategyNodeType, QuantityConditionNodeType } from "@/state/types";
import { ItemType } from "@/enums/ItemType";
import { ObjectiveType } from "@/enums/ObjectiveType";

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

const selector = (state: AppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNode: state.addNode,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
});

function StrategyContent() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setNodes, setEdges } = useStore(
        useShallow(selector),
    );

    const [rfInstance, setRfInstance] = useState<ReactFlowInstance<AppNode, Edge>>();
    const { x, y } = useViewport();

    const onAddConditionNode = () => {
        const newNode: QuantityConditionNodeType = {
            id: `${nodes.length + 1}`,
            type: "quantityConditionNode",
            data: { quantitySource: undefined, itemType: ItemType.Blueberry, operator: "=" },
            position: { x: -x, y: -y },
        };

        addNode(newNode);
    }

    const onAddEndNode = () => {
        const newNode: EndStrategyNodeType = {
            id: `${nodes.length + 1}`,
            type: "endStrategyNode",
            data: { objective: { objectiveType: ObjectiveType.BuildStructure } },
            position: { x: -x, y: -y },
        };

        addNode(newNode);
    }

    const onSave = useCallback(() => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            localStorage.setItem("react-flow-save", JSON.stringify(flow));
        }
    }, [rfInstance]);

    useEffect(() => {
        const savedFlow = localStorage.getItem("react-flow-save");
        if (savedFlow) {
            const parsedFlow: ReactFlowJsonObject<AppNode, Edge> = JSON.parse(savedFlow);
            setNodes(parsedFlow.nodes);
            setEdges(parsedFlow.edges);
        }
    }, [])

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
                    onInit={setRfInstance}
                    fitView
                    fitViewOptions={fitViewOptions}
                    defaultEdgeOptions={defaultEdgeOptions}
                >
                    <Background variant={BackgroundVariant.Dots} />
                </ReactFlow>
            </div>

            <DialogFooter>
                <Button variant="default" onClick={onAddConditionNode}>Add Condition Node</Button>
                <Button variant="default" onClick={onAddEndNode}>Add End Node</Button>
                <DialogClose asChild>
                    <Button variant="outline" onClick={onSave}>Close</Button>
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
                    <StrategyContent />
                </ReactFlowProvider>
            </DialogContent>
        </Dialog>
    )
}