import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import MainFeature from '../components/MainFeature';
import getIcon from '../utils/iconUtils';

function Home() {
  const [calculationHistory, setCalculationHistory] = useState([]);

  // Function to add a calculation to history
  const addToHistory = (input, result) => {
    setCalculationHistory(prev => [
      { input, result, timestamp: new Date().toISOString() },
      ...prev.slice(0, 9) // Keep last 10 calculations
    ]);
  };

  // Function to clear history
  const clearHistory = () => {
    setCalculationHistory([]);
    toast.success("History cleared successfully");
  };

  // Declare icon components
  const HistoryIcon = getIcon('History');
  const TrashIcon = getIcon('Trash2');
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-surface-800 p-4 md:p-6 rounded-2xl shadow-card"
        >
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">
            Smart Calculator
          </h2>
          <MainFeature onCalculate={addToHistory} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-1 flex flex-col h-full"
      >
        <div className="bg-white dark:bg-surface-800 p-4 rounded-2xl shadow-card flex-grow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <HistoryIcon size={18} className="text-primary" />
              History
            </h3>
            
            {calculationHistory.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-surface-600 hover:text-accent transition-colors p-1 rounded"
                aria-label="Clear history"
              >
                <TrashIcon size={16} />
              </button>
            )}
          </div>
          
          {calculationHistory.length === 0 ? (
            <div className="text-center py-6 text-surface-500">
              <p>No calculations yet</p>
              <p className="text-sm mt-1">Your calculation history will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {calculationHistory.map((calc, index) => (
                <motion.div
                  key={calc.timestamp}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-3 rounded-xl bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600"
                >
                  <div className="font-mono text-sm opacity-80">{calc.input}</div>
                  <div className="font-medium font-mono text-lg">{calc.result}</div>
                  <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                    {new Date(calc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Home;