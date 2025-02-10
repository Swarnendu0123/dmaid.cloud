import dompurify from "dompurify";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { BlogType } from "../types";

interface Heading {
  title: string;
  level: number;
  children: Heading[];
}

// Recursive function to render the heading tree
const HeadingTree: React.FC<{ headings: Heading[] }> = ({ headings }) => {
  if (!headings.length) return null;

  return (
    <ul className="ml-4">
      {headings.map((heading, index) => (
        <li key={index} className="">
          <p className="hover:hover:underline cursor-pointer mt-1">
            {heading.title}
          </p>
          {heading.children.length > 0 && (
            <HeadingTree headings={heading.children} />
          )}
        </li>
      ))}
    </ul>
  );
};

// Extract headings and maintain their hierarchy
function extractHeadings(markdown: string): Heading[] {
  const lines = markdown
    .split("\n")
    .filter((line) => line.trim().startsWith("#"));
  const stack: Heading[] = [];
  let root: Heading[] = [];

  lines.forEach((line) => {
    const level = line.match(/^#+/)?.[0].length || 1; // Count `#`
    const title = line.replace(/^#+\s*/, "").trim();
    const newHeading: Heading = { title, level, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(newHeading);
    } else {
      stack[stack.length - 1].children.push(newHeading);
    }

    stack.push(newHeading);
  });

  return root;
}

export default function Blog({ blog }: { blog: BlogType }) {
  const [htmlContent, setHtmlContent] = useState("");
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    setHeadings(extractHeadings(blog.body));
  }, [blog.body]);

  useEffect(() => {
    const htmlContentHandeller = async () => {
      const m = await marked(blog.body);
      setHtmlContent(dompurify.sanitize(m));
    };

    htmlContentHandeller();
  }, [blog.body]);

  const getDateString = (date: string) => {
    return new Date(date).toDateString();
  };

  return (
    <div className="flex justify-evenly">
      {/* Table of Contents */}
      <div className="mt-20 text-gray-500 h-full p-1 rounded text-sm">
        <p className="font-bold">Contents</p>
        <HeadingTree headings={headings} />
      </div>

      {/* Blog Content */}
      <div className="text-start p-2 overflow-y-auto hide-scroll m-2 flex justify-center w-3/4">
        <div className="max-w-[900px]">
          <div className="py-5 text-5xl font-black text-black p-5">
            {blog.title}
          </div>

          <div className="flex flex-col items-start">
            <div className="flex justify-center space-x-4 m-5">
              <p className="text-gray-500 text-center">
                {getDateString(blog.date)}
              </p>
            </div>

            <div className="flex space-x-4 m-5 flex-wrap">
              {blog.hastags.map((hastag) => (
                <p
                  key={hastag}
                  className="px-2 py-1 rounded-full text-sm hover:underline  cursor-pointer"
                >
                  # {hastag}
                </p>
              ))}
            </div>
          </div>

          {/* Render Markdown */}
          <article className="prose lg:prose-xl prose-a:text-gray-600 max-w-full prose-code:text-red-600 prose-pre:text-white prose-pre:bg-gray-100 prose-p:text-md prose-code:text-md prose-ul:text-md prose-ol:text-md hover:prose-headings:underline cursor-default prose-headings:text-gray-600 prose-table:border-gray-200 prose-table:border prose-th:p-2 prose-td:p-2 prose-th:bg-gray-100 prose-td:border">
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              className="text-sm prose-p:text-gray-500 p-5"
            />
          </article>
        </div>
      </div>
    </div>
  );
}
