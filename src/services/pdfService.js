import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Configuración Base del Documento
const getBaseDoc = (title) => {
  const doc = new jsPDF();
  
  // Encabezado Oficial
  doc.setFontSize(18);
  doc.text('ASOCIACIÓN BOMBEROS VOLUNTARIOS', 14, 22);
  doc.setFontSize(14);
  doc.setTextColor(206, 17, 38); // Rojo Bombero
  doc.text('BUTA RANQUIL - CENTRAL 27', 14, 28);
  
  // Título del Reporte
  doc.setTextColor(0, 0, 0); // Negro
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), 14, 40);
  
  // Fecha de Emisión
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 46);
  
  return doc;
};

/**
 * Genera PDF de Inventario (Filtrado por la categoría que estés viendo)
 */
export const generateInventoryPDF = (items, categoryName) => {
  const doc = getBaseDoc(`Listado de Inventario: ${categoryName}`);

  // Columnas de la tabla
  const tableColumn = ["Cant.", "Descripción", "Marca/Modelo", "Serial / Patente", "Estado"];
  
  // Filas de datos
  const tableRows = items.map(item => [
    item.cantidad,
    item.nombre,
    `${item.marca || ''} ${item.modelo || ''}`,
    item.serial || '-',
    item.estado || 'Operativo'
  ]);

  // Generar Tabla
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    theme: 'grid', // Estilo rejilla para facilitar lectura
    headStyles: { fillColor: [26, 43, 73] }, // Azul oscuro cabecera
    styles: { fontSize: 9 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 }, // Columna Cantidad centrada y chica
    }
  });

  // Pie de página (Firma)
  const finalY = doc.lastAutoTable.finalY || 60;
  doc.setFontSize(10);
  doc.text('__________________________', 140, finalY + 40);
  doc.text('Firma Responsable', 145, finalY + 45);

  doc.save(`Inventario_${categoryName}_${new Date().toISOString().slice(0,10)}.pdf`);
};

/**
 * Genera PDF de Lista de Personal (Cuerpo Activo)
 */
export const generatePersonnelPDF = (bomberos) => {
  const doc = getBaseDoc('NÓMINA DE CUERPO ACTIVO');

  const tableColumn = ["Legajo", "Grado/Rango", "Apellido y Nombre", "DNI", "Grupo Sang."];

  const tableRows = bomberos.map(b => [
    b.legajo || '-',
    b.rango,
    `${b.apellido}, ${b.nombre}`,
    b.dni,
    b.grupo_sanguineo || '-'
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    theme: 'striped',
    headStyles: { fillColor: [206, 17, 38] }, // Rojo cabecera
    styles: { fontSize: 10 }
  });

  doc.save(`Personal_Activo_${new Date().toISOString().slice(0,10)}.pdf`);
};