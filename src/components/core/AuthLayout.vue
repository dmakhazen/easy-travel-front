<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-6 sm:px-6"
  >
    <div class="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center">
      <main class="w-full rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
