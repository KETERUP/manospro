import { supabase } from "@/integrations/supabase/client";
import proyectoElectricista from "@/assets/proyecto-electricista.jpg";
import proyectoFontanero from "@/assets/proyecto-fontanero.jpg";
import proyectoTechumbre from "@/assets/proyecto-techumbre.jpg";
import proyectoPintor from "@/assets/proyecto-pintor.jpg";
import proyectoCeramista from "@/assets/proyecto-ceramista.jpg";
import proyectoCarpintero from "@/assets/proyecto-carpintero.jpg";

const projectImages = [
  { path: proyectoElectricista, name: "electricista" },
  { path: proyectoFontanero, name: "fontanero" },
  { path: proyectoTechumbre, name: "techumbre" },
  { path: proyectoPintor, name: "pintor" },
  { path: proyectoCeramista, name: "ceramista" },
  { path: proyectoCarpintero, name: "carpintero" }
];

async function uploadImageFromUrl(imageUrl: string, fileName: string, userId: string) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Upload to Supabase Storage
    const filePath = `${userId}/${fileName}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('proyectos')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('proyectos')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function seedProjects() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Get existing projects
    const { data: projects } = await supabase
      .from('obras')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(3);

    if (!projects || projects.length < 3) {
      console.error('Not enough projects to seed');
      return;
    }

    // Upload images and get URLs
    const imageUrls = await Promise.all(
      projectImages.map((img, idx) => 
        uploadImageFromUrl(img.path, img.name, user.id)
      )
    );

    // Create clients
    const { data: clientesData } = await supabase
      .from('clientes')
      .insert([
        { nombre: 'Carlos Mendoza', telefono: '+56912345678', email: 'cmendoza@email.com', direccion: 'Av. Providencia 1234, Santiago', user_id: user.id },
        { nombre: 'María González', telefono: '+56987654321', email: 'mgonzalez@email.com', direccion: 'Calle Las Condes 567, Las Condes', user_id: user.id },
        { nombre: 'Roberto Silva', telefono: '+56911223344', email: 'rsilva@email.com', direccion: 'Av. Vicuña Mackenna 890, Ñuñoa', user_id: user.id }
      ])
      .select('id');

    if (!clientesData) throw new Error('Error creating clients');

    // Create providers
    const { data: proveedoresData } = await supabase
      .from('proveedores')
      .insert([
        { nombre: 'Ferretería El Constructor', telefono: '+56922334455', email: 'ventas@elconstructor.cl', user_id: user.id },
        { nombre: 'Materiales Pro', telefono: '+56933445566', email: 'info@materialespro.cl', user_id: user.id },
        { nombre: 'Distribuidora Central', telefono: '+56944556677', email: 'contacto@distcentral.cl', user_id: user.id }
      ])
      .select('id');

    if (!proveedoresData) throw new Error('Error creating providers');

    // Update project 1 - Electricista (Noviembre)
    await supabase
      .from('obras')
      .update({
        nombre_obra: 'Reparación Sistema Eléctrico Casa Mendoza',
        cliente_id: clientesData[0].id,
        estado: 'APROBADO',
        fecha_visita: new Date('2024-11-08T10:00:00').toISOString(),
        imagen_proyecto: imageUrls[0],
        created_at: new Date('2024-11-01T10:00:00').toISOString()
      })
      .eq('id', projects[0].id);

    // Add budget items for project 1
    await supabase.from('items_presupuesto').insert([
      { obra_id: projects[0].id, descripcion: 'Revisión y diagnóstico del sistema eléctrico', precio: 150000 },
      { obra_id: projects[0].id, descripcion: 'Reemplazo de cableado defectuoso', precio: 450000 },
      { obra_id: projects[0].id, descripcion: 'Instalación de nuevo tablero eléctrico', precio: 380000 },
      { obra_id: projects[0].id, descripcion: 'Mano de obra especializada', precio: 520000 }
    ]);

    // Add expenses for project 1
    await supabase.from('gastos').insert([
      { obra_id: projects[0].id, descripcion: 'Cables eléctricos calibre 12', monto: 185000, proveedor_id: proveedoresData[0].id },
      { obra_id: projects[0].id, descripcion: 'Tablero eléctrico 24 circuitos', monto: 295000, proveedor_id: proveedoresData[0].id },
      { obra_id: projects[0].id, descripcion: 'Interruptores y enchufes', monto: 120000, proveedor_id: proveedoresData[1].id },
      { obra_id: projects[0].id, descripcion: 'Herramientas y materiales menores', monto: 85000, proveedor_id: proveedoresData[1].id }
    ]);

    // Update project 2 - Fontanero (Noviembre)
    await supabase
      .from('obras')
      .update({
        nombre_obra: 'Renovación Completa de Baño Casa González',
        cliente_id: clientesData[1].id,
        estado: 'APROBADO',
        fecha_visita: new Date('2024-11-15T14:00:00').toISOString(),
        imagen_proyecto: imageUrls[1],
        created_at: new Date('2024-11-03T14:00:00').toISOString()
      })
      .eq('id', projects[1].id);

    // Add budget items for project 2
    await supabase.from('items_presupuesto').insert([
      { obra_id: projects[1].id, descripcion: 'Retiro de instalaciones antiguas', precio: 280000 },
      { obra_id: projects[1].id, descripcion: 'Instalación de nuevas cañerías', precio: 620000 },
      { obra_id: projects[1].id, descripcion: 'Instalación de artefactos sanitarios', precio: 450000 },
      { obra_id: projects[1].id, descripcion: 'Mano de obra gasfitería', precio: 550000 }
    ]);

    // Add expenses for project 2
    await supabase.from('gastos').insert([
      { obra_id: projects[1].id, descripcion: 'Tuberías de cobre y PVC', monto: 320000, proveedor_id: proveedoresData[2].id },
      { obra_id: projects[1].id, descripcion: 'WC y lavamanos', monto: 385000, proveedor_id: proveedoresData[2].id },
      { obra_id: projects[1].id, descripcion: 'Grifería y accesorios', monto: 245000, proveedor_id: proveedoresData[1].id },
      { obra_id: projects[1].id, descripcion: 'Materiales de instalación', monto: 125000, proveedor_id: proveedoresData[0].id }
    ]);

    // Update project 3 - Techumbre (Noviembre)
    await supabase
      .from('obras')
      .update({
        nombre_obra: 'Reparación de Techumbre Casa Silva',
        cliente_id: clientesData[2].id,
        estado: 'APROBADO',
        fecha_visita: new Date('2024-11-22T09:00:00').toISOString(),
        imagen_proyecto: imageUrls[2],
        created_at: new Date('2024-11-05T09:00:00').toISOString()
      })
      .eq('id', projects[2].id);

    // Add budget items for project 3
    await supabase.from('items_presupuesto').insert([
      { obra_id: projects[2].id, descripcion: 'Evaluación y medición de techumbre', precio: 120000 },
      { obra_id: projects[2].id, descripcion: 'Reemplazo de tejas dañadas', precio: 680000 },
      { obra_id: projects[2].id, descripcion: 'Impermeabilización completa', precio: 420000 },
      { obra_id: projects[2].id, descripcion: 'Mano de obra especializada', precio: 580000 }
    ]);

    // Add expenses for project 3
    await supabase.from('gastos').insert([
      { obra_id: projects[2].id, descripcion: 'Tejas cerámicas premium', monto: 425000, proveedor_id: proveedoresData[2].id },
      { obra_id: projects[2].id, descripcion: 'Membrana impermeabilizante', monto: 285000, proveedor_id: proveedoresData[1].id },
      { obra_id: projects[2].id, descripcion: 'Estructura de soporte', monto: 195000, proveedor_id: proveedoresData[0].id },
      { obra_id: projects[2].id, descripcion: 'Selladores y fijaciones', monto: 110000, proveedor_id: proveedoresData[0].id }
    ]);

    // Create 2 additional projects for December
    const { data: decemberProjects } = await supabase
      .from('obras')
      .insert([
        {
          nombre_obra: 'Pintura Interior Departamento López',
          cliente_id: clientesData[0].id,
          estado: 'APROBADO',
          fecha_visita: new Date('2024-12-05T11:00:00').toISOString(),
          imagen_proyecto: imageUrls[3],
          user_id: user.id,
          created_at: new Date('2024-12-01T11:00:00').toISOString()
        },
        {
          nombre_obra: 'Instalación de Cerámicas Baño y Cocina',
          cliente_id: clientesData[1].id,
          estado: 'APROBADO',
          fecha_visita: new Date('2024-12-18T15:00:00').toISOString(),
          imagen_proyecto: imageUrls[4],
          user_id: user.id,
          created_at: new Date('2024-12-03T15:00:00').toISOString()
        }
      ])
      .select('id');

    if (decemberProjects) {
      // Add budget items for December project 1 (Pintor)
      await supabase.from('items_presupuesto').insert([
        { obra_id: decemberProjects[0].id, descripcion: 'Preparación de superficies y masillado', precio: 220000 },
        { obra_id: decemberProjects[0].id, descripcion: 'Pintura de dormitorios y living', precio: 380000 },
        { obra_id: decemberProjects[0].id, descripcion: 'Pintura de cocina y baños', precio: 180000 }
      ]);

      await supabase.from('gastos').insert([
        { obra_id: decemberProjects[0].id, descripcion: 'Pintura y materiales', monto: 185000, proveedor_id: proveedoresData[0].id },
        { obra_id: decemberProjects[0].id, descripcion: 'Masilla y herramientas', monto: 95000, proveedor_id: proveedoresData[1].id }
      ]);

      // Add budget items for December project 2 (Ceramista)
      await supabase.from('items_presupuesto').insert([
        { obra_id: decemberProjects[1].id, descripcion: 'Cerámicas para baño', precio: 280000 },
        { obra_id: decemberProjects[1].id, descripcion: 'Cerámicas para cocina', precio: 320000 },
        { obra_id: decemberProjects[1].id, descripcion: 'Mano de obra instalación', precio: 350000 }
      ]);

      await supabase.from('gastos').insert([
        { obra_id: decemberProjects[1].id, descripcion: 'Cerámicas premium', monto: 385000, proveedor_id: proveedoresData[2].id },
        { obra_id: decemberProjects[1].id, descripcion: 'Adhesivos y fragüe', monto: 125000, proveedor_id: proveedoresData[1].id }
      ]);
    }

    // Create 1 additional project for January
    const { data: januaryProjects } = await supabase
      .from('obras')
      .insert([
        {
          nombre_obra: 'Fabricación de Muebles de Cocina Casa Núñez',
          cliente_id: clientesData[2].id,
          estado: 'PENDIENTE',
          fecha_visita: new Date('2025-01-15T10:00:00').toISOString(),
          imagen_proyecto: imageUrls[5],
          user_id: user.id,
          created_at: new Date('2025-01-05T10:00:00').toISOString()
        }
      ])
      .select('id');

    if (januaryProjects) {
      // Add budget items for January project (Carpintero)
      await supabase.from('items_presupuesto').insert([
        { obra_id: januaryProjects[0].id, descripcion: 'Diseño y mediciones', precio: 150000 },
        { obra_id: januaryProjects[0].id, descripcion: 'Materiales de madera', precio: 650000 },
        { obra_id: januaryProjects[0].id, descripcion: 'Fabricación e instalación', precio: 480000 }
      ]);

      await supabase.from('gastos').insert([
        { obra_id: januaryProjects[0].id, descripcion: 'Madera y tableros', monto: 280000, proveedor_id: proveedoresData[0].id }
      ]);
    }

    console.log('Projects seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding projects:', error);
    return false;
  }
}
