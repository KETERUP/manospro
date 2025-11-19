import { supabase } from "@/integrations/supabase/client";

export const uploadGeneratedImageToProject = async (projectId: string, imageUrl: string) => {
  try {
    // Fetch the image from public folder
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Generate unique filename
    const fileName = `${projectId}/${Date.now()}.jpg`;
    
    // Upload to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from('proyectos')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('proyectos')
      .getPublicUrl(fileName);
    
    // Update project with image URL
    const { error: updateError } = await supabase
      .from('obras')
      .update({ imagen_proyecto: publicUrl })
      .eq('id', projectId);
    
    if (updateError) throw updateError;
    
    return { success: true, imageUrl: publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};