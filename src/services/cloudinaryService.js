import { CLOUDINARY_CONFIG } from '../config/cloudinaryConfig';
import imageCompression from 'browser-image-compression';

/**
 * Servicio unificado de subida de imágenes.
 * 1. Recibe un File o Blob.
 * 2. Lo comprime en el navegador (Cliente).
 * 3. Lo sube a Cloudinary.
 * 4. Retorna la URL.
 */
export const uploadImageToCloudinary = async (file) => {
  if (!file) return null;

  // Mostramos cuánto pesaba antes
  const originalSize = (file.size / 1024 / 1024).toFixed(2);
  console.log(`📸 Imagen Original: ${originalSize} MB`);

  try {
    // --- PASO 1: CONFIGURACIÓN DE COMPRESIÓN ---
    const options = {
      maxSizeMB: 0.8,          // Máximo 800KB (Ideal para web, ahorra mucho espacio)
      maxWidthOrHeight: 1920,   // Full HD es suficiente para ver detalles de herramientas
      useWebWorker: true,       // Usa hilos secundarios para no congelar la pantalla
      fileType: 'image/jpeg',   // Convertir todo a JPG (más ligero que PNG)
      initialQuality: 0.8       // 80% de calidad (imperceptible al ojo humano)
    };

    // --- PASO 2: COMPRIMIR ---
    console.log("⏳ Comprimiendo...");
    let compressedFile = file;
    
    // Solo comprimimos si es un archivo de imagen estándar (evita errores con formatos raros)
    if (file.type.startsWith('image/')) {
      try {
        compressedFile = await imageCompression(file, options);
      } catch (compressionError) {
        console.warn("⚠️ No se pudo comprimir (quizás ya es muy pequeña o formato no soportado). Subiendo original.");
      }
    }

    const newSize = (compressedFile.size / 1024 / 1024).toFixed(2);
    console.log(`✅ Imagen Comprimida: ${newSize} MB (Ahorro: ${Math.round((1 - compressedFile.size / file.size) * 100)}%)`);

    // --- PASO 3: SUBIR A CLOUDINARY ---
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error Cloudinary: ${errorData.error?.message}`);
    }

    const data = await response.json();
    console.log("☁️ URL Generada:", data.secure_url);
    
    return data.secure_url;

  } catch (error) {
    console.error('❌ Error en Cloudinary Service:', error);
    throw error;
  }
};