import { createClient } from '@supabase/supabase-js';

const bucket = 'temp-nest-away';

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_KEY as string;

const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const uploadImage = async (image: File) => {
  const timestamp = Date.now();
  const newName = `${timestamp}-${image.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(newName, image, { cacheControl: '3600' });
  if (!data) {
    throw new Error('Failed to upload image');
  }
  return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
};
