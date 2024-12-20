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
    <div className="grid items-center justify-items-center font-[family-name:var(--font-geist-sans)]">


        <div className="flex justify-center flex-col m-auto">
            <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]" type="1">
                      <li> <b>Educational Purposes Only </b><br/>
                      The information and tools provided on this demo trading website are for educational and informational purposes only.
                      They are intended to simulate trading environments and do not involve real financial transactions or actual funds.</li>

                      <li> <b>No Investment Advice </b><br/>
                      This website does not offer financial, legal, or investment advice.</li>

                      <li> <b>Simulation and Accuracy </b><br/>
                      The data and market conditions simulated on this website are designed to approximate real-world trading but may not always reflect actual market conditions,
                       pricing, or liquidity.
                      </li>

                        <li> <b>Third-Party Data and Tools </b><br/>
                        The website may use third-party data feeds and tools. We do not guarantee the accuracy, completeness, or timeliness of this data.
                        </li>

                      <li>Click Trade Demo.</li>
                    </ol>
        </div>

    </div>
  );
}
