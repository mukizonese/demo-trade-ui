import Image from "next/image";

export default function Footer() {
  return (

      <footer className="row-start-3 flex gap-6 flex-wrap items-right justify-right">

        <a>Powered by → </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_self"
          rel="noopener noreferrer"
        >

          <Image
                className="dark:invert"
                src="https://nextjs.org/icons/next.svg"
                alt="Next.js"
                width={50}
                height={20}
                priority
              />

        </a>

        <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://www.docker.com/"
              target="_self"
              rel="noopener noreferrer"
            >

              <Image
                    className="dark:invert"
                    src="https://www.svgrepo.com/download/376365/docker.svg"
                    alt="Docker"
                    width={60}
                    height={30}
                    priority
                  />

            </a>

            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://aws.amazon.com/"
              target="_self"
              rel="noopener noreferrer"
            >

              <Image
                    className="dark:invert"
                    src="https://www.svgrepo.com/download/329901/amazonaws.svg"
                    alt="AWS"
                    width={30}
                    height={20}
                    priority
                  />

            </a>

      </footer>

  );
}

export { Footer }