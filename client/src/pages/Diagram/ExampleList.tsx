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
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-4 border-b-2 border-gradient-to-r from-blue-400 to-purple-400 pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {exampleCategory.category}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
              {exampleCategory.diagrams.map((example) => (
                <button 
                  key={example.id}
                  onClick={() => handleCodeChange(example.code)}
                  className="glass-card rounded-xl overflow-hidden hover:shadow-glow-purple transition-all duration-300 w-full transform hover:scale-105 hover:-translate-y-1 border border-white/30 dark:border-gray-700/30"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-3 flex items-center justify-center">
                    <MermaidImage code={example.code} />
                  </div>

                  <div className="p-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
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