/* global Office */

// The initialize function must be run each time a new page is loaded.
Office.onReady(() => {
  // If needed, you can address the other Office.js APIs here.
});

/**
 * Generate content function called from menu
 */
function generateContent(event) {
  // Get selected text
  Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.load('text');
    
    await context.sync();
    const selectedText = selection.text;
    
    // Show taskpane with generate action
    Office.context.ui.displayDialogAsync(
      'https://app.govsureai.com/word-addin/taskpane.html?action=generate',
      { height: 60, width: 30 },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          console.error(result.error);
        }
      }
    );
    
    event.completed();
  }).catch((error) => {
    console.error(error);
    event.completed();
  });
}

/**
 * Check compliance function called from menu
 */
function checkCompliance(event) {
  // Show taskpane with compliance check action
  Office.context.ui.displayDialogAsync(
    'https://app.govsureai.com/word-addin/taskpane.html?action=compliance',
    { height: 60, width: 30 },
    (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        console.error(result.error);
      }
    }
  );
  
  event.completed();
}

