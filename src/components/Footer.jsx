import React from 'react';
import { Copyright, Mail } from 'lucide-react';
import { IoLogoInstagram } from 'react-icons/io5';
import { ThemeToggle } from '../ThemeToggle';
import * as Separator from '@radix-ui/react-separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {' '}
      <Separator.Root
        className='h-px bg-black/25 dark:bg-white/25 mx-4'
        orientation='horizontal'
      />
      <footer className='dark:bg-cornsilk-d1 dark:text-white p-2 pb-6 sm:p-4'>
        <div className='grid md:grid-cols-4 grid-flow-row grid-cols-2 grid-rows-1 gap-2 md:gap-4 items-start md:justify-items-center p-0.5'>
          <div className='col-span-2 row-span-2 md:col-span-1'>
            <h3 className='md:text-xl font-medium md:font-bold leading-7'>The Jeweller Bee Store</h3>
            <p className='dark:text-gray-300 text-sm leading-6 break-all'>
              Crafting memories, one piece at a time. Where every jewelry tells
              a story of love, commitment, and timeless elegance.
            </p>
          </div>
          <div className='col-span-1 md:row-span-1'>
            <h4 className='text-lg font-semibold leading-10'>Collections</h4>
            <ul className='space-y-2 dark:text-gray-300 text-sm'>
              <li>
                <a href='#' className='hover:underline hover:underline-offset-4 focus:underline focus:underline-offset-4'>
                  Engagement Rings
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline hover:underline-offset-4 focus:underline focus:underline-offset-4'>
                  Wedding Bands
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline hover:underline-offset-4 focus:underline focus:underline-offset-4'>
                  Necklaces
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline hover:underline-offset-4 focus:underline focus:underline-offset-4'>
                  Bracelets
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline hover:underline-offset-4 focus:underline focus:underline-offset-4'>
                  Earrings
                </a>
              </li>
            </ul>
          </div>
          <div className='col-span-1'>
            <h4 className='text-lg font-semibold leading-10 '>Connect</h4>
            <div className='space-y-3 text-sm'>
              <a
                href='https://www.instagram.com/_thejewelerbee_'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3 dark:text-gray-300 hover:underline hover:underline-offset-4 focus:underline focus:underline-offset-4'
              >
                <IoLogoInstagram className='size-4' />
                Follow our Instagram
              </a>
              <p className='inline-flex items-center gap-3 dark:text-gray-300'>
                <Mail className='size-4' /> example@mail.com
              </p>
            </div>
          </div>
          <div className='space-y-1.5 col-span-1'>
            <h4 className='text-lg font-semibold leading-10'>Appearance</h4>
            <ThemeToggle />
          </div>
        </div>
        <Separator.Root
          className='h-px bg-black/25 dark:bg-white/25 my-4 md:my-8'
          orientation='horizontal'
        />
        <div className='flex flex-row justify-between gap-8 items-center text-black/75 dark:text-white/75 text-xs md:text-sm'>
          <div className='p-0.5 md:p-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-2'>
            <div className='flex items-center gap-1'>
              <Copyright className='size-3 md:size-4' />
              <span>{currentYear}</span>
            </div>
            <Separator.Root
              className='hidden md:block w-px h-3.5 bg-black/30 dark:bg-white/50'
              orientation='vertical'
            />
            <Separator.Root
              className='block md:hidden h-px bg-black/25 dark:bg-white/25'
              orientation='horizontal'
            />
            {/* <span className='hidden md:inline'>•</span> */}
            <span className='break-all'>The Jeweller Bee | All rights reserved</span>
          </div>
          <div className='p-0.5 md:p-1 break-all'>Crafted with 💎 and passion</div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
