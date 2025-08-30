"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Maximize, 
  Minimize,
  Move,
  FileImage,
  FileType,
  FileText
} from "lucide-react";

interface MermaidPreviewPanelProps {
  content: string;
  className?: string;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export default function MermaidPreviewPanel({ content, className = "" }: MermaidPreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  // Render Mermaid diagram
  const renderMermaid = useCallback(async () => {
    if (!containerRef.current || !content.trim()) return;

    setIsRendering(true);
    setError(null);

    try {
      const element = containerRef.current.querySelector(".mermaid-container");
      if (element) {
        element.innerHTML = "";
        
        const { svg } = await mermaid.render("mermaid-diagram", content);
        element.innerHTML = svg;
        
        // Get reference to the SVG element
        svgRef.current = element.querySelector("svg");
      }
    } catch (err) {
      setError(`Invalid Mermaid syntax: ${(err as Error).message}`);
    } finally {
      setIsRendering(false);
    }
  }, [content]);

  useEffect(() => {
    renderMermaid();
  }, [renderMermaid]);

  // Handle zoom
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'reset') {
      setZoomLevel(100);
      setPan({ x: 0, y: 0 });
      return;
    }

    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    let newIndex = currentIndex;

    if (direction === 'in' && currentIndex < ZOOM_LEVELS.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'out' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    setZoomLevel(ZOOM_LEVELS[newIndex]);
  };

  // Handle pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Export functions
  const exportAsPNG = async () => {
    if (!svgRef.current) return;

    try {
      const canvas = await html2canvas(svgRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'mermaid-diagram.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  };

  const exportAsSVG = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.download = 'mermaid-diagram.svg';
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async () => {
    if (!svgRef.current) return;

    try {
      const canvas = await html2canvas(svgRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('mermaid-diagram.pdf');
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  // Fullscreen handling
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-white"
    : className;

  return (
    <div className={`${containerClasses} flex flex-col`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-md">
            <button
              onClick={() => handleZoom('out')}
              disabled={zoomLevel === ZOOM_LEVELS[0]}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <select
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="px-2 py-1.5 text-sm border-0 bg-transparent focus:outline-none"
            >
              {ZOOM_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}%
                </option>
              ))}
            </select>
            <button
              onClick={() => handleZoom('in')}
              disabled={zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* Reset View */}
          <button
            onClick={() => handleZoom('reset')}
            className="p-1.5 hover:bg-gray-100 border border-gray-300 rounded-md"
            title="Reset View"
          >
            <RotateCcw size={14} />
          </button>

          {/* Pan Indicator */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Move size={14} />
            <span>Drag to pan</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={exportAsPNG}
              disabled={!svgRef.current || isRendering}
              className="p-1.5 hover:bg-gray-100 border border-gray-300 rounded-md disabled:opacity-50"
              title="Export as PNG"
            >
              <FileImage size={14} />
            </button>
            <button
              onClick={exportAsSVG}
              disabled={!svgRef.current || isRendering}
              className="p-1.5 hover:bg-gray-100 border border-gray-300 rounded-md disabled:opacity-50"
              title="Export as SVG"
            >
              <FileType size={14} />
            </button>
            <button
              onClick={exportAsPDF}
              disabled={!svgRef.current || isRendering}
              className="p-1.5 hover:bg-gray-100 border border-gray-300 rounded-md disabled:opacity-50"
              title="Export as PDF"
            >
              <FileText size={14} />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-gray-100 border border-gray-300 rounded-md"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        className="flex-1 overflow-hidden bg-white relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-500"></div>
              <span>Rendering diagram...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-red-600 text-center p-4">
              <h3 className="font-semibold mb-2">Mermaid Syntax Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div
          className="mermaid-container flex items-center justify-center h-full"
          style={{
            transform: `scale(${zoomLevel / 100}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {!content.trim() && !isRendering && (
            <div className="text-gray-400 text-center">
              <div className="mb-2">No Mermaid content to render</div>
              <div className="text-sm">Add Mermaid syntax to see the diagram</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}