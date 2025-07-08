import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import Dropdown from './Dropdown';
import { showToast } from './ToastManager';
import { IoAdd, IoTrash, IoInformationCircle } from 'react-icons/io5';
import './ComponentDemo.css';

const ComponentDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');

  const dropdownOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
  ];

  const handleDropdownChange = (option) => {
    setSelectedOption(option.value);
    showToast(`Selected: ${option.label}`, 'success');
  };

  const showSuccessToast = () => {
    showToast('This is a success message!', 'success');
  };

  const showErrorToast = () => {
    showToast('This is an error message!', 'error');
  };

  const showWarningToast = () => {
    showToast('This is a warning message!', 'warning');
  };

  const showInfoToast = () => {
    showToast('This is an info message!', 'info');
  };

  return (
    <div className="component-demo">
      <motion.div
        className="demo-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="demo-title">Component Showcase</h1>
        <p className="demo-subtitle">Beautiful, modern components with glassmorphism styling</p>

        <div className="demo-grid">
          {/* Modal Demo */}
          <motion.div
            className="demo-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3>Modal Component</h3>
            <p>Beautiful modal with glassmorphism and animations</p>
            <button 
              className="demo-button"
              onClick={() => setIsModalOpen(true)}
            >
              <IoAdd /> Open Modal
            </button>
          </motion.div>

          {/* Toast Demo */}
          <motion.div
            className="demo-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3>Toast Notifications</h3>
            <p>Show different types of toast messages</p>
            <div className="demo-button-group">
              <button className="demo-button success" onClick={showSuccessToast}>
                Success
              </button>
              <button className="demo-button error" onClick={showErrorToast}>
                Error
              </button>
              <button className="demo-button warning" onClick={showWarningToast}>
                Warning
              </button>
              <button className="demo-button info" onClick={showInfoToast}>
                Info
              </button>
            </div>
          </motion.div>

          {/* Dropdown Demo */}
          <motion.div
            className="demo-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3>Dropdown Component</h3>
            <p>Animated dropdown with glassmorphism styling</p>
            <Dropdown
              options={dropdownOptions}
              value={selectedOption}
              onChange={handleDropdownChange}
              placeholder="Select an option"
            />
            {selectedOption && (
              <p className="selected-value">Selected: {selectedOption}</p>
            )}
          </motion.div>

          {/* Theme Switcher Demo */}
          <motion.div
            className="demo-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3>Theme Switcher</h3>
            <p>Toggle between dark and light themes</p>
            <div className="theme-demo">
              <p>Click the theme switcher in the top-right corner to see it in action!</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Beautiful Modal"
        size="medium"
      >
        <div className="modal-content-demo">
          <p>This is a beautiful modal with glassmorphism styling!</p>
          <p>It features:</p>
          <ul>
            <li>✨ Smooth animations</li>
            <li>🎨 Glassmorphism design</li>
            <li>📱 Responsive layout</li>
            <li>🎯 Accessible focus states</li>
          </ul>
          <div className="modal-actions">
            <button 
              className="modal-button secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="modal-button"
              onClick={() => {
                setIsModalOpen(false);
                showToast('Modal action completed!', 'success');
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComponentDemo; 