import React, { createContext, useContext, useState, useCallback } from 'react';
import { MdCheckCircleOutline, MdErrorOutline } from 'react-icons/md';
import GlassContainer from './GlassContainer';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, isSuccess = true) => {
    setNotification({ message, isSuccess });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 9999,
          padding: '0 20px'
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <GlassContainer padding="15px 20px">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {notification.isSuccess ? (
                  <MdCheckCircleOutline size={28} color="#69f0ae" />
                ) : (
                  <MdErrorOutline size={28} color="#ff5252" />
                )}
                <div style={{ marginLeft: '15px', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                  {notification.message}
                </div>
              </div>
            </GlassContainer>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
