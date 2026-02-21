<template>
  <TripsLayout>
    <template #header>
      <h1 class="text-2xl font-bold text-white">Желания</h1>
    </template>

    <AppToast :message="toastMessage" />

    <div class="mx-auto w-full max-w-xl space-y-6">
      <div class="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-gray-100 p-1">
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-200"
          @click="router.push(`/trips/${tripId}`)"
        >
          Описание
        </button>
        <button type="button" class="rounded-md px-3 py-2 text-sm font-medium bg-teal-600 text-white">
          Желания
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-200"
          @click="router.push(`/trips/${tripId}/locations`)"
        >
          Места
        </button>
      </div>

      <form class="flex gap-2" @submit.prevent="handleCreateWish">
        <input
          v-model="newWishTitle"
          type="text"
          required
          maxlength="120"
          placeholder="Добавить желание"
          class="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
        <button
          type="submit"
          class="rounded-md bg-teal-600 px-4 py-3 font-medium text-white disabled:opacity-60"
          :disabled="loading"
        >
          +
        </button>
      </form>

      <p v-if="errorMessage" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ errorMessage }}
      </p>

      <ul class="space-y-2">
        <li
          v-for="wish in wishes"
          :key="wish.id"
          class="rounded-lg border border-gray-200 bg-gray-50 p-3"
        >
          <div class="flex items-center gap-2">
            <input
              :value="editValues[wish.id] ?? wish.title"
              type="text"
              maxlength="120"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
              @input="setEditValue(wish.id, $event)"
            />
            <button
              type="button"
              class="rounded-md bg-gray-200 px-3 py-2 text-xs font-medium text-gray-800"
              :disabled="loading"
              @click="handleUpdateWish(wish.id)"
            >
              Сохр.
            </button>
            <button
              type="button"
              class="rounded-md bg-red-100 px-3 py-2 text-xs font-medium text-red-700"
              :disabled="loading"
              @click="handleDeleteWish(wish.id)"
            >
              Удал.
            </button>
          </div>
        </li>
      </ul>

      <button
        type="button"
        class="w-full rounded-md bg-teal-600 px-4 py-3 font-medium text-white"
        @click="handleNext"
      >
        Далее
      </button>
    </div>
  </TripsLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TripsLayout from '@/components/core/TripsLayout.vue'
import AppToast from '@/components/core/AppToast.vue'
import {
  createWish,
  deleteWish,
  listWishesByTrip,
  type Wish,
  updateWish,
} from '@/services/travel'

const route = useRoute()
const router = useRouter()
const tripId = route.params.tripId as string

const loading = ref(false)
const errorMessage = ref('')
const toastMessage = ref('')
const wishes = ref<Wish[]>([])
const newWishTitle = ref('')
const editValues = ref<Record<string, string>>({})
let toastTimer: ReturnType<typeof setTimeout> | null = null

function setEditValue(wishId: string, event: Event) {
  const input = event.target as HTMLInputElement
  editValues.value[wishId] = input.value
}

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2400)
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    wishes.value = await listWishesByTrip(tripId)
    editValues.value = Object.fromEntries(wishes.value.map((wish) => [wish.id, wish.title]))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить данные'
  } finally {
    loading.value = false
  }
}

async function handleCreateWish() {
  if (!newWishTitle.value.trim()) return

  loading.value = true
  errorMessage.value = ''
  try {
    const wish = await createWish(tripId, newWishTitle.value.trim())
    wishes.value.push(wish)
    editValues.value[wish.id] = wish.title
    newWishTitle.value = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось добавить желание'
  } finally {
    loading.value = false
  }
}

async function handleUpdateWish(wishId: string) {
  const value = (editValues.value[wishId] ?? '').trim()
  if (!value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const updated = await updateWish(wishId, value)
    wishes.value = wishes.value.map((wish) => (wish.id === wishId ? updated : wish))
    editValues.value[wishId] = updated.title
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось обновить желание'
  } finally {
    loading.value = false
  }
}

async function handleDeleteWish(wishId: string) {
  loading.value = true
  errorMessage.value = ''
  try {
    await deleteWish(wishId)
    wishes.value = wishes.value.filter((wish) => wish.id !== wishId)
    delete editValues.value[wishId]
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось удалить желание'
  } finally {
    loading.value = false
  }
}

function handleNext() {
  if (wishes.value.length === 0) {
    showToast('Добавьте желание')
    return
  }
  void router.push(`/trips/${tripId}/locations`)
}

onMounted(() => {
  void load()
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>
