import { supabase } from "@/integrations/supabase/client";
import proyectoObraGeneral from "@/assets/proyecto-obra-general.jpg";
import proyectoCarpintero2 from "@/assets/proyecto-carpintero-2.jpg";
import proyectoCeramista2 from "@/assets/proyecto-ceramista-2.jpg";
import proyectoPintor2 from "@/assets/proyecto-pintor-2.jpg";

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

export async function updateProjectImages() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Upload new images
    const [obraUrl, carpinteroUrl, ceramistaUrl, pintorUrl] = await Promise.all([
      uploadImageFromUrl(proyectoObraGeneral, 'obra-general', user.id),
      uploadImageFromUrl(proyectoCarpintero2, 'carpintero-2', user.id),
      uploadImageFromUrl(proyectoCeramista2, 'ceramista-2', user.id),
      uploadImageFromUrl(proyectoPintor2, 'pintor-2', user.id)
    ]);

    // Update projects
    const updates = [
      // Add image to "Obra" project
      supabase
        .from('obras')
        .update({ imagen_proyecto: obraUrl })
        .eq('id', 'b5460891-fae4-446d-b144-d19fe02ed236'),
      
      // Update one of the duplicate carpintero projects
      supabase
        .from('obras')
        .update({ imagen_proyecto: carpinteroUrl })
        .eq('id', 'ddd49dd9-15f6-47e0-b7d9-03c20d86c18c'),
      
      // Update one of the duplicate ceramista projects
      supabase
        .from('obras')
        .update({ imagen_proyecto: ceramistaUrl })
        .eq('id', '99b67804-7516-471b-a411-76ee62e44347'),
      
      // Update one of the duplicate pintor projects
      supabase
        .from('obras')
        .update({ imagen_proyecto: pintorUrl })
        .eq('id', '4a2889d6-44a3-45d1-8223-6d55603d5dd2')
    ];

    await Promise.all(updates);

    console.log('✅ Proyectos actualizados correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error actualizando proyectos:', error);
    return false;
  }
}
