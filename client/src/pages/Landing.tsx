import { useEffect } from "react";
import Markdown from "../components/EditorPage/Markdown";

const Landing = () => {

  // redirect to /diagram/create
  useEffect(() => {
    window.location.href = "/diagram/create";
  }, []);


  const content =
    "# Dmaid.Cloud";

  return (
    <div className="text-black font-normal">
      <div className="h-[600px] flex justify-center items-center">
        <div className="flex justify-center items-center flex-col">
          <div>
            <p className="text-center flex">
              <Markdown markdownString={content} />
            </p>
          </div>

          <div className="flex">
            <div className="relative border px-3 py-1 m-1">
              <label htmlFor="UserEmail" className="sr-only">
                {" "}
                Email{" "}
              </label>

              <input
                type="email"
                id="UserEmail"
                placeholder="flea@rhcp.com"
                className="w-full rounded-md border-gray-200 pe-10 shadow-xs sm:text-sm"
              />

              <span className="pointer-events-none absolute inset-y-0 end-0 grid w-10 place-content-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.404 14.596A6.5 6.5 0 1116.5 10a1.25 1.25 0 01-2.5 0 4 4 0 10-.571 2.06A2.75 2.75 0 0018 10a8 8 0 10-2.343 5.657.75.75 0 00-1.06-1.06 6.5 6.5 0 01-9.193 0zM10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <button className="bg-black text-white px-4 py-2 rounded font-extrabold text-sm m-1">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
