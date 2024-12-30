import React, { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Default styles
import 'tippy.js/animations/shift-away-subtle.css'; // Optional animations
import 'tippy.js/themes/light-border.css';
import 'tippy.js/themes/translucent.css'; // Add dark mode theme

const Tooltip = ({
  content,
  children,
  placement = 'top',
  animation = 'shift-away-subtle',
  delay = [100, 50],
  interactive = false,
  arrow = true,
  className = '',
  contentClassName = 'p-0.5 font-jost text-neutral-500 dark:text-neutral-200',
  maxWidth = '250px',
  offset = [0, 10],
  theme = '', // Added theme prop to handle Tailwind themes
  ...props
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const root = document.documentElement;

    // Update dark mode state
    const updateDarkMode = () => {
      setIsDarkMode(root.classList.contains('dark'));
    };

    updateDarkMode();

    const darkModeObserver = new MutationObserver(updateDarkMode);
    darkModeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });

    // Handle screen width updates
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      darkModeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Only render the tooltip if the screen width is 768px or larger
  if (screenWidth < 768) {
    return children;
  }

  const tooltipTheme = theme || (isDarkMode ? 'translucent' : 'light-border');

  return (
    <Tippy
      content={<span className={`text-sm ${contentClassName}`}>{content}</span>}
      placement={placement}
      animation={animation}
      delay={delay}
      interactive={interactive}
      arrow={arrow}
      maxWidth={maxWidth}
      offset={offset}
      theme={tooltipTheme}
      className={className}
      {...props}
    >
      <div className="tooltip-wrapper">{children}</div>
    </Tippy>
  );
};

export default Tooltip;