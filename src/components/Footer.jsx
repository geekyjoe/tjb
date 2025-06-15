import React from 'react';
import { Copyright, Mail } from 'lucide-react';
import { IoLogoInstagram } from 'react-icons/io5';
import { ThemeToggle } from '../ThemeToggle';
import * as Separator from '@radix-ui/react-separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='dark:bg-cornsilk-d1 dark:text-white py-8 px-4'>
      <div className='grid md:grid-cols-4 grid-flow-col grid-rows-4 md:grid-rows-1 gap-4 items-start md:justify-items-center p-1'>
        <div className='col-span-2 md:col-span-1'>
          <h3 className='text-xl font-bold mb-4 '>
            The Jeweller Bee Store
          </h3>
          <p className='dark:text-gray-300 text-sm leading-relaxed'>
            Crafting memories, one piece at a time. Where every jewelry tells a
            story of love, commitment, and timeless elegance.
          </p>
        </div>
        <div className='row-span-3 md:row-span-1'>
          <h4 className='text-lg font-semibold mb-4'>Collections</h4>
          <ul className='space-y-2 dark:text-gray-300 text-sm'>
            <li>
              <a className='hover:text-amber-500 transition-colors'>
                Engagement Rings
              </a>
            </li>
            <li>
              <a className='hover:text-amber-500 transition-colors'>
                Wedding Bands
              </a>
            </li>
            <li>
              <a className='hover:text-amber-500 transition-colors'>
                Necklaces
              </a>
            </li>
            <li>
              <a className='hover:text-amber-500 transition-colors'>
                Bracelets
              </a>
            </li>
            <li>
              <a className='hover:text-amber-500 transition-colors'>Earrings</a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className='text-lg font-semibold mb-4'>Connect</h4>
          <div className='space-y-3 text-sm'>
            <a
              href='https://www.instagram.com/_thejewelerbee_'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 dark:text-gray-300 hover:text-amber-500 transition-colors'
            >
              <IoLogoInstagram size={20} />
              Follow us on Instagram
            </a>
            <p className='inline-flex items-center gap-3 dark:text-gray-300'>
              <Mail size={20} /> example@mail.com
            </p>
          </div>
        </div>
        <div className='text-lg font-semibold rounded-full w-fit space-y-3'>
          <p>Appearance</p>
          <ThemeToggle />
        </div>
      </div>
      <Separator.Root
        className='h-px bg-black/50 dark:bg-white/50 my-8'
        orientation='horizontal'
      />
      <div className='flex flex-row justify-between items-center text-black/75 dark:text-white/75 text-xs md:text-sm'>
        <div className='p-0.5 md:p-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-2'>
          <div className='flex items-center gap-1'>
            <Copyright className='size-3 md:size-4' />
            <span>{currentYear}</span>
          </div>
          <Separator.Root
            className='hidden md:block w-px h-4 bg-gray-400 dark:bg-white/50'
            orientation='vertical'
          />
          {/* <span className='hidden md:inline'>•</span> */}
          <span>The Jeweller Bee | All rights reserved</span>
        </div>
        <div className='p-0.5 md:p-1'>
          Crafted with 💎 and passion
        </div>
      </div>
    </footer>
  );
};

export default Footer;
