import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { supabase } from '../../../config/supabaseClient';
import './InscripcionForm.scss';

const InscripcionForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // 1. Insertar en Supabase
      const { error } = await supabase
        .from('aspirantes')
        .insert([
          {
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            email: data.email,
            telefono: data.telefono,
            direccion: data.direccion,
            estado: 'Pendiente' // Default
          }
        ]);

      if (error) {
        // Manejar error de DNI duplicado (código 23505 en Postgres)
        if (error.code === '23505') {
          throw new Error('Ya existe una solicitud registrada con ese DNI.');
        }
        throw error;
      }

      // 2. Éxito
      Swal.fire({
        icon: 'success',
        title: '¡Solicitud Enviada!',
        text: 'Tus datos han sido recibidos. Nos contactaremos pronto.',
        confirmButtonColor: '#CE1126'
      });
      
      reset(); // Limpiar formulario

    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        text: error.message || 'Hubo un problema de conexión. Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="inscripcion-section">
      <div className="form-card">
        <div className="form-card__header">
          <h2>Quiero ser Bombero</h2>
          <p>Completá tus datos para iniciar el proceso de admisión.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          
          {/* Nombre */}
          <div className="input-group">
            <label>Nombre</label>
            <input 
              {...register("nombre", { required: "Este campo es obligatorio" })} 
              placeholder="Ej: Juan"
            />
            {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
          </div>

          {/* Apellido */}
          <div className="input-group">
            <label>Apellido</label>
            <input 
              {...register("apellido", { required: "Este campo es obligatorio" })} 
              placeholder="Ej: Pérez"
            />
            {errors.apellido && <span className="error-msg">{errors.apellido.message}</span>}
          </div>

          {/* DNI */}
          <div className="input-group">
            <label>DNI</label>
            <input 
              type="number"
              {...register("dni", { 
                required: "El DNI es obligatorio",
                minLength: { value: 7, message: "Mínimo 7 números" }
              })} 
              placeholder="Sin puntos"
            />
            {errors.dni && <span className="error-msg">{errors.dni.message}</span>}
          </div>

          {/* Teléfono */}
          <div className="input-group">
            <label>Teléfono / Celular</label>
            <input 
              type="tel"
              {...register("telefono", { required: "Necesitamos un número para contactarte" })} 
              placeholder="Cod. Área + Número"
            />
            {errors.telefono && <span className="error-msg">{errors.telefono.message}</span>}
          </div>

          {/* Email */}
          <div className="input-group full-width">
            <label>Correo Electrónico</label>
            <input 
              type="email"
              {...register("email", { required: "El email es obligatorio" })} 
              placeholder="ejemplo@gmail.com"
            />
            {errors.email && <span className="error-msg">{errors.email.message}</span>}
          </div>

          {/* Dirección */}
          <div className="input-group full-width">
            <label>Dirección</label>
            <textarea 
              {...register("direccion", { required: "Indica tu domicilio actual" })} 
              placeholder="Calle, Altura, Barrio..."
            ></textarea>
            {errors.direccion && <span className="error-msg">{errors.direccion.message}</span>}
          </div>

          {/* Botón Submit */}
          <div className="full-width">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enviando Datos...' : 'ENVIAR SOLICITUD'}
            </button>
          </div>

        </form>
      </div>
    </section>
  );
};

export default InscripcionForm;