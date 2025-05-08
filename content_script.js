let lastProcessedTimestamp = 0;
const debounceTime = 100; // milliseconds to wait before allowing another processing

/**
 * Checks if the text is Japanese, meets length criteria, and opens WaniKani.
 * @param {string} text The text to process.
 * @param {boolean} isExplicitTrigger True if triggered by an explicit action like Ctrl+DblClick.
 * @returns {boolean} True if a tab was opened, false otherwise.
 */
function processAndOpenWaniKani(text, isExplicitTrigger = false) {
  const selectedText = text.trim();

  if (!selectedText) {
    return false;
  }

  // 1. Check for Japanese characters
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/;
  if (!japaneseRegex.test(selectedText)) {
    // console.log(`WaniKani Lookup: Selection "${selectedText}" does not appear to be Japanese.`);
    return false;
  }

  // 2. Basic length and newline check
  if (selectedText.length === 0 || selectedText.length >= 50 || selectedText.includes('\n')) {
    // console.log(`WaniKani Lookup: Selected text "${selectedText}" is Japanese but invalid length or contains newlines.`);
    return false;
  }

  // 3. Debounce: If processed very recently, skip.
  const now = Date.now();
  if (now - lastProcessedTimestamp < debounceTime) {
    // console.log("WaniKani Lookup: Debounced.");
    return false;
  }

  // 4. Construct URL and open tab
  const encodedText = encodeURIComponent(selectedText);
  const wanikaniUrl = `https://www.wanikani.com/vocabulary/${encodedText}`;
  window.open(wanikaniUrl, '_blank');
  lastProcessedTimestamp = now; // Update timestamp after successful processing

  // For debugging:
  // console.log(`WaniKani Lookup: Opened for "${selectedText}" (Trigger: ${isExplicitTrigger ? 'Ctrl+DblClick' : 'Selection'}).`);
  return true;
}

// Listener 1: Ctrl/Cmd + Double Click
document.addEventListener('dblclick', function(event) {
  if (event.ctrlKey || event.metaKey) { // Ctrl on Win/Linux, Cmd on Mac
    const currentSelection = window.getSelection().toString();
    // Double-click might happen on empty space, so ensure there's a selection.
    if (currentSelection.trim()) {
        processAndOpenWaniKani(currentSelection, true);
    }
  }
});

// Listener 2: Text Selection (on mouse button release)
document.addEventListener('mouseup', function(event) {
  // Only act on left mouse button release
  if (event.button !== 0) {
    return;
  }

  const currentSelectionText = window.getSelection().toString();

  if (currentSelectionText.trim()) {
    // Avoid triggering if the selection is inside an input field,
    // textarea, or contentEditable element for general mouseup selections.
    // The Ctrl+DblClick is more explicit and will work in these fields.
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let node = selection.anchorNode;
      // Find the element node containing the start of the selection
      let element = (node.nodeType === Node.TEXT_NODE) ? node.parentNode : node;
      let inEditableField = false;
      while (element && element !== document.body && element.nodeType === Node.ELEMENT_NODE) {
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || element.isContentEditable) {
          inEditableField = true;
          break;
        }
        element = element.parentNode;
      }

      if (inEditableField) {
        // console.log("WaniKani Lookup: Mouseup selection is within an editable field. Skipping non-explicit trigger.");
        return;
      }
    }
    processAndOpenWaniKani(currentSelectionText, false);
  }
});