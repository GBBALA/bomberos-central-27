import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';
import './Login.scss';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      
      // Alerta de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Acceso autorizado al sistema.',
        timer: 1500,
        showConfirmButton: false
      });

      // Redirigir al Dashboard
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Acceso',
        text: 'Credenciales incorrectas o usuario no registrado.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Jefatura Central 27</h2>
        <p>Acceso exclusivo para personal autorizado</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          
          <div className="form-group">
            <label>Email Institucional</label>
            <input 
              type="email" 
              placeholder="admin@bomberos.com"
              {...register("email", { required: "El email es obligatorio" })} 
            />
            {errors.email && <span className="error-msg">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              {...register("password", { required: "La contraseña es obligatoria" })} 
            />
            {errors.password && <span className="error-msg">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;