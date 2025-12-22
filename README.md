# Sistema de Gestión - Bomberos Voluntarios Central 27 (Buta Ranquil)

Plataforma web integral desarrollada para la Asociación de Bomberos Voluntarios de Buta Ranquil. Este sistema combina un portal público de información a la comunidad con un potente panel de administración para la gestión operativa del cuartel.

🔗 **Demo / Producción:** [https://www.bomberosbuta.com](https://www.bomberosbuta.com)

---

## 🚀 Tecnologías Utilizadas

El proyecto fue construido utilizando un stack moderno, escalable y de alto rendimiento:

### Frontend
*   **React 18**: Librería principal de UI.
*   **Vite**: Empaquetador y entorno de desarrollo ultrarrápido.
*   **SCSS (Sass)**: Estilos modulares y variables globales para un diseño consistente.
*   **React Router DOM**: Navegación SPA (Single Page Application).

### Backend & Servicios (Serverless)
*   **Supabase**: Base de datos PostgreSQL en tiempo real y Autenticación.
*   **Cloudinary**: Almacenamiento y optimización automática de imágenes.
*   **Vercel**: Despliegue continuo (CI/CD) y hosting global.

### Librerías Clave
*   **SweetAlert2**: Alertas y modales interactivos.
*   **React Hook Form**: Gestión eficiente de formularios.
*   **jsPDF & AutoTable**: Generación de reportes PDF (Inventarios, Nómimas).
*   **React Easy Crop**: Recorte de imágenes de perfil en el cliente.
*   **Browser Image Compression**: Compresión automática de fotos antes de subir.

---

## ✨ Funcionalidades Principales

### 🌍 Portal Público
*   **Hero con Video**: Portada de alto impacto visual.
*   **Estado de Alerta**: Widget visual (tipo tacómetro) del riesgo de incendio, gestionable en tiempo real.
*   **Novedades**: Blog institucional integrado + Widget de Facebook.
*   **Parque Automotor**: Galería de vehículos activos.
*   **In Memoriam**: Sección de homenaje a los caídos.
*   **Inscripción Online**: Formulario con validación de edad y carga de documentación (DNI) segura.

### 🔒 Panel de Administración (Jefatura)
*   **Gestión de Aspirantes**: Tabla con estados (Pendiente, Aprobado, etc.), cálculo de edad y visualización de documentos.
*   **Inventario Digital**:
    *   Categorización (Vehículos, Materiales, Indumentaria, etc.).
    *   Búsqueda global inteligente.
    *   Carga de múltiples fotos por ítem.
    *   Generación de **Manifiestos de Carga (PDF)** seleccionando ítems y cantidades.
    *   Sistema de bajas lógicas (Historial).
*   **Gestión de Personal**:
    *   Alta/Baja de bomberos.
    *   Recorte de foto de perfil.
    *   Datos médicos y seguros.
    *   Generación de **Nómina (PDF)**.
*   **Libro de Guardia Digital**:
    *   Registro de turnos y novedades.
    *   Selección rápida de personal presente.
    *   Historial de guardias.
*   **Configuración**: Panel para cambiar el nivel de riesgo de incendio públicamente.

---

## 🛠️ Instalación y Configuración Local

Si deseas correr este proyecto en tu máquina:

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/TU_USUARIO/bomberos-central-27.git
    cd bomberos-central-27
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la raíz con las siguientes claves (solicitar al administrador):
    ```env
    VITE_SUPABASE_URL=tu_supabase_url
    VITE_SUPABASE_ANON_KEY=tu_supabase_key
    VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
    VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset_unsigned
    ```

4.  **Iniciar Servidor de Desarrollo**
    ```bash
    npm run dev
    ```

---

## 📂 Estructura del Proyecto
/src
├── components/
│ ├── Admin/ # Módulos privados (Dashboard, Inventario, Guardias...)
│ ├── Common/ # Componentes compartidos (Navbar, Footer, Widgets)
│ └── Public/ # Secciones públicas (Hero, Noticias, Forms)
├── config/ # Conexión a Supabase y Cloudinary
├── context/ # AuthContext (Manejo de sesión)
├── services/ # Lógica de subida de archivos y generación de PDF
├── styles/ # Variables SCSS y estilos globales
├── utils/ # Funciones auxiliares (Cropper)
└── App.jsx # Enrutamiento principal

## 📄 Licencia

Este proyecto fue desarrollado exclusivamente para la **Asociación de Bomberos Voluntarios de Buta Ranquil**. Todos los derechos reservados.
