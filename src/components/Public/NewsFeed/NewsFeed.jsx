import React from 'react';

const NewsFeed = () => {
  // URL codificada de tu Facebook
  const fbPage = "https://www.facebook.com/profile.php?id=61552348490877";
  const encodedUrl = encodeURIComponent(fbPage);

  return (
    <div style={{ 
      background: 'white', 
      padding: '1.5rem', 
      borderRadius: '16px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      height: '100%',
      minHeight: '400px'
    }}>
      <h3 style={{ 
        marginBottom: '1.5rem', 
        color: '#1e293b', 
        fontWeight: '800', 
        fontSize: '1.2rem',
        textAlign: 'center',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>
        Novedades del Cuartel
      </h3>
      
      <div style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
        <iframe 
          src={`https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
          width="100%" 
          height="500" 
          style={{ border: 'none', overflow: 'hidden' }} 
          scrolling="no" 
          frameBorder="0" 
          allowFullScreen={true} 
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        ></iframe>
      </div>
      <div style={{textAlign: 'center', marginTop: '10px'}}>
        <a href={fbPage} target="_blank" style={{color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem'}}>Ver en Facebook &rarr;</a>
      </div>
    </div>
  );
};

export default NewsFeed;