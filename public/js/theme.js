// Theme management
const THEME_KEY = 'cloud-storage-theme';
let themeToggle;
let prefersDarkScheme;

// Initialize theme variables
function initThemeVars() {
  themeToggle = document.getElementById('themeToggle');
  prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
}

// Function to set the theme
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  
  // Update button state
  if (themeToggle) {
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    themeToggle.setAttribute('aria-pressed', isDark);
    
    // Update icon
    const icon = themeToggle.querySelector('.theme-icon');
    if (icon) {
      icon.style.transform = isDark ? 'rotate(180deg)' : 'rotate(0)';
    }
  }
}

// Function to toggle between themes
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// Initialize theme on page load
export function initTheme() {
  initThemeVars(); // Initialize variables
  // Check for saved theme preference
  const savedTheme = localStorage.getItem(THEME_KEY);
  
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (prefersDarkScheme.matches) {
    // Use system preference if no saved preference
    setTheme('dark');
  } else {
    // Default to light theme
    setTheme('light');
  }
  
  // Add event listener to theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }
  
  // Make sure the theme is applied to the body immediately
  document.body.style.visibility = 'visible';
}

// Listen for system theme changes
function setupThemeListeners() {
  if (!prefersDarkScheme) return;
  
  prefersDarkScheme.addEventListener('change', (e) => {
    // Only apply system theme if user hasn't explicitly set a preference
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

// Initialize everything when the script loads
initThemeVars();
setupThemeListeners();

// Make functions available globally
window.toggleTheme = toggleTheme;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Export for use in other files if needed
window.theme = {
  setTheme,
  toggleTheme,
  initTheme
};
