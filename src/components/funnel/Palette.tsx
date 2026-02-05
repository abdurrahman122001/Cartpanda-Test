import { cn } from '@/lib/utils';
import { NODE_TYPE_CONFIG, type NodeType } from '@/types/funnel';
import type { DragEvent } from 'react';

const dotClass: Record<string, string> = {
  'node-sales': 'bg-node-sales',
  'node-order': 'bg-node-order',
  'node-upsell': 'bg-node-upsell',
  'node-downsell': 'bg-node-downsell',
  'node-thankyou': 'bg-node-thankyou',
};

export default function Palette({ className }: { className?: string }) {
  function onDrag(e: DragEvent, type: NodeType) {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <aside
      className={cn('w-64 bg-sidebar border-r border-sidebar-border flex flex-col border-l-4 border-l-primary', className)}
      aria-label="Node palette"
    >
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Steps</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Drag to canvas</p>
      </div>
      <div className="flex-1 p-3 overflow-auto">
        <div className="space-y-1.5" role="list" aria-label="Node types">
          {(Object.entries(NODE_TYPE_CONFIG) as [NodeType, (typeof NODE_TYPE_CONFIG)[NodeType]][]).map(([type, config]) => (
            <div
              key={type}
              className="palette-item group"
              draggable
              onDragStart={(e) => onDrag(e, type)}
              role="listitem"
              aria-label={`Add ${config.label}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
              }}
            >
              <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', dotClass[config.color])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{config.label}</p>
                <p className="text-xs text-muted-foreground truncate">{config.defaultButtonLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
