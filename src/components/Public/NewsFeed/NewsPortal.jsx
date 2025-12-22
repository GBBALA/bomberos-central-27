import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import Swal from 'sweetalert2';
import './NewsPortal.scss';

const NewsPortal = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [iframeWidth, setIframeWidth] = useState(500);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .order('fecha', { ascending: false })
          .limit(4);
          
        if (error) console.error("Error:", error);
        if (data) setNews(data);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth <= 480) {
        setIframeWidth(340);
      } else if (window.innerWidth <= 768) {
        setIframeWidth(450);
      } else {
        setIframeWidth(500);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const readMore = (n) => {
    Swal.fire({
      title: n.titulo,
      text: n.descripcion,
      imageUrl: n.imagen_url,
      imageWidth: 600,
      imageAlt: 'Noticia',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1A2B49',
      width: 700,
      padding: '2rem',
      backdrop: `rgba(0,0,0,0.8)`
    });
  };

  const fbPage = "https://www.facebook.com/profile.php?id=61552348490877";
  const encodedUrl = encodeURIComponent(fbPage);

  return (
    <div className="unified-news-section">
      <h2 className="section-title">Actualidad Institucional</h2>

      <div className="news-layout">
        
        {/* IZQUIERDA: NOTICIAS PROPIAS */}
        <div className="internal-news-column">
          <h3 className="column-title">Novedades del Cuartel</h3>
          
          {loading ? (
            <p style={{textAlign:'center', color:'#666'}}>Cargando...</p>
          ) : news.length === 0 ? (
            <div className="empty-message">
              <p>No hay novedades cargadas recientemente.</p>
            </div>
          ) : (
            <div className="news-grid">
              {news.map(n => (
                <article key={n.id} className="news-card" onClick={() => readMore(n)}>
                  <div className="news-img-wrapper">
                    <div 
                      className="news-img" 
                      style={{backgroundImage: `url(${n.imagen_url || 'https://via.placeholder.com/400x250?text=Bomberos+Central+27'})`}}
                    ></div>
                  </div>
                  <div className="news-content">
                    <span className="date">
                      {new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <h4>{n.titulo}</h4>
                    <p>{n.descripcion.substring(0, 90)}...</p>
                    <button className="read-more-btn">Leer nota completa</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* DERECHA: FACEBOOK */}
        <div className="facebook-column">
          <div className="fb-container">
            <h3>Síguenos en Facebook</h3>
            
            <iframe 
              src={`https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=${iframeWidth}&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
              width="100%"
              height="800"
              style={{ border: 'none', overflow: 'hidden', display: 'block' }} 
              scrolling="no" 
              frameBorder="0" 
              allowFullScreen={true} 
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Facebook Feed"
            ></iframe>
            
            <a href={fbPage} target="_blank" rel="noreferrer" className="fb-link">
              Ver página oficial
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsPortal;