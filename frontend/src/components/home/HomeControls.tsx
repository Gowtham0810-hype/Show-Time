import React from 'react';

interface HomeControlsProps {
  activeView: 'overview' | 'index';
  onViewChange: (view: 'overview' | 'index') => void;
}

export const HomeControls: React.FC<HomeControlsProps> = ({
  activeView,
  onViewChange,
}) => {
  return (
    <>
      {/* Overview / Index Two-Option Switch (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-30 pointer-events-auto flex items-center bg-[#fafafa]/85 dark:bg-[#161619]/85 backdrop-blur-[14px] border border-black/[0.08] dark:border-white/10 p-1">
        <button
          onClick={() => onViewChange('overview')}
          className={`px-3.5 py-1.5 label-xs text-[10px] tracking-[0.1em] transition-all duration-200 ${
            activeView === 'overview'
              ? 'bg-[#141414] dark:bg-white text-white dark:text-black shadow-xs font-semibold'
              : 'text-[#141414]/70 dark:text-white/70 hover:text-[#141414] dark:hover:text-white'
          }`}
        >
          OVERVIEW
        </button>
        <button
          onClick={() => onViewChange('index')}
          className={`px-3.5 py-1.5 label-xs text-[10px] tracking-[0.1em] transition-all duration-200 ${
            activeView === 'index'
              ? 'bg-[#141414] dark:bg-white text-white dark:text-black shadow-xs font-semibold'
              : 'text-[#141414]/70 dark:text-white/70 hover:text-[#141414] dark:hover:text-white'
          }`}
        >
          INDEX
        </button>
      </div>
    </>
  );
};
