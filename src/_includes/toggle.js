// Remove the no JS class so that the button will show
document.documentElement.classList.remove('no-js');

const themeToggle = document.getElementById('theme-toggle');

// Apply theme based on the selected mode
function applyTheme(mode) {
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-user-color-scheme', 'dark');
  } else if (mode === 'light') {
    document.documentElement.setAttribute('data-user-color-scheme', 'light');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.setAttribute('data-user-color-scheme', 'dark');
    } else {
      document.documentElement.setAttribute('data-user-color-scheme', 'light');
    }
  }
}

// Handle system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (themeToggle.value === 'system') {
    applyTheme('system');
  }
});

// Load saved theme or default to system
const savedTheme = localStorage.getItem('theme') || 'system';
themeToggle.value = savedTheme;
applyTheme(savedTheme);

// Save theme selection and apply it
themeToggle.addEventListener('change', () => {
  const selectedTheme = themeToggle.value;
  localStorage.setItem('theme', selectedTheme);
  applyTheme(selectedTheme);
});