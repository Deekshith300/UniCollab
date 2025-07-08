import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle, IoWarning } from 'react-icons/io5';
import './Toast.css';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <IoCheckmarkCircle />;
      case 'error':
        return <IoCloseCircle />;
      case 'warning':
        return <IoWarning />;
      default:
        return <IoInformationCircle />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      default:
        return 'toast-info';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`toast ${getTypeStyles()}`}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="toast-icon">
            {getIcon()}
          </div>
          <div className="toast-content">
            <p className="toast-message">{message}</p>
          </div>
          <button className="toast-close" onClick={() => setIsVisible(false)}>
            <IoCloseCircle />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 