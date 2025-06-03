import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useState, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { codeState } from "../store/atoms";

const Markdown = ({ markdownString }: { markdownString: string }) => {
  const setCode = useSetRecoilState(codeState);
  const [htmlContent, setHtmlContent] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Convert <think>…</think> → <div class="thinking">…</div>, then sanitize the HTML
  useEffect(() => {
    const parseAndSanitize = async () => {
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

  // 2. Once we have HTML, attach “Try This” buttons to every <pre>…</pre>
  useEffect(() => {
    if (!containerRef.current) return;
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

  // 3. Typing‐effect for all text nodes. After each .thinking block finishes, append “Thought for n seconds.”
  useEffect(() => {
    if (!containerRef.current) return;

    // Gather every text node under containerRef
    const walker = document.createTreeWalker(
      containerRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    const textNodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      if (node.textContent && node.textContent.trim().length > 0) {
        textNodes.push(node as Text);
      }
      node = walker.nextNode();
    }

    const CHAR_INTERVAL = 2; // ms per character (faster type)
    let cumulativeDelay = 0;

    // Keep track of which .thinking elements we’ve already inserted a “Thought for…” note under
    const handledThinking = new Set<HTMLElement>();

    textNodes.forEach((textNode) => {
      const fullText = textNode.textContent || "";
      // Clear it immediately
      textNode.textContent = "";

      // When to start typing this particular node
      const startTime = cumulativeDelay;
      // How long typing this node takes
      const nodeDuration = fullText.length * CHAR_INTERVAL;
      // When typing this node finishes
      const finishTime = startTime + nodeDuration;

      // Schedule the character‐by‐character typing
      setTimeout(() => {
        let i = 0;
        const typer = setInterval(() => {
          if (i < fullText.length) {
            textNode.textContent += fullText.charAt(i);
            i++;
          } else {
            clearInterval(typer);
          }
        }, CHAR_INTERVAL);
      }, startTime);

      // If this textNode is inside a .thinking container, schedule its “Thought for n seconds” note
      // right when it finishes typing.
      const thinkElem = ((): HTMLElement | null => {
        if (!textNode.parentElement) return null;
        return textNode.parentElement.closest(".thinking");
      })();

      if (thinkElem && !handledThinking.has(thinkElem)) {
        handledThinking.add(thinkElem);
        // Compute seconds, rounded to 2 decimals
        const seconds = +(nodeDuration / 1000).toFixed(2);

        setTimeout(() => {
          // Create and insert the note right after the .thinking div
          const note = document.createElement("div");
          note.className = "mt-1 text-sm text-gray-500 italic";
          note.innerText = `Thought for ${seconds} seconds`;
          thinkElem.insertAdjacentElement("afterend", note);
        }, finishTime);
      }

      // Increase cumulativeDelay so the next text node types *after* this one finishes
      cumulativeDelay += nodeDuration;
    });
  }, [htmlContent]);

  return (
    <article
      className="
        prose lg:prose-xl prose-a:text-gray-600 max-w-full
        prose-code:text-red-600 prose-pre:text-white prose-pre:bg-gray-100
        prose-p:text-md prose-code:text-md prose-ul:text-md prose-ol:text-md
        prose-headings:text-gray-600 prose-table:border-gray-200 prose-table:border
        prose-th:p-2 prose-td:p-2 prose-th:bg-gray-100 prose-td:border
        prose-headings:font-black
      "
    >
      <div
        ref={containerRef}
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
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      ></div>
    </article>
  );
};

export default Markdown;
