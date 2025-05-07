<script setup>
import ChatInterface from './components/ChatInterface.vue'
</script>

<template>
  <main>
    <ChatInterface />
  </main>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  overflow: hidden;
  position: relative;
  height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  line-height: 1.6;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

main {
  width: 100%;
  height: 100%;
  position: relative;
}

.toast-demo-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--color-text-primary);
  font-weight: 500;
  line-height: 1.3;
}

p {
  margin: 0 0 1em;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-primary-dark);
}
</style>
