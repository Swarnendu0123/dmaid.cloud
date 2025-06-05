// components/ZoomControls.jsx
import { RefObject } from "react";

const ZoomControls = ({ panzoomRef }: { panzoomRef: RefObject<{ zoomIn: () => void; zoomOut: () => void }> }) => {
    const handleZoomIn = () => {
      try {
        panzoomRef.current?.zoomIn();
      } catch (err) {
        console.warn("Zoom in failed:", err);
      }
    };
  
    const handleZoomOut = () => {
      try {
        panzoomRef.current?.zoomOut();
      } catch (err) {
        console.warn("Zoom out failed:", err);
      }
    };
  
    return (
      <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2 p-2 rounded-lg">
        <div className="flex space-x-2">
          <button
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>
    );
  };
  
  export default ZoomControls;