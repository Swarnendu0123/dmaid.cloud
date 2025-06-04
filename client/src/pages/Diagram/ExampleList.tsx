import React, { useCallback } from "react";
import MermaidImage from "./MermaidImage";
import { examples } from "./examples";
import { codeState } from "../../store/atoms";
import { useSetRecoilState } from "recoil";

const ExampleList: React.FC = () => {
  const setEditorCode = useSetRecoilState<string>(codeState);

  const handleCodeChange = useCallback(
    (value: string) => {
      setEditorCode(value);
      localStorage.setItem("mermaid_code", value);
    },
    [setEditorCode]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="space-y-8">
        {examples.map((exampleCategory, categoryIndex) => (
          <div key={`${exampleCategory.category}-${categoryIndex}`}>
            <h2 className="text-xl font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
              {exampleCategory.category}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
              {exampleCategory.diagrams.map((example) => (
                <button 
                  key={example.id}
                  onClick={() => handleCodeChange(example.code)}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow w-full"
                >
                  <div className="aspect-square bg-gray-50 p-3 flex items-center justify-center">
                    <MermaidImage code={example.code} />
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {example.name}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleList;