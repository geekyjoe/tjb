import React from 'react';
import { Copyright } from 'lucide-react';
import { IoLogoInstagram } from 'react-icons/io5';
import { CopyrightCircleOutlined } from '@ant-design/icons';
import { ThemeToggle } from '../ThemeToggle';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='dark:bg-cornsilk-d1 dark:text-white py-12 px-4 border-t dark:border-neutral-600 mt-5'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid md:grid-cols-4 grid-flow-col grid-rows-4 md:grid-rows-1 gap-4 mb-8 items-start md:justify-items-center'>
          <div className='col-span-2 md:col-span-1'>
            <h3 className='text-2xl font-bold mb-4 text-amber-500'>
              The Jeweller Bee Store
            </h3>
            <p className='dark:text-gray-300 leading-relaxed'>
              Crafting memories, one piece at a time. Where every jewelry tells
              a story of love, commitment, and timeless elegance.
            </p>
          </div>
          <div className='row-span-3 md:row-span-1'>
            <h4 className='text-lg font-semibold mb-4'>Collections</h4>
            <ul className='space-y-2 dark:text-gray-300'>
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
                <a className='hover:text-amber-500 transition-colors'>
                  Earrings
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='text-lg font-semibold mb-4'>Connect</h4>
            <div className='space-y-3'>
              <a
                href='https://www.instagram.com/_thejewelerbee_'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3 dark:text-gray-300 hover:text-amber-500 transition-colors'
              >
                <IoLogoInstagram size={20} />
                Follow us on Instagram
              </a>
              <p className='dark:text-gray-300'>📧 sal@outlook.com</p>
            </div>
          </div>
          <div className='text-lg font-semibold rounded-full w-fit space-y-3'>
            <p>Appearance</p>
            <ThemeToggle />
          </div>
        </div>
        <div className='border-t border-gray-700 pt-8 flex flex-row justify-between items-center'>
          <div className='flex items-center space-x-1 p-2 text-neutral-800 dark:text-neutral-300'>
            <Copyright className='h-4 w-4' />
            <h2 className='text-sm'>
              {currentYear}
              <span className='inline-flex ml-1 text-base'>
                The Jeweller Bee | All rights reserved
              </span>
            </h2>
          </div>
          <div className='text-gray-400 text-sm'>
            Crafted with 💎 and passion
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
