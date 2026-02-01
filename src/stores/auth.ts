import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function initialize() {
    loading.value = true
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      user.value = currentUser

      supabase.auth.onAuthStateChange((event, session) => {
        user.value = session?.user ?? null
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError
      user.value = data.user
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function signIn(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
      user.value = data.user
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    error.value = null
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initialize,
    signUp,
    signIn,
    signOut,
  }
})