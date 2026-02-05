import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ValidationIssue } from '@/types/funnel';
import { useRef } from 'react';

type Props = {
  onExport: () => void;
  onImport: (json: string) => void;
  onClear: () => void;
  validationIssues: ValidationIssue[];
};

export default function Toolbar({ onExport, onImport, onClear, validationIssues }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      if (typeof r.result === 'string') onImport(r.result);
    };
    r.readAsText(file);
    e.target.value = '';
  }

  const hasIssues = validationIssues.length > 0;
  const isError = validationIssues.some((i) => i.type === 'error');

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-2 toolbar-panel rounded-lg px-2 py-1.5 text-sm">
      {hasIssues ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                isError ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              )}
              role="status"
              aria-label={`${validationIssues.length} issue(s)`}
            >
              <span>{validationIssues.length}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-xs">
            <ul className="space-y-1">
              {validationIssues.map((issue, i) => (
                <li key={i}>{issue.message}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      ) : (
        <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          OK
        </div>
      )}

      <div className="w-px h-5 bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onExport} className="h-8 px-2 text-muted-foreground hover:text-foreground text-xs" aria-label="Export JSON">
            Export
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download as JSON</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="h-8 px-2 text-muted-foreground hover:text-foreground text-xs" aria-label="Import JSON">
            Import
          </Button>
        </TooltipTrigger>
        <TooltipContent>Load from file</TooltipContent>
      </Tooltip>
      <input ref={inputRef} type="file" accept=".json,application/json" onChange={onFilePick} className="hidden" aria-hidden />

      <div className="w-px h-5 bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2 text-destructive hover:bg-destructive/10 text-xs" aria-label="Clear canvas">
            Clear
          </Button>
        </TooltipTrigger>
        <TooltipContent>Clear canvas</TooltipContent>
      </Tooltip>
    </div>
  );
}
