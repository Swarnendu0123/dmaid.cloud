import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useState, useRef } from "react";
import { useSetRecoilState } from "recoil";
import { codeState } from "../store/atoms";
import mermaid from "mermaid";
import Prism from "prismjs";
// Import core languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-php";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
// Import a light theme
import "prismjs/themes/prism.css";

const Markdown = ({ markdownString }: { markdownString: string }) => {
  const setCode = useSetRecoilState(codeState);
  const [htmlContent, setHtmlContent] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  // Configure marked to use Prism for code highlighting using a custom renderer
  useEffect(() => {
    const renderer = new marked.Renderer();
    
    // Override the code renderer to add proper language classes
    // @ts-expect-error Prism types are not fully compatible with marked's renderer
    renderer.code = function(code: string, language?: string) {
      const validLang = language && Prism.languages[language] ? language : '';
      const langClass = validLang ? ` class="language-${validLang}"` : '';
      
      let highlightedCode = code;
      if (validLang) {
        try {
          highlightedCode = Prism.highlight(code, Prism.languages[validLang], validLang);
        } catch (err) {
          console.warn("Prism highlighting failed:", err);
          highlightedCode = code;
        }
      }
      
      return `<pre><code${langClass}>${highlightedCode}</code></pre>`;
    };

    marked.setOptions({
      renderer: renderer,
    });
  }, []);

  // 1. Convert <think>…</think> → <div class="thinking">…</div>, handle Mermaid, then sanitize the HTML
  useEffect(() => {
    const parseAndSanitize = async () => {
      let transformedMarkdown = markdownString.replace(
        /<think>([\s\S]*?)<\/think>/gi,
        (_, content) => `<div class="thinking">${content}</div>`
      );

      // Replace Mermaid code blocks with placeholder divs that will be processed later
      const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/gi;
      transformedMarkdown = transformedMarkdown.replace(
        mermaidRegex,
        (_, code) => {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          // Store the code in a data attribute, encoded to be safe
          return `<div class="mermaid-diagram" data-mermaid-code="${encodeURIComponent(
            code.trim()
          )}" id="${id}"></div>`;
        }
      );

      const rawHTML = await marked(transformedMarkdown);
      const sanitized = DOMPurify.sanitize(rawHTML);
      setHtmlContent(sanitized);
    };
    parseAndSanitize();
  }, [markdownString]);

  // 2. Once we have HTML, attach "Try This" buttons to every <pre>…</pre> (non-Mermaid code blocks) and apply syntax highlighting
  useEffect(() => {
    if (!containerRef.current) return;

    // Remove existing buttons
    containerRef.current
      .querySelectorAll(".copy-button")
      .forEach((btn) => btn.remove());

    containerRef.current.querySelectorAll("pre").forEach((pre) => {
      // Apply Prism highlighting if not already done
      const codeElement = pre.querySelector("code");
      if (codeElement && codeElement.className.includes("language-")) {
        // Extract language from class name
        const languageClass = Array.from(codeElement.classList).find((cls) =>
          cls.startsWith("language-")
        );
        if (languageClass) {
          const language = languageClass.replace("language-", "");
          if (Prism.languages[language]) {
            try {
              const highlighted = Prism.highlight(
                codeElement.textContent || "",
                Prism.languages[language],
                language
              );
              codeElement.innerHTML = highlighted;
            } catch (err) {
              console.warn("Failed to highlight code:", err);
            }
          }
        }
      }

      const button = document.createElement("button");
      button.innerText = "Try This";
      button.className =
        "copy-button absolute right-2 top-2 bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 transition-colors z-10 shadow-lg";
      button.onclick = () => {
        const code = pre.querySelector("code");
        if (code) {
          // Get the text content without HTML tags for copying
          const codeText = code.textContent || code.innerText;
          setCode(codeText);
          localStorage.setItem("mermaid_code", codeText);
          button.innerText = "Copied!";
          button.className =
            "copy-button absolute right-2 top-2 bg-green-500 text-white text-sm px-3 py-1 rounded transition-colors z-10 shadow-lg";
          setTimeout(() => {
            button.innerText = "Try This";
            button.className =
              "copy-button absolute right-2 top-2 bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 transition-colors z-10 shadow-lg";
          }, 1000);
        }
      };

      const wrapper = document.createElement("div");
      wrapper.className = "relative group";
      pre.parentNode?.replaceChild(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(button);

      // Add language label if available
      if (codeElement && codeElement.className.includes("language-")) {
        const languageClass = Array.from(codeElement.classList).find((cls) =>
          cls.startsWith("language-")
        );
        if (languageClass) {
          const language = languageClass.replace("language-", "");
          const languageLabel = document.createElement("span");
          languageLabel.innerText = language.toUpperCase();
          languageLabel.className =
            "absolute left-2 top-2 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border z-10";
          wrapper.appendChild(languageLabel);
        }
      }
    });
  }, [htmlContent, setCode]);

  // 3. Render Mermaid diagrams with controls
  useEffect(() => {
    if (!containerRef.current) return;

    const mermaidElements =
      containerRef.current.querySelectorAll(".mermaid-diagram");

    mermaidElements.forEach(async (element) => {
      const code = decodeURIComponent(
        element.getAttribute("data-mermaid-code") || ""
      );
      const id = element.id;

      if (code && id) {
        try {
          const { svg } = await mermaid.render(`${id}-svg`, code);

          // Create wrapper with controls
          const wrapper = document.createElement("div");
          wrapper.className =
            "mermaid-diagram-wrapper my-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm";

          // Create control bar
          const controlBar = document.createElement("div");
          controlBar.className =
            "flex justify-end gap-2 p-2 bg-gray-50 border-b border-gray-200";

          // Copy to Editor button
          const copyButton = document.createElement("button");
          copyButton.innerText = "Copy to Canvas";
          copyButton.className =
            "px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-black transition-colors";
          copyButton.onclick = () => {
            setCode(code);
            localStorage.setItem("mermaid_code", code);
            copyButton.innerText = "Copied!";
            setTimeout(() => (copyButton.innerText = "Copy to Canvas"), 1500);
          };

          // Switch to Code button
          const codeToggleButton = document.createElement("button");
          codeToggleButton.innerText = "Show Code";
          codeToggleButton.className =
            "px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-black transition-colors";

          // Create content container for diagram
          const diagramContent = document.createElement("div");
          diagramContent.className = "flex justify-center p-4 bg-white";
          diagramContent.innerHTML = svg;

          // Create code container (initially hidden) with syntax highlighting
          const codeContent = document.createElement("div");
          codeContent.className = "hidden bg-gray-900 text-gray-100 p-4";
          const codeElement = document.createElement("pre");
          codeElement.className = "text-sm overflow-x-auto language-mermaid";
          const codeText = document.createElement("code");
          codeText.className = "language-mermaid";

          // Apply syntax highlighting to Mermaid code if available
          if (Prism.languages.mermaid) {
            try {
              codeText.innerHTML = Prism.highlight(
                code,
                Prism.languages.mermaid,
                "mermaid"
              );
            } catch (err) {
              codeText.textContent = code;
            }
          } else {
            codeText.textContent = code;
          }

          codeElement.appendChild(codeText);
          codeContent.appendChild(codeElement);

          // Toggle functionality
          let showingCode = false;
          codeToggleButton.onclick = () => {
            showingCode = !showingCode;
            if (showingCode) {
              diagramContent.classList.add("hidden");
              codeContent.classList.remove("hidden");
              codeToggleButton.innerText = "Show Diagram";
            } else {
              diagramContent.classList.remove("hidden");
              codeContent.classList.add("hidden");
              codeToggleButton.innerText = "Show Code";
            }
          };

          // Assemble the components
          controlBar.appendChild(copyButton);
          controlBar.appendChild(codeToggleButton);
          wrapper.appendChild(controlBar);
          wrapper.appendChild(diagramContent);
          wrapper.appendChild(codeContent);

          // Replace the original element
          element.parentNode?.replaceChild(wrapper, element);
        } catch (error) {
          console.error("Error rendering Mermaid diagram:", error);
          element.innerHTML = `
            <div class="text-red-500 p-4 border border-red-300 rounded bg-red-50">
              <strong>Error rendering diagram:</strong><br>
              <code class="text-sm">${error instanceof Error ? error.message : "Unknown error"}</code>
            </div>
          `;
        }
      }
    });
  }, [htmlContent, setCode]);

  // 4. Typing‐effect for all text nodes. After each .thinking block finishes, append "Thought for n seconds."
  useEffect(() => {
    if (!containerRef.current) return;

    // Wait a bit for Mermaid to render first
    setTimeout(() => {
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

      // Keep track of which .thinking elements we've already inserted a "Thought for…" note under
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

        // If this textNode is inside a .thinking container, schedule its "Thought for n seconds" note
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
    }, 100); // Small delay to let Mermaid render first
  }, [htmlContent]);

  return (
    <article
      className="
        prose lg:prose-xl prose-a:text-gray-600 max-w-full
        prose-code:text-red-600 prose-pre:text-white prose-pre:bg-gray-900
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
          [&_pre]:rounded-lg
          [&_pre]:shadow-sm
          [&_pre]:border
          [&_pre]:border-gray-200
          [&_pre]:overflow-hidden
          [&_pre_code]:text-sm
          [&_pre_code]:leading-relaxed
        "
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      ></div>
    </article>
  );
};

export default Markdown;