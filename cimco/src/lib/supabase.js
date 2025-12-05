import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check Vercel settings.')
}

// Create client only if keys exist, otherwise create a dummy client that warns on use
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: 'Supabase keys missing' } }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
      upload: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase keys missing' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null })
    }
  }

// Helper function to upload maintenance photo
export async function uploadMaintenancePhoto(file, equipmentId) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${equipmentId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('maintenance-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('maintenance-photos')
    .getPublicUrl(data.path)

  return publicUrl
}

// Helper function to compress image before upload
export function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }))
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}
