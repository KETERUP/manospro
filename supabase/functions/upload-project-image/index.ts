import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { projectId, imageBase64 } = await req.json();

    if (!projectId || !imageBase64) {
      throw new Error('Missing projectId or imageBase64');
    }

    // Decode base64 image
    const imageData = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
    
    // Generate unique filename
    const fileName = `${projectId}/${Date.now()}.jpg`;

    // Upload to storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('proyectos')
      .upload(fileName, imageData, {
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

    return new Response(
      JSON.stringify({ success: true, imageUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});