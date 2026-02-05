import { cn } from '@/lib/utils';
import type { FunnelNodeData } from '@/types/funnel';
import { FUNNEL_NODE_WIDTH, NODE_TYPE_CONFIG } from '@/types/funnel';
import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

const NODE_STYLE_BY_COLOR: Record<
  string,
  { bar: string; button: string; dot: string }
> = {
  'node-sales': {
    bar: 'node-bar-sales',
    button: 'bg-node-sales hover:opacity-90',
    dot: 'bg-node-sales',
  },
  'node-order': {
    bar: 'node-bar-order',
    button: 'bg-node-order hover:opacity-90',
    dot: 'bg-node-order',
  },
  'node-upsell': {
    bar: 'node-bar-upsell',
    button: 'bg-node-upsell hover:opacity-90',
    dot: 'bg-node-upsell',
  },
  'node-downsell': {
    bar: 'node-bar-downsell',
    button: 'bg-node-downsell hover:opacity-90',
    dot: 'bg-node-downsell',
  },
  'node-thankyou': {
    bar: 'node-bar-thankyou',
    button: 'bg-node-thankyou hover:opacity-90',
    dot: 'bg-node-thankyou',
  },
};

function Step({ data, selected }: { data: FunnelNodeData; selected?: boolean }) {
  const config = NODE_TYPE_CONFIG[data.type];
  const style = NODE_STYLE_BY_COLOR[config.color];

  return (
    <div
      className={cn(
        'funnel-node overflow-hidden animate-fade-in-up',
        selected && 'funnel-node-selected'
      )}
      style={{ width: FUNNEL_NODE_WIDTH }}
      role="button"
      aria-label={`${data.title} node`}
      tabIndex={0}
    >
      <div className={cn('h-1 w-full', style.bar)} />
      <div className="p-3">
        <div className="flex items-center gap-2.5 mb-3">
          <span
            className={cn('w-2.5 h-2.5 rounded-full shrink-0', style.dot)}
            aria-hidden
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {data.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {config.label}
            </p>
          </div>
        </div>
        <div
          className={cn(
            'w-full py-2 px-3 rounded-md text-center text-xs font-medium text-white',
            style.button
          )}
        >
          {data.buttonLabel}
        </div>
        {data.hasWarning && (
          <div
            className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-amber-500/10 rounded text-amber-700 dark:text-amber-400 text-xs"
            role="alert"
          >
            <span className="font-bold">!</span>
            <span>{data.warningMessage}</span>
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !rounded-full"
        aria-label="Connection input"
      />
      {data.type !== 'thankyou' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !rounded-full"
          aria-label="Connection output"
        />
      )}
    </div>
  );
}

export default memo(Step);
