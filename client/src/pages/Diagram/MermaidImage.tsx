import mermaid from "mermaid";
import { useEffect, useRef } from "react";

type MermaidImageProps = {
  code: string;
};

const MermaidImage = ({ code }: MermaidImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Mermaid (only needs to happen once, but re-initializing is okay)
    mermaid.initialize({
      startOnLoad: false, // we’re manually rendering
      theme: "default",
      securityLevel: "loose",
    });

    // Generate a unique ID so Mermaid doesn’t collide if you have multiple diagrams
    const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    // Render returns a Promise<{ svg, bindFunctions }>
    mermaid
      .render(uniqueId, code)
      .then(({ svg, bindFunctions }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          // If there are any interactive bits (e.g. tooltips), bind them
          bindFunctions?.(containerRef.current);
        }
      })
      .catch((err) => {
        console.error("Error rendering Mermaid diagram:", err);
      });
  }, [code]); // re-run whenever `code` changes

  return (
    <div
      ref={containerRef}
      style={{
        width: "80px",
        height: "80px",
        overflow: "auto",
        // you can tweak these if you want scrollbars or responsive scaling
      }}
    />
  );
};

export default MermaidImage;
