import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <--- CAMBIO IMPORTANTE: Importación por defecto

// Configuración Base del Documento
const getBaseDoc = (title) => {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ASOCIACIÓN BOMBEROS VOLUNTARIOS', 105, 20, null, null, 'center');
  
  doc.setFontSize(12);
  doc.setTextColor(206, 17, 38); // Rojo
  doc.text('BUTA RANQUIL - CENTRAL 27', 105, 28, null, null, 'center');
  
  // Línea separadora
  doc.setDrawColor(150);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);
  
  // Título y Fecha
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(title.toUpperCase(), 14, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  const fecha = new Date().toLocaleDateString('es-AR');
  const hora = new Date().toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});
  doc.text(`Fecha: ${fecha} - Hora: ${hora}`, 14, 52);
  
  return doc;
};

// 1. PDF DE INVENTARIO COMPLETO
export const generateInventoryPDF = (items, categoryName = 'General') => {
  try {
    const doc = getBaseDoc(`INVENTARIO: ${categoryName}`);

    const tableRows = items.map(item => [
      item.cantidad,
      item.nombre,
      `${item.marca || ''} ${item.modelo || ''}`,
      item.origen || '-',
      item.estado || 'Operativo'
    ]);

    autoTable(doc, {
      head: [["Cant.", "Detalle", "Marca/Modelo", "Origen", "Estado"]],
      body: tableRows,
      startY: 60,
      theme: 'striped',
      headStyles: { fillColor: [26, 43, 73] }, // Azul oscuro
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } }
    });

    doc.save(`Inventario_${categoryName.replace(/\s/g, '_')}.pdf`);
  } catch (error) {
    console.error("Error generando PDF Inventario:", error);
    alert("Error al generar PDF. Revisa la consola.");
  }
};

// 2. PDF DE NÓMINA DE PERSONAL
export const generatePersonnelPDF = (bomberos) => {
  try {
    const doc = getBaseDoc('NÓMINA DE CUERPO ACTIVO');

    const tableRows = bomberos.map(b => [
      b.legajo || '-',
      b.rango,
      `${b.apellido}, ${b.nombre}`,
      b.dni,
      b.grupo_sanguineo || '-'
    ]);

    autoTable(doc, {
      head: [["Leg.", "Grado", "Apellido y Nombre", "DNI", "G. Sang."]],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [26, 43, 73] }
    });

    doc.save('Nomina_Personal.pdf');
  } catch (error) {
    console.error("Error generando PDF Personal:", error);
    alert("Error al generar PDF.");
  }
};

// 3. PDF DE REMITO DE SALIDA (El que fallaba)
export const generateManifestPDF = (itemsSeleccionados) => {
  console.log("Iniciando generación de Manifiesto...", itemsSeleccionados); // Debug

  try {
    const doc = getBaseDoc('MANIFIESTO DE CARGA / SALIDA');

    const tableColumn = ["Cant.", "Descripción / Equipo", "Marca/Modelo", "Serial / Obs"];
    
    const tableRows = itemsSeleccionados.map(item => [
      item.cantidadSalida || 1, // Aseguramos que tenga valor
      item.nombre,
      `${item.marca || ''} ${item.modelo || ''}`,
      item.serial || item.origen || '-'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid', // Estilo rejilla para remito
      headStyles: { fillColor: [206, 17, 38], textColor: 255 }, // Rojo Bombero
      styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', fontSize: 12, cellWidth: 20 },
      }
    });

    // Firmas al pie
    // Usamos 'lastAutoTable' desde el objeto doc
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 100;
    const firmaY = finalY + 40;

    // Verificar si nos pasamos de hoja
    if (firmaY > 270) {
      doc.addPage();
      // firmaY = 40; // Resetear posición si es nueva hoja (opcional)
    }

    doc.setFontSize(10);
    doc.setTextColor(0);
    
    // Firma Izquierda
    doc.text('__________________________', 30, firmaY);
    doc.text('Responsable Salida', 35, firmaY + 5);
    
    // Firma Derecha
    doc.text('__________________________', 130, firmaY);
    doc.text('Responsable Recepción', 135, firmaY + 5);

    console.log("Guardando PDF...");
    doc.save(`Remito_Salida_${new Date().getTime()}.pdf`);
    
  } catch (error) {
    console.error("Error fatal generando PDF:", error);
    alert("Hubo un error al crear el archivo PDF. Ver consola (F12).");
  }
};