import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { StarOutlined } from "@ant-design/icons";
import { GiGlobeRing } from "react-icons/gi";
import { SiAffinitydesigner } from "react-icons/si";
import { FaGifts } from "react-icons/fa6";
import { ImGift } from "react-icons/im";
import { BsBox2HeartFill } from "react-icons/bs";
import { IoHeartCircleSharp} from "react-icons/io5";
import Footer from "../components/Footer";

const Home = () => {
  const featuredCollections = [
    {
      title: "Elegant Rings",
      description: "Timeless designs that capture your unique style",
      icon: <GiGlobeRing className="text-6xl text-amber-500" />,
    },
    {
      title: "Love Collection",
      description: "Pieces that symbolize eternal love and connection",
      icon: <IoHeartCircleSharp size={70} className="text-6xl text-pink-500" />,
    },
    {
      title: "Gift Sets",
      description: "Perfect presents for your loved ones",
      icon: <FaGifts className="text-6xl text-emerald-500" />,
    },
  ];

  useEffect(() => {
    document.title = "Home - TJB Store"; // Set the document title
  }, []);

  return (
    <div className="min-h-screen font-host bg-cornsilk dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center text-center bg-cover bg-center bg-fixed h-screen"
        style={{
          backgroundImage: "url('/src/assets/hero.webp')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.25)",
        }}
      >
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 "></div>
        <div className="relative z-0 px-6 pt-5 pb-8 rounded-xl text-white bg-black/60">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            The Jeweller Bee
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Crafting Elegance, Celebrating Individuality
          </p>
          <div className="space-x-4">
            <Link
              to="/products"
              className="relative px-6 py-3 bg-cornsilk dark:bg-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 text-black dark:text-white rounded-xl transition duration-75 group"
            >
              <span className="relative">
                Shop Now
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-black dark:bg-white transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>

            <Link
              to="/admin"
              className="px-6 py-3 border-2 border-white hover:bg-white hover:text-black rounded-xl transition duration-75"
            >
              View Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">
          Our Featured Collections
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {featuredCollections.map((collection, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-lg transition duration-75"
            >
              <div className="mb-4 flex justify-center">{collection.icon}</div>
              <h3 className="text-2xl font-semibold mb-3 dark:text-white">
                {collection.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {collection.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 dark:bg-neutral-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">
            Why Choose
            <br /> The JewellerBee
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <StarOutlined className="text-4xl text-amber-500" />,
                title: "Premium Quality",
                description: "Handcrafted with the finest materials",
              },
              {
                icon: (
                  <SiAffinitydesigner className="text-4xl text-fuchsia-500" />
                ),
                title: "Unique Designs",
                description: "Exclusive collections you won't find elsewhere",
              },
              {
                icon: <ImGift className="text-4xl text-red-600" />,
                title: "Perfect Gifts",
                description: "Memorable pieces for special moments",
              },
              {
                icon: <BsBox2HeartFill className="text-4xl text-rose-400" />,
                title: "Custom Orders",
                description: "Personalize your jewelry experience",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white dark:bg-neutral-700 rounded-xl shadow hover:shadow-md"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-6 dark:text-white">
          Stay Connected
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Subscribe to our newsletter and be the first to know about our new
          collections, exclusive offers, and special events.
        </p>
        <div className="max-w-md mx-auto">
          <div className="flex rounded-full shadow">
            <input
              id="emailInput"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-l-full border dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
            <button
              onClick={() => {
                const emailInput = document.getElementById("emailInput").value;
                const recipient = "sal@outlook.com";
                const subject = "Subscribed!!!!!";
                const body = `Hi, I am interested in your products!!%0D%0A%0D%0AUser Email: ${emailInput}`;

                window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(
                  subject
                )}&body=${encodeURIComponent(body)}`;
              }}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-r-full transition duration-75"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
      <Footer />
      {/* <footer className="flex justify-between p-5 border-t mt-5">
        <div className="flex space-x-1 p-2 text-neutral-800 dark:text-neutral-300">
          <CopyrightCircleOutlined className="text-sm p-0.5" />
          <h2 className="text-md">
            2025<p className="inline-flex ml-2 text-md">The Jeweller Bee</p>
          </h2>
        </div>
        <div className="grid grid-cols-1">
          <a
            className="flex items-center gap-1 text-md hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4"
            href="https://www.instagram.com/_thejewelerbee_"
            target="_blank"
          >
            <IoLogoInstagram size={16} />
            Instagram
          </a>
        </div>
      </footer> */}
    </div>
  );
};

export default Home;
