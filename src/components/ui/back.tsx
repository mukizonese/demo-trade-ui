import Image from "next/image";

export default function Back() {
  return (

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/"
            target="_self"
            rel="noopener noreferrer"
          >
            Back
          </a>
        </div>
  );
}

export { Back }