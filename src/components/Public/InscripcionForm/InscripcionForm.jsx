import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { supabase } from '../../../config/supabaseClient';
import { uploadImageToCloudinary } from '../../../services/cloudinaryService';
import './InscripcionForm.scss';

const InscripcionForm = () => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

 // Validación de Edad (+18 y > 1950)
  const validateAge = (value) => {
    if (!value) return "Ingresa una fecha";
    
    const today = new Date();
    const birthDate = new Date(value);
    const year = birthDate.getFullYear();

    // 1. Validar año mínimo (Anti-error/troll)
    if (year < 1950) {
      return "Por favor ingresa un año de nacimiento válido (posterior a 1950).";
    }

    // 2. Validar mayor de 18 años
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
      // 1. Validar que subió las fotos
      if (!data.dni_frente[0] || !data.dni_dorso[0]) {
        throw new Error("Debes subir ambas fotos de tu DNI.");
      }

      // 2. Subir imágenes a Cloudinary
      const urlFrente = await uploadImageToCloudinary(data.dni_frente[0]);
      const urlDorso = await uploadImageToCloudinary(data.dni_dorso[0]);

      // 3. Guardar en Supabase
      const { error } = await supabase.from('aspirantes').insert([{
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        fecha_nacimiento: data.fecha_nacimiento, // Asegurate que esta columna exista en DB o agregala
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
        <div className="form-card__header">
          <h2>Postulación a Aspirante</h2>
          <p>Requisitos: Ser mayor de 18 años y residir en la localidad.</p>
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
                validate: validateAge // Validación personalizada
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

          {/* DOCUMENTACIÓN */}
          <div className="full-width" style={{marginTop:'1rem', borderTop:'1px solid #eee', paddingTop:'1rem'}}>
            <h4 style={{marginBottom:'10px', color:'#1A2B49'}}>Documentación (Obligatorio)</h4>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              <div className="input-group">
                <label>Foto DNI (Frente)</label>
                <input type="file" accept="image/*" {...register("dni_frente", { required: "Sube el frente del DNI" })} />
                {errors.dni_frente && <span className="error-msg">{errors.dni_frente.message}</span>}
              </div>
              <div className="input-group">
                <label>Foto DNI (Dorso)</label>
                <input type="file" accept="image/*" {...register("dni_dorso", { required: "Sube el dorso del DNI" })} />
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