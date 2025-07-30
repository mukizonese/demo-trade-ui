import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Architecture } from "./architecture";

export default function Home() {
  return (
    <div className="flex min-h-4 w-full items-center justify-center p-4 sm:p-6 lg:p-10">
    {/**<div className="grid items-center justify-items-center font-[family-name:var(--font-geist-sans)]">  */}


        <div className="flex justify-center flex-col m-auto max-w-4xl">
            <ol className="list-inside list-decimal text-xs sm:text-sm lg:text-base text-center sm:text-left font-[family-name:var(--font-geist-mono)] space-y-4" type="1">
                      <li className="text-left"> 
                        <span className="font-bold">Educational Purposes Only</span><br/>
                        <span className="font-normal">
                          The information and tools provided on this demo trading website are for educational and informational purposes only.
                          They are intended to simulate trading environments and do not involve real financial transactions or actual funds.
                        </span>
                      </li>

                      <li className="text-left"> 
                        <span className="font-bold">No Investment Advice</span><br/>
                        <span className="font-normal">
                          This website does not offer financial, legal, or investment advice.
                        </span>
                      </li>

                      <li className="text-left"> 
                        <span className="font-bold">Simulation and Accuracy</span><br/>
                        <span className="font-normal">
                          The data and market conditions simulated on this website are designed to approximate real-world trading but may not always reflect actual market conditions,
                          pricing, or liquidity.
                        </span>
                      </li>

                      <li className="text-left"> 
                        <span className="font-bold">Third-Party Data and Tools</span><br/>
                        <span className="font-normal">
                          The website may use third-party data feeds and tools. We do not guarantee the accuracy, completeness, or timeliness of this data.
                        </span>
                      </li>

                      <li className="text-left font-bold">Click Trade Demo.</li>
                    </ol>
        </div>

    </div>
  );
}
