import React from 'react';

const GiphyEmbed = () => {
  return (
    
      <div style={{ width: '20%', height: 0, paddingBottom: '10%', position: 'relative' }}>
        <iframe
          src="https://giphy.com/embed/IwSG1QKOwDjQk"
          width="100%"
          height="100%"
          style={{ position: 'absolute' }}
         
          className="giphy-embed"
          allowFullScreen
        ></iframe>
      </div>
     
 
  );
};

export default GiphyEmbed;
