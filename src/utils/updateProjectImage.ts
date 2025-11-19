import { supabase } from "@/integrations/supabase/client";

export async function updateProjectImageFromAsset(
  projectId: string,
  assetPath: string
): Promise<string | null> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // Fetch the image from the asset path
    const response = await fetch(assetPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const fileName = `${user.id}/pintor-${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("proyectos")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("proyectos")
      .getPublicUrl(fileName);

    // Update the project with the new image URL
    const { error: updateError } = await supabase
      .from("obras")
      .update({ imagen_proyecto: publicUrl })
      .eq("id", projectId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error("Error updating project image:", error);
    return null;
  }
}
