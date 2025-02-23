import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50">
      <div className="w-16 h-16 rounded-full border-[10px] border-black/[0.15] border-t-black/50 border-r-black/35 border-b-black/25 dark:border-white/15 dark:border-t-white/50 dark:border-r-white/35 dark:border-b-white/25 animate-spin"></div>
    </div>
  );
};

export default Loading;