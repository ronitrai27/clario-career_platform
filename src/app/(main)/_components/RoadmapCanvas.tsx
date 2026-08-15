/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
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

// 🔹 Validate resource link provided by Tavily real-time search
const getWorkingResourceLink = (title: string, link?: string): string => {
  if (link && typeof link === "string") {
    const trimmed = link.trim();
    const lower = trimmed.toLowerCase();
    if (
      trimmed !== "" &&
      trimmed !== "#" &&
      !lower.includes("example.com") &&
      !lower.includes("placeholder") &&
      lower !== "undefined" &&
      lower !== "null"
    ) {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      if (trimmed.includes(".")) {
        return `https://${trimmed}`;
      }
    }
  }
  // Fallback to direct search if link is missing
  return `https://www.google.com/search?q=${encodeURIComponent(title + " official documentation tutorial")}`;
};

// 🔹 Custom Node Component matching original design
function CustomNode({ data }: any) {
  const resourceUrl = getWorkingResourceLink(data.title, data.link);

  return (
    <div className="bg-blue-50 border rounded-lg shadow-md p-3 w-64 relative hover:shadow-lg transition-all duration-200">
      <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
        {data.step}
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />

      <h3 className="font-semibold text-blue-500 text-sm font-sora capitalize">
        {data.title}
      </h3>
      <p className="text-gray-600 font-inter text-sm mt-1">{data.description}</p>
      
      <a
        href={resourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 text-sm underline mt-2 inline-block font-medium hover:text-blue-700"
      >
        Resource ↗
      </a>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}

const MIN_X_GAP = 310; // Center-to-center horizontal distance (card width 256px + 54px gap)
const MIN_Y_GAP = 190; // Center-to-center vertical distance (card height ~130px + 60px gap)

// 🔹 Scale layout grid coordinates so original card layout is preserved without overlaps
const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const hasPositions = nodes.some(
    (n) => n.position && typeof n.position.x === "number"
  );

  let layoutedNodes: any[] = [];

  if (hasPositions) {
    const xValues = nodes.map((n) => n.position?.x ?? 0);
    const yValues = nodes.map((n) => n.position?.y ?? 0);

    // Get unique X and Y grid coordinates sorted
    const uniqueXs = Array.from(new Set(xValues)).sort((a, b) => a - b);
    const uniqueYs = Array.from(new Set(yValues)).sort((a, b) => a - b);

    // Map column & row indices to scaled position with proper gaps
    const xMap = new Map<number, number>();
    uniqueXs.forEach((x, idx) => xMap.set(x, idx * MIN_X_GAP));

    const yMap = new Map<number, number>();
    uniqueYs.forEach((y, idx) => yMap.set(y, idx * MIN_Y_GAP));

    layoutedNodes = nodes.map((node) => {
      const origX = node.position?.x ?? 0;
      const origY = node.position?.y ?? 0;

      const newX = xMap.has(origX) ? xMap.get(origX)! : origX * 2.2;
      const newY = yMap.has(origY) ? yMap.get(origY)! : origY * 1.8;

      return {
        ...node,
        position: { x: newX, y: newY },
      };
    });
  } else {
    // Fallback: 3 columns grid layout
    const COLS = 3;
    layoutedNodes = nodes.map((node, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return {
        ...node,
        position: {
          x: col * MIN_X_GAP,
          y: row * MIN_Y_GAP,
        },
      };
    });
  }

  const layoutedEdges = edges.map((edge) => ({
    ...edge,
    type: "default",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2, ...edge.style },
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

function RoadmapCanvasInner({ roadmap }: RoadmapProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!roadmap) return;

    const rawNodes =
      roadmap.initialNodes?.map((n: any, index: number) => ({
        id: n.id || `node-${index + 1}`,
        type: "custom",
        position: n.position,
        data: {
          step: index + 1,
          title: n.data?.title || "Untitled",
          description: n.data?.description || "",
          link: n.data?.link || "",
        },
      })) || [];

    const rawEdges = roadmap.initialEdges || [];

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Auto-fit screen viewport nicely
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 300 });
    }, 50);
  }, [roadmap, fitView]);

  // 🔹 Auto-adjust on screen / container size change
  useEffect(() => {
    const container = reactFlowWrapper.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      fitView({ padding: 0.15, duration: 200 });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [fitView]);

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

      <p className="text-gray-600 text-center font-inter">
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
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
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

export default function Roadmap({ roadmap }: RoadmapProps) {
  return (
    <ReactFlowProvider>
      <RoadmapCanvasInner roadmap={roadmap} />
    </ReactFlowProvider>
  );
}
