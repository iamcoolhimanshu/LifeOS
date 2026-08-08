document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('loginView');
  const clipperView = document.getElementById('clipperView');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeIcon = document.getElementById('eyeIcon');
  const loginBtn = document.getElementById('loginBtn');
  const loggedInUser = document.getElementById('loggedInUser');
  const logoutLink = document.getElementById('logoutLink');
  
  const categorySelect = document.getElementById('categorySelect');
  const titleInput = document.getElementById('titleInput');
  const contentInput = document.getElementById('contentInput');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMessage');

  // Server Settings UI Elements
  const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const serverUrlInput = document.getElementById('serverUrlInput');
  const activeServerBadge = document.getElementById('activeServerBadge');
  const saveServerUrlBtn = document.getElementById('saveServerUrlBtn');
  const presetProdBtn = document.getElementById('presetProdBtn');
  const presetLocalBtn = document.getElementById('presetLocalBtn');

  const DEFAULT_LOCAL_URL = 'http://localhost:8080';
  const DEFAULT_PROD_URL = 'https://lifeos-backend-qxsy.onrender.com'; // or render backend URL

  // SVG paths for Eye / Eye-Off icons
  const EYE_OPEN_PATH = 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z';
  const EYE_OFF_PATH = 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2z';

  // Toggle show / hide password
  if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      eyeIcon.querySelector('path').setAttribute('d', isPassword ? EYE_OFF_PATH : EYE_OPEN_PATH);
      togglePasswordBtn.title = isPassword ? 'Hide Password' : 'Show Password';
    });
  }

  // Get sanitized base URL without trailing slashes or duplicate /api
  function getBaseUrl() {
    let raw = localStorage.getItem('lifeos_server_url') || DEFAULT_LOCAL_URL;
    raw = raw.trim().replace(/\/+$/, '');
    if (raw.endsWith('/api')) {
      raw = raw.substring(0, raw.length - 4).replace(/\/+$/, '');
    }
    return raw;
  }

  // Update server URL UI display
  function updateServerBadge() {
    const currentUrl = getBaseUrl();
    activeServerBadge.textContent = `API Server: ${currentUrl}`;
    serverUrlInput.value = currentUrl;
  }

  // Toggle settings panel
  toggleSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
  });

  // Save server URL button
  saveServerUrlBtn.addEventListener('click', () => {
    let inputUrl = serverUrlInput.value.trim();
    if (!inputUrl) {
      inputUrl = DEFAULT_LOCAL_URL;
    }
    // Ensure protocol prefix
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = 'http://' + inputUrl;
    }
    inputUrl = inputUrl.replace(/\/+$/, '');
    if (inputUrl.endsWith('/api')) {
      inputUrl = inputUrl.substring(0, inputUrl.length - 4).replace(/\/+$/, '');
    }
    localStorage.setItem('lifeos_server_url', inputUrl);
    updateServerBadge();
    settingsPanel.classList.remove('active');
    showStatus(`Server URL saved: ${inputUrl}`, 'success');
  });

  // Preset buttons
  presetProdBtn.addEventListener('click', () => {
    serverUrlInput.value = DEFAULT_PROD_URL;
  });

  presetLocalBtn.addEventListener('click', () => {
    serverUrlInput.value = DEFAULT_LOCAL_URL;
  });

  // Initial load
  updateServerBadge();
  updateViewState();

  // Switch views and fetch data based on authorization state
  function updateViewState() {
    const token = localStorage.getItem('lifeos_clipper_token');
    const username = localStorage.getItem('lifeos_clipper_username');
    
    if (token) {
      loginView.style.display = 'none';
      clipperView.style.display = 'block';
      loggedInUser.textContent = username || 'User';
      loadTabContent();
    } else {
      loginView.style.display = 'block';
      clipperView.style.display = 'none';
      loggedInUser.textContent = '';
    }
  }

  // Load active tab details into inputs
  function loadTabContent() {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          const activeTab = tabs[0];
          titleInput.value = activeTab.title || 'Clipped Web Page';
          contentInput.value = `URL: ${activeTab.url || ''}\n\n[Clipping details gathered from browser tab]`;
        }
      });
    } else {
      titleInput.value = 'Local Web Page';
      contentInput.value = 'URL: http://localhost\n\n[Clipping details gathered from browser tab]';
    }
  }

  // Handle Login Click
  loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const baseUrl = getBaseUrl();
    const authEndpoint = `${baseUrl}/api/auth/signin`;

    if (!username) {
      showStatus('Please enter your username.', 'error');
      return;
    }
    if (!password) {
      showStatus('Please enter your password.', 'error');
      return;
    }

    showStatus(`Connecting to ${baseUrl}...`, '');

    try {
      const response = await fetch(authEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken || data.token;
        const user = data.username || username;

        if (token) {
          localStorage.setItem('lifeos_clipper_token', token);
          localStorage.setItem('lifeos_clipper_username', user);
          
          // Clear inputs
          usernameInput.value = '';
          passwordInput.value = '';
          
          showStatus('Successfully logged in!', 'success');
          
          setTimeout(() => {
            statusMsg.style.display = 'none';
            updateViewState();
          }, 1000);
        } else {
          showStatus('Error: Invalid response format from server.', 'error');
        }
      } else if (response.status === 404) {
        showStatus(`Status 404: Endpoint not found at ${authEndpoint}. Please check Server URL settings (⚙️) points to your Spring Boot API (e.g. http://localhost:8080).`, 'error');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showStatus(errorData.message || `Login failed. Status: ${response.status}`, 'error');
      }
    } catch (err) {
      showStatus(`Failed to connect to ${baseUrl}. Make sure your backend server is running and CORS is enabled.`, 'error');
    }
  });

  // Handle Logout Click
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('lifeos_clipper_token');
    localStorage.removeItem('lifeos_clipper_username');
    statusMsg.style.display = 'none';
    updateViewState();
  });

  // Handle Note Save Click
  saveBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('lifeos_clipper_token');
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const category = categorySelect ? categorySelect.value : 'Clipped';
    const baseUrl = getBaseUrl();
    const notesEndpoint = `${baseUrl}/api/notes`;

    if (!token) {
      showStatus('Session expired. Please log in again.', 'error');
      updateViewState();
      return;
    }
    if (!title) {
      showStatus('Please enter a note title.', 'error');
      return;
    }

    showStatus('Saving web clip...', '');

    try {
      const response = await fetch(notesEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          content: content,
          category: category,
          tags: 'web-clipper'
        })
      });

      if (response.ok) {
        showStatus('Web page successfully clipped to LifeOS!', 'success');
        contentInput.value = '';
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('lifeos_clipper_token');
        localStorage.removeItem('lifeos_clipper_username');
        showStatus('Session expired. Please log in again.', 'error');
        setTimeout(() => {
          updateViewState();
        }, 1500);
      } else if (response.status === 404) {
        showStatus(`Status 404: Endpoint not found at ${notesEndpoint}. Check Server URL settings (⚙️).`, 'error');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showStatus(errorData.message || `Error saving note. Status: ${response.status}`, 'error');
      }
    } catch (err) {
      showStatus(`Failed to connect to ${baseUrl}. Make sure your backend server is running.`, 'error');
    }
  });

  function showStatus(msg, type) {
    statusMsg.innerText = msg;
    statusMsg.className = 'status';
    if (type) {
      statusMsg.classList.add(type);
    } else {
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#06b6d4';
      statusMsg.style.background = 'rgba(6, 182, 212, 0.1)';
      statusMsg.style.border = '1px solid rgba(6, 182, 212, 0.2)';
    }
  }
});
