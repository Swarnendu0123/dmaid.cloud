import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

type MermaidImageProps = {
  code: string;
};

const MermaidImage = ({ code }: MermaidImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!code?.trim()) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });

    // Generate unique ID
    const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    const renderDiagram = async () => {
      try {
        const result = await mermaid.render(uniqueId, code);
        
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = result.svg;
          
          // Scale SVG to fit
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
            svgElement.style.maxWidth = '100%';
            svgElement.style.maxHeight = '100%';
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Mermaid render error:", error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-2xl mb-1">⚠</div>
          <div className="text-xs">Error</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-1"></div>
            <div className="text-xs">Loading</div>
          </div>
        </div>
      )}
      
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
      />
    </div>
  );
};

export default MermaidImage;