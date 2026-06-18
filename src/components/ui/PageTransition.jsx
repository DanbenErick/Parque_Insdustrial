import React from 'react';

const PageTransition = ({ children }) => {
  return (
    <div
      className="h-full w-full flex flex-col"
    >
      {children}
    </div>
  );
};

export default PageTransition;
