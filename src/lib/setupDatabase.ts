import { supabase } from "./supabaseClient"
import { toast } from "sonner"

export async function setupDatabase() {
  // Create profiles table if not exists
  const { error: profilesError } = await supabase
    .from('profiles')
    .insert([
      {
        id: '00000000-0000-0000-0000-000000000000',
        username: 'system',
        role: 'admin'
      }
    ], { upsert: true })

  if (profilesError) {
    toast.error(`Profiles table error: ${profilesError.message}`)
  }

  // Create posts table if not exists
  const { error: postsError } = await supabase
    .from('posts')
    .insert([
      {
        id: '00000000-0000-0000-0000-000000000000',
        title: 'Welcome',
        content: 'First post',
        author_id: '00000000-0000-0000-0000-000000000000'
      }
    ], { upsert: true })

  if (postsError) {
    toast.error(`Posts table error: ${postsError.message}`)
  }

  toast.success("Database tables verified")
}