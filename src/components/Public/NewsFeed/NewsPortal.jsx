import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import Swal from 'sweetalert2';
import './NewsPortal.scss'; // Asegúrate de actualizar este archivo en el Paso 2

const NewsPortal = () => {
  // --- LÓGICA DE NOTICIAS INTERNAS (Supabase) ---
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .order('fecha', { ascending: false })
          .limit(4); // Limitamos a 4 para que cuadre bien con el Facebook al lado
          
        if (error) console.error("Error cargando noticias:", error);
        if (data) setNews(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const readMore = (n) => {
    Swal.fire({
      title: n.titulo,
      text: n.descripcion,
      imageUrl: n.imagen_url,
      imageWidth: 500,
      imageAlt: 'Imagen noticia',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1A2B49',
      width: 600,
      backdrop: `rgba(0,0,0,0.8)`
    });
  };

  // --- LÓGICA DE FACEBOOK ---
  const fbPage = "https://www.facebook.com/profile.php?id=61552348490877";
  const encodedUrl = encodeURIComponent(fbPage);

  return (
    <div className="unified-news-section">
      <h2 className="section-title">Actualidad Institucional</h2>

      <div className="news-layout">
        
        {/* COLUMNA IZQUIERDA: NOTICIAS SUPABASE */}
        <div className="internal-news-column">
          <h3 className="column-title">Novedades del Cuartel</h3>
          
          {loading ? (
            <p style={{textAlign:'center'}}>Cargando novedades...</p>
          ) : news.length === 0 ? (
            <div className="empty-message">No hay novedades recientes para mostrar.</div>
          ) : (
            <div className="news-grid">
              {news.map(n => (
                <div key={n.id} className="news-card" onClick={() => readMore(n)}>
                  <div className="news-img-wrapper">
                    <div 
                      className="news-img" 
                      style={{backgroundImage: `url(${n.imagen_url || 'https://via.placeholder.com/400x200?text=Bomberos'})`}}
                    ></div>
                  </div>
                  <div className="news-content">
                    <span className="date">
                      {new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <h4>{n.titulo}</h4>
                    <p>{n.descripcion.substring(0, 80)}...</p>
                    <button className="read-more-btn">Leer más</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: FACEBOOK */}
        <div className="facebook-column">
          <div className="fb-container">
            {/* Título opcional dentro del container si quieres */}
            {/* <h3 style={{textAlign: 'center', marginBottom: '1rem', color: '#1877F2'}}>Facebook Oficial</h3> */}
            
            <iframe 
              src={`https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=340&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
              width="100%"
              height="600"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Facebook Feed"
            ></iframe>
            
            <div style={{textAlign: 'center', marginTop: '15px'}}>
              <a href={fbPage} target="_blank" rel="noreferrer" className="fb-link">
                Ver en Facebook &rarr;
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsPortal;