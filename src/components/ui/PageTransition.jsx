import 'react';

const PageTransition = ({ children }) => {
  return (
    <div
      className="page-transition relative h-full w-full flex flex-col"
    >
      <span className="page-transition-indicator" aria-hidden="true" />
      {children}
    </div>
  );
};

export default PageTransition;
