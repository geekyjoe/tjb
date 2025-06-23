import { useEffect } from 'react';

const NotFound = () => {
  useEffect(() => {
    document.title = 'Something Went Wrong - TJB Store'; // Set the document title
  }, []);

  return (
    <div className='place-content-center bg-white dark:bg-cornsilk-d1 dark:text-white flex flex-col items-center justify-center h-screen text-neutral-900'>
      <div className='p-1 transform-gpu'>
        <video
          className='transition-all duration-500 size-75 md:size-100 object-cover rounded-lg'
          src='/4041.mp4'
          autoPlay
          loop
          muted
          playsInline
        ></video>
      </div>
      {/* <h1 className="leading-10 font-semibold">404 - Page Not Found</h1> */}
      <p className='text-sm md:text-base font-semibold'>
        Sorry, the page you are looking for does not exist.
      </p>
      <a href='/' className='font-medium rounded-full'>
        <button className='text-white bg-indigo-600 py-2 px-4 hover:bg-indigo-700 rounded-full duration-800 transition-all underline-offset-4 focus:underline-none hover:underline dark:text-neutral-50 mt-6'>
          Go to Home
        </button>
      </a>
      <div className='text-center mt-4'>
        <p className='text-xs md:text-sm leading-5'>
          If you think this is an error, please contact support.
        </p>
        <p className='text-xs md:text-sm'>Thank you for your patience!</p>
      </div>
      <div className='relative flex justify-between'>
        <video
          className='transition-all duration-500 size-15 md:size-30 lg:size-50 rounded-md fixed -rotate-10 bottom-2 left-1'
          src='/Warehouse_Worker.mp4'
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <video
          className='transition-all duration-500 size-15 md:size-30 lg:size-50 rounded-md fixed rotate-5 top-2 left-1'
          src='/Business Website.mp4'
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <video
          className='transition-all duration-500 size-15 md:size-30 lg:size-50 rounded-md fixed -rotate-5 top-2 right-1'
          src='/main-worker.mp4'
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <video
          className='transition-all duration-500 size-15 md:size-30 lg:size-50 rounded-md fixed rotate-10 bottom-2 right-1'
          src='/Warehouse_Worker1.mp4'
          autoPlay
          loop
          muted
          playsInline
        ></video>
      </div>
    </div>
  );
};
export default NotFound;
