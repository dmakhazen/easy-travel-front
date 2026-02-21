import { supabase } from '@/lib/supabaseClient'

export type Trip = {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export type Wish = {
  id: string
  title: string
  trip_id: string
  created_at: string
  updated_at: string
}

export type Place = {
  id: string
  title: string
  wish_id: string
  created_at: string
}

function ensure<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message)
  if (data === null) throw new Error('No data returned')
  return data
}

export async function listTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select('id,title,created_at,updated_at,user_id')
    .order('created_at', { ascending: false })
  return ensure(data, error) as Trip[]
}

export async function getTripById(tripId: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('id,title,created_at,updated_at,user_id')
    .eq('id', tripId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Путешествие не найдено')
  return data as Trip
}

export async function createTrip(title: string) {
  const { data, error } = await supabase
    .from('trips')
    .insert({ title })
    .select('id,title,created_at,updated_at,user_id')
  if (error) throw new Error(error.message)
  const trip = data?.[0]
  if (!trip) throw new Error('Не удалось получить созданное путешествие')
  return trip as Trip
}

export async function updateTrip(tripId: string, title: string) {
  const { data, error } = await supabase
    .from('trips')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .select('id,title')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('Изменения не применены. Проверьте права доступа (RLS) для UPDATE в trips.')
  }
  return getTripById(tripId)
}

export async function deleteTrip(tripId: string) {
  const { error } = await supabase.from('trips').delete().eq('id', tripId)
  if (error) throw new Error(error.message)
}

export async function listWishesByTrip(tripId: string) {
  const { data, error } = await supabase
    .from('wishes')
    .select('id,title,trip_id,created_at,updated_at')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true })
  return ensure(data, error) as Wish[]
}

export async function createWish(tripId: string, title: string) {
  const { data, error } = await supabase
    .from('wishes')
    .insert({ trip_id: tripId, title })
    .select('id,title,trip_id,created_at,updated_at')
  if (error) throw new Error(error.message)
  const wish = data?.[0]
  if (!wish) throw new Error('Не удалось создать желание')
  return wish as Wish
}

export async function updateWish(wishId: string, title: string) {
  const { data, error } = await supabase
    .from('wishes')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', wishId)
    .select('id,title,trip_id,created_at,updated_at')
  if (error) throw new Error(error.message)
  const wish = data?.[0]
  if (!wish) throw new Error('Не удалось обновить желание')
  return wish as Wish
}

export async function deleteWish(wishId: string) {
  const { error } = await supabase.from('wishes').delete().eq('id', wishId)
  if (error) throw new Error(error.message)
}

export async function listPlacesByWish(wishId: string) {
  const { data, error } = await supabase
    .from('places')
    .select('id,title,wish_id,created_at')
    .eq('wish_id', wishId)
    .order('created_at', { ascending: true })
  return ensure(data, error) as Place[]
}

export async function createPlace(wishId: string, title: string) {
  const { data, error } = await supabase
    .from('places')
    .insert({ wish_id: wishId, title })
    .select('id,title,wish_id,created_at')
  if (error) throw new Error(error.message)
  const place = data?.[0]
  if (!place) throw new Error('Не удалось создать место')
  return place as Place
}

export async function updatePlace(placeId: string, title: string) {
  const { data, error } = await supabase
    .from('places')
    .update({ title })
    .eq('id', placeId)
    .select('id,title,wish_id,created_at')
  if (error) throw new Error(error.message)
  const place = data?.[0]
  if (!place) throw new Error('Не удалось обновить место')
  return place as Place
}

export async function deletePlace(placeId: string) {
  const { error } = await supabase.from('places').delete().eq('id', placeId)
  if (error) throw new Error(error.message)
}

export async function exportTripBundle(tripId: string) {
  const trip = await getTripById(tripId)
  const wishes = await listWishesByTrip(tripId)
  const placesByWish: Record<string, Place[]> = {}

  await Promise.all(
    wishes.map(async (wish) => {
      placesByWish[wish.id] = await listPlacesByWish(wish.id)
    }),
  )

  return {
    trip,
    wishes: wishes.map((wish) => ({
      ...wish,
      places: placesByWish[wish.id] ?? [],
    })),
  }
}
