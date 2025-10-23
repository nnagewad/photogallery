window.addEventListener('DOMContentLoaded', () => {
  new PagefindUI({
    element: "#search",
    showSubResults: true,
    resetStyles: true,
    addStyles: false,
    translations: {
      "placeholder": "Search this site...",
    }
  });

  // Wait for Pagefind to render its input
  const observer = new MutationObserver(() => {
    const searchInput = document.querySelector('.pagefind-ui__search-input');
    const searchClear = document.querySelector('.pagefind-ui__search-clear');
    
    if (searchInput) {
      observer.disconnect(); // Stop watching once found

      // Listen for key input
      searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() !== '') {
          // Something has been entered
          searchInput.removeAttribute('style');
          searchClear.style.display = 'inline-block';
        } else {
          searchClear.style.display = 'none';
        }
      });

      // Clear button functionality
      searchClear.addEventListener('click', () => {
        searchClear.style.display = 'none';
      });
    }
  });

  observer.observe(document.querySelector('#search'), { childList: true, subtree: true });
});
