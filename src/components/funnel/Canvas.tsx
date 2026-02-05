import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useFunnel } from '@/hooks/useFunnel';
import type { NodeType } from '@/types/funnel';
import { FUNNEL_NODE_HEIGHT, FUNNEL_NODE_WIDTH } from '@/types/funnel';
import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    Node,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { DragEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import Palette from './Palette';
import Step from './Step';
import Toolbar from './Toolbar';

const nodeTypes = { funnelNode: Step };

function isOverNode(
  centerX: number,
  centerY: number,
  node: Node,
  width: number,
  height: number
) {
  const { x, y } = node.position;
  return (
    centerX >= x &&
    centerX <= x + width &&
    centerY >= y &&
    centerY <= y + height
  );
}

function EmptyState({ onLoadExample }: { onLoadExample: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none" aria-hidden="true">
      <div className="flex flex-col items-center gap-4 text-center px-6 pointer-events-auto">
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Drag steps from the left onto the canvas. Drop a step on top of another to connect them, or use the handles. Click a connection and press Delete to remove it; drag an edge end to another step to reconnect.
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={onLoadExample} className="pointer-events-auto">
          Start from example order flow
        </Button>
      </div>
    </div>
  );
}

function CanvasInner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ id: string; position: { x: number; y: number } } | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const state = useFunnel();

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      state.addNode(type, pos);
    },
    [screenToFlowPosition, state.addNode]
  );

  const onNodeDragStart = useCallback((_e: React.MouseEvent, node: Node) => {
    dragStartRef.current = { id: node.id, position: { ...node.position } };
  }, []);

  const onNodeDragStop = useCallback(
    (_e: React.MouseEvent, dragged: Node) => {
      const start = dragStartRef.current;
      dragStartRef.current = null;
      const centerX = dragged.position.x + FUNNEL_NODE_WIDTH / 2;
      const centerY = dragged.position.y + FUNNEL_NODE_HEIGHT / 2;
      const target = state.nodes.find(
        (node) =>
          node.id !== dragged.id &&
          isOverNode(centerX, centerY, node, FUNNEL_NODE_WIDTH, FUNNEL_NODE_HEIGHT)
      );
      if (target && start) {
        state.connectByDrop(dragged.id, target.id, start.position);
      }
    },
    [state.nodes, state.connectByDrop]
  );

  return (
    <div className="flex h-screen w-full">
      <div className="hidden md:block shrink-0">
        <Palette />
      </div>

      <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed left-3 top-16 z-20 h-9 w-9 rounded-lg border bg-card"
            aria-label="Open palette"
          >
            <span className="text-sm font-medium">≡</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 max-w-[85vw] p-0 border-r">
          <Palette className="h-full border-0" />
        </SheetContent>
      </Sheet>

      <div className="flex-1 relative min-w-0" ref={wrapperRef}>
        {state.nodes.length === 0 && <EmptyState onLoadExample={state.loadExampleFunnel} />}
        <Toolbar
          onExport={state.exportFunnel}
          onImport={state.importFunnel}
          onClear={state.clearCanvas}
          validationIssues={state.validationIssues}
        />
        <ReactFlow
          nodes={state.nodes}
          edges={state.edges}
          onNodesChange={state.onNodesChange}
          onEdgesChange={state.onEdgesChange}
          onConnect={state.onConnect}
          onReconnect={state.onReconnect}
          edgesReconnectable
          reconnectRadius={12}
          nodesDraggable
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: 'smoothstep', reconnectable: 'target' }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="canvas-wrapper"
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Shift']}
          aria-label="Funnel canvas"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--canvas-grid-dot))" />
          <Controls showInteractive={false} className="!rounded-lg !border" aria-label="Canvas controls" />
          <MiniMap nodeStrokeWidth={2} pannable zoomable className="!rounded-lg !border" maskColor="hsl(var(--background) / 0.8)" aria-label="Minimap" />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
