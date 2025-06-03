import React from "react";
import MermaidImage from "./MermaidImage";
import { examples } from "./examples";
import { codeState } from "../../store/atoms";
import { useSetRecoilState } from "recoil";

const ExampleList: React.FC = () => {
  const setEditorCode = useSetRecoilState<string>(codeState);

  // [CORE] Code change Handeler
  const handleCodeChange = (value: string) => {
    setEditorCode(value);
    localStorage.setItem("mermaid_code", value);
  };
  return (
    <div className="items-center p-4">
      {examples.map((exampleCategory) => (
        <div>
          <div>
            <p className="text-lg font-black mb-2">
              {exampleCategory.category}
            </p>
          </div>
          <div>
            {/* 1) List of buttons */}
            {exampleCategory.diagrams.map((example) => (
              <button
                key={example.id}
                className="bg-pink-200 text-sm px-4 py-2 rounded m-1 hover:bg-blue-300 transition-colors mx-2"
                onClick={() => handleCodeChange(example.code)}
              >
                {example.name}
                {/* 2) Render the MermaidImage when there's code */}
                <div className="mt-4">
                  {example.code && <MermaidImage code={example.code} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExampleList;
