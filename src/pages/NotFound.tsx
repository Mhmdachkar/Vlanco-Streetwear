import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-6xl sm:text-8xl font-black mb-4 text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text">404</h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-6">Oops! Page not found</p>
        <p className="text-sm text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
