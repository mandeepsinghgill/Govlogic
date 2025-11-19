/* global Office */

let authToken = null;
const API_BASE_URL = 'https://api.govsureai.com/api/v1/word-addin';

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.addEventListener("DOMContentLoaded", initializeAddIn);
  }
});

function initializeAddIn() {
  // Check if user is already logged in
  authToken = localStorage.getItem('govsure_access_token');
  
  if (authToken) {
    showMainSection();
  } else {
    showLoginSection();
  }

  setupEventListeners();
}

function setupEventListeners() {
  // Login
  document.getElementById("login-btn")?.addEventListener("click", handleLogin);
  
  // Generate content
  document.getElementById("generate-btn")?.addEventListener("click", generateContent);
  
  // Check compliance
  document.getElementById("compliance-btn")?.addEventListener("click", checkCompliance);
  
  // Analyze document
  document.getElementById("analyze-btn")?.addEventListener("click", analyzeDocument);
  
  // Get suggestions
  document.getElementById("suggest-btn")?.addEventListener("click", getSuggestions);
  
  // Close results
  document.getElementById("close-results")?.addEventListener("click", () => {
    document.getElementById("results-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";
  });
}

function showLoginSection() {
  document.getElementById("login-section").style.display = "block";
  document.getElementById("main-section").style.display = "none";
}

function showMainSection() {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("main-section").style.display = "block";
}

async function handleLogin() {
  // Open login in new window
  const loginUrl = 'https://app.govsureai.com/login?redirect=word-addin';
  window.open(loginUrl, '_blank');
  
  // For now, we'll use a simple token input (in production, use OAuth)
  const token = prompt('Enter your GovSure AI access token:');
  if (token) {
    authToken = token;
    localStorage.setItem('govsure_access_token', token);
    showMainSection();
  }
}

async function generateContent() {
  showLoading(true);
  
  try {
    const sectionType = document.getElementById("section-type").value;
    const wordCount = parseInt(document.getElementById("word-count").value);
    const selectedText = await getSelectedText();
    
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        section_type: sectionType,
        context: selectedText || '',
        word_count: wordCount
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate content');
    }
    
    const data = await response.json();
    
    // Insert generated content into Word
    await insertText(data.content);
    
    showResults(`✅ Content generated and inserted successfully!\n\nGenerated ${data.word_count} words.`);
    showLoading(false);
  } catch (error) {
    showError(`Failed to generate content: ${error.message}`);
    showLoading(false);
  }
}

async function checkCompliance() {
  showLoading(true);
  
  try {
    const documentContent = await getDocumentContent();
    
    const response = await fetch(`${API_BASE_URL}/compliance-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        content: documentContent,
        standards: ['FAR', 'DFARS']
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check compliance');
    }
    
    const data = await response.json();
    
    let resultHtml = `
      <h4>Compliance Score: ${data.score}/100</h4>
      <p>Status: ${data.compliant ? '✅ Compliant' : '⚠️ Needs Review'}</p>
    `;
    
    if (data.issues && data.issues.length > 0) {
      resultHtml += '<h5>Issues Found:</h5><ul>';
      data.issues.forEach(issue => {
        resultHtml += `<li>${issue}</li>`;
      });
      resultHtml += '</ul>';
    }
    
    if (data.recommendations && data.recommendations.length > 0) {
      resultHtml += '<h5>Recommendations:</h5><ul>';
      data.recommendations.forEach(rec => {
        resultHtml += `<li>${rec}</li>`;
      });
      resultHtml += '</ul>';
    }
    
    showResults(resultHtml);
    showLoading(false);
  } catch (error) {
    showError(`Failed to check compliance: ${error.message}`);
    showLoading(false);
  }
}

async function analyzeDocument() {
  showLoading(true);
  
  try {
    const documentContent = await getDocumentContent();
    
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        content: documentContent,
        context: 'word-addin'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze document');
    }
    
    const data = await response.json();
    
    let resultHtml = `
      <h4>Document Analysis</h4>
      <p>Compliance Score: ${data.compliance_score || 'N/A'}</p>
    `;
    
    if (data.suggestions && data.suggestions.length > 0) {
      resultHtml += '<h5>Suggestions:</h5><ul>';
      data.suggestions.forEach(suggestion => {
        resultHtml += `<li>${suggestion}</li>`;
      });
      resultHtml += '</ul>';
    }
    
    showResults(resultHtml);
    showLoading(false);
  } catch (error) {
    showError(`Failed to analyze document: ${error.message}`);
    showLoading(false);
  }
}

async function getSuggestions() {
  showLoading(true);
  
  try {
    const selectedText = await getSelectedText();
    
    if (!selectedText || selectedText.trim().length === 0) {
      showError('Please select some text in Word first.');
      showLoading(false);
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        selected_text: selectedText
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get suggestions');
    }
    
    const data = await response.json();
    
    let resultHtml = '<h4>Suggestions for Selected Text:</h4><ul>';
    data.suggestions.forEach(suggestion => {
      resultHtml += `<li>${suggestion}</li>`;
    });
    resultHtml += '</ul>';
    
    showResults(resultHtml);
    showLoading(false);
  } catch (error) {
    showError(`Failed to get suggestions: ${error.message}`);
    showLoading(false);
  }
}

async function getDocumentContent() {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      const body = context.document.body;
      context.load(body, 'text');
      
      await context.sync();
      resolve(body.text);
    }).catch(reject);
  });
}

async function getSelectedText() {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load('text');
      
      await context.sync();
      resolve(selection.text);
    }).catch(() => resolve(''));
  });
}

async function insertText(text) {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.insertText(text, Word.InsertLocation.replace);
      
      await context.sync();
      resolve();
    }).catch(reject);
  });
}

function showResults(html) {
  document.getElementById("results-content").innerHTML = html;
  document.getElementById("results-section").style.display = "block";
  document.getElementById("main-section").style.display = "none";
}

function showError(message) {
  showResults(`<div class="error">❌ ${message}</div>`);
}

function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
}

