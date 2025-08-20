"use client"

import { usePathname } from "next/navigation";
import { Navigation } from "@/components/navigation";

export default function NavWrapper() {
    const pathname = usePathname();

    const noNavRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
    const hideNav = noNavRoutes.includes(pathname);
    
    if (hideNav) return null;

    return <Navigation/>;
    

}