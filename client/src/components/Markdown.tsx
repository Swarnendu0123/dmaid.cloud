import { marked } from "marked";
import dompurify from "dompurify";
import { useEffect, useState } from "react";

const Markdown = ({ markdownString }: { markdownString: string }) => {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const htmlContentHandeller = async () => {
      const m = await marked(markdownString);
      setHtmlContent(dompurify.sanitize(m));
    };

    htmlContentHandeller();
  }, [markdownString]);

  return (
    <article className="prose lg:prose-xl prose-a:text-gray-600 max-w-full prose-code:text-red-600 prose-pre:text-white prose-pre:bg-gray-100 prose-p:text-md prose-code:text-md prose-ul:text-md prose-ol:text-md hover:prose-headings:underline cursor-default prose-headings:text-gray-600 prose-table:border-gray-200 prose-table:border prose-th:p-2 prose-td:p-2 prose-th:bg-gray-100 prose-td:border prose-h1:font-black">
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="text-sm prose-p:text-gray-500 p-5"
      />
    </article>
  );
};

export default Markdown;
