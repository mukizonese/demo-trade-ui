import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"

import Link from "next/link";

export default function Navigation() {
  return (
        <NavigationMenu>

          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink >
                    <Link href="/" target="_self" >HomePage
                    </Link>
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>

          <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Sample</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink>
                      <Link href="/sample" target="_self" >SamplePage
                      </Link>
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>

        </NavigationMenu>
  );
}

export {Navigation}