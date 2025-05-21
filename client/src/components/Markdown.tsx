import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useState, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { codeState } from "../store/atoms";

const Markdown = ({ markdownString }: { markdownString: string }) => {
  const setCode = useSetRecoilState(codeState);
  const [htmlContent, setHtmlContent] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    if (!containerRef.current) return;

    const thinkBlocks = containerRef.current.querySelectorAll(".thinking");
    thinkBlocks.forEach((el, index) => {
      (el as HTMLElement).style.animation = `fadeIn 0.6s ease-out ${
        index * 2
      }s forwards`;
    });
  }, [htmlContent]);

  useEffect(() => {
    const parseAndSanitize = async () => {
      // Replace <think>...</think> with <div class="thinking">...</div>
      const transformedMarkdown = markdownString.replace(
        /<think>([\s\S]*?)<\/think>/gi,
        (_, content) => `<div class="thinking">${content}</div>`
      );

      const rawHTML = await marked(transformedMarkdown);
      const sanitized = DOMPurify.sanitize(rawHTML);
      setHtmlContent(sanitized);
    };

    parseAndSanitize();
  }, [markdownString]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove previous buttons to prevent duplicates
    containerRef.current
      .querySelectorAll(".copy-button")
      .forEach((btn) => btn.remove());

    containerRef.current.querySelectorAll("pre").forEach((pre) => {
      const button = document.createElement("button");
      button.innerText = "Try This";
      button.className =
        "copy-button absolute right-2 top-2 bg-gray-200 text-sm px-2 py-1 rounded hover:bg-gray-300";
      button.onclick = () => {
        const code = pre.querySelector("code");
        if (code) {
          setCode(code.innerText);
          localStorage.setItem("mermaid_code", code.innerText);
          button.innerText = "Copied to Editor!";
          setTimeout(() => (button.innerText = "Try This"), 1000);
        }
      };

      const wrapper = document.createElement("div");
      wrapper.className = "relative";
      pre.parentNode?.replaceChild(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(button);
    });
  }, [htmlContent, setCode]);

  return (
    <article className="prose lg:prose-xl prose-a:text-gray-600 max-w-full prose-code:text-red-600 prose-pre:text-white prose-pre:bg-gray-100 prose-p:text-md prose-code:text-md prose-ul:text-md prose-ol:text-md prose-headings:text-gray-600 prose-table:border-gray-200 prose-table:border prose-th:p-2 prose-td:p-2 prose-th:bg-gray-100 prose-td:border prose-headings:font-black">
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="
    text-sm p-5
    [&_.thinking]:italic
    [&_.thinking]:bg-gray-50
    [&_.thinking]:border-l-2
    [&_.thinking]:border-gray-300
    [&_.thinking]:pl-4
    [&_.thinking]:my-4
    [&_.thinking]:rounded-sm
    [&_.thinking]:text-gray-700
    [&_.thinking]:font-normal
  "
      ></div>
    </article>
  );
};

export default Markdown;
