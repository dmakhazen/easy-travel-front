import { defineStore } from 'pinia'
import { ref, computed, onScopeDispose } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  let initializePromise: Promise<void> | null = null
  let unsubscribeAuthListener: (() => void) | null = null

  const isAuthenticated = computed(() => !!user.value)

  async function initialize() {
    if (initialized.value) return

    if (initializePromise) {
      return initializePromise
    }

    error.value = null
    loading.value = true
    initializePromise = (async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()
        user.value = currentUser

        if (!unsubscribeAuthListener) {
          const { data } = supabase.auth.onAuthStateChange((_, session) => {
            user.value = session?.user ?? null
          })
          unsubscribeAuthListener = () => {
            data.subscription.unsubscribe()
          }
        }

        initialized.value = true
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unknown error'
      } finally {
        loading.value = false
        initializePromise = null
      }
    })()

    return initializePromise
  }

  function cleanup() {
    unsubscribeAuthListener?.()
    unsubscribeAuthListener = null
    initialized.value = false
  }

  onScopeDispose(cleanup)

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

  async function requestPasswordReset(email: string, redirectTo?: string) {
    loading.value = true
    error.value = null
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (resetError) throw resetError
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to request password reset'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(password: string) {
    loading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      user.value = data.user
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update password'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    initialize,
    cleanup,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    updatePassword,
  }
})
