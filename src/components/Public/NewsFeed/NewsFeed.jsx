import React from 'react';

const NewsFeed = () => {
  // URL codificada de tu Facebook
  const fbPage = "https://www.facebook.com/profile.php?id=61552348490877";
  const encodedUrl = encodeURIComponent(fbPage);

  return (
    // ... dentro del return ...
<div style={{ 
  background: 'white', 
  padding: '2rem',         // Más padding
  borderRadius: '16px', 
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: '1px solid #e2e8f0'
}}>
  {/* Quitamos el título de aquí porque ya lo pusimos en el App.jsx */}
  
  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
    <iframe 
      src={`https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
      width="500"  // Más ancho (antes 340)
      height="600" // Más alto (antes 500)
      // ... resto de propiedades ...
    ></iframe>
  </div>
  
  {/* ... botón ver en facebook ... */}
</div>
  );
};

export default NewsFeed;