/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
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
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { LuDownload } from "react-icons/lu";
import { toast } from "sonner";
import { toPng } from "html-to-image";

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
      <Handle type="target" position={Position.Top} className="" />
      <h3 className="font-semibold text-blue-500 text-sm font-inter">
        {data.title}
      </h3>
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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roadmap) return;

    const newNodes =
      roadmap.initialNodes?.map((n: any) => ({
        id: n.id,
        type: "custom", // use custom node
        position: n.position || {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
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

  // =========================================
  const downloadAsPNG = async () => {
    try {
      const target = document.querySelector(".react-flow__renderer");
      if (!target) {
        toast.error("React Flow canvas not found!");
        console.error("React Flow canvas not found!");
        return;
      }

      const dataUrl = await toPng(target as HTMLElement, {
        cacheBust: true,
        pixelRatio: 2, 
        backgroundColor: "#ffffff", 
      });

      toast.success("Image downloaded successfully!");

      const link = document.createElement("a");
      link.download = `${roadmap.roadmapTitle || "roadmap"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-6 justify-center">
        <h2 className="text-xl font-bold mb-2 text-center font-inter mt-2">
          {roadmap.roadmapTitle}
        </h2>
        <Button size="sm" onClick={downloadAsPNG}>
          <LuDownload className="" />
        </Button>
      </div>

      <p className="text-gray-600  text-center font-inter">
        {roadmap.description}
      </p>
      <div
        ref={reactFlowWrapper}
        className="overflow-hidden"
        style={{ width: "100%", height: "600px" }}
      >
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
    </>
  );
}
