import { useEffect, useState } from "react";
import { BlogType } from "../types";
import { Bookmark, Copy, Download, MoveLeft, Share } from "lucide-react";
import Markdown from "./Markdown";
import { usePDF } from "react-to-pdf";

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

// function to generate hashtags from a space separated string
function getHashtags(hastags: string) {
  return hastags.split(" ");
}

export default function Blog({ blog }: { blog: BlogType }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [trendingHashTags] = useState<string[]>(["serverless", "aws"]);
  const [fileName, setFileName] = useState("content.pdf");
  const { toPDF, targetRef } = usePDF({ filename: fileName });

  useEffect(() => {
    setHeadings(extractHeadings(blog.body));
    setHashtags(getHashtags(blog.hashtags));
    setFileName(blog.title + ".pdf");
  }, [blog.body]);

  const getDateString = (date: string) => {
    return new Date(date).toDateString();
  };

  return (
    <div className="flex justify-evenly">
      {/* Table of Contents */}
      <div className="mt-10">
        <button className="bg-black text-white px-4 py-2 rounded font-extrabold text-sm m-1">
          <MoveLeft size={16} />
        </button>
        <div className="mt-5 text-gray-500 h-full p-1 rounded text-sm">
          <p className="font-bold">Contents</p>
          <HeadingTree headings={headings} />
        </div>
      </div>

      {/* Blog Content */}
      <div
        className="text-start p-2 overflow-y-auto hide-scroll m-2 flex justify-center w-3/4"
        ref={targetRef}
      >
        <div className="max-w-[900px]">
          <div className="py-5 text-5xl font-black text-black p-5">
            {blog.title}
          </div>

          <div className="flex flex-col items-start">
            <div className="flex justify-between space-x-4 m-5 w-full">
              <div>
                {blog.published ? (
                  <p className="text-gray-500">
                    Published,
                    {getDateString(blog.date)}
                  </p>
                ) : (
                  <p className="text-gray-500">Draft, Not Published yet</p>
                )}
              </div>
              <div>
                <button className="bg-black text-white px-4 py-2 rounded font-extrabold text-sm m-1">
                  <Bookmark size={16} />
                </button>

                <button
                  className="bg-black text-white px-4 py-2 rounded font-extrabold text-sm m-1"
                  onClick={() => toPDF()}
                >
                  <Download size={16} />
                </button>

                <button
                  className="bg-black text-white px-4 py-2 rounded font-extrabold text-sm m-1"
                  onClick={() => setShareOpen(!shareOpen)}
                >
                  <Share size={16} />
                </button>
                {shareOpen && (
                  <div className="relative">
                    <div
                      className="absolute end-0 z-10 mt-2 divide-y divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg"
                      role="menu"
                    >
                      <div className="p-2 flex justify-between items-start">
                        <strong className="block p-2 text-xs font-medium  text-gray-600">
                          {window.location.href.split("/").slice(0)[2] +
                            "/b/" +
                            blog.short_id}
                        </strong>

                        <button
                          className="bg-black text-white px-4 py-2 rounded font-extrabold text-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              window.location.href.split("/").slice(0)[2] +
                                "/b/" +
                                blog.short_id
                            );
                          }}
                        >
                          {/* icon only */}
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 m-5 flex-wrap">
              {hashtags.map((hastag) => (
                <p
                  key={hastag}
                  className={`px-2 py-1 rounded-full text-sm hover:underline  cursor-pointer ${
                    trendingHashTags.includes(hastag)
                      ? "font-bold text-red-600"
                      : ""
                  }`}
                >
                  # {hastag}
                </p>
              ))}
            </div>
          </div>

          {/* Render Markdown */}
          <div className="flex justify-center border-t-2 border-gray-100">
            <Markdown markdownString={blog.body} />
          </div>
        </div>
      </div>
    </div>
  );
}
