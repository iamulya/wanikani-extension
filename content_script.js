document.addEventListener('dblclick', function(event) {
  // 1. Check if the Ctrl key (or Command key on Mac) was pressed during the double-click
  if (event.ctrlKey || event.metaKey) { // event.metaKey is for Command on macOS
    const selectedText = window.getSelection().toString().trim();

    if (selectedText) {
      // 2. Check if the selected text contains Japanese characters
      // This regex checks for Hiragana, Katakana, and common CJK Unified Ideographs (Kanji)
      // It also includes some common Japanese punctuation and symbols.
      const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/;

      if (japaneseRegex.test(selectedText)) {
        // Basic length check to avoid overly long selections (optional, adjust as needed)
        if (selectedText.length > 0 && selectedText.length < 50 && !selectedText.includes('\n')) {
          const encodedText = encodeURIComponent(selectedText);
          const wanikaniUrl = `https://www.wanikani.com/vocabulary/${encodedText}`;

          // Open the URL in a new tab
          window.open(wanikaniUrl, '_blank');

          // For debugging:
          // console.log(`WaniKani Lookup: Selected "${selectedText}", Opening "${wanikaniUrl}" (Ctrl+DblClick, Japanese text detected)`);
        } else {
          // console.log(`WaniKani Lookup: Selected text "${selectedText}" is Japanese but too long or contains newlines.`);
        }
      } else {
        // console.log(`WaniKani Lookup: Selected text "${selectedText}" does not appear to be Japanese.`);
      }
    }
  }
});