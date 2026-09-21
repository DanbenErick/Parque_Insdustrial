import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationFeedback } from '../../context/NavigationFeedbackContext';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const { completeNavigation } = useNavigationFeedback();

  useEffect(() => {
    completeNavigation(location.pathname);
  }, [completeNavigation, location.pathname, location.search]);

  return (
    <div
      className="page-transition relative min-h-full w-full flex flex-col"
    >
      <span className="page-transition-indicator" aria-hidden="true" />
      {children}
    </div>
  );
};

export default PageTransition;
