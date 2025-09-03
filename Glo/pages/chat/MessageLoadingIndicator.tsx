import React from 'react';

const blink = `
  @keyframes blink {
    0% {
      opacity: 0.2;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
`;

const dotStyle = (delay: string) => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: '#000',
  animation: `blink 1.4s infinite both ${delay}`,
  margin: '0 5px',
});

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'start',
  justifyContent: 'start',
};

const MessageLoadingIndicator: React.FC = () => {
  return (
    <div style={containerStyle}>
      <style>{blink}</style>
      <div style={dotStyle('0s')}></div>
      <div style={dotStyle('0.2s')}></div>
      <div style={dotStyle('0.4s')}></div>
    </div>
  );
};

export default MessageLoadingIndicator;
