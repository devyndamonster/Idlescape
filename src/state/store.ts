import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { type AppNode, type AppState, type QuantityConditionNodeType } from './types';

const useStore = create<AppState>((set, get) => ({
    nodes: [{ id: '1', type: "onActorStrategy", data: {}, position: { x: 5, y: 5 } }],
    edges: [],
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    setNodes: (nodes) => {
        set({ nodes });
    },
    setEdges: (edges) => {
        set({ edges });
    },
    addNode: (node: AppNode) => {
        set({
            nodes: [...get().nodes, node],
        });
    },
    updateQuantitySource: (nodeId, quantitySource) => {
        set({
            nodes: get().nodes.map((node) => {
                if(node.id === nodeId && node.type === "quantityConditionNode") {
                    const updatedNode: QuantityConditionNodeType = {
                        ...node,
                        data: {
                            ...node.data,
                            quantitySource: quantitySource,
                        },
                    };
                    return updatedNode;
                }

                return node;
            }),
        });
    },
    updateItemType: (nodeId, itemType) => {
        set({
            nodes: get().nodes.map((node) => {
                if(node.id === nodeId && node.type === "quantityConditionNode") {
                    const updatedNode: QuantityConditionNodeType = {
                        ...node,
                        data: {
                            ...node.data,
                            itemType: itemType,
                        },
                    };
                    return updatedNode;
                }

                return node;
            }),
        });
    },
    updateOperator: (nodeId, operator) => {
        set({
            nodes: get().nodes.map((node) => {
                if(node.id === nodeId && node.type === "quantityConditionNode") {
                    const updatedNode: QuantityConditionNodeType = {
                        ...node,
                        data: {
                            ...node.data,
                            operator: operator,
                        },
                    };
                    return updatedNode;
                }

                return node;
            }),
        });
    },
    updateObjective: (nodeId, objective) => {
        set({
            nodes: get().nodes.map((node) => {
                if(node.id === nodeId && node.type === "endStrategyNode") {
                    const updatedNode = {
                        ...node,
                        data: {
                            ...node.data,
                            objective: objective,
                        },
                    };
                    return updatedNode;
                }

                return node;
            }),
        });
    },
}));

export default useStore;