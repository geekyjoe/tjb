import React from "react";
import { Copyright } from "lucide-react";
import { IoLogoInstagram } from "react-icons/io5";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex select-none font-karla sm:flex-row justify-between items-center p-5 border-t dark:border-neutral-600 mt-5">
      <div className="flex items-center space-x-1 p-2 text-neutral-800 dark:text-neutral-300">
        <Copyright className="h-4 w-4" />
        <h2 className="text-sm">
          {currentYear}
          <span className="inline-flex ml-2 text-base">The Jeweller Bee</span>
        </h2>
      </div>

      <div className="p-1">
        <a
          className="flex items-center gap-1 text-md text-neutral-800 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:underline hover:decoration-solid hover:underline-offset-4 transition-colors duration-200"
          href="https://www.instagram.com/_thejewelerbee_"
          target="_blank"
        //   rel="noopener noreferrer"
        >
          <IoLogoInstagram />
          Instagram
        </a>
      </div>
    </footer>
  );
};

export default Footer;
