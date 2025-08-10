import { ItemType } from '@/enums/ItemType';
import { Objective } from '@/models/Objective';
import {
    type Edge,
    type Node,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type BuiltInNode,
} from '@xyflow/react';

export type OnActorStrategyNodeType = Node<
    {},
    'onActorStrategy'
>;

export type QuantityConditionNodeType = Node<
    {
        quantitySource?: string;
        itemType: ItemType;
        operator: string;
    },
    'quantityConditionNode'
>;

export type EndStrategyNodeType = Node<
    {
        objective: Objective;
    },
    'endStrategyNode'
>;

export type AppNode = OnActorStrategyNodeType | QuantityConditionNodeType | EndStrategyNodeType | BuiltInNode;

export type AppState = {
    nodes: AppNode[];
    edges: Edge[];
    onNodesChange: OnNodesChange<AppNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: AppNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: AppNode) => void;
    updateQuantitySource: (nodeId: string, quantitySource: string) => void;
    updateItemType: (nodeId: string, itemType: ItemType) => void;
    updateOperator: (nodeId: string, operator: string) => void;
    updateObjective: (nodeId: string, objective: Objective) => void;
};