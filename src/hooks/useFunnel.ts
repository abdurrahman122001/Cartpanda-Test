import {
    FunnelNodeData,
    NODE_TYPE_CONFIG,
    NodeType,
    ValidationIssue,
} from '@/types/funnel';
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const STORAGE_KEY = 'funnel-builder-state';

function getNextIndex(nodes: Node[], kind: NodeType): number {
  const ofKind = nodes.filter((node) => (node.data as FunnelNodeData)?.type === kind);
  if (ofKind.length === 0) return 1;
  const indices = ofKind.map((node) => {
    const title = (node.data as FunnelNodeData)?.title ?? '';
    const match = title.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  });
  return Math.max(...indices) + 1;
}

function buildNodeTitle(type: NodeType, index: number): string {
  const config = NODE_TYPE_CONFIG[type];
  if (type === 'upsell' || type === 'downsell') return `${config.label} ${index}`;
  return config.label;
}

function computeValidation(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const connectedIds = new Set([
    ...edges.map((edge) => edge.source),
    ...edges.map((edge) => edge.target),
  ]);
  const orphans = nodes.filter((node) => !connectedIds.has(node.id));
  if (orphans.length > 0 && nodes.length > 1) {
    issues.push({
      type: 'warning',
      message: `${orphans.length} orphan node${orphans.length > 1 ? 's' : ''}`,
    });
  }
  nodes.forEach((node) => {
    const data = node.data as FunnelNodeData;
    if (data?.type !== 'sales') return;
    const outgoing = edges.filter((edge) => edge.source === node.id);
    if (nodes.length > 1) {
      if (outgoing.length === 0) {
        issues.push({ type: 'warning', message: `"${data.title}" has no connection` });
      } else if (outgoing.length > 1) {
        issues.push({ type: 'warning', message: `"${data.title}" has multiple connections` });
      }
    }
  });
  return issues;
}

function applyWarningToNodes(nodes: Node[], edges: Edge[]): Node[] {
  return nodes.map((node) => {
    const data = node.data as FunnelNodeData;
    if (data?.type !== 'sales') return node;
    const outgoing = edges.filter((edge) => edge.source === node.id);
    const hasWarning = nodes.length > 1 && outgoing.length !== 1;
    return {
      ...node,
      data: {
        ...data,
        hasWarning,
        warningMessage: hasWarning
          ? outgoing.length === 0
            ? 'No connection'
            : 'Multiple connections'
          : undefined,
      },
    };
  });
}

export function useFunnel() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.nodes)) setNodes(parsed.nodes);
        if (Array.isArray(parsed.edges)) setEdges(parsed.edges);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const validationIssues = useMemo(() => computeValidation(nodes, edges), [nodes, edges]);
  const nodesWithWarnings = useMemo(
    () => applyWarningToNodes(nodes, edges),
    [nodes, edges]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((prev) => applyNodeChanges(changes, prev)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((prev) => applyEdgeChanges(changes, prev)),
    []
  );

  const onConnect = useCallback((conn: Connection) => {
    const sourceNode = nodes.find((node) => node.id === conn.source);
    const sourceData = sourceNode?.data as FunnelNodeData | undefined;
    if (sourceData?.type === 'thankyou') {
      toast.error("Thank You steps can't have outgoing connections");
      return;
    }
    setEdges((prev) => addEdge({ ...conn, type: 'smoothstep' }, prev));
  }, [nodes]);

  const addNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const index = getNextIndex(nodes, type);
    const config = NODE_TYPE_CONFIG[type];
    setNodes((prev) => [
      ...prev,
      {
        id: `${type}-${Date.now()}`,
        type: 'funnelNode',
        position,
        data: {
          type,
          title: buildNodeTitle(type, index),
          buttonLabel: config.defaultButtonLabel,
        },
      },
    ]);
  }, [nodes]);

  const exportFunnel = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ nodes, edges }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'funnel.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported');
  }, [nodes, edges]);

  const importFunnel = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        setNodes(parsed.nodes);
        setEdges(parsed.edges);
        toast.success('Imported');
      } else {
        throw new Error('Invalid format');
      }
    } catch {
      toast.error('Invalid JSON');
    }
  }, []);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    toast.success('Cleared');
  }, []);

  const connectByDrop = useCallback(
    (
      sourceId: string,
      targetId: string,
      revertPosition: { x: number; y: number }
    ) => {
      if (sourceId === targetId) return;
      const sourceNode = nodes.find((node) => node.id === sourceId);
      const sourceData = sourceNode?.data as FunnelNodeData | undefined;
      if (sourceData?.type === 'thankyou') {
        toast.error("Thank You can't connect to another step");
        return;
      }
      const alreadyConnected = edges.some(
        (edge) => edge.source === sourceId && edge.target === targetId
      );
      if (alreadyConnected) return;
      setEdges((prev) =>
        addEdge({ source: sourceId, target: targetId, type: 'smoothstep' }, prev)
      );
      setNodes((prev) =>
        prev.map((node) =>
          node.id === sourceId ? { ...node, position: revertPosition } : node
        )
      );
    },
    [nodes, edges]
  );

  const loadExampleFunnel = useCallback(() => {
    const exampleNodes: Node[] = [
      {
        id: 'sales-1',
        type: 'funnelNode',
        position: { x: 80, y: 0 },
        data: { type: 'sales', title: 'Sales Page', buttonLabel: 'Buy Now' },
      },
      {
        id: 'order-1',
        type: 'funnelNode',
        position: { x: 80, y: 100 },
        data: { type: 'order', title: 'Checkout', buttonLabel: 'Go to Checkout' },
      },
      {
        id: 'upsell-1',
        type: 'funnelNode',
        position: { x: 80, y: 200 },
        data: { type: 'upsell', title: 'Upsell 1', buttonLabel: 'Yes, add to order' },
      },
      {
        id: 'thankyou-1',
        type: 'funnelNode',
        position: { x: 80, y: 300 },
        data: { type: 'thankyou', title: 'Thank You', buttonLabel: 'View order' },
      },
    ];
    const exampleEdges: Edge[] = [
      { id: 'e-sales-order', source: 'sales-1', target: 'order-1', type: 'smoothstep' },
      { id: 'e-order-upsell', source: 'order-1', target: 'upsell-1', type: 'smoothstep' },
      { id: 'e-upsell-thankyou', source: 'upsell-1', target: 'thankyou-1', type: 'smoothstep' },
    ];
    setNodes(exampleNodes);
    setEdges(exampleEdges);
    toast.success('Example order flow loaded');
  }, []);

  return {
    nodes: nodesWithWarnings,
    edges,
    validationIssues,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    exportFunnel,
    importFunnel,
    clearCanvas,
    connectByDrop,
    loadExampleFunnel,
  };
}
