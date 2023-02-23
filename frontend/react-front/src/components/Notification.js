import React from 'react';
import toast, { Toaster } from 'react-hot-toast';


const Notification = ({toastNotification: {displayFlag, msg}}) => {
  const notify = () => toast(msg.toUpperCase());
  return (
    <div>
      {displayFlag && notify()}
      <Toaster
      position="center-top"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        width: '100%',
        height: '70%',
        margin: 'auto',
      }}
      toastOptions={{
        // Define default options
        className: '',
        duration: 3000,
        style: {
          background: '#3f51b5',
          color: '#fff',
          lineHeight: 1.8,
        },
        // Default options for specific types
        success: {
          duration: 1000,
          theme: {
            primary: 'green',
            secondary: 'black',
          },
        },
      }}
       />
    </div>
  );
};

export default Notification
