<template>
  <footer class="footer-container">
    <div class="footer-content">
      <p class="footer-copyright">© 2025 Element Fleet Solutions</p>
      <div class="footer-links">
        <a href="#" class="footer-link">Terms of service</a>
        <a href="#" class="footer-link">Privacy notice</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer component - minimal functionality
</script>

<style scoped>
.footer-container {
  height: 280px;
  background: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 1.5rem 2rem;
  position: relative;
  z-index: 5;
}

.footer-content {
  max-width: 1280px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Euclid Circular B', Arial, sans-serif;
  font-size: 14px;
  color: #A0A0A0;
}

.footer-copyright {
  margin: 0;
  font-weight: normal;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-link {
  color: #A0A0A0;
  text-decoration: none;
  font-weight: normal;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #00D7D2;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }
}
</style>
