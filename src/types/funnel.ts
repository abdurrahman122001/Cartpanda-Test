export type NodeType = 'sales' | 'order' | 'upsell' | 'downsell' | 'thankyou';

export const FUNNEL_NODE_WIDTH = 200;
export const FUNNEL_NODE_HEIGHT = 95;

export interface FunnelNodeData {
  type: NodeType;
  title: string;
  buttonLabel: string;
  hasWarning?: boolean;
  warningMessage?: string;
}

export interface FunnelNode {
  id: string;
  type: 'funnelNode';
  position: { x: number; y: number };
  data: FunnelNodeData;
}

export interface FunnelEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface FunnelState {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
}

export type ValidationIssue = {
  type: 'error' | 'warning';
  message: string;
};

export const NODE_TYPE_CONFIG: Record<NodeType, {
  label: string;
  defaultButtonLabel: string;
  icon: string;
  color: string;
}> = {
  sales: {
    label: 'Sales Page',
    defaultButtonLabel: 'Buy Now',
    icon: 'ShoppingBag',
    color: 'node-sales',
  },
  order: {
    label: 'Checkout',
    defaultButtonLabel: 'Go to Checkout',
    icon: 'CreditCard',
    color: 'node-order',
  },
  upsell: {
    label: 'Upsell',
    defaultButtonLabel: 'Yes, add to order',
    icon: 'TrendingUp',
    color: 'node-upsell',
  },
  downsell: {
    label: 'Downsell',
    defaultButtonLabel: 'No thanks',
    icon: 'TrendingDown',
    color: 'node-downsell',
  },
  thankyou: {
    label: 'Thank You',
    defaultButtonLabel: 'View order',
    icon: 'CheckCircle',
    color: 'node-thankyou',
  },
};
