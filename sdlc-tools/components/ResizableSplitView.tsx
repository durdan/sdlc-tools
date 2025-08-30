"use client";

import { ReactNode } from "react";
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle,
  ImperativePanelHandle 
} from "react-resizable-panels";

interface ResizableSplitViewProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultSizes?: [number, number];
  minSizes?: [number, number];
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export default function ResizableSplitView({
  leftPanel,
  rightPanel,
  defaultSizes = [50, 50],
  minSizes = [20, 20],
  direction = 'horizontal',
  className = ""
}: ResizableSplitViewProps) {
  return (
    <div className={`flex h-full w-full ${className}`}>
      <PanelGroup direction={direction}>
        <Panel defaultSize={defaultSizes[0]} minSize={minSizes[0]}>
          <div className="h-full w-full">
            {leftPanel}
          </div>
        </Panel>
        
        <PanelResizeHandle className="relative">
          <div className={`
            ${direction === 'horizontal' 
              ? 'w-1 h-full hover:w-2 cursor-col-resize' 
              : 'h-1 w-full hover:h-2 cursor-row-resize'
            } 
            bg-gray-200 hover:bg-blue-400 transition-all duration-150 group
          `}>
            {/* Resize handle indicator */}
            <div className={`
              absolute 
              ${direction === 'horizontal'
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8'
                : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-8'
              }
              bg-gray-400 group-hover:bg-blue-600 rounded-full transition-colors
            `} />
          </div>
        </PanelResizeHandle>
        
        <Panel defaultSize={defaultSizes[1]} minSize={minSizes[1]}>
          <div className="h-full w-full">
            {rightPanel}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}