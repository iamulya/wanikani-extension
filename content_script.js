let lastProcessedTimestamp = 0;
const debounceTime = 100; // milliseconds

function processAndOpenWaniKani(text, isExplicitTrigger = false) {
  const rawSelectedText = text; // Keep original for logging
  const selectedText = text.trim();

  // --- START DIAGNOSTIC LOGGING ---
  console.log("[WaniKani Ext Debug] Raw selected text: |" + rawSelectedText + "| Length:", rawSelectedText.length);
  console.log("[WaniKani Ext Debug] Trimmed selected text: |" + selectedText + "| Length:", selectedText.length);
  // Using pipes |...| to clearly see if there's leading/trailing whitespace missed by trim.
  // --- END DIAGNOSTIC LOGGING ---

  if (!selectedText) {
    console.log("[WaniKani Ext Debug] Trimmed selected text is empty. Exiting.");
    return false;
  }

  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/;
  if (!japaneseRegex.test(selectedText)) {
    console.log(`[WaniKani Ext Debug] Selection "${selectedText}" does NOT pass Japanese regex. Exiting.`);
    return false;
  }
  console.log(`[WaniKani Ext Debug] Selection "${selectedText}" PASSES Japanese regex.`);


  let wanikaniUrlPrefix;
  let isValidSelection = false;

  console.log(`[WaniKani Ext Debug] Evaluating length conditions for trimmed text: "${selectedText}" (length: ${selectedText.length})`);

  if (selectedText.length === 1) {
    console.log("[WaniKani Ext Debug] Condition: selectedText.length === 1 is TRUE. Using KANJI prefix.");
    wanikaniUrlPrefix = "https://www.wanikani.com/kanji/";
    isValidSelection = true;
  } else if (selectedText.length > 1 && selectedText.length < 50 && !selectedText.includes('\n')) {
    // This is the branch it's incorrectly taking for "提"
    console.log("[WaniKani Ext Debug] Condition: selectedText.length > 1 (and other vocab criteria) is TRUE. Using VOCABULARY prefix.");
    wanikaniUrlPrefix = "https://www.wanikani.com/vocabulary/";
    isValidSelection = true;
  } else {
    // This case would be if length is 0 after regex, or >= 50, or includes newline
    console.log("[WaniKani Ext Debug] None of the primary length conditions (single char, or multi-char vocab) were met.");
  }


  if (!isValidSelection) {
    console.log(`[WaniKani Ext Debug] isValidSelection is FALSE for "${selectedText}". Exiting.`);
    return false;
  }

  const now = Date.now();
  if (now - lastProcessedTimestamp < debounceTime) {
    console.log("[WaniKani Ext Debug] Debounced. Exiting.");
    return false;
  }

  const encodedText = encodeURIComponent(selectedText);
  const wanikaniUrl = `${wanikaniUrlPrefix}${encodedText}`;
  console.log(`[WaniKani Ext Debug] Attempting to open URL: ${wanikaniUrl}`);
  window.open(wanikaniUrl, '_blank');
  lastProcessedTimestamp = now;

  return true;
}

// Listener 1: Ctrl/Cmd + Double Click (NO CHANGES HERE)
document.addEventListener('dblclick', function(event) {
  if (event.ctrlKey || event.metaKey) {
    const currentSelection = window.getSelection().toString();
    // console.log("[WaniKani Ext Debug] DblClick Triggered. Raw selection from window: |" + currentSelection + "|");
    if (currentSelection.trim()) { // .trim() here is important before passing to function
        processAndOpenWaniKani(currentSelection, true);
    }
  }
});

// Listener 2: Text Selection (on mouse button release) (NO CHANGES HERE)
document.addEventListener('mouseup', function(event) {
  if (event.button !== 0) return;

  const currentSelectionText = window.getSelection().toString();
  // console.log("[WaniKani Ext Debug] MouseUp Triggered. Raw selection from window: |" + currentSelectionText + "|");

  if (currentSelectionText.trim()) { // .trim() here is important
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let element = (selection.anchorNode.nodeType === Node.TEXT_NODE) ? selection.anchorNode.parentNode : selection.anchorNode;
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
        // console.log("[WaniKani Ext Debug] MouseUp selection in editable field. Skipping.");
        return;
      }
    }
    processAndOpenWaniKani(currentSelectionText, false);
  }
});