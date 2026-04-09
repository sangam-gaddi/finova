// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Menu from "../components/Menu/Menu";
import { AnimatePresence, motion } from "framer-motion";
import PageLoader from "../components/PageLoader/PageLoader";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isOSRoute = pathname?.startsWith("/os");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const isDarkMenu = pathname === "/updates" || pathname === "/stories";

  useEffect(() => {
    if (isOSRoute) return;
    setIsBootLoading(true);
    const timer = setTimeout(() => {
      setIsBootLoading(false);
    }, 6200);

    return () => clearTimeout(timer);
  }, [isOSRoute]);

  useEffect(() => {
    if (isOSRoute || isAuthRoute) return;
    // FINOVA page titles
    const pageTitles: Record<string, string> = {
      "/": "FINOVA — Your Financial OS",
      "/about": "About | FINOVA",
      "/solutions": "Solutions | FINOVA",
      "/updates": "Updates | FINOVA",
      "/contact": "Contact | FINOVA",
      "/studio": "Studio | FINOVA",
      "/stories": "Stories | FINOVA",
    };
    const currentTitle = pageTitles[pathname] || "FINOVA";
    document.title = currentTitle;

    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 750);
    return () => clearTimeout(timeout);
  }, [pathname, isOSRoute]);

  if (isOSRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="app app-theme">
      <PageLoader active={isBootLoading} />
      <Menu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} isDark={isDarkMenu} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          style={{
            height: "100%",
            width: "100%",
            visibility: isBootLoading ? "hidden" : "visible",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

