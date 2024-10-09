import Image from "next/image";

export default function Footer() {
  return (

      <footer className="row-start-3 flex gap-6 flex-wrap items-right justify-right">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_self"
          rel="noopener noreferrer"
        >
        Powered by →
          <Image
                className="dark:invert"
                src="https://nextjs.org/icons/next.svg"
                alt="Next.js logo"
                width={150}
                height={30}
                priority
              />

        </a>
      </footer>

  );
}

export { Footer }