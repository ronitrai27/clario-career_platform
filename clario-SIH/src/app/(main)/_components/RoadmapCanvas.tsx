
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface RoadmapProps {
  roadmap: {
    roadmapTitle?: string;
    description?: string;
    duration?: string;
    initialNodes?: any[];
    initialEdges?: any[];
  };
}

// 🔹 Custom Node Component
function CustomNode({ data }: any) {
  return (
    <div className="bg-blue-50 border rounded-lg shadow-md p-3 w-64">
      <Handle type="target" position={Position.Top} className=""/>
      <h3 className="font-semibold text-blue-500 text-sm font-inter">{data.title}</h3>
      <p className="text-gray-600 text-sm">{data.description}</p>
      {data.link && (
        <a
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm underline"
        >
          Resource
        </a>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default function Roadmap({ roadmap }: RoadmapProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    if (!roadmap) return;

    const newNodes =
      roadmap.initialNodes?.map((n: any) => ({
        id: n.id,
        type: "custom", // use custom node
        position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          title: n.data?.title || "Untitled",
          description: n.data?.description || "",
          link: n.data?.link || "",
        },
      })) || [];

    const newEdges = roadmap.initialEdges || [];

    setNodes(newNodes);
    setEdges(newEdges);
  }, [roadmap]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <h2 className="text-xl font-bold mb-2 text-center font-sora mt-2">{roadmap.roadmapTitle}</h2>
      <p className="text-gray-600  text-center font-inter">{roadmap.description}</p>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ custom: CustomNode }} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        {/* @ts-expect-error variant "dots" not in types but works at runtime */}
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}


