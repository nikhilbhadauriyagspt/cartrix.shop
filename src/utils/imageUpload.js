import { supabase } from '../lib/supabase'

export const uploadImage = async (file, bucket = 'assets', folder = '', client = null) => {
  try {
    const supabaseClient = client || supabase
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { url: publicUrl, path: filePath, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { url: null, path: null, error: error.message }
  }
}

export const deleteImage = async (path, bucket = 'assets', client = null) => {
  try {
    const supabaseClient = client || supabase
    const { error } = await supabaseClient.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: error.message }
  }
}

export const getImageUrl = (path, bucket = 'assets', client = null) => {
  const supabaseClient = client || supabase
  const { data } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}
