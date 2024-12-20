import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-flow-row auto-rows-max items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="flex gap-10 items-center flex-col sm:flex-row">
            <span >
                <span className="text-lg font-bold">1. Overview</span>
                <br/>
            </span>
                  <span className="text-base font-medium">
                     <li> High Level Architecture Below...</li>
                      <li> AWS EC2 instance: Hosts the application.</li>
                      <li> Docker: Runs the website as a containerized service.</li>
                      <li> Nginx/Apache: Acts as the web server and reverse proxy.</li>
                      <li> MySql Database: Runs on a separate container on same instance.</li>
                      <li> Redis Cache : Runs on a separate container on same instance.</li>
                      <li> Elastic Load Balancer (optional): For future scalability.</li>
                      <li> Amazon S3 : For static daily feed storage.</li>
                  </span>
        </div>
        <div className="flex gap-10 items-center flex-col sm:flex-row">
            <span >
                <span className="text-lg font-bold">2. Architecture Diagram</span>
                <br/>
            </span>
                  <Image
                               className="dark:invert"
                               src="/icons/trade-demo.drawio.svg"
                               alt="MukiZone"
                               width={600}
                               height={350}
                               priority
                             />
        </div>

    <div className="flex gap-10 items-center flex-col sm:flex-row">
            <span >
                <span className="text-lg font-bold">3. Components</span>
                <br/>
            </span>
            <span >
                <span className="text-md font-bold">a. AWS EC2 Instance</span>
                   <ol>
                      <li>Launch a t3.medium or larger EC2 instance depending on the application&apos;s workload.</li>
                      <li>Use Amazon Linux 2 or Ubuntu as the operating system.</li>
                    </ol>
            </span>
            <span >
                <span className="text-md font-bold">b. Docker Setup</span>
                   <ol>
                      <li>Install Docker on the EC2 instance.</li>
                      <li>Use Docker Compose to define and manage multi-container applications.</li>
                    </ol>
            </span>
        </div>

        <div className="flex gap-10 items-center flex-col sm:flex-row">
            <span >
                <span className="text-lg font-bold">continued </span>
                <br/>
            </span>
            <span >
                <span className="text-md font-bold">c. Containers - 1.Web Server (Nginx/Apache)</span>
                   <ol>
                      <li>Acts as a reverse proxy, forwarding HTTP/HTTPS requests to the application server.</li>
                      <li>Can also handle static file serving if needed.</li>
                    </ol>
            </span>
            <span >
                <span className="text-md font-bold">c. Containers - 2.UI Logic</span>
                   <ol>
                      <li>Use a programming language/framework like Next.js.</li>
                      <li>Alternatively, use Node.js, Django, Flask, etc.</li>
                      <li>The application code and dependencies are packaged into a Docker image.</li>
                    </ol>
            </span>
            <span >
                <span className="text-md font-bold">c. Containers - 3.Application Server</span>
                   <ol>
                      <li>Use a programming language/framework like SprintBoot.</li>
                      <li>Alternatively, use Node.js, Tomcat, Weblogic etc.</li>
                      <li>The application code and dependencies are packaged into a Docker image.</li>
                    </ol>
            </span>
            <span >
                <span className="text-md font-bold">c. Containers - 4.Database</span>
                   <ol>
                      <li>Run a database like MySQL or PostgreSQL in a separate Docker container.</li>
                      <li>Alternatively, use Amazon RDS for a managed database solution.</li>
                    </ol>
            </span>
            <span >
                <span className="text-md font-bold">c. Containers - 5.Cache</span>
                   <ol>
                      <li>Run a cache like Redis in a separate Docker container.</li>
                      <li>Alternatively, use Amazon Elastic for a managed caching solution.</li>
                    </ol>
            </span>
        </div>
      </main>
    </div>
  );
}
