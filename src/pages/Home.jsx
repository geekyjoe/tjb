import React, { useEffect } from 'react';
import { StarOutlined } from '@ant-design/icons';
import { GiGlobeRing } from 'react-icons/gi';
import { SiAffinitydesigner } from 'react-icons/si';
import { FaGifts } from 'react-icons/fa6';
import { ImGift } from 'react-icons/im';
import { BsBox2HeartFill } from 'react-icons/bs';
import { IoHeartCircleSharp } from 'react-icons/io5';
import Footer from '../components/Footer';
import HeroCarousel from '../components/HC';
import * as Separator from '@radix-ui/react-separator';

const Home = () => {
  const featuredCollections = [
    {
      title: 'Elegant Rings',
      description: 'Timeless designs that capture your unique style',
      icon: <GiGlobeRing className='text-6xl text-amber-500' />,
    },
    {
      title: 'Love Collection',
      description: 'Pieces that symbolize eternal love and connection',
      icon: <IoHeartCircleSharp size={70} className='text-6xl text-pink-500' />,
    },
    {
      title: 'Gift Sets',
      description: 'Perfect presents for your loved ones',
      icon: <FaGifts className='text-6xl text-emerald-500' />,
    },
  ];

  useEffect(() => {
    document.title = 'Home - TJB Store'; // Set the document title
  }, []);

  return (
    <div className='min-h-screen font-host bg-cornsilk dark:bg-cornsilk-d3 text-gray-900 dark:text-gray-100'>
      <HeroCarousel />

      {/* Featured Collections */}
      <section className='container mx-auto px-4 py-16'>
        <h2 className='text-4xl font-bold text-center mb-12 dark:text-white'>
          Our Featured Collections
        </h2>
        <div className='grid md:grid-cols-3 gap-8'>
          {featuredCollections.map((collection, index) => (
            <div
              key={index}
              className='text-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition duration-75'
            >
              <div className='mb-4 flex justify-center'>{collection.icon}</div>
              <h3 className='text-2xl font-semibold mb-3 dark:text-white'>
                {collection.title}
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                {collection.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className='bg-cornsilk dark:bg-cornsilk-d1 py-16'>
        <div className='container mx-auto px-4'>
          <h2 className='text-4xl font-bold text-center mb-12 dark:text-white'>
            Why Choose
            <br /> The JewellerBee
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              {
                icon: <StarOutlined className='text-4xl text-amber-500' />,
                title: 'Premium Quality',
                description: 'Handcrafted with the finest materials',
              },
              {
                icon: (
                  <SiAffinitydesigner className='text-4xl text-fuchsia-500' />
                ),
                title: 'Unique Designs',
                description: "Exclusive collections you won't find elsewhere",
              },
              {
                icon: <ImGift className='text-4xl text-red-600' />,
                title: 'Perfect Gifts',
                description: 'Memorable pieces for special moments',
              },
              {
                icon: <BsBox2HeartFill className='text-4xl text-rose-400' />,
                title: 'Custom Orders',
                description: 'Personalize your jewelry experience',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className='text-center p-6 bg-white dark:bg-neutral-700 rounded-xl shadow-sm hover:shadow-md'
              >
                <div className='mb-4 flex justify-center'>{feature.icon}</div>
                <h3 className='text-xl font-semibold mb-3 dark:text-white'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Separator.Root
        className='h-px bg-black/50 dark:bg-white/50 my-8'
        orientation='horizontal'
      />
      {/* Newsletter Signup */}
      <section className='container mx-auto px-4 py-10 text-center'>
        <h2 className='text-4xl font-bold mb-6 dark:text-white'>
          Stay Connected
        </h2>
        <p className='mb-8 text-gray-600 dark:text-gray-300 max-w-xl mx-auto'>
          Subscribe to our newsletter and be the first to know about our new
          collections, exclusive offers, and special events.
        </p>
        <div className='max-w-md mx-auto'>
          <div className='flex rounded-full shadow-sm'>
            <input
              id='emailInput'
              type='email'
              placeholder='Enter your email'
              className='w-full px-4 py-3 rounded-l-full border dark:bg-neutral-700 dark:border-neutral-600 dark:text-white'
            />
            <button
              onClick={() => {
                const emailInput = document.getElementById('emailInput').value;
                const recipient = 'sal@outlook.com';
                const subject = 'Subscribed!!!!!';
                const body = `Hi, I am interested in your products!!%0D%0A%0D%0AUser Email: ${emailInput}`;

                window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(
                  subject
                )}&body=${encodeURIComponent(body)}`;
              }}
              className='px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-r-full transition duration-75'
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
      <Separator.Root
        className='h-px bg-black/25 dark:bg-white/50 mt-8'
        orientation='horizontal'
      />
      <Footer />
    </div>
  );
};

export default Home;
