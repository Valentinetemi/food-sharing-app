"use client"

import { usePathname } from "next/navigation";
import { Navigation } from "../navigation";

export default function NavWrapper() {
    const pathname = usePathname();

    const noNavRoutes = ["/login", "/signup"];
    const hideNav = noNavRoutes.includes(pathname);
    
    return (
        <>
            {!hideNav && <Navigation />}
        </>
    )

}