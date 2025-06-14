const NotFound = () => {
  return (
    <div className='place-content-center flex flex-col items-center justify-center h-screen text-neutral-900'>
      <div className='p-1 transform-gpu'>
        <video
          className='size-75 md:size-100 object-cover rounded-lg'
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
      <button className='text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50 mt-6'>
        <a href='/' className='font-medium'>
          Go to Home
        </a>
      </button>
      <div className='text-center mt-4'>
        <p className='text-xs md:text-sm leading-5'>
          If you think this is an error, please contact support.
        </p>
        <p className='text-xs md:text-sm'>Thank you for your patience!</p>
      </div>
      <div className='relative flex justify-between'>
        <video
          className='size-20 md:size-50 fixed -rotate-10 md:-bottom-4 left-1'
          src='/Warehouse_Worker.mp4'
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <video
          className='size-20 md:size-50 fixed rotate-5 top-2 left-1'
          src='/Business Website.mp4'
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <video
          className='size-20 md:size-50 fixed -rotate-5 top-2 right-1'
          src='/main-worker.mp4'
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <video
          className='size-20 md:size-50 fixed rotate-10 md:-bottom-4 right-1'
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
