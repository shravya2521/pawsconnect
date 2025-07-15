// Create MutationObserver instance
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      // Your copy protection logic here
      enableCopy();
    }
  });
});

function enableCopy() {
  document.querySelectorAll('*').forEach(el => {
    el.style.userSelect = 'text';
    el.style.webkitUserSelect = 'text';
    el.style.mozUserSelect = 'text';
    el.style.msUserSelect = 'text';
  });
}

// Start observing changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

// Initial call
enableCopy();
