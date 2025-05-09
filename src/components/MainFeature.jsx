import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

function MainFeature({ onCalculate }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('0');
  const [inputMode, setInputMode] = useState('standard'); // standard, scientific, programmer
  const [lastOperation, setLastOperation] = useState('');
  const [memory, setMemory] = useState(null);
  const [showMemory, setShowMemory] = useState(false);
  const [naturalInput, setNaturalInput] = useState('');
  const [processing, setProcessing] = useState(false);

  // Declare icon components
  const CalculatorIcon = getIcon('Calculator');
  const FunctionSquareIcon = getIcon('FunctionSquare');
  const BinaryIcon = getIcon('Binary');
  const CheckIcon = getIcon('Check');
  const BrainIcon = getIcon('Brain');
  const RefreshCwIcon = getIcon('RefreshCw');
  const MemoryStickIcon = getIcon('MemoryStick');
  const DeleteIcon = getIcon('Delete');
  const PlusIcon = getIcon('Plus');
  const MinusIcon = getIcon('Minus');
  const XIcon = getIcon('X');
  const DivideIcon = getIcon('Divide');
  const PercentIcon = getIcon('Percent');
  const SquareIcon = getIcon('Square');
  const SquareRootIcon = getIcon('Pilcrow'); // Using as sqrt symbol
  const BackspaceIcon = getIcon('Backspace');
  const ReplyIcon = getIcon('Reply');

  // Add digit to input
  const addDigit = (digit) => {
    if (input === '0' || result !== '0' && lastOperation === '=') {
      setInput(digit);
      setResult('0');
      setLastOperation('');
    } else {
      setInput(prev => prev + digit);
    }
  };

  // Add decimal point
  const addDecimal = () => {
    if (lastOperation === '=') {
      setInput('0.');
      setResult('0');
      setLastOperation('');
      return;
    }

    // If input already has a decimal, don't add another
    if (input.includes('.')) return;

    // If input is empty, add '0.'
    if (input === '') {
      setInput('0.');
    } else {
      setInput(prev => prev + '.');
    }
  };

  // Handle operation
  const handleOperation = (operation) => {
    if (input === '' && result === '0') return;

    try {
      let currentResult;
      
      // If this is a continuation of operations
      if (lastOperation && lastOperation !== '=' && input) {
        // Calculate based on the last operation
        const value1 = parseFloat(result);
        const value2 = parseFloat(input);
        
        switch (lastOperation) {
          case '+': currentResult = value1 + value2; break;
          case '-': currentResult = value1 - value2; break;
          case '*': currentResult = value1 * value2; break;
          case '/': 
            if (value2 === 0) throw new Error("Division by zero");
            currentResult = value1 / value2; 
            break;
          case '%': currentResult = value1 % value2; break;
          default: currentResult = parseFloat(input);
        }
      } else {
        // Start of a new calculation
        currentResult = parseFloat(input || result);
      }

      // Format the result
      currentResult = formatResult(currentResult);
      
      // Update state
      setResult(currentResult);
      setLastOperation(operation);
      setInput('');
      
      // Add to calculation history if equals was pressed
      if (operation === '=') {
        let expressionText;
        if (lastOperation && input) {
          const value1 = parseFloat(result);
          const value2 = parseFloat(input);
          expressionText = `${value1} ${lastOperation} ${value2}`;
        } else {
          expressionText = input || result;
        }
        onCalculate(expressionText, currentResult);
      }
    } catch (error) {
      toast.error(error.message || "Calculation error");
      clearAll();
    }
  };

  // Format numbers to avoid floating point precision issues
  const formatResult = (num) => {
    if (isNaN(num)) return "Error";
    if (!isFinite(num)) return num > 0 ? "Infinity" : "-Infinity";
    
    // Convert to string and check if it's a whole number or has decimal points
    const numStr = num.toString();
    if (numStr.includes('e')) return numStr; // Scientific notation
    
    // If it has more than 10 digits after decimal, round it
    if (numStr.includes('.')) {
      const parts = numStr.split('.');
      if (parts[1].length > 10) {
        return num.toFixed(10).replace(/\.?0+$/, '');
      }
    }
    
    return numStr;
  };

  // Clear current input
  const clearInput = () => {
    setInput('');
  };

  // Clear all (AC)
  const clearAll = () => {
    setInput('');
    setResult('0');
    setLastOperation('');
  };

  // Backspace function
  const handleBackspace = () => {
    if (input.length > 0) {
      setInput(prev => prev.slice(0, -1));
    }
  };

  // Toggle sign (+/-)
  const toggleSign = () => {
    if (input) {
      setInput(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
    } else if (result !== '0') {
      setResult(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
    }
  };

  // Calculate square
  const calculateSquare = () => {
    try {
      const number = parseFloat(input || result);
      const squareResult = number * number;
      setResult(formatResult(squareResult));
      setInput('');
      setLastOperation('=');
      onCalculate(`${number}²`, formatResult(squareResult));
    } catch (error) {
      toast.error("Calculation error");
    }
  };

  // Calculate square root
  const calculateSquareRoot = () => {
    try {
      const number = parseFloat(input || result);
      if (number < 0) throw new Error("Cannot calculate square root of negative number");
      
      const sqrtResult = Math.sqrt(number);
      setResult(formatResult(sqrtResult));
      setInput('');
      setLastOperation('=');
      onCalculate(`√${number}`, formatResult(sqrtResult));
    } catch (error) {
      toast.error(error.message || "Calculation error");
    }
  };

  // Handle memory functions
  const handleMemory = (action) => {
    switch (action) {
      case 'save':
        const valueToStore = parseFloat(input || result);
        setMemory(valueToStore);
        setShowMemory(true);
        toast.info("Value saved to memory");
        break;
      case 'recall':
        if (memory !== null) {
          if (lastOperation === '=') {
            setInput(memory.toString());
            setResult('0');
            setLastOperation('');
          } else {
            setInput(memory.toString());
          }
        } else {
          toast.info("Memory is empty");
        }
        break;
      case 'clear':
        setMemory(null);
        setShowMemory(false);
        toast.info("Memory cleared");
        break;
    }
  };

  // Process natural language input
  const processNaturalInput = () => {
    if (!naturalInput.trim()) {
      toast.info("Please enter a calculation in natural language");
      return;
    }

    setProcessing(true);

    // Simulate processing delay (would be an actual API call in a real app)
    setTimeout(() => {
      try {
        // Simple natural language processing with regex patterns
        let processedInput = naturalInput.toLowerCase()
          .replace(/half of/g, '0.5 *')
          .replace(/double of/g, '2 *')
          .replace(/square of/g, 'Math.pow(')
          .replace(/squared/g, '^ 2')
          .replace(/cube of/g, 'Math.pow(')
          .replace(/cubed/g, '^ 3')
          .replace(/square root of/g, 'Math.sqrt(')
          .replace(/plus/g, '+')
          .replace(/minus/g, '-')
          .replace(/times/g, '*')
          .replace(/multiplied by/g, '*')
          .replace(/divided by/g, '/')
          .replace(/percent/g, '* 0.01')
          .replace(/percent of/g, '* 0.01 *');
        
        // Extract tax calculation
        const taxMatch = processedInput.match(/(.*)\s+plus\s+tax\s+at\s+(\d+(?:\.\d+)?)%/);
        if (taxMatch) {
          const baseAmount = taxMatch[1];
          const taxRate = parseFloat(taxMatch[2]) / 100;
          processedInput = `(${baseAmount}) * (1 + ${taxRate})`;
        }
        
        // Replace common words with operators
        processedInput = processedInput
          .replace(/\bof\b/g, '*')
          .replace(/\bto\b/g, '+');
        
        // Clean up the expression
        processedInput = processedInput
          .replace(/\s+/g, ' ')
          .replace(/(\d+)\s+(\d+)/g, '$1$2')  // Join adjacent numbers
          .replace(/([+\-*/^])\s+/g, '$1')  // Remove spaces after operators
          .replace(/\s+([+\-*/^])/g, '$1'); // Remove spaces before operators
        
        // Try to convert the natural language to a mathematical expression
        let calculatedResult;
        
        // Handle squared/cubed
        if (processedInput.includes('^ 2')) {
          const base = parseFloat(processedInput.split('^ 2')[0]);
          calculatedResult = base * base;
        } else if (processedInput.includes('^ 3')) {
          const base = parseFloat(processedInput.split('^ 3')[0]);
          calculatedResult = base * base * base;
        } else if (processedInput.includes('Math.sqrt(')) {
          const match = processedInput.match(/Math.sqrt\((.*?)\)/);
          if (match) {
            const value = parseFloat(match[1]);
            calculatedResult = Math.sqrt(value);
          }
        } else if (processedInput.includes('Math.pow(')) {
          const match = processedInput.match(/Math.pow\((.*?),\s*(.*?)\)/);
          if (match) {
            const base = parseFloat(match[1]);
            const exponent = parseFloat(match[2]);
            calculatedResult = Math.pow(base, exponent);
          }
        } else {
          // For simple arithmetic, use Function constructor (with safety checks)
          // Note: This is a simplified example - in production you'd want more robust parsing
          const safeExpr = processedInput.replace(/[^0-9+\-*/().\s]/g, '');
          calculatedResult = new Function(`return ${safeExpr}`)();
        }
        
        // Format and display the result
        const formattedResult = formatResult(calculatedResult);
        setResult(formattedResult);
        setInput('');
        setLastOperation('=');
        onCalculate(naturalInput, formattedResult);
        
        // Success message
        toast.success("Calculation processed successfully");
      } catch (error) {
        console.error("Natural language processing error:", error);
        toast.error("Could not process that calculation. Try a simpler expression.");
      } finally {
        setProcessing(false);
        setNaturalInput('');
      }
    }, 800);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        addDigit(e.key);
      } else if (e.key === '.') {
        addDecimal();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        handleOperation(e.key);
      } else if (e.key === '%') {
        handleOperation('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleOperation('=');
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, result, lastOperation]);

  // Calculator key component for consistent styling
  const CalculatorKey = ({ className, onClick, children, ...props }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`calculator-key h-14 md:h-16 text-lg ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="calculator-container">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <button 
            onClick={() => setInputMode('standard')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'standard' 
                ? 'bg-primary text-white' 
                : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
            }`}
          >
            <CalculatorIcon size={16} />
            <span>Standard</span>
          </button>
          
          <button 
            onClick={() => setInputMode('scientific')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'scientific' 
                ? 'bg-primary text-white' 
                : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
            }`}
          >
            <FunctionSquareIcon size={16} />
            <span>Scientific</span>
          </button>
          
          <button 
            onClick={() => setInputMode('programmer')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'programmer' 
                ? 'bg-primary text-white' 
                : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
            }`}
          >
            <BinaryIcon size={16} />
            <span>Programmer</span>
          </button>

          <button 
            onClick={() => setInputMode('natural')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'natural' 
                ? 'bg-primary text-white' 
                : 'bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600'
            }`}
          >
            <BrainIcon size={16} />
            <span>Natural Language</span>
          </button>
        </div>
        
        {inputMode === 'natural' ? (
          <div className="mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-surface-600 dark:text-surface-400">
                Enter your calculation in natural language
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={naturalInput}
                  onChange={(e) => setNaturalInput(e.target.value)}
                  placeholder="E.g., half of 24 plus tax at 8%"
                  className="calculator-display flex-grow text-base"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={processNaturalInput}
                  disabled={processing}
                  className={`px-4 rounded-xl ${
                    processing 
                      ? 'bg-surface-300 dark:bg-surface-600 cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {processing ? (
                    <RefreshCwIcon size={20} className="animate-spin" />
                  ) : (
                    <CheckIcon size={20} />
                  )}
                </motion.button>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                Try: "square root of 16", "half of 30 plus 5", "20 plus tax at 7.5%"
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="calculator-display h-16 text-2xl flex items-center justify-end mb-2 overflow-x-auto">
              {input || result}
            </div>
            
            {showMemory && (
              <div className="flex items-center gap-2 text-sm mb-2 bg-surface-50 dark:bg-surface-700 p-2 rounded-md">
                <MemoryStickIcon size={14} className="text-primary" />
                <span>Memory: {memory}</span>
              </div>
            )}
          </>
        )}
      </div>

      {inputMode !== 'natural' && (
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {inputMode === 'scientific' && (
            <>
              <CalculatorKey 
                className="calculator-key-function"
                onClick={() => handleMemory('save')}
              >
                M+
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-function"
                onClick={() => handleMemory('recall')}
              >
                MR
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-function"
                onClick={() => handleMemory('clear')}
              >
                MC
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-clear"
                onClick={clearAll}
              >
                AC
              </CalculatorKey>
            </>
          )}

          {(inputMode === 'standard' || inputMode === 'programmer') && (
            <>
              <CalculatorKey 
                className="calculator-key-clear"
                onClick={clearAll}
              >
                AC
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-function"
                onClick={toggleSign}
              >
                +/-
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-function"
                onClick={() => handleOperation('%')}
              >
                <PercentIcon size={18} />
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-operation"
                onClick={() => handleOperation('/')}
              >
                <DivideIcon size={18} />
              </CalculatorKey>
            </>
          )}

          {/* Number pad for all calculator modes */}
          <CalculatorKey 
            className="calculator-key-number"
            onClick={() => addDigit('7')}
          >
            7
          </CalculatorKey>
          <CalculatorKey 
            className="calculator-key-number"
            onClick={() => addDigit('8')}
          >
            8
          </CalculatorKey>
          <CalculatorKey 
            className="calculator-key-number"
            onClick={() => addDigit('9')}
          >
            9

          {/* Show different operation buttons based on calculator mode */}
          {inputMode === 'scientific' ? (
          {
            inputMode === 'scientific' ? (
              <CalculatorKey 
                className="calculator-key-operation"
                onClick={() => handleOperation('/')}
              >
                <DivideIcon size={18} />
              </CalculatorKey>
            ) : (
              /* Only show the multiply button here if not in scientific mode, 
                 as scientific mode has its own multiply button below */
            <CalculatorKey 
              className="calculator-key-operation"
              onClick={() => handleOperation('*')}
            >
              <XIcon size={18} />
            </CalculatorKey>
            <CalculatorKey 
          <CalculatorKey 
            className="calculator-key-number"
            onClick={() => addDigit('4')}
          >
            4
          </CalculatorKey>
          }
          
            className="calculator-key-number"
            onClick={() => addDigit('5')}
          >
            5
          </CalculatorKey>
          <CalculatorKey 
            className="calculator-key-number"
            onClick={() => addDigit('6')}
          >
            6
          </CalculatorKey>
          <CalculatorKey 
            className="calculator-key-operation"
            onClick={() => handleOperation('-')}
          >
            <MinusIcon size={18} />
          </CalculatorKey>

          <CalculatorKey 
            className="calculator-key-number"
            onClick={() => addDigit('1')}
          >
            1
          </CalculatorKey>
          <CalculatorKey 
            className="calculator-key-number"
            onClick={() => addDigit('2')}
          >
            2
          </CalculatorKey>
          <CalculatorKey 
            className="calculator-key-number"
            onClick={() => addDigit('3')}
          >
            3
          </CalculatorKey>
          <CalculatorKey 
            className="calculator-key-operation"
            onClick={() => handleOperation('+')}
          >
            <PlusIcon size={18} />
          </CalculatorKey>

          {inputMode === 'scientific' && (
            <>
              <CalculatorKey 
                className="calculator-key-function"
                onClick={calculateSquare}
              >
                <SquareIcon size={18} />
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-function"
                onClick={calculateSquareRoot}
              >
                <SquareRootIcon size={18} />√
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-number"
                onClick={() => addDigit('0')}
              >
                0
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-number"
                onClick={addDecimal}
              >
                .
              </CalculatorKey>
            </>
          )}

          {(inputMode === 'standard' || inputMode === 'programmer') && (
            <>
              <CalculatorKey 
                className="calculator-key-number"
                onClick={() => addDigit('0')}
              >
                0
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-number"
                onClick={addDecimal}
              >
                .
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-function"
                onClick={handleBackspace}
              >
                <BackspaceIcon size={18} />
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-operation"
                onClick={() => handleOperation('=')}
              >
                =
              </CalculatorKey>
            </>
          )}

          {inputMode === 'scientific' && (
            <>
              <CalculatorKey 
                className="calculator-key-function col-span-2"
                onClick={handleBackspace}
              >
                <BackspaceIcon size={18} />
              </CalculatorKey>
              <CalculatorKey 
                className="calculator-key-operation col-span-2"
                onClick={() => handleOperation('=')}
              >
                =
              </CalculatorKey>
            </>
          )}
        </div>
      )}

      {/* Helpful tips */}
      <div className="mt-6 text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-700 p-3 rounded-lg">
        <h3 className="font-medium mb-1">Keyboard Shortcuts:</h3>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
          <li className="flex items-center gap-1">
            <span className="text-surface-800 dark:text-surface-200 font-medium">Enter</span>
            <span>=</span>
          </li>
          <li>
            <span className="text-surface-800 dark:text-surface-200 font-medium">Esc</span>
            <span> Clear All</span>
          </li>
          <li>
            <span className="text-surface-800 dark:text-surface-200 font-medium">Backspace</span>
            <span> Delete</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MainFeature;