import dompurify from "dompurify";
import { marked } from "marked";
import { useEffect, useState } from "react";

interface BlogProps {
  blog: {
    title: string;
    body: string;
    date: string;
    hastags: string[];
  };
}

export default function Blog(blog: BlogProps) {
  const [htmlContent, setHtmlContent] = useState("");

  const htmlContentHandeller = async () => {
    const m = await marked(blog.blog.body);

    setHtmlContent(dompurify.sanitize(m));
  };

  const getDateString = (date: string) => {
    const d = new Date(date);
    return d.toDateString();
  };

  useEffect(() => {
    htmlContentHandeller();
  });

  return (
    <div className="text-start p-2 overflow-y-auto hide-scroll m-2  flex  justify-center">
      <div className="max-w-[900px]">
        <div className=" py-5 text-5xl font-black text-black p-5">
          {blog.blog.title}
        </div>

        <div className="flex flex-col items-start">
          <div className="flex justify-center space-x-4 m-5">
            <p className="text-gray-500 text-center">
              {" "}
              {getDateString(blog.blog.date)}
            </p>
          </div>

          {/* every hastag shoub be in different color */}
          {
            <div className="flex  space-x-4 m-5 flex-wrap">
              {blog.blog.hastags.map((hastag) => (
                <p
                  key={hastag}
                  className="hover:underline px-2 py-1 rounded-full text-sm"
                >
                  # {hastag}
                </p>
              ))}
            </div>
          }
        </div>

        <article className="prose lg:prose-xl prose-a:text-gray-600  max-w-full  prose-code:text-red-600 prose-pre:text-white prose-pre:bg-gray-100 prose-p:text-md prose-code:text-md prose-ul:text-md porse-ol:text-md hover:prose-headings:underline cursor-default  prose-headings:text-gray-600">
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="text-sm  prose-p:text-gray-500 p-5"
          />
        </article>
      </div>
    </div>
  );
}
