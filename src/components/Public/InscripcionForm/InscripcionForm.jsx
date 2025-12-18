import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import './InscripcionForm.scss';
import { FaUserPlus } from 'react-icons/fa';

const InscripcionForm = () => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  // Validación de Edad (+18 y > 1950)
  const validateAge = (value) => {
    if (!value) return "Ingresa una fecha";
    const today = new Date();
    const birthDate = new Date(value);
    const year = birthDate.getFullYear();

    if (year < 1950) {
      return "Por favor ingresa un año de nacimiento válido (posterior a 1950).";
    }

    let age = today.getFullYear() - year;
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 18 || "Debes ser mayor de 18 años para inscribirte.";
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!data.dni_frente[0] || !data.dni_dorso[0]) {
        throw new Error("Debes subir ambas fotos de tu DNI.");
      }

      const urlFrente = await uploadImageToCloudinary(data.dni_frente[0]);
      const urlDorso = await uploadImageToCloudinary(data.dni_dorso[0]);

      const { error } = await supabase.from('aspirantes').insert([{
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        fecha_nacimiento: data.fecha_nacimiento,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        foto_dni_frente: urlFrente,
        foto_dni_dorso: urlDorso,
        estado: 'Pendiente'
      }]);

      if (error) {
        if (error.code === '23505') throw new Error('Ya existe una solicitud con este DNI.');
        throw error;
      }

      Swal.fire('¡Enviado!', 'Tu solicitud y documentación han sido recibidas.', 'success');
      reset();

    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="inscripcion-section">
      <div className="form-card">
        {/* TÍTULO ÚNICO (El duplicado fue eliminado) */}
        <div className="form-card__header">
          <div style={{
            width: '60px', height: '60px', background: '#CE1126', borderRadius: '50%', 
            margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(206, 17, 38, 0.3)'
          }}>
            <FaUserPlus style={{color: 'white', fontSize: '1.5rem'}}/>
          </div>
          <h2>Postulación a Aspirante</h2>
          <p>Únete al cuerpo activo de la Central 27</p>
          REQUISITOS: SER MAYOR DE 18 AÑOS Y RESIDIR EN BUTA RANQUIL
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          
          <div className="input-group">
            <label>Nombre</label>
            <input {...register("nombre", { required: "Requerido" })} />
            {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
          </div>

          <div className="input-group">
            <label>Apellido</label>
            <input {...register("apellido", { required: "Requerido" })} />
          </div>

          <div className="input-group">
            <label>DNI</label>
            <input type="number" {...register("dni", { required: "Requerido", minLength: {value: 7, message: "DNI Inválido"} })} />
            {errors.dni && <span className="error-msg">{errors.dni.message}</span>}
          </div>

          <div className="input-group">
            <label>Fecha de Nacimiento</label>
            <input 
              type="date" 
              {...register("fecha_nacimiento", { 
                required: "Requerido", 
                validate: validateAge 
              })} 
            />
            {errors.fecha_nacimiento && <span className="error-msg">{errors.fecha_nacimiento.message}</span>}
          </div>

          <div className="input-group">
            <label>Teléfono</label>
            <input type="tel" {...register("telefono", { required: "Requerido" })} />
          </div>

          <div className="input-group full-width">
            <label>Email</label>
            <input type="email" {...register("email", { required: "Requerido" })} />
          </div>

          <div className="input-group full-width">
            <label>Dirección</label>
            <textarea {...register("direccion", { required: "Requerido" })}></textarea>
          </div>

          {/* DOCUMENTACIÓN (Corregido para que no se salga) */}
          <div className="full-width" style={{marginTop:'1rem', borderTop:'1px solid #eee', paddingTop:'1rem'}}>
            <h4 style={{marginBottom:'10px', color:'#1A2B49'}}>Documentación (Obligatorio)</h4>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem'}}>
              
              <div className="input-group">
                <label>Foto DNI (Frente)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  {...register("dni_frente", { required: "Sube el frente del DNI" })} 
                  style={{ width: '100%', overflow: 'hidden' }} // CORRECCIÓN CSS
                />
                {errors.dni_frente && <span className="error-msg">{errors.dni_frente.message}</span>}
              </div>

              <div className="input-group">
                <label>Foto DNI (Dorso)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  {...register("dni_dorso", { required: "Sube el dorso del DNI" })} 
                  style={{ width: '100%', overflow: 'hidden' }} // CORRECCIÓN CSS
                />
                {errors.dni_dorso && <span className="error-msg">{errors.dni_dorso.message}</span>}
              </div>

            </div>
          </div>

          <div className="full-width">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Subiendo Documentación...' : 'ENVIAR POSTULACIÓN'}
            </button>
          </div>

        </form>
      </div>
    </section>
  );
};

export default InscripcionForm;