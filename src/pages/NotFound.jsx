import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function NotFound() {
  // Declare icon components
  const AlertTriangleIcon = getIcon('AlertTriangle');
  const HomeIcon = getIcon('Home');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="inline-block p-5 rounded-full bg-surface-100 dark:bg-surface-800 mb-6"
        >
          <AlertTriangleIcon size={60} className="text-accent" />
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-3">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-surface-600 dark:text-surface-400 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back to calculating!
        </p>
        
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-primary text-white font-medium flex items-center gap-2 mx-auto hover:bg-primary-dark transition-colors"
          >
            <HomeIcon size={20} />
            Return to Calculator
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

export default NotFound;