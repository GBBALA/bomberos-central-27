import { CLOUDINARY_CONFIG } from '../config/cloudinaryConfig';

/**
 * Sube una imagen a Cloudinary y retorna la URL segura.
 * @param {File} file - El objeto archivo del input file
 * @returns {Promise<string>} - La URL de la imagen (secure_url)
 */
export const uploadImageToCloudinary = async (file) => {
  if (!file) throw new Error("No se ha seleccionado ningún archivo");

  // Crear el formulario virtual para el envío
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

  try {
    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir la imagen a Cloudinary');
    }

    const data = await response.json();
    return data.secure_url; // Retornamos solo la URL HTTPS
  } catch (error) {
    console.error('Error en Cloudinary Service:', error);
    throw error;
  }
};