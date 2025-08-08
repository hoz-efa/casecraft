// Global variables
let troubleshootingSteps = [];
let draggedElement = null;
let currentTheme = 'light';
let equipmentSNs = [];
let equipmentModels = [];
let resolutions = [];
let ticketNumbers = [];
let infoAssistDocs = [];
let flowParagraphs = [];
let agentAssistSummaries = [];

// Call Back Scheduler and Tracker functionality
let callbacks = JSON.parse(localStorage.getItem('callbacks') || '[]');
let currentScheduledCalls = [];

// Add a flag to track if user has manually modified SPINS fields
let spinsFieldsModified = false;

// Add a flag to track if localStorage has been cleared
let localStorageCleared = false;

// Function to clear old localStorage data
function clearOldLocalStorageData() {
    // Clear any old form data that might persist
    const oldKeys = [
        'caseNotes_contactId', 'caseNotes_spokenTo', 'caseNotes_phoneNumber', 'caseNotes_callBackNo',
        'caseNotes_reasonOfCall', 'caseNotes_verificationCompleted', 'caseNotes_authenticationMethod',
        'spins_customerName', 'spins_spinsPhoneNumber', 'spins_serialNumber', 'spins_equipmentNameModel',
        'spins_issue', 'spins_caseNumber', 'spins_customIssues', 'spins_toolsInfo', 'spins_customInstructions',
        'caseNotes_equipmentSNs', 'caseNotes_equipmentModels', 'caseNotes_resolutions', 'caseNotes_ticketNumbers',
        'caseNotes_infoAssist', 'caseNotes_flowParagraphs', 'caseNotes_agentAssistSummaries'
    ];
    
    oldKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Clear all SPINS form field localStorage keys
    const spinsFieldIds = [
        'customerName', 'spinsPhoneNumber', 'serialNumber', 'equipmentNameModel', 'issue', 
        'caseNumber', 'customIssues', 'toolsInfo', 'customInstructions'
    ];
    
    spinsFieldIds.forEach(fieldId => {
        localStorage.removeItem(`spins_${fieldId}`);
    });
    
    // Clear all case notes form field localStorage keys that could affect SPINS auto-population
    const caseNotesFieldIds = [
        'contactId', 'spokenTo', 'phoneNumber', 'callBackNo', 'reasonOfCall'
    ];
    
    caseNotesFieldIds.forEach(fieldId => {
        localStorage.removeItem(`caseNotes_${fieldId}`);
    });
    
    // Clear floating troubleshooting input
    const floatingInput = document.getElementById('floatingStepInput');
    if (floatingInput) {
        floatingInput.value = '';
        floatingInput.style.height = 'auto';
    }
    
    // Set the flag to indicate localStorage has been cleared
    localStorageCleared = true;
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeCallBackScheduler();
    
    // Clear any old localStorage data after all initialization is complete
    setTimeout(() => {
        clearOldLocalStorageData();
    }, 100);
});

function initializeApp() {
    setupTheme();
    setupTabSwitching();
    setupTroubleshootingSteps();
    setupFormHandlers();
    setupAutoPopulation();
    setupInputActions();
    setupReasonSelector();
    setupRadioButtons(); // New consolidated radio button setup
    setupEquipmentInputs(); // New equipment input setup
    setupLiveSpinsUpdate(); // Setup SPINS live updates
    setupRankingsModal(); // Setup rankings modal
    setupCustomStepsModal(); // Setup custom steps modal
    setupFormatterSettingsModal(); // Setup formatter settings modal
    setupAdminControls(); // Setup admin controls
    
    // Ensure initial tab state is correct
    const caseNotesTab = document.getElementById('case-notes');
    const spinsTab = document.getElementById('spins');
    const caseNotesOutput = document.getElementById('caseNotesOutput');
    const spinsOutput = document.getElementById('spinsOutput');
    
    // Setup initial floating action button state
    const caseNotesFabGroup = document.getElementById('caseNotesFabGroup');
    const spinsFabGroup = document.getElementById('spinsFabGroup');
    
    if (caseNotesTab) {
        caseNotesTab.style.display = 'block';
        caseNotesTab.classList.add('active');
        // Show case notes output and floating buttons
        if (caseNotesOutput) caseNotesOutput.style.display = 'block';
        if (caseNotesFabGroup) caseNotesFabGroup.style.display = 'flex';
    }
    if (spinsTab) {
        spinsTab.style.display = 'none';
        spinsTab.classList.remove('active');
        // Hide SPINS output and floating buttons
        if (spinsOutput) spinsOutput.style.display = 'none';
        if (spinsFabGroup) spinsFabGroup.style.display = 'none';
    }
    
    // Set the first tab button as active
    const firstTabBtn = document.querySelector('.tab-btn');
    if (firstTabBtn) {
        firstTabBtn.classList.add('active');
    }
}

// Theme functionality
function setupTheme() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('caseNotesTheme') || 'light';
    setTheme(savedTheme);
    
    // Setup theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Setup About page
    setupAboutPage();
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('caseNotesTheme', theme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setupAboutPage() {
    const aboutToggle = document.getElementById('aboutToggle');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModal = document.getElementById('closeAboutModal');
    const aboutModalBody = aboutModal.querySelector('.about-modal-body');
    
    if (aboutToggle) {
        aboutToggle.addEventListener('click', () => {
            aboutModal.classList.add('show');
            // Reset scroll position to top with a small delay to ensure modal is visible
            setTimeout(() => {
                if (aboutModalBody) {
                    aboutModalBody.scrollTop = 0;
                }
            }, 100);
        });
    }
    
    if (closeAboutModal) {
        closeAboutModal.addEventListener('click', () => {
            aboutModal.classList.remove('show');
            // Reset scroll position when closing
            if (aboutModalBody) {
                aboutModalBody.scrollTop = 0;
            }
        });
    }
    
    // Close modal when clicking outside
    if (aboutModal) {
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) {
                aboutModal.classList.remove('show');
                // Reset scroll position when closing
                if (aboutModalBody) {
                    aboutModalBody.scrollTop = 0;
                }
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal.classList.contains('show')) {
            aboutModal.classList.remove('show');
            // Reset scroll position when closing
            if (aboutModalBody) {
                aboutModalBody.scrollTop = 0;
            }
        }
    });

    // Setup admin controls (hidden by default)
    setupAdminControls();
}

// Tab switching functionality
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const floatingInput = document.getElementById('floatingTroubleshootingInput');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            console.log('Switching to tab:', targetTab);
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                // Ensure all tab contents are hidden
                content.style.display = 'none';
            });
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
                console.log('Tab content activated:', targetTab);
                
                // Show/hide output containers and copy buttons based on active tab
                const caseNotesOutput = document.getElementById('caseNotesOutput');
                const spinsOutput = document.getElementById('spinsOutput');
                
                // Show/hide floating action buttons based on active tab
                const caseNotesFabGroup = document.getElementById('caseNotesFabGroup');
                const spinsFabGroup = document.getElementById('spinsFabGroup');
                
                if (targetTab === 'spins') {
                    // Show SPINS output and floating buttons, hide case notes
                    if (spinsOutput) spinsOutput.style.display = 'block';
                    if (caseNotesOutput) caseNotesOutput.style.display = 'none';
                    
                    // Show SPINS floating buttons, hide case notes floating buttons
                    if (spinsFabGroup) spinsFabGroup.style.display = 'flex';
                    if (caseNotesFabGroup) caseNotesFabGroup.style.display = 'none';
                    
                    // Hide floating troubleshooting input
                    if (floatingInput) floatingInput.classList.remove('active');
                    
                    updateSpinsLive();
                } else if (targetTab === 'case-notes') {
                    // Show case notes output and floating buttons, hide SPINS
                    if (caseNotesOutput) caseNotesOutput.style.display = 'block';
                    if (spinsOutput) spinsOutput.style.display = 'none';
                    
                    // Show case notes floating buttons, hide SPINS floating buttons
                    if (caseNotesFabGroup) caseNotesFabGroup.style.display = 'flex';
                    if (spinsFabGroup) spinsFabGroup.style.display = 'none';
                    
                    // Show floating troubleshooting input
                    if (floatingInput) floatingInput.classList.add('active');
                    
                    // Check position after showing the input
                    setTimeout(() => {
                        adjustTroubleshootingInputPosition();
                    }, 100);
                    
                    updateCaseNotesLive();
                } else {
                    // Hide floating troubleshooting input for other tabs
                    if (floatingInput) floatingInput.classList.remove('active');
                }
            } else {
                console.error('Target tab content not found:', targetTab);
            }
        });
    });

    // Show floating input on initial load if case-notes tab is active
    if (document.querySelector('.tab-btn.active').getAttribute('data-tab') === 'case-notes') {
        if (floatingInput) floatingInput.classList.add('active');
        // Check position on initial load
        setTimeout(() => {
            adjustTroubleshootingInputPosition();
        }, 100);
    }
    
    // Setup window resize listener for position adjustment
    window.addEventListener('resize', () => {
        if (floatingInput && floatingInput.classList.contains('active')) {
            adjustTroubleshootingInputPosition();
        }
    });
    
    // Setup scroll listener for position adjustment with debouncing
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (floatingInput && floatingInput.classList.contains('active')) {
            // Clear existing timeout
            clearTimeout(scrollTimeout);
            // Debounce the position adjustment
            scrollTimeout = setTimeout(() => {
                adjustTroubleshootingInputPosition();
            }, 100);
        }
    });
}

function adjustTroubleshootingInputPosition() {
    const floatingInput = document.getElementById('floatingTroubleshootingInput');
    const actionButtons = document.getElementById('floatingActionButtons');
    
    if (!floatingInput || !actionButtons) return;
    
    // Only adjust on case-notes tab
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab || activeTab.getAttribute('data-tab') !== 'case-notes') {
        // Reset buttons to normal position on other tabs
        actionButtons.classList.remove('adjusted');
        return;
    }
    
    const inputRect = floatingInput.getBoundingClientRect();
    const buttonsRect = actionButtons.getBoundingClientRect();
    
    // Calculate the distance between input bottom and buttons top
    const distance = buttonsRect.top - inputRect.bottom;
    
    // Use a more stable threshold (15px) and add hysteresis to prevent jittering
    const threshold = 15;
    const hysteresis = 5; // Buffer zone to prevent rapid switching
    
    const isCurrentlyAdjusted = actionButtons.classList.contains('adjusted');
    
    if (isCurrentlyAdjusted) {
        // If currently adjusted, only remove adjustment if there's enough space
        if (distance > threshold + hysteresis) {
            actionButtons.classList.remove('adjusted');
        }
    } else {
        // If not adjusted, only add adjustment if too close
        if (distance < threshold - hysteresis) {
            actionButtons.classList.add('adjusted');
        }
    }
}

// Troubleshooting steps functionality
function setupTroubleshootingSteps() {
    const stepsList = document.getElementById('stepsList');

    // Initialize drag and drop
    setupDragAndDrop();

    // Setup floating troubleshooting input
    setupFloatingTroubleshootingInput();
    
    // Setup default steps selector
    setupDefaultStepsSelector();
}

function setupFloatingTroubleshootingInput() {
    const floatingInput = document.getElementById('floatingStepInput');
    const floatingAddBtn = document.getElementById('floatingAddStepBtn');
    const autocomplete = document.getElementById('floatingAutocomplete');

    if (!floatingInput || !floatingAddBtn || !autocomplete) return;

    let currentAutocompleteResults = [];
    let selectedIndex = -1;

    // Send button click handler
    floatingAddBtn.addEventListener('click', addFloatingTroubleshootingStep);
    
    // Enhanced key handler for multi-line support and autocomplete
    floatingInput.addEventListener('keydown', function(e) {
        const autocompleteItems = autocomplete.querySelectorAll('.floating-autocomplete-item');
        
        if (autocompleteItems.length > 0) {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    selectedIndex = Math.min(selectedIndex + 1, autocompleteItems.length - 1);
                    updateSelectedAutocompleteItem(autocompleteItems, selectedIndex);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    selectedIndex = Math.max(selectedIndex - 1, -1);
                    updateSelectedAutocompleteItem(autocompleteItems, selectedIndex);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && currentAutocompleteResults[selectedIndex]) {
                        selectAutocompleteItem(currentAutocompleteResults[selectedIndex].text);
                    } else {
                        addFloatingTroubleshootingStep();
                    }
                    break;
                case 'Escape':
                    hideAutocomplete();
                    selectedIndex = -1;
                    break;
            }
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addFloatingTroubleshootingStep();
        }
    });

    // Auto-resize textarea (max 2 lines)
    floatingInput.addEventListener('input', function() {
        this.style.height = 'auto';
        const lineHeight = parseInt(window.getComputedStyle(this).lineHeight);
        const maxHeight = lineHeight * 2; // 2 lines max
        this.style.height = Math.min(this.scrollHeight, maxHeight) + 'px';
        
        // Handle autocomplete
        const query = this.value.trim();
        if (query.length >= 2) {
            currentAutocompleteResults = searchDefaultSteps(query);
            displayAutocompleteResults(currentAutocompleteResults);
            selectedIndex = -1;
        } else {
            hideAutocomplete();
            selectedIndex = -1;
        }
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!floatingInput.contains(e.target) && !autocomplete.contains(e.target) && !floatingAddBtn.contains(e.target)) {
            hideAutocomplete();
            selectedIndex = -1;
        }
    });
}

// Text formatting functions for modem data
function formatUpstreamChannels(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Find lines that contain upstream channel data (look for frequency and transmit level patterns)
    const channelLines = lines.filter(line => {
        return line.includes('cable-upstream') && 
               (line.includes('MHz') || /\d+\.?\d*\s*MHz/.test(line)) &&
               /\d+\.?\d*\s+\d+\.?\d*/.test(line); // Contains numeric data
    });
    
    if (channelLines.length === 0) return text;
    
    const formattedLines = ['Upstream Frequency    Tx'];
    
    channelLines.forEach(line => {
        // Extract channel name, frequency, and transmit level
        const parts = line.split(/\s+/);
        let channelName = '', frequency = '', txLevel = '';
        
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].includes('cable-upstream')) {
                channelName = parts[i];
            } else if (parts[i].includes('MHz')) {
                frequency = parts[i];
                // Transmit level is usually the next numeric value
                if (i + 1 < parts.length && /^\d+\.?\d*$/.test(parts[i + 1])) {
                    txLevel = parts[i + 1];
                }
                break;
            }
        }
        
        if (frequency && txLevel) {
            formattedLines.push(`${frequency}    ${txLevel}`);
        }
    });
    
    return formattedLines.length > 1 ? formattedLines.join('\n') : text;
}

function formatDownstreamChannels(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Find lines that contain downstream channel data
    const channelLines = lines.filter(line => {
        return line.includes('cable-downstream') && 
               line.includes('MHz') &&
               /-?\d+\.?\d*/.test(line); // Contains negative or positive numbers (Rx levels)
    });
    
    if (channelLines.length === 0) return text;
    
    const formattedLines = ['Downstream Frequency    Rx'];
    
    channelLines.forEach(line => {
        // Extract frequency and receive level
        const parts = line.split(/\s+/);
        let frequency = '', rxLevel = '';
        
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].includes('MHz')) {
                frequency = parts[i];
                // Receive level is usually the next value (could be negative)
                if (i + 1 < parts.length && /-?\d+\.?\d*$/.test(parts[i + 1])) {
                    rxLevel = parts[i + 1];
                }
                break;
            }
        }
        
        if (frequency && rxLevel) {
            formattedLines.push(`${frequency}    ${rxLevel}`);
        }
    });
    
    return formattedLines.length > 1 ? formattedLines.join('\n') : text;
}

function formatOFDMInfo(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for lines with just frequency and Rx level (like "812 MHz	-11.3")
    const dataLines = lines.filter(line => {
        // Match lines that start with frequency and have a negative number
        return /^\d+\s*MHz\s+-?\d+\.?\d*\s*$/.test(line) && 
               !line.includes('OFDM') && 
               !line.includes('Channel') &&
               !line.includes('Subcarrier');
    });
    
    // Also handle the first data line which might have more complex format
    // Look for lines like "807-987 MHz	807 MHz	-12.1	36.7"
    const complexLines = lines.filter(line => {
        return line.includes('807 MHz') && line.includes('-12.1');
    });
    
    if (dataLines.length === 0 && complexLines.length === 0) return text;
    
    const formattedLines = ['OFDM Subcarrier Rx Levels:'];
    
    // Handle complex first line
    complexLines.forEach(line => {
        // Extract the specific values: look for "807 MHz" followed by "-12.1"
        const match = line.match(/807\s*MHz\s+(-?\d+\.?\d*)/);
        if (match) {
            const rxLevel = match[1];
            formattedLines.push(`807 MHz: ${rxLevel}`);
        }
    });
    
    // Handle simple frequency lines
    dataLines.forEach(line => {
        // Extract frequency and Rx level from simple format
        const match = line.match(/(\d+)\s*MHz\s+(-?\d+\.?\d*)/);
        if (match) {
            const frequency = match[1];
            const rxLevel = match[2];
            formattedLines.push(`${frequency} MHz: ${rxLevel}`);
        }
    });
    
    return formattedLines.length > 1 ? formattedLines.join('\n') : text;
}

function formatOFDMChannelTable(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Find lines that contain cable-ds-ofdm data
    const channelLines = lines.filter(line => {
        return line.includes('cable-ds-ofdm') && 
               line.includes('MHz') &&
               (line.includes('Available') || line.includes('Preferred'));
    });
    
    if (channelLines.length === 0) return text;
    
    const formattedLines = ['OFDM Channel Information:'];
    
    channelLines.forEach(line => {
        // Split by tabs or multiple spaces
        const parts = line.split(/\s{2,}|\t/).filter(part => part.trim().length > 0);
        
        if (parts.length >= 4) {
            const channelName = parts[0];
            const status = parts[1];
            const frequency = parts[2];
            const bandwidth = parts[3];
            
            formattedLines.push(`${channelName} (${status}): ${frequency}, ${bandwidth}`);
        }
    });
    
    return formattedLines.length > 1 ? formattedLines.join('\n') : text;
}

function formatModemData(text) {
    // Check which type of data this is and apply appropriate formatting if enabled
    
    if (text.includes('Upstream') && text.includes('cable-upstream')) {
        const formatterEnabled = localStorage.getItem('upstreamFormatterEnabled') === 'true';
        return formatterEnabled ? formatUpstreamChannels(text) : text;
    }
    
    if (text.includes('Downstream') && text.includes('cable-downstream')) {
        const formatterEnabled = localStorage.getItem('downstreamFormatterEnabled') === 'true';
        return formatterEnabled ? formatDownstreamChannels(text) : text;
    }
    
    if (text.includes('OFDM Info') && text.includes('MHz') && !text.includes('cable-ds-ofdm')) {
        const formatterEnabled = localStorage.getItem('ofdmInfoFormatterEnabled') === 'true';
        return formatterEnabled ? formatOFDMInfo(text) : text;
    }
    
    if (text.includes('cable-ds-ofdm')) {
        const formatterEnabled = localStorage.getItem('ofdmTableFormatterEnabled') === 'true';
        return formatterEnabled ? formatOFDMChannelTable(text) : text;
    }
    
    if (text.includes('Appears to be a larger issue') && text.includes('modems offline at or near:')) {
        const formatterEnabled = localStorage.getItem('modemsOfflineFormatterEnabled') === 'true';
        return formatterEnabled ? formatModemsOffline(text) : text;
    }
    
    // If no specific pattern matches, return original text
    return text;
}

function addFloatingTroubleshootingStep() {
    const floatingInput = document.getElementById('floatingStepInput');
    let stepText = floatingInput.value.trim();
    
    if (stepText) {
        // Apply intelligent formatting if it looks like modem data
        if (stepText.includes('MHz') && (stepText.includes('cable-') || stepText.includes('OFDM'))) {
            stepText = formatModemData(stepText);
        }
        
        troubleshootingSteps.push(stepText);
        floatingInput.value = '';
        floatingInput.style.height = 'auto'; // Reset height
        hideAutocomplete(); // Hide autocomplete when adding step
        renderTroubleshootingSteps();
        floatingInput.focus();
        
        // Trigger live update
        updateCaseNotesLive();
    }
}

function updateSelectedAutocompleteItem(autocompleteItems, selectedIndex) {
    autocompleteItems.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

function displayAutocompleteResults(results) {
    const autocomplete = document.getElementById('floatingAutocomplete');
    
    if (results.length === 0) {
        // Hide autocomplete completely when no results
        autocomplete.style.display = 'none';
        return;
    }
    
    autocomplete.innerHTML = results.map(result => `
        <div class="floating-autocomplete-item" onclick="selectAutocompleteItem('${result.text.replace(/'/g, "\\'")}')">
            <div class="autocomplete-text">${result.text}</div>
            <div class="autocomplete-category">${result.category}</div>
        </div>
    `).join('');
    
    autocomplete.style.display = 'block';
    
    // Reset scroll position to top when new results are displayed
    autocomplete.scrollTop = 0;
}

function hideAutocomplete() {
    const autocomplete = document.getElementById('floatingAutocomplete');
    autocomplete.style.display = 'none';
}

function selectAutocompleteItem(stepText) {
    if (stepText) {
        troubleshootingSteps.push(stepText);
        renderTroubleshootingSteps();
        updateCaseNotesLive();
        
        // Increment usage count for this step
        incrementStepUsage(stepText);
        
        // Clear input and hide autocomplete
        const floatingInput = document.getElementById('floatingStepInput');
        floatingInput.value = '';
        floatingInput.style.height = 'auto';
        hideAutocomplete();
        floatingInput.focus();
    }
}

function getStepRankings() {
    try {
        const rankings = localStorage.getItem('troubleshootingStepRankings');
        return rankings ? JSON.parse(rankings) : {};
    } catch (error) {
        console.error('Error loading step rankings:', error);
        return {};
    }
}

function saveStepRankings(rankings) {
    try {
        localStorage.setItem('troubleshootingStepRankings', JSON.stringify(rankings));
    } catch (error) {
        console.error('Error saving step rankings:', error);
    }
}

function incrementStepUsage(stepText) {
    const rankings = getStepRankings();
    rankings[stepText] = (rankings[stepText] || 0) + 1;
    saveStepRankings(rankings);
}

// Function to reset step rankings (for admin purposes)
function resetStepRankings() {
    if (confirm('Are you sure you want to reset all troubleshooting step usage rankings? This cannot be undone.')) {
        localStorage.removeItem('troubleshootingStepRankings');
        showNotification('Step rankings have been reset', 'success');
    }
}

// Function to view current rankings (for debugging)
function viewStepRankings() {
    const rankings = getStepRankings();
    const sortedRankings = Object.entries(rankings)
        .sort(([,a], [,b]) => b - a)
        .map(([step, count]) => `${step}: ${count} times`)
        .join('\n');
    
    console.log('Current step rankings:');
    console.log(sortedRankings);
    
    // Show in notification for easy viewing
    if (sortedRankings) {
        showNotification(`Top used steps:\n${sortedRankings.split('\n').slice(0, 5).join('\n')}`, 'info');
    } else {
        showNotification('No step usage data available yet', 'info');
    }
}

// Custom troubleshooting steps functions
function isDefaultTroubleshootingStep(stepText) {
    const defaultSteps = [];
    document.querySelectorAll('.default-step-btn').forEach(btn => {
        defaultSteps.push(btn.dataset.step);
    });
    return defaultSteps.includes(stepText);
}

function isCustomStepSaved(stepText) {
    const customSteps = getCustomTroubleshootingSteps();
    return customSteps.some(step => step.text === stepText);
}

function getCustomTroubleshootingSteps() {
    try {
        const customSteps = localStorage.getItem('customTroubleshootingSteps');
        return customSteps ? JSON.parse(customSteps) : [];
    } catch (error) {
        console.error('Error loading custom steps:', error);
        return [];
    }
}

function saveCustomTroubleshootingSteps(customSteps) {
    try {
        localStorage.setItem('customTroubleshootingSteps', JSON.stringify(customSteps));
    } catch (error) {
        console.error('Error saving custom steps:', error);
    }
}

function saveCustomStep(stepText) {
    const customSteps = getCustomTroubleshootingSteps();
    
    // Check if step already exists
    if (customSteps.some(step => step.text === stepText)) {
        showNotification('This step is already saved!', 'warning');
        return;
    }
    
    // Add new custom step
    const newStep = {
        id: Date.now().toString(),
        text: stepText,
        category: 'custom',
        createdAt: new Date().toISOString()
    };
    
    customSteps.push(newStep);
    saveCustomTroubleshootingSteps(customSteps);
    
    showNotification('Custom step saved successfully!', 'success');
    
    // Re-render steps to update save button
    renderTroubleshootingSteps();
    
    // Refresh custom steps category
    refreshCustomStepsCategory();
}

function deleteCustomStep(stepId) {
    const customSteps = getCustomTroubleshootingSteps();
    const updatedSteps = customSteps.filter(step => step.id !== stepId);
    saveCustomTroubleshootingSteps(updatedSteps);
    
    showNotification('Custom step deleted successfully!', 'success');
    
    // Refresh custom steps category
    refreshCustomStepsCategory();
}

function editCustomStep(stepId, newText) {
    const customSteps = getCustomTroubleshootingSteps();
    const stepIndex = customSteps.findIndex(step => step.id === stepId);
    
    if (stepIndex !== -1) {
        customSteps[stepIndex].text = newText;
        customSteps[stepIndex].updatedAt = new Date().toISOString();
        saveCustomTroubleshootingSteps(customSteps);
        
        showNotification('Custom step updated successfully!', 'success');
        
        // Refresh custom steps category
        refreshCustomStepsCategory();
        return true;
    }
    
    return false;
}

function exportCustomSteps() {
    const customSteps = getCustomTroubleshootingSteps();
    
    if (customSteps.length === 0) {
        showNotification('No custom steps to export', 'warning');
        return;
    }
    
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        steps: customSteps
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `custom-troubleshooting-steps-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Custom steps exported successfully!', 'success');
}

function importCustomSteps(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!importData.steps || !Array.isArray(importData.steps)) {
                showNotification('Invalid file format', 'error');
                return;
            }
            
            const existingSteps = getCustomTroubleshootingSteps();
            const newSteps = importData.steps.filter(importStep => 
                !existingSteps.some(existingStep => existingStep.text === importStep.text)
            );
            
            if (newSteps.length === 0) {
                showNotification('All steps already exist or no valid steps found', 'warning');
                return;
            }
            
            const updatedSteps = [...existingSteps, ...newSteps];
            saveCustomTroubleshootingSteps(updatedSteps);
            
            showNotification(`${newSteps.length} custom steps imported successfully!`, 'success');
            
            // Refresh custom steps category and management view
            refreshCustomStepsCategory();
            displayCustomSteps();
            
        } catch (error) {
            console.error('Error importing custom steps:', error);
            showNotification('Error importing custom steps', 'error');
        }
    };
    
    reader.readAsText(file);
}

// Setup admin controls
function formatModemsOffline(text) {
    // Check if the text matches the pattern
    if (!text.includes('Appears to be a larger issue') || !text.includes('modems offline at or near:')) {
        return text;
    }

    // Split into lines and remove empty ones
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length !== 3) {
        return text;
    }

    // Join all parts into a single line
    return lines.join(' ');
}

function setupFormatterSettingsModal() {
    const formatterSettingsModal = document.getElementById('formatterSettingsModal');
    const closeFormatterSettingsModal = document.getElementById('closeFormatterSettingsModal');
    const upstreamFormatterToggle = document.getElementById('upstreamFormatterToggle');
    const downstreamFormatterToggle = document.getElementById('downstreamFormatterToggle');
    const ofdmInfoFormatterToggle = document.getElementById('ofdmInfoFormatterToggle');
    const ofdmTableFormatterToggle = document.getElementById('ofdmTableFormatterToggle');
    const modemsOfflineFormatterToggle = document.getElementById('modemsOfflineFormatterToggle');

    if (!formatterSettingsModal || !closeFormatterSettingsModal) return;

    // Close modal functionality
    closeFormatterSettingsModal.addEventListener('click', function() {
        formatterSettingsModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    formatterSettingsModal.addEventListener('click', function(e) {
        if (e.target === formatterSettingsModal) {
            formatterSettingsModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Load formatter settings
    const upstreamFormatterEnabled = localStorage.getItem('upstreamFormatterEnabled') === 'true';
    const downstreamFormatterEnabled = localStorage.getItem('downstreamFormatterEnabled') === 'true';
    const ofdmInfoFormatterEnabled = localStorage.getItem('ofdmInfoFormatterEnabled') === 'true';
    const ofdmTableFormatterEnabled = localStorage.getItem('ofdmTableFormatterEnabled') === 'true';
    const modemsOfflineFormatterEnabled = localStorage.getItem('modemsOfflineFormatterEnabled') === 'true';

    // Set initial states
    if (upstreamFormatterToggle) {
        upstreamFormatterToggle.checked = upstreamFormatterEnabled;
        upstreamFormatterToggle.addEventListener('change', function() {
            const enabled = this.checked;
            localStorage.setItem('upstreamFormatterEnabled', enabled);
            showNotification(`Upstream formatter ${enabled ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (downstreamFormatterToggle) {
        downstreamFormatterToggle.checked = downstreamFormatterEnabled;
        downstreamFormatterToggle.addEventListener('change', function() {
            const enabled = this.checked;
            localStorage.setItem('downstreamFormatterEnabled', enabled);
            showNotification(`Downstream formatter ${enabled ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (ofdmInfoFormatterToggle) {
        ofdmInfoFormatterToggle.checked = ofdmInfoFormatterEnabled;
        ofdmInfoFormatterToggle.addEventListener('change', function() {
            const enabled = this.checked;
            localStorage.setItem('ofdmInfoFormatterEnabled', enabled);
            showNotification(`OFDM info formatter ${enabled ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (ofdmTableFormatterToggle) {
        ofdmTableFormatterToggle.checked = ofdmTableFormatterEnabled;
        ofdmTableFormatterToggle.addEventListener('change', function() {
            const enabled = this.checked;
            localStorage.setItem('ofdmTableFormatterEnabled', enabled);
            showNotification(`OFDM table formatter ${enabled ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    if (modemsOfflineFormatterToggle) {
        modemsOfflineFormatterToggle.checked = modemsOfflineFormatterEnabled;
        modemsOfflineFormatterToggle.addEventListener('change', function() {
            const enabled = this.checked;
            localStorage.setItem('modemsOfflineFormatterEnabled', enabled);
            showNotification(`Modems offline formatter ${enabled ? 'enabled' : 'disabled'}`, 'success');
        });
    }
}

function showFormatterSettingsModal() {
    const formatterSettingsModal = document.getElementById('formatterSettingsModal');
    if (formatterSettingsModal) {
        formatterSettingsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function setupAdminControls() {
    const viewRankingsBtn = document.getElementById('viewRankingsBtn');
    const resetRankingsBtn = document.getElementById('resetRankingsBtn');
    const adminControls = document.querySelector('.admin-controls');
    const rankingFeatureToggle = document.getElementById('rankingFeatureToggle');
    const manageFormattersBtn = document.getElementById('manageFormattersBtn');

    if (!viewRankingsBtn || !resetRankingsBtn || !adminControls) return;

    // Show admin controls on triple click of the admin logo
    let clickCount = 0;
    let clickTimer;
    
    const adminLogo = document.getElementById('adminLogo');
    if (adminLogo) {
        adminLogo.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            clickCount++;
            clearTimeout(clickTimer);
            
            clickTimer = setTimeout(() => {
                if (clickCount >= 3) {
                    adminControls.style.display = 'block';
                    showNotification('Admin controls activated', 'info');
                }
                clickCount = 0;
            }, 500);
        });
    }

    // Load feature settings
    const rankingEnabled = localStorage.getItem('rankingFeatureEnabled') === 'true';

    // Set initial states
    if (rankingFeatureToggle) {
        rankingFeatureToggle.checked = rankingEnabled;
    }

    // Ranking feature toggle
    if (rankingFeatureToggle) {
        rankingFeatureToggle.addEventListener('change', function() {
            const enabled = this.checked;
            localStorage.setItem('rankingFeatureEnabled', enabled);
            showNotification(`Suggestion ranking ${enabled ? 'enabled' : 'disabled'}`, 'success');
        });
    }

    // Manage formatters button
    if (manageFormattersBtn) {
        manageFormattersBtn.addEventListener('click', function() {
            showFormatterSettingsModal();
        });
    }

    // View rankings button
    viewRankingsBtn.addEventListener('click', function() {
        showRankingsModal();
    });

    // Reset rankings button
    resetRankingsBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all troubleshooting step usage rankings? This cannot be undone.')) {
            localStorage.removeItem('troubleshootingStepRankings');
            showNotification('All step rankings have been reset', 'success');
        }
    });

    // Manage custom steps button
    const manageCustomStepsBtn = document.getElementById('manageCustomStepsBtn');
    if (manageCustomStepsBtn) {
        manageCustomStepsBtn.addEventListener('click', function() {
            showCustomStepsModal();
        });
    }
}

// Setup rankings modal
function setupRankingsModal() {
    const rankingsModal = document.getElementById('rankingsModal');
    const closeRankingsModal = document.getElementById('closeRankingsModal');

    if (!rankingsModal || !closeRankingsModal) return;

    closeRankingsModal.addEventListener('click', function() {
        rankingsModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    rankingsModal.addEventListener('click', function(e) {
        if (e.target === rankingsModal) {
            rankingsModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Setup filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            displayRankings(filter);
        });
    });

    // Setup custom steps modal
    setupCustomStepsModal();
}

// Show rankings modal
function showRankingsModal() {
    const rankingsModal = document.getElementById('rankingsModal');
    if (rankingsModal) {
        rankingsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        displayRankings('all');
    }
}

// Display rankings with filter
function displayRankings(filter = 'all') {
    const rankingsList = document.getElementById('rankingsList');
    const totalStepsUsed = document.getElementById('totalStepsUsed');
    const totalUsageCount = document.getElementById('totalUsageCount');
    
    if (!rankingsList || !totalStepsUsed || !totalUsageCount) return;

    const rankings = getStepRankings();
    const categories = {
        'internet': '🌐 Internet',
        'tv': '📺 TV',
        'shawid': '👤 Shaw ID & Webmail',
        'other': '🔧 Other',
        'custom': '💾 Custom'
    };

    // Get all available steps with their categories
    const allSteps = [];
    
    // Get custom steps first to avoid duplicates
    const customSteps = getCustomTroubleshootingSteps();
    const customStepTexts = new Set(customSteps.map(step => step.text));

    // Add custom steps
    customSteps.forEach(step => {
        const usageCount = rankings[step.text] || 0;
        
        if (filter === 'all' || filter === 'custom') {
            allSteps.push({
                text: step.text,
                category: categories.custom,
                categoryKey: 'custom',
                usageCount: usageCount
            });
        }
    });

    // Add default steps (excluding any that exist in custom steps)
    document.querySelectorAll('.default-step-btn').forEach(btn => {
        const stepText = btn.dataset.step;
        // Skip if this step exists in custom steps
        if (customStepTexts.has(stepText)) {
            return;
        }

        const category = btn.closest('.default-steps-category').dataset.category;
        const usageCount = rankings[stepText] || 0;
        
        if (filter === 'all' || category === filter) {
            allSteps.push({
                text: stepText,
                category: categories[category],
                categoryKey: category,
                usageCount: usageCount
            });
        }
    });

    // Sort by usage count (highest first), then alphabetically
    allSteps.sort((a, b) => {
        if (b.usageCount !== a.usageCount) {
            return b.usageCount - a.usageCount;
        }
        return a.text.localeCompare(b.text);
    });

    // Calculate totals
    const totalSteps = Object.keys(rankings).length;
    const totalUsage = Object.values(rankings).reduce((sum, count) => sum + count, 0);

    // Update summary
    totalStepsUsed.textContent = totalSteps;
    totalUsageCount.textContent = totalUsage;

    // Display rankings
    if (allSteps.length === 0) {
        rankingsList.innerHTML = `
            <div class="no-rankings">
                <i class="fas fa-chart-bar"></i>
                <p>No step usage data available yet</p>
            </div>
        `;
    } else {
        rankingsList.innerHTML = allSteps.map((step, index) => `
            <div class="ranking-item">
                <div class="ranking-number">${index + 1}</div>
                <div class="ranking-content">
                    <div class="ranking-step">${step.text}</div>
                    <div class="ranking-category">${step.category}</div>
                </div>
                <div class="ranking-count">${step.usageCount}</div>
            </div>
        `).join('');
    }
}

function setupDefaultStepsSelector() {
    // Add category toggle buttons
    const defaultStepsSelector = document.querySelector('.default-steps-selector');
    if (!defaultStepsSelector) return;
    
    // Create category toggle buttons
    const categoryToggles = document.createElement('div');
    categoryToggles.className = 'default-steps-toggles';
    categoryToggles.innerHTML = `
        <button type="button" class="default-step-toggle-btn" data-category="internet">🌐 Internet</button>
        <button type="button" class="default-step-toggle-btn" data-category="tv">📺 TV</button>
        <button type="button" class="default-step-toggle-btn" data-category="shawid">👤 Shaw ID & Webmail</button>
        <button type="button" class="default-step-toggle-btn" data-category="other">🔧 Other</button>
        <button type="button" class="default-step-toggle-btn" data-category="custom">💾 Custom</button>
    `;
    
    // Insert toggle buttons before the categories
    defaultStepsSelector.insertBefore(categoryToggles, defaultStepsSelector.firstChild);
    
    // Setup toggle button event listeners
    categoryToggles.querySelectorAll('.default-step-toggle-btn').forEach(btn => {
        btn.addEventListener('click', toggleDefaultStepsCategory);
    });
    
    // Setup default step button event listeners
    document.querySelectorAll('.default-step-btn').forEach(btn => {
        btn.addEventListener('click', addDefaultStep);
    });
    
    // Setup custom steps category
    setupCustomStepsCategory();
}

function toggleDefaultStepsCategory(e) {
    const category = e.target.dataset.category;
    const categoryElement = document.querySelector(`.default-steps-category[data-category="${category}"]`);
    
    if (!categoryElement) return;
    
    // Toggle the category visibility
    const isActive = categoryElement.classList.contains('active');
    
    // Hide all categories first
    document.querySelectorAll('.default-steps-category').forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Remove active class from all toggle buttons
    document.querySelectorAll('.default-step-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show the selected category if it wasn't active
    if (!isActive) {
        categoryElement.classList.add('active');
        e.target.classList.add('active');
        
        // If custom category is selected, refresh the custom steps
        if (category === 'custom') {
            refreshCustomStepsCategory();
        }
    }
}

function setupCustomStepsCategory() {
    refreshCustomStepsCategory();
}

function refreshCustomStepsCategory() {
    const customStepsButtons = document.getElementById('customStepsButtons');
    if (!customStepsButtons) return;
    
    const customSteps = getCustomTroubleshootingSteps();
    
    if (customSteps.length === 0) {
        customStepsButtons.innerHTML = '<p class="no-custom-steps-message">No custom steps saved yet</p>';
    } else {
        customStepsButtons.innerHTML = customSteps.map(step => 
            `<button type="button" class="default-step-btn" data-step="${step.text.replace(/"/g, '&quot;')}">${step.text}</button>`
        ).join('');
        
        // Add event listeners to the new custom step buttons
        customStepsButtons.querySelectorAll('.default-step-btn').forEach(btn => {
            btn.addEventListener('click', addDefaultStep);
        });
    }
}

function addDefaultStep(e) {
    const stepText = e.target.dataset.step;
    if (stepText) {
        troubleshootingSteps.push(stepText);
        renderTroubleshootingSteps();
        updateCaseNotesLive();
        
        // Increment usage count for this step
        incrementStepUsage(stepText);
    }
}

function searchDefaultSteps(query) {
    const results = [];
    const categories = {
        'internet': '🌐 Internet',
        'tv': '📺 TV',
        'shawid': '👤 Shaw ID & Webmail',
        'other': '🔧 Other',
        'custom': '💾 Custom'
    };
    
    // Check if ranking feature is enabled
    const rankingEnabled = localStorage.getItem('rankingFeatureEnabled') === 'true';
    
    // Get step usage rankings only if feature is enabled
    const stepRankings = rankingEnabled ? getStepRankings() : {};
    
    // Get all custom steps first to check for duplicates
    const customSteps = getCustomTroubleshootingSteps();
    const customStepTexts = new Set(customSteps.map(step => step.text));

    // Search through all default step buttons that aren't custom steps
    document.querySelectorAll('.default-step-btn').forEach(btn => {
        const stepText = btn.dataset.step;
        // Skip if this step exists in custom steps
        if (customStepTexts.has(stepText)) {
            return;
        }

        const stepTextLower = stepText.toLowerCase();
        const category = btn.closest('.default-steps-category').dataset.category;
        
        if (stepTextLower.includes(query.toLowerCase())) {
            const usageCount = stepRankings[stepText] || 0;
            
            results.push({
                text: stepText,
                category: categories[category],
                categoryKey: category,
                usageCount: usageCount
            });
        }
    });
    
    // Search through custom steps
    customSteps.forEach(step => {
        const stepText = step.text.toLowerCase();
        
        if (stepText.includes(query.toLowerCase())) {
            const usageCount = stepRankings[step.text] || 0;
            
            results.push({
                text: step.text,
                category: categories.custom || '💾 Custom', // Ensure category is never undefined
                categoryKey: 'custom',
                usageCount: usageCount,
                isCustom: true,
                customId: step.id
            });
        }
    });
    
    // Sort results based on ranking feature setting
    if (rankingEnabled) {
        // Sort by usage count (highest first), then alphabetically
        results.sort((a, b) => {
            if (b.usageCount !== a.usageCount) {
                return b.usageCount - a.usageCount;
            }
            return a.text.localeCompare(b.text);
        });
    } else {
        // Sort alphabetically only
        results.sort((a, b) => a.text.localeCompare(b.text));
    }
    
    return results;
}



function renderTroubleshootingSteps() {
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';
    
    troubleshootingSteps.forEach((step, index) => {
        const stepItem = createStepElement(step, index);
        stepsList.appendChild(stepItem);
    });
}

function createStepElement(stepText, index) {
    const stepItem = document.createElement('div');
    stepItem.className = 'step-item';
    stepItem.draggable = true;
    stepItem.setAttribute('data-index', index);
    
    // Check if this step is a default step or already saved
    const isDefaultStep = isDefaultTroubleshootingStep(stepText);
    const isSavedStep = isCustomStepSaved(stepText);
    const showSaveButton = !isDefaultStep && !isSavedStep;
    
    // Escape HTML and preserve line breaks
    const escapedText = stepText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
    
    let saveButton = '';
    if (showSaveButton) {
        saveButton = `
            <button type="button" class="step-action-btn save-step-btn" onclick="saveCustomStep('${stepText.replace(/'/g, "\\'")}')" title="Save as custom step">
                <i class="fas fa-save"></i>
            </button>
        `;
    }
    
    stepItem.innerHTML = `
        <div class="step-number">${index + 1}</div>
        <div class="step-text">${escapedText}</div>
        <div class="step-actions">
            <button type="button" class="step-action-btn copy-step-btn" onclick="copyStep(${index})" title="Copy step">
                <i class="fas fa-copy"></i>
            </button>
            <button type="button" class="step-action-btn edit-step-btn" onclick="editStep(${index})" title="Edit step">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="step-action-btn move-up-btn" onclick="moveStep(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>
                <i class="fas fa-arrow-up"></i>
            </button>
            <button type="button" class="step-action-btn move-down-btn" onclick="moveStep(${index}, 'down')" ${index === troubleshootingSteps.length - 1 ? 'disabled' : ''}>
                <i class="fas fa-arrow-down"></i>
            </button>
            ${saveButton}
            <button type="button" class="step-action-btn delete-step-btn" onclick="deleteStep(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add drag event listeners
    stepItem.addEventListener('dragstart', handleDragStart);
    stepItem.addEventListener('dragend', handleDragEnd);
    stepItem.addEventListener('dragover', handleDragOver);
    stepItem.addEventListener('drop', handleDrop);
    
    return stepItem;
}

// Custom steps modal functions
function setupCustomStepsModal() {
    const customStepsModal = document.getElementById('customStepsModal');
    const closeCustomStepsModal = document.getElementById('closeCustomStepsModal');
    const exportCustomStepsBtn = document.getElementById('exportCustomStepsBtn');
    const importCustomStepsFile = document.getElementById('importCustomStepsFile');
    const deleteAllCustomStepsBtn = document.getElementById('deleteAllCustomStepsBtn');

    if (!customStepsModal || !closeCustomStepsModal) return;

    closeCustomStepsModal.addEventListener('click', function() {
        customStepsModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    customStepsModal.addEventListener('click', function(e) {
        if (e.target === customStepsModal) {
            customStepsModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Export custom steps
    if (exportCustomStepsBtn) {
        exportCustomStepsBtn.addEventListener('click', function() {
            exportCustomSteps();
        });
    }

    // Import custom steps
    if (importCustomStepsFile) {
        importCustomStepsFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                importCustomSteps(file);
                e.target.value = ''; // Reset file input
            }
        });
    }

    // Delete all custom steps button
    if (deleteAllCustomStepsBtn) {
        deleteAllCustomStepsBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete ALL custom steps? This cannot be undone.')) {
                saveCustomTroubleshootingSteps([]); // Clear all custom steps
                showNotification('All custom steps have been deleted', 'success');
                displayCustomSteps(); // Refresh the list
                refreshCustomStepsCategory(); // Refresh the category view
            }
        });
    }
}

function showCustomStepsModal() {
    const customStepsModal = document.getElementById('customStepsModal');
    if (customStepsModal) {
        customStepsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        displayCustomSteps();
    }
}

function displayCustomSteps() {
    const customStepsList = document.getElementById('customStepsList');
    if (!customStepsList) return;

    const customSteps = getCustomTroubleshootingSteps();

    if (customSteps.length === 0) {
        customStepsList.innerHTML = `
            <div class="no-custom-steps">
                <i class="fas fa-save"></i>
                <p>No custom steps saved yet</p>
            </div>
        `;
    } else {
        customStepsList.innerHTML = customSteps.map(step => {
            const createdAt = new Date(step.createdAt).toLocaleDateString();
            const updatedAt = step.updatedAt ? new Date(step.updatedAt).toLocaleDateString() : null;
            
            return `
                <div class="custom-step-item" data-step-id="${step.id}">
                    <div class="custom-step-content">
                        <div class="custom-step-text">${step.text}</div>
                        <div class="custom-step-meta">
                            Created: ${createdAt}${updatedAt ? ` | Updated: ${updatedAt}` : ''}
                        </div>
                    </div>
                    <div class="custom-step-actions">
                        <button type="button" class="custom-step-action-btn edit-custom-step-btn" onclick="editCustomStepInModal('${step.id}')" title="Edit step">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button type="button" class="custom-step-action-btn delete-custom-step-btn" onclick="deleteCustomStepFromModal('${step.id}')" title="Delete step">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function editCustomStepInModal(stepId) {
    const customSteps = getCustomTroubleshootingSteps();
    const step = customSteps.find(s => s.id === stepId);
    
    if (!step) return;
    
    const newText = prompt('Edit custom step:', step.text);
    if (newText && newText.trim() !== '' && newText !== step.text) {
        if (editCustomStep(stepId, newText.trim())) {
            displayCustomSteps();
        }
    }
}

function deleteCustomStepFromModal(stepId) {
    if (confirm('Are you sure you want to delete this custom step? This cannot be undone.')) {
        deleteCustomStep(stepId);
        displayCustomSteps();
    }
}

function moveStep(index, direction) {
    if (direction === 'up' && index > 0) {
        [troubleshootingSteps[index], troubleshootingSteps[index - 1]] = 
        [troubleshootingSteps[index - 1], troubleshootingSteps[index]];
    } else if (direction === 'down' && index < troubleshootingSteps.length - 1) {
        [troubleshootingSteps[index], troubleshootingSteps[index + 1]] = 
        [troubleshootingSteps[index + 1], troubleshootingSteps[index]];
    }
    renderTroubleshootingSteps();
    
    // Trigger live update
    updateCaseNotesLive();
}

function deleteStep(index) {
    troubleshootingSteps.splice(index, 1);
    renderTroubleshootingSteps();
    
    // Trigger live update
    updateCaseNotesLive();
}

function copyStep(index) {
    const stepText = troubleshootingSteps[index];
    copyToClipboard(stepText, 'Troubleshooting step copied to clipboard!');
}

function editStep(index) {
    const stepItem = document.querySelector(`[data-index="${index}"]`);
    if (!stepItem) return;
    
    const stepText = troubleshootingSteps[index];
    const originalContent = stepItem.innerHTML;
    
    // Create edit mode HTML
    stepItem.innerHTML = `
        <div class="step-number">${index + 1}</div>
        <div class="step-edit-container">
            <textarea class="step-edit-textarea" rows="3">${stepText}</textarea>
            <div class="step-edit-actions">
                <button class="step-edit-btn save-step-btn" onclick="saveStep(${index})" title="Save changes">
                    <i class="fas fa-check"></i>
                </button>
                <button class="step-edit-btn cancel-step-btn" onclick="cancelEditStep(${index})" title="Cancel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Store original content for cancel functionality
    stepItem.setAttribute('data-original-content', originalContent);
    
    // Focus on the textarea and select all text
    const textarea = stepItem.querySelector('.step-edit-textarea');
    textarea.focus();
    textarea.select();
    
    // Auto-resize textarea
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Handle Enter key to save, Escape key to cancel
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveStep(index);
        } else if (e.key === 'Escape') {
            cancelEditStep(index);
        }
    });
    
    // Disable drag during edit
    stepItem.draggable = false;
}

function saveStep(index) {
    const stepItem = document.querySelector(`[data-index="${index}"]`);
    if (!stepItem) return;
    
    const textarea = stepItem.querySelector('.step-edit-textarea');
    const newText = textarea.value.trim();
    
    if (newText) {
        troubleshootingSteps[index] = newText;
        renderTroubleshootingSteps();
        
        // Trigger live update
        updateCaseNotesLive();
    } else {
        // If empty, cancel the edit
        cancelEditStep(index);
    }
}

function cancelEditStep(index) {
    const stepItem = document.querySelector(`[data-index="${index}"]`);
    if (!stepItem) return;
    
    const originalContent = stepItem.getAttribute('data-original-content');
    if (originalContent) {
        stepItem.innerHTML = originalContent;
        stepItem.removeAttribute('data-original-content');
    } else {
        // Fallback: re-render the step
        renderTroubleshootingSteps();
    }
    
    // Re-enable drag
    stepItem.draggable = true;
}

// Drag and drop functionality
function setupDragAndDrop() {
    const stepsList = document.getElementById('stepsList');
    
    stepsList.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Add visual feedback for drop zones
        const stepItems = document.querySelectorAll('.step-item');
        stepItems.forEach(item => {
            if (item !== draggedElement) {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                
                if (e.clientY < itemCenter) {
                    item.classList.add('drag-over');
                } else {
                    item.classList.remove('drag-over');
                }
            }
        });
    });
    
    stepsList.addEventListener('dragleave', function(e) {
        // Remove drag-over class when leaving drop zone
        if (!stepsList.contains(e.relatedTarget)) {
            document.querySelectorAll('.step-item').forEach(item => {
                item.classList.remove('drag-over');
            });
        }
    });
    
    stepsList.addEventListener('drop', function(e) {
        e.preventDefault();
        if (draggedElement) {
            const targetIndex = getDropIndex(e);
            if (targetIndex !== -1) {
                const draggedIndex = parseInt(draggedElement.getAttribute('data-index'));
                if (draggedIndex !== targetIndex) {
                    moveStepByDrag(draggedIndex, targetIndex);
                }
            }
        }
        
        // Clean up drag-over classes
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    });
}

function handleDragStart(e) {
    draggedElement = e.target.closest('.step-item');
    if (draggedElement) {
        draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', draggedElement.outerHTML);
    }
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
    
    // Clean up any remaining drag-over classes
    document.querySelectorAll('.step-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
}

function getDropIndex(e) {
    const stepItems = document.querySelectorAll('.step-item:not(.dragging)');
    let targetIndex = stepItems.length;
    
    for (let i = 0; i < stepItems.length; i++) {
        const rect = stepItems[i].getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        
        if (e.clientY < itemCenter) {
            targetIndex = i;
            break;
        }
    }
    
    return targetIndex;
}

function moveStepByDrag(fromIndex, toIndex) {
    const step = troubleshootingSteps.splice(fromIndex, 1)[0];
    troubleshootingSteps.splice(toIndex, 0, step);
    renderTroubleshootingSteps();
    
    // Trigger live update
    updateCaseNotesLive();
}

// Form handlers
function setupFormHandlers() {
    // Case Notes form handlers - Live update
    setupLiveCaseNotesUpdate();
    
    // SPINS form handlers - Live update
    setupLiveSpinsUpdate();
    
    // Setup floating action button event listeners
    setupFloatingActionButtons();
    
    // Radio button listeners will be set up after DOM is fully loaded
    // setupRadioButtonListeners();
    
    // Force initial update to ensure radio buttons are captured
    setTimeout(() => {
        updateCaseNotesLive();
    }, 100);
}

// Setup floating action buttons
function setupFloatingActionButtons() {
    const caseNotesFabGroup = document.getElementById('caseNotesFabGroup');
    const spinsFabGroup = document.getElementById('spinsFabGroup');
    const callbacksFabGroup = document.getElementById('callbacksFabGroup');

    // Case Notes floating buttons
    const copyCaseNotesBtn = document.getElementById('copyCaseNotesBtn');
    const clearCaseNotesBtn = document.getElementById('clearCaseNotesBtn');
    
    if (copyCaseNotesBtn) {
        copyCaseNotesBtn.addEventListener('click', copyCaseNotes);
    }
    
    if (clearCaseNotesBtn) {
        clearCaseNotesBtn.addEventListener('click', clearCaseNotesForm);
    }
    
    // SPINS floating buttons
    const copySpinsBtn = document.getElementById('copySpinsBtn');
    
    if (copySpinsBtn) {
        copySpinsBtn.addEventListener('click', copySpins);
    }

    // Call Back Tracker floating buttons
    const refreshCallbacksBtn = document.getElementById('refreshCallbacksBtn');
    const clearAllCallbacksBtn = document.getElementById('clearAllCallbacksBtn');
    
    if (refreshCallbacksBtn) {
        refreshCallbacksBtn.addEventListener('click', refreshCallBacks);
    }
    
    if (clearAllCallbacksBtn) {
        clearAllCallbacksBtn.addEventListener('click', clearAllCallBacks);
    }

    // Tab switching logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show target tab content
            document.getElementById(targetTab).classList.add('active');
            
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide appropriate floating action buttons
            if (caseNotesFabGroup) caseNotesFabGroup.style.display = targetTab === 'case-notes' ? 'flex' : 'none';
            if (spinsFabGroup) spinsFabGroup.style.display = targetTab === 'spins' ? 'flex' : 'none';
            if (callbacksFabGroup) callbacksFabGroup.style.display = targetTab === 'callbacks' ? 'flex' : 'none';
            
            // Show/hide output containers based on tab
            const caseNotesOutput = document.getElementById('caseNotesOutput');
            const spinsOutput = document.getElementById('spinsOutput');
            
            if (caseNotesOutput) caseNotesOutput.style.display = targetTab === 'case-notes' ? 'block' : 'none';
            if (spinsOutput) spinsOutput.style.display = targetTab === 'spins' ? 'block' : 'none';
            
            // Update live preview when switching to case notes tab
            if (targetTab === 'case-notes') {
                setTimeout(() => {
                    updateCaseNotesLive();
                }, 100);
            }
        });
    });
}

// Clear case notes form function
function clearCaseNotesForm() {
    if (confirm('Are you sure you want to clear the Case Notes form?')) {
        // Clear form inputs
        const form = document.getElementById('caseNotesForm');
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.value = '';
            localStorage.removeItem(`caseNotes_${input.id}`);
        });
        
        // Clear verification and authentication buttons
        const verificationButtons = document.querySelectorAll('.verification-btn');
        const authButtons = document.querySelectorAll('.auth-btn');
        
        verificationButtons.forEach(btn => btn.classList.remove('selected'));
        authButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Clear hidden inputs
        const verificationInput = document.getElementById('verificationCompleted');
        const authInput = document.getElementById('authenticationMethod');
        if (verificationInput) verificationInput.value = '';
        if (authInput) authInput.value = '';
        
        // Clear localStorage
        localStorage.removeItem('caseNotes_authenticationMethod');
        localStorage.removeItem('caseNotes_verificationCompleted');
        
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            localStorage.removeItem(`caseNotes_${checkbox.id}`);
        });
        
        // Clear troubleshooting steps
        troubleshootingSteps = [];
        renderTroubleshootingSteps();
        
        // Clear floating input
        const floatingInput = document.getElementById('floatingStepInput');
        if (floatingInput) {
            floatingInput.value = '';
            floatingInput.style.height = 'auto';
        }
        
        // Clear selected reasons
        clearSelectedReasons();
        
        // Clear equipment data
        equipmentSNs = [];
        equipmentModels = [];
        renderEquipmentSNs();
        renderEquipmentModels();
        
        // Clear new fields data
        resolutions = [];
        ticketNumbers = [];
        infoAssistDocs = [];
        flowParagraphs = [];
        agentAssistSummaries = [];
        renderResolutions();
        renderTicketNumbers();
        renderInfoAssist();
        renderFlowParagraphs();
        renderAgentAssistSummaries();
        saveEquipmentData();
        
        // Clear call back scheduler
        clearScheduler();
        currentScheduledCalls = [];
        renderScheduledCalls();
        
        // Clear SPINS form completely
        const spinsForm = document.getElementById('spinsForm');
        if (spinsForm) {
            const spinsInputs = spinsForm.querySelectorAll('input, textarea');
            spinsInputs.forEach(input => {
                input.value = '';
                localStorage.removeItem(`spins_${input.id}`);
            });
        }
        
        // Clear SPINS selected issues and instructions
        clearSelectedIssues();
        clearSelectedInstructions();
        clearCustomIssues();
        clearCustomInstructions();
        
        // Clear SPINS issue type buttons
        const issueTypeButtons = document.querySelectorAll('.issue-type-btn');
        issueTypeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Clear SPINS issue buttons
        const issueButtons = document.querySelectorAll('.issue-btn');
        issueButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Clear SPINS instruction buttons
        const instructionButtons = document.querySelectorAll('.instruction-btn');
        instructionButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Clear SPINS character counter
        const characterCounter = document.getElementById('characterCounter');
        if (characterCounter) {
            characterCounter.textContent = '0 / 1000';
        }
        
        // Clear SPINS localStorage
        localStorage.removeItem('spins_selectedIssues');
        localStorage.removeItem('spins_selectedInstructions');
        localStorage.removeItem('spins_customIssues');
        localStorage.removeItem('spins_customInstructions');
        localStorage.removeItem('spins_issueType');
        
        // Clear all SPINS form field localStorage keys
        const spinsFieldIds = [
            'customerName', 'spinsPhoneNumber', 'serialNumber', 'equipmentNameModel', 'issue', 
            'caseNumber', 'customIssues', 'toolsInfo', 'customInstructions'
        ];
        
        spinsFieldIds.forEach(fieldId => {
            localStorage.removeItem(`spins_${fieldId}`);
        });
        
        // Reset the modification flag
        spinsFieldsModified = false;
        
        // Reset the localStorage cleared flag
        localStorageCleared = false;
        
        // Re-setup radio buttons to ensure event listeners are working
        setupRadioButtons();
        
        // Update live previews
        updateCaseNotesLive();
        updateSpinsLive();
        
        // Scroll back to top of the page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        showNotification('Workspace has been reset!', 'success');
    }
}

// Live update functionality
function setupLiveCaseNotesUpdate() {
    const form = document.getElementById('caseNotesForm');
    const outputContainer = document.getElementById('caseNotesOutput');
    const copyBtn = document.getElementById('copyCaseNotesBtn');
    
    // Only show output container when on case notes tab
    const currentTab = document.querySelector('.tab-btn.active').dataset.tab;
    if (outputContainer && currentTab === 'case-notes') {
        outputContainer.style.display = 'block';
    }
    
    // Debounced update function for better performance
    let updateTimeout;
    let lastFormData = '';
    
    const debouncedUpdate = () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            // Only update if we're on the case notes tab
            const currentTab = document.querySelector('.tab-btn.active');
            if (currentTab && currentTab.dataset.tab === 'case-notes') {
                updateCaseNotesLive();
            }
        }, 500); // Increased delay for better performance
    };
    
    // Add event listeners to all form elements (excluding radio buttons)
    const formElements = form.querySelectorAll('input:not([type="radio"]), textarea');
    formElements.forEach(element => {
        element.addEventListener('input', debouncedUpdate);
        element.addEventListener('change', debouncedUpdate);
    });
    
    // Initial update only if on case notes tab
    if (currentTab === 'case-notes') {
        updateCaseNotesLive();
    }
}

function updateCaseNotesLive() {
    const formData = getCaseNotesFormData();
    const formattedNotes = formatCaseNotes(formData);
    
    const outputContent = document.getElementById('caseNotesContent');
    
    if (outputContent) {
        // Only update if content has actually changed
        if (outputContent.textContent !== formattedNotes) {
            outputContent.textContent = formattedNotes;
            
            // Simplified animation - only change opacity once
            outputContent.style.opacity = '0.8';
            requestAnimationFrame(() => {
                outputContent.style.opacity = '1';
            });
        }
    } else {
        console.error('caseNotesContent element not found!');
    }
}

function setupRadioButtons() {
    console.log('Setting up verification and authentication button listeners...');
    
    // Setup verification buttons
    setupVerificationButtons();
    
    // Setup authentication method buttons
    setupAuthenticationButtons();
    
    console.log('Verification and authentication button listeners setup complete');
}

function setupVerificationButtons() {
    const verificationButtons = document.querySelectorAll('.verification-btn');
    const verificationHiddenInput = document.getElementById('verificationCompleted');
    
    // Load saved state
    const savedVerification = localStorage.getItem('caseNotes_verificationCompleted');
    if (savedVerification) {
        const buttonToSelect = document.querySelector(`.verification-btn[data-verification="${savedVerification}"]`);
        if (buttonToSelect) {
            buttonToSelect.classList.add('selected');
            if (verificationHiddenInput) {
                verificationHiddenInput.value = savedVerification;
            }
        }
    }
    
    // Add click listeners to verification buttons
    verificationButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const verificationValue = e.target.dataset.verification;
            
            // Remove selected class from all buttons
            verificationButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            e.target.classList.add('selected');
            
            // Update hidden input
            if (verificationHiddenInput) {
                verificationHiddenInput.value = verificationValue;
            }
            
            // Save to localStorage
            localStorage.setItem('caseNotes_verificationCompleted', verificationValue);
            
            // Update live preview
            const currentTab = document.querySelector('.tab-btn.active');
            if (currentTab && currentTab.dataset.tab === 'case-notes') {
                updateCaseNotesLive();
            }
        });
    });
}

function setupAuthenticationButtons() {
    const authButtons = document.querySelectorAll('.auth-btn');
    const authHiddenInput = document.getElementById('authenticationMethod');
    
    // Load saved state
    const savedAuthMethod = localStorage.getItem('caseNotes_authenticationMethod');
    if (savedAuthMethod) {
        const buttonToSelect = document.querySelector(`.auth-btn[data-auth="${savedAuthMethod}"]`);
        if (buttonToSelect) {
            buttonToSelect.classList.add('selected');
            if (authHiddenInput) {
                authHiddenInput.value = savedAuthMethod;
            }
        }
    }
    
    // Add click listeners to authentication buttons
    authButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const authValue = e.target.dataset.auth;
            
            // Remove selected class from all buttons
            authButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            e.target.classList.add('selected');
            
            // Update hidden input
            if (authHiddenInput) {
                authHiddenInput.value = authValue;
            }
            
            // Save to localStorage
            localStorage.setItem('caseNotes_authenticationMethod', authValue);
            
            // Handle authentication method change
            handleAuthenticationMethodChange({ target: { value: authValue } });
            
            // Update live preview
            const currentTab = document.querySelector('.tab-btn.active');
            if (currentTab && currentTab.dataset.tab === 'case-notes') {
                updateCaseNotesLive();
            }
        });
    });
}



function handleAuthenticationMethodChange(e) {
    const selectedMethod = e.target.value;
    const pinStepText = 'Pin/Passphrase Information Updated';
    const authorizedUserStepText = 'Added Cx as an Authorized User on the account with the permission of account owner.';
    
    console.log('Authentication method changed to:', selectedMethod);
    
    // Remove the step if it exists (for any method change)
    const pinStepIndex = troubleshootingSteps.findIndex(step => 
        step.includes(pinStepText)
    );
    
    if (pinStepIndex !== -1) {
        troubleshootingSteps.splice(pinStepIndex, 1);
        console.log('Removed existing pin troubleshooting step');
    }
    
    // Remove the authorized user step if it exists (for any method change)
    const authorizedUserStepIndex = troubleshootingSteps.findIndex(step => 
        step.includes(authorizedUserStepText)
    );
    
    if (authorizedUserStepIndex !== -1) {
        troubleshootingSteps.splice(authorizedUserStepIndex, 1);
        console.log('Removed existing authorized user troubleshooting step');
    }
    
    // Add the step back if OTP or Personal Questions Asked is selected
    if (selectedMethod === 'OTP' || selectedMethod === 'Personal Questions Asked') {
        troubleshootingSteps.push(pinStepText);
        console.log('Added troubleshooting step for:', selectedMethod);
    }
    
    // Add the authorized user step if Not Authorized is selected
    if (selectedMethod === 'Not Authorized') {
        troubleshootingSteps.push(authorizedUserStepText);
        console.log('Added authorized user troubleshooting step for:', selectedMethod);
    }
    
    renderTroubleshootingSteps();
    updateCaseNotesLive();
}

function setupLiveSpinsUpdate() {
    const spinsForm = document.getElementById('spinsForm');
    if (!spinsForm) return;

    // Get all form elements that should trigger updates
    const formElements = spinsForm.querySelectorAll('input, textarea, select');
    
    // Add event listeners to all form elements
    formElements.forEach(element => {
        element.addEventListener('input', updateSpinsLive);
        element.addEventListener('change', updateSpinsLive);
    });

    // Setup issue type selector
    setupIssueTypeSelector();
    
    // Setup issue and instruction buttons
    setupIssueButtons();
    setupInstructionButtons();
    
    // Setup action buttons
    setupSpinsActionButtons();

    // Initial update
    updateSpinsLive();
    
    // Debounced update for better performance
    const debouncedUpdate = () => {
        clearTimeout(window.spinsUpdateTimeout);
        window.spinsUpdateTimeout = setTimeout(updateSpinsLive, 300);
    };
    
    formElements.forEach(element => {
        element.addEventListener('input', debouncedUpdate);
    });
}

function setupIssueTypeSelector() {
    document.querySelectorAll('.issue-type-btn').forEach(btn => {
        btn.addEventListener('click', selectIssueType);
    });
    
    // Default to hidden state - no sections shown initially
    document.querySelectorAll('.product-section').forEach(section => {
        section.classList.remove('active');
    });
}

function selectIssueType(e) {
    const selectedType = e.currentTarget.dataset.type;
    
    // Update active button
    document.querySelectorAll('.issue-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    if (selectedType === 'toggle-all') {
        // Toggle between show all and hide all
        const toggleBtn = e.currentTarget;
        const isShowingAll = toggleBtn.querySelector('.type-label').textContent === 'Hide All';
        
        if (isShowingAll) {
            // Hide all sections
            document.querySelectorAll('.product-section').forEach(section => {
                section.classList.remove('active');
            });
            toggleBtn.querySelector('.type-label').textContent = 'Show All';
            toggleBtn.classList.remove('active');
        } else {
            // Show all sections
            document.querySelectorAll('.product-section').forEach(section => {
                section.classList.add('active');
            });
            toggleBtn.querySelector('.type-label').textContent = 'Hide All';
        }
    } else {
        // Toggle individual category
        const targetSection = document.querySelector(`.product-section[data-category="${selectedType}"]`);
        if (targetSection) {
            const isCurrentlyActive = targetSection.classList.contains('active');
            
            // Hide all sections first
            document.querySelectorAll('.product-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Toggle the selected section
            if (!isCurrentlyActive) {
                targetSection.classList.add('active');
            }
        }
    }
}

function setupIssueButtons() {
    document.querySelectorAll('.issue-btn').forEach(btn => {
        btn.addEventListener('click', toggleIssue);
    });
}

function setupInstructionButtons() {
    document.querySelectorAll('.instruction-btn').forEach(btn => {
        btn.addEventListener('click', toggleInstruction);
    });
}

function toggleIssue(e) {
    const btn = e.currentTarget;
    const issue = btn.dataset.issue;
    
    // Toggle selected state
    btn.classList.toggle('selected');
    
    // Update selected issues display
    updateSelectedIssuesDisplay();
    
    // Update SPINS preview
    updateSpinsLive();
}

function toggleInstruction(e) {
    const btn = e.currentTarget;
    const instruction = btn.dataset.instruction;
    
    // Toggle selected state
    btn.classList.toggle('selected');
    
    // Update selected instructions display
    updateSelectedInstructionsDisplay();
    
    // Update SPINS preview
    updateSpinsLive();
}

function updateSelectedIssuesDisplay() {
    const selectedIssues = [];
    
    document.querySelectorAll('.issue-btn.selected').forEach(btn => {
        selectedIssues.push(btn.dataset.issue);
    });
    
    // Add custom issues
    const customIssues = document.getElementById('customIssues').value.trim();
    if (customIssues) {
        selectedIssues.push(customIssues);
    }
    
    const display = document.getElementById('selectedIssuesDisplay');
    if (selectedIssues.length > 0) {
        display.textContent = selectedIssues.join(', ');
        display.classList.add('has-content');
    } else {
        display.textContent = 'No issues selected';
        display.classList.remove('has-content');
    }
}

function updateSelectedInstructionsDisplay() {
    const selectedInstructions = [];
    
    document.querySelectorAll('.instruction-btn.selected').forEach(btn => {
        selectedInstructions.push(btn.dataset.instruction);
    });
    
    // Add custom instructions
    const customInstructions = document.getElementById('customInstructions').value.trim();
    if (customInstructions) {
        selectedInstructions.push(customInstructions);
    }
    
    const display = document.getElementById('selectedInstructionsDisplay');
    if (selectedInstructions.length > 0) {
        display.textContent = selectedInstructions.join(', ');
        display.classList.add('has-content');
    } else {
        display.textContent = 'No instructions selected';
        display.classList.remove('has-content');
    }
}



function setupSpinsActionButtons() {
    // Copy issues button
    const copyIssuesBtn = document.querySelector('.copy-issues-btn');
    if (copyIssuesBtn) {
        copyIssuesBtn.addEventListener('click', copySelectedIssues);
    }
    
    // Clear issues button
    const clearIssuesBtn = document.querySelector('.clear-issues-btn');
    if (clearIssuesBtn) {
        clearIssuesBtn.addEventListener('click', clearSelectedIssues);
    }
    
    // Copy instructions button
    const copyInstructionsBtn = document.querySelector('.copy-instructions-btn');
    if (copyInstructionsBtn) {
        copyInstructionsBtn.addEventListener('click', copySelectedInstructions);
    }
    
    // Clear instructions button
    const clearInstructionsBtn = document.querySelector('.clear-instructions-btn');
    if (clearInstructionsBtn) {
        clearInstructionsBtn.addEventListener('click', clearSelectedInstructions);
    }
    
    // Clear custom instructions button
    const clearCustomInstructionsBtn = document.querySelector('.clear-custom-instructions-btn');
    if (clearCustomInstructionsBtn) {
        clearCustomInstructionsBtn.addEventListener('click', clearCustomInstructions);
    }
    
    // Clear custom issues button
    const clearCustomIssuesBtn = document.querySelector('.clear-custom-issues-btn');
    if (clearCustomIssuesBtn) {
        clearCustomIssuesBtn.addEventListener('click', clearCustomIssues);
    }
    
    // Add event listener for custom instructions textarea
    const customInstructionsTextarea = document.getElementById('customInstructions');
    if (customInstructionsTextarea) {
        customInstructionsTextarea.addEventListener('input', updateSelectedInstructionsDisplay);
    }
    
    // Add event listener for custom issues textarea
    const customIssuesTextarea = document.getElementById('customIssues');
    if (customIssuesTextarea) {
        customIssuesTextarea.addEventListener('input', updateSelectedIssuesDisplay);
    }
}

function copySelectedIssues() {
    const selectedIssues = [];
    document.querySelectorAll('.issue-btn.selected').forEach(btn => {
        selectedIssues.push(btn.dataset.issue);
    });
    
    const customIssues = document.getElementById('customIssues').value.trim();
    if (customIssues) {
        selectedIssues.push(customIssues);
    }
    
    if (selectedIssues.length > 0) {
        copyToClipboard(selectedIssues.join(', '), 'Issues copied to clipboard!');
    } else {
        // showNotification('No issues selected', 'warning');
    }
}

function clearSelectedIssues() {
    document.querySelectorAll('.issue-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.getElementById('customIssues').value = '';
    
    updateSelectedIssuesDisplay();
    updateSpinsLive();
}

function clearCustomIssues() {
    document.getElementById('customIssues').value = '';
    updateSelectedIssuesDisplay();
    updateSpinsLive();
}

function copySelectedInstructions() {
    const selectedInstructions = [];
    document.querySelectorAll('.instruction-btn.selected').forEach(btn => {
        selectedInstructions.push(btn.dataset.instruction);
    });
    
    const customInstructions = document.getElementById('customInstructions').value.trim();
    if (customInstructions) {
        selectedInstructions.push(customInstructions);
    }
    
    if (selectedInstructions.length > 0) {
        copyToClipboard(selectedInstructions.join(', '), 'Instructions copied to clipboard!');
    } else {
        // showNotification('No instructions selected', 'warning');
    }
}

function clearSelectedInstructions() {
    document.querySelectorAll('.instruction-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    document.getElementById('customInstructions').value = '';
    
    updateSelectedInstructionsDisplay();
    updateSpinsLive();
}

function clearCustomInstructions() {
    document.getElementById('customInstructions').value = '';
    updateSelectedInstructionsDisplay();
    updateSpinsLive();
}

function updateSpinsLive() {
    const spinsContent = document.getElementById('spinsContent');
    if (!spinsContent) return;

    const data = getSpinsFormData();
    const formattedSpins = formatSpins(data);
    
    spinsContent.innerHTML = formattedSpins;
    
    // Update character counter
    updateCharacterCounter(formattedSpins);
}

function updateCharacterCounter(spinsText) {
    const characterCount = document.getElementById('characterCount');
    const counterFill = document.getElementById('counterFill');
    
    if (!characterCount || !counterFill) return;
    
    const currentLength = spinsText.length;
    const maxLength = 976;
    const percentage = Math.min((currentLength / maxLength) * 100, 100);
    
    characterCount.textContent = currentLength;
    counterFill.style.width = percentage + '%';
    
    // Update color based on usage
    counterFill.classList.remove('warning', 'danger');
    if (percentage >= 90) {
        counterFill.classList.add('danger');
    } else if (percentage >= 75) {
        counterFill.classList.add('warning');
    }
}

function generateSpins() {
    const data = getSpinsFormData();
    return formatSpins(data);
}

function getSpinsFormData() {
    const form = document.getElementById('spinsForm');
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    // Get basic form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Get selected issues by category
    data.phoneIssues = getSelectedIssuesByCategory('phone');
    data.internetIssues = getSelectedIssuesByCategory('internet');
    data.videoIssues = getSelectedIssuesByCategory('video');
    data.generalIssues = getSelectedIssuesByCategory('general');

    // Get selected instructions by category
    data.accessInstructions = getSelectedInstructionsByCategory('Access Instructions');
    data.notifications = getSelectedInstructionsByCategory('Notifications');

    // Get custom instructions
    data.customInstructions = document.getElementById('customInstructions').value.trim();

    // Get custom issues
    data.customIssues = document.getElementById('customIssues').value.trim();

    return data;
}

function getSelectedIssuesByCategory(categoryName) {
    const categorySection = document.querySelector(`.product-section[data-category="${categoryName}"]`);
    
    if (!categorySection) return [];
    
    const selectedButtons = categorySection.querySelectorAll('.issue-btn.selected');
    return Array.from(selectedButtons).map(btn => btn.dataset.issue);
}

function getSelectedInstructionsByCategory(categoryName) {
    const categorySection = Array.from(document.querySelectorAll('.instruction-section')).find(section => 
        section.querySelector('.section-title').textContent === categoryName
    );
    
    if (!categorySection) return [];
    
    const selectedButtons = categorySection.querySelectorAll('.instruction-btn.selected');
    return Array.from(selectedButtons).map(btn => btn.dataset.instruction);
}

function formatSpins(data) {
    let spins = '';

    // Customer Information
    if (data.customerName) {
        spins += `Customer: ${data.customerName}\n`;
    }
    if (data.spinsPhoneNumber) {
        spins += `Phone: ${data.spinsPhoneNumber}\n`;
    }
    if (data.caseNumber) {
        spins += `Case #: ${data.caseNumber}\n`;
    }

    // Equipment Information
    if (data.equipmentNameModel) {
        spins += `Equipment: ${data.equipmentNameModel}\n`;
    }
    if (data.serialNumber) {
        spins += `S/N: ${data.serialNumber}\n`;
    }

    // Issues (from selected issues and custom issues)
    const allIssues = [];
    
    // Add selected issues from categories
    if (data.phoneIssues && data.phoneIssues.length > 0) {
        allIssues.push(...data.phoneIssues);
    }
    if (data.internetIssues && data.internetIssues.length > 0) {
        allIssues.push(...data.internetIssues);
    }
    if (data.videoIssues && data.videoIssues.length > 0) {
        allIssues.push(...data.videoIssues);
    }
    if (data.generalIssues && data.generalIssues.length > 0) {
        allIssues.push(...data.generalIssues);
    }
    
    // Add custom issues
    if (data.customIssues) {
        allIssues.push(data.customIssues);
    }

    if (allIssues.length > 0) {
        spins += `Issues: ${allIssues.join(', ')}\n`;
    }

    // Tools Info
    if (data.toolsInfo) {
        spins += `Tools: ${data.toolsInfo}\n`;
    }

    // Additional Instructions (without category prefixes)
    const allInstructions = [];
    if (data.accessInstructions && data.accessInstructions.length > 0) {
        allInstructions.push(...data.accessInstructions);
    }
    if (data.notifications && data.notifications.length > 0) {
        allInstructions.push(...data.notifications);
    }
    if (data.customInstructions) {
        allInstructions.push(data.customInstructions);
    }

    if (allInstructions.length > 0) {
        spins += `Additional Instructions: ${allInstructions.join(', ')}\n`;
    }

    // Repeat Service Call
    if (data.repeatServiceCall) {
        spins += `Repeat: ${data.repeatServiceCall}\n`;
    }

    return spins.trim();
}

// Legacy functions for backward compatibility
function generateCaseNotes() {
    updateCaseNotesLive();
}

function getCaseNotesFormData() {
    const form = document.getElementById('caseNotesForm');
    const formData = new FormData(form);
    const data = {};
    
    // Get all form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Get verification and authentication values from hidden inputs
    const verificationInput = document.getElementById('verificationCompleted');
    const authenticationInput = document.getElementById('authenticationMethod');
    
    data.verificationCompleted = verificationInput ? verificationInput.value : '';
    data.authenticationMethod = authenticationInput ? authenticationInput.value : '';
    
    // Debug logging
    console.log('Verification and Authentication values:', {
        verificationCompleted: data.verificationCompleted,
        authenticationMethod: data.authenticationMethod
    });
    
    // Add troubleshooting steps
    data.troubleshootingSteps = [...troubleshootingSteps];
    
    // Add equipment data
    data.equipmentSNs = [...equipmentSNs];
    data.equipmentModels = [...equipmentModels];
    
    // Add new fields data
    data.resolutions = [...resolutions];
    data.ticketNumbers = [...ticketNumbers];
    data.infoAssistDocs = [...infoAssistDocs];
    data.flowParagraphs = [...flowParagraphs];
    data.agentAssistSummaries = [...agentAssistSummaries];
    
    // Add call back scheduler data
    data.callBackReason = document.getElementById('callBackReason').value;
    data.callBackCaseNumber = document.getElementById('callBackCaseNumber').value;
    data.callBackDate = document.getElementById('callBackDate').value;
    data.callBackTime = document.getElementById('callBackTime').value;
    data.specificTime = document.getElementById('specificTime').value;
    
    return data;
}

function formatCaseNotes(data) {
    let notes = '';
    
    // Add each field if it has a value with proper spacing
    if (data.contactId) notes += `Contact ID: ${data.contactId}\n\n`;
    if (data.spokenTo) notes += `Spoken To: ${data.spokenTo}\n\n`;
    if (data.phoneNumber) notes += `Ph no.: ${data.phoneNumber}\n\n`;
    if (data.callBackNo) notes += `Call Back No.: ${data.callBackNo}\n\n`;
    if (data.accountNumber) notes += `Account Number: ${data.accountNumber}\n\n`;
    if (data.verificationCompleted) notes += `Verification Completed: ${data.verificationCompleted}\n\n`;
    if (data.authenticationMethod) {
        // Display different text for "Not Authorized" in case notes
        const displayText = data.authenticationMethod === 'Not Authorized' 
            ? 'Customer not authorized on the account' 
            : data.authenticationMethod;
        notes += `Authentication Method: ${displayText}\n\n`;
    }
    if (data.reasonOfCall) notes += `Reason of the call: ${data.reasonOfCall}\n\n`;
    
    // Add troubleshooting steps
    if (data.troubleshootingSteps && data.troubleshootingSteps.length > 0) {
        notes += `Troubleshooting Steps:\n`;
        data.troubleshootingSteps.forEach((step, index) => {
            notes += `• ${step}\n`;
        });
        notes += '\n';
    }
    
    // Add equipment information
    if (data.equipmentSNs && data.equipmentSNs.length > 0) {
        notes += `Affected Equipment SN: ${data.equipmentSNs.join(', ')}\n\n`;
    }
    if (data.equipmentModels && data.equipmentModels.length > 0) {
        notes += `Affected Equipment Model: ${data.equipmentModels.join(', ')}\n\n`;
    }
    
    // Add resolution information
    if (data.resolutions && data.resolutions.length > 0) {
        notes += `Resolution: ${data.resolutions.join(', ')}\n\n`;
    }
    
    // Add ticket numbers
    if (data.ticketNumbers && data.ticketNumbers.length > 0) {
        notes += `Relevant Ticket Number: ${data.ticketNumbers.join(', ')}\n\n`;
    }
    
    // Add info assist documentation as bullet points
    if (data.infoAssistDocs && data.infoAssistDocs.length > 0) {
        notes += `Info Assist / Support Docs Used:\n`;
        data.infoAssistDocs.forEach(doc => {
            notes += `• ${doc}\n`;
        });
        notes += '\n';
    }
    
    // Add agent assist summary information
    if (data.agentAssistSummaries && data.agentAssistSummaries.length > 0) {
        notes += `Agent Assist Summary:\n\n`;
        data.agentAssistSummaries.forEach(summary => {
            notes += `${summary}\n\n`;
        });
    }
    
    // Add flow information with proper line breaks
    if (data.flowParagraphs && data.flowParagraphs.length > 0) {
        notes += `Flow:\n\n`;
        data.flowParagraphs.forEach(paragraph => {
            notes += `${paragraph}\n\n`;
        });
    }
    
    // Add call backs information
    if (currentScheduledCalls.length > 0) {
        notes += `Call Backs Scheduled:\n`;
        currentScheduledCalls.forEach((call, index) => {
            const timeDisplay = call.specificTime || (call.time === 'morning' ? 'Morning' : call.time === 'afternoon' ? 'Afternoon' : 'Evening');
            const caseNumberDisplay = call.caseNumber ? ` (Case: ${call.caseNumber})` : '';
            notes += `• ${call.reason}${caseNumberDisplay} - ${call.date} at ${timeDisplay}\n`;
        });
        notes += '\n';
    } else if (data.callBackReason && data.callBackDate) {
        // Show pending call back if scheduler is filled but not yet scheduled
        const timeDisplay = data.specificTime || (data.callBackTime === 'morning' ? 'Morning' : data.callBackTime === 'afternoon' ? 'Afternoon' : 'Evening');
        const caseNumberDisplay = data.callBackCaseNumber ? ` (Case: ${data.callBackCaseNumber})` : '';
        notes += `Call Back Scheduled:\n`;
        notes += `• ${data.callBackReason}${caseNumberDisplay} - ${data.callBackDate} at ${timeDisplay}\n\n`;
    }
    
    if (data.rogersMastercard) notes += `Rogers Mastercard: ${data.rogersMastercard}\n\n`;
    
    return notes.trim();
}

function copyCaseNotes() {
    const content = document.getElementById('caseNotesContent').textContent;
    copyToClipboard(content, 'Case Notes copied to clipboard!');
}



function copySpins() {
    const spinsText = generateSpins();
    if (spinsText.trim()) {
        copyToClipboard(spinsText, 'SPINS copied to clipboard!');
    } else {
        // showNotification('No SPINS content to copy', 'warning');
    }
}

function clearSpinsForm() {
    if (confirm('Are you sure you want to clear the SPINS form?')) {
        // Clear form inputs
        const form = document.getElementById('spinsForm');
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.value = '';
        });
        
        // Clear all selected buttons
        document.querySelectorAll('.issue-btn.selected, .instruction-btn.selected').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Reset issue type selector to hidden state
        document.querySelectorAll('.issue-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Reset toggle button text
        const toggleBtn = document.querySelector('.issue-type-btn[data-type="toggle-all"]');
        if (toggleBtn) {
            toggleBtn.querySelector('.type-label').textContent = 'Show All';
        }
        
        // Hide all sections
        document.querySelectorAll('.product-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Clear custom fields
        document.getElementById('customIssues').value = '';
        document.getElementById('customInstructions').value = '';
        
        // Update displays
            updateSelectedIssuesDisplay();
    updateSelectedInstructionsDisplay();
        
        // Update live preview
        updateSpinsLive();
        
        // showNotification('SPINS form cleared', 'success');
    }
}

// Input actions functionality (paste and clear buttons)
function setupInputActions() {
    // Setup copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', handleCopy);
    });
    
    // Setup paste buttons
    document.querySelectorAll('.paste-btn').forEach(btn => {
        btn.addEventListener('click', handlePaste);
    });
    
    // Setup clear buttons
    document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', handleClear);
    });
    
    // Setup "same as phone number" checkbox
    const sameAsPhoneCheckbox = document.getElementById('sameAsPhone');
    if (sameAsPhoneCheckbox) {
        sameAsPhoneCheckbox.addEventListener('change', handleSameAsPhone);
    }
    
    console.log('Input actions setup complete');
    console.log('Clear buttons found:', document.querySelectorAll('.clear-btn').length);
    console.log('Paste buttons found:', document.querySelectorAll('.paste-btn').length);
}

async function handlePaste(e) {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    const targetId = e.target.closest('.paste-btn').getAttribute('data-target');
    const targetInput = document.getElementById(targetId);
    
    try {
        const text = await navigator.clipboard.readText();
        
        // For specific fields, directly save as tags without requiring Enter
        if (targetId === 'affectedEquipmentSN') {
            if (text.trim() && !equipmentSNs.includes(text.trim())) {
                equipmentSNs.push(text.trim());
                renderEquipmentSNs();
                updateCaseNotesLive();
                saveEquipmentData();
                showInputActionFeedback(e.target, 'Pasted!', 'success');
            } else {
                showInputActionFeedback(e.target, 'Pasted!', 'success');
            }
        } else if (targetId === 'agentAssistSummary') {
            if (text.trim()) {
                agentAssistSummaries.push(text.trim());
                renderAgentAssistSummaries();
                updateCaseNotesLive();
                saveEquipmentData();
                showInputActionFeedback(e.target, 'Pasted!', 'success');
            }
        } else if (targetId === 'relevantTicketNumber') {
            if (text.trim()) {
                ticketNumbers.push(text.trim());
                renderTicketNumbers();
                updateCaseNotesLive();
                saveEquipmentData();
                showInputActionFeedback(e.target, 'Pasted!', 'success');
            }
        } else if (targetId === 'infoAssist') {
            if (text.trim()) {
                infoAssistDocs.push(text.trim());
                renderInfoAssist();
                updateCaseNotesLive();
                saveEquipmentData();
                showInputActionFeedback(e.target, 'Pasted!', 'success');
            }
        } else if (targetId === 'flow') {
            if (text.trim()) {
                flowParagraphs.push(text.trim());
                renderFlowParagraphs();
                updateCaseNotesLive();
                saveEquipmentData();
                showInputActionFeedback(e.target, 'Pasted!', 'success');
            }
        } else {
            // For other fields, paste to input as before
            targetInput.value = text;
            targetInput.focus();
            
            // Trigger live update
            if (targetId === 'contactId' || targetId === 'spokenTo' || targetId === 'phoneNumber' || 
                targetId === 'callBackNo' || targetId === 'accountNumber') {
                updateCaseNotesLive();
            }
            
            // Show success feedback
            showInputActionFeedback(e.target, 'Pasted!', 'success');
        }
    } catch (err) {
        // Fallback for older browsers or when clipboard access is denied
        targetInput.focus();
        showInputActionFeedback(e.target, 'Paste manually (Ctrl+V)', 'warning');
    }
}

async function handleCopy(e) {
    const targetId = e.target.closest('.copy-btn').getAttribute('data-target');
    const targetInput = document.getElementById(targetId);
    const textToCopy = targetInput.value.trim();
    
    if (!textToCopy) {
        showInputActionFeedback(e.target, 'No text to copy!', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showInputActionFeedback(e.target, 'Copied!', 'success');
    } catch (err) {
        // Fallback for older browsers
        fallbackCopyToClipboard(textToCopy, 'Copied!');
        showInputActionFeedback(e.target, 'Copied!', 'success');
    }
}

function handleClear(e) {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    const targetId = e.target.closest('.clear-btn').getAttribute('data-target');
    const targetInput = document.getElementById(targetId);
    
    console.log('Clear button clicked for:', targetId);
    
    // Clear the input/textarea field
    if (targetInput) {
        // Temporarily disable blur event to prevent auto-saving
        const originalBlurHandler = targetInput.onblur;
        targetInput.onblur = null;
        
        targetInput.value = '';
        targetInput.focus();
        
        // Re-enable blur event after a short delay
        setTimeout(() => {
            targetInput.onblur = originalBlurHandler;
        }, 100);
        
        console.log('Input field cleared:', targetId);
    }
    
    // Trigger live update for basic fields
    if (targetId === 'contactId' || targetId === 'spokenTo' || targetId === 'phoneNumber' || 
        targetId === 'callBackNo' || targetId === 'accountNumber') {
        updateCaseNotesLive();
    }
    
    // Show feedback
    showInputActionFeedback(e.target, 'Cleared!', 'success');
}

function handleSameAsPhone(e) {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const callBackNo = document.getElementById('callBackNo');
    
    if (e.target.checked && phoneNumber) {
        callBackNo.value = phoneNumber;
        updateCaseNotesLive();
        showInputActionFeedback(e.target, 'Copied phone number!', 'success');
    } else if (!e.target.checked) {
        callBackNo.value = '';
        updateCaseNotesLive();
    }
}

function showInputActionFeedback(element, message, type) {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Set colors based on theme and type
    let backgroundColor, textColor;
    if (type === 'success') {
        backgroundColor = currentTheme === 'dark' ? '#10b981' : '#059669';
        textColor = '#ffffff';
    } else {
        backgroundColor = currentTheme === 'dark' ? '#f59e0b' : '#d97706';
        textColor = '#ffffff';
    }
    
    feedback.style.cssText = `
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        background: ${backgroundColor};
        color: ${textColor};
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
        animation: feedbackSlideIn 0.3s ease forwards;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        pointer-events: none;
    `;
    
    // Find the correct parent element with relative positioning
    let parentElement = element.parentElement;
    while (parentElement && getComputedStyle(parentElement).position === 'static') {
        parentElement = parentElement.parentElement;
    }
    
    // If no relative parent found, use the element's parent
    if (!parentElement) {
        parentElement = element.parentElement;
    }
    
    parentElement.appendChild(feedback);
    
    // Remove feedback after animation
    setTimeout(() => {
        feedback.style.animation = 'feedbackSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (feedback.parentElement) {
                feedback.parentElement.removeChild(feedback);
            }
        }, 300);
    }, 1500);
}

function showInputActionFeedbackAtPosition(event, message, type) {
    // Remove any existing feedback
    const existingFeedback = document.querySelector('.input-action-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `input-action-feedback ${type}`;
    feedback.textContent = message;
    
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Set colors based on theme and type
    let backgroundColor, textColor;
    if (type === 'success') {
        backgroundColor = currentTheme === 'dark' ? '#10b981' : '#059669';
        textColor = '#ffffff';
    } else {
        backgroundColor = currentTheme === 'dark' ? '#f59e0b' : '#d97706';
        textColor = '#ffffff';
    }
    
    // Position at mouse click position
    feedback.style.cssText = `
        position: fixed;
        left: ${event.clientX - 30}px;
        top: ${event.clientY - 40}px;
        background: ${backgroundColor};
        color: ${textColor};
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
        animation: feedbackSlideIn 0.3s ease forwards;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        pointer-events: none;
    `;
    
    // Add to body
    document.body.appendChild(feedback);
    
    // Remove feedback after animation
    setTimeout(() => {
        feedback.style.animation = 'feedbackSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (feedback.parentElement) {
                feedback.parentElement.removeChild(feedback);
            }
        }, 300);
    }, 1500);
}

// Equipment input functionality
function setupEquipmentInputs() {
    // Setup equipment SN input
    const equipmentSNInput = document.getElementById('affectedEquipmentSN');
    if (equipmentSNInput) {
        equipmentSNInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addEquipmentSN();
            }
        });
        
        equipmentSNInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                addEquipmentSN();
            }
        });
    }
    
    // Setup agent assist summary container click to paste
    const agentAssistContainer = document.getElementById('agentAssistContainer');
    if (agentAssistContainer) {
        agentAssistContainer.addEventListener('click', async function(e) {
            // Don't trigger if clicking on a tag or remove button
            if (e.target.closest('.equipment-tag') || e.target.closest('.remove-tag')) {
                return;
            }
            
            try {
                const text = await navigator.clipboard.readText();
                if (text.trim()) {
                    agentAssistSummaries.push(text.trim());
                    renderAgentAssistSummaries();
                    updateCaseNotesLive();
                    saveEquipmentData();
                    
                    // Show feedback at click position
                    showInputActionFeedbackAtPosition(e, 'Pasted!', 'success');
                }
            } catch (err) {
                showInputActionFeedbackAtPosition(e, 'Paste manually (Ctrl+V)', 'warning');
            }
        });
        
        // Add visual feedback for clickable area
        agentAssistContainer.style.cursor = 'pointer';
        agentAssistContainer.title = 'Click to paste from clipboard';
    }
    
    // Setup equipment model input
    const equipmentModelInput = document.getElementById('affectedEquipmentModel');
    if (equipmentModelInput) {
        equipmentModelInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addEquipmentModel();
            }
        });
        
        equipmentModelInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                addEquipmentModel();
            }
        });
    }
    
    // Setup model selection buttons
    document.querySelectorAll('.model-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const model = this.getAttribute('data-model');
            // Allow adding the same model multiple times
            equipmentModels.push(model);
            renderEquipmentModels();
            updateCaseNotesLive();
            saveEquipmentData();
            this.classList.add('selected');
            setTimeout(() => {
                this.classList.remove('selected');
            }, 300);
        });
    });
    
    // Setup resolution input
    const resolutionInput = document.getElementById('resolution');
    if (resolutionInput) {
        resolutionInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addResolution();
            }
        });
        
        resolutionInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                addResolution();
            }
        });
    }
    
    // Setup resolution selection buttons
    document.querySelectorAll('.resolution-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const resolution = this.getAttribute('data-resolution');
            // Allow adding the same resolution multiple times
            resolutions.push(resolution);
            renderResolutions();
            updateCaseNotesLive();
            saveEquipmentData();
            this.classList.add('selected');
            setTimeout(() => {
                this.classList.remove('selected');
            }, 300);
        });
    });
    
    // Setup ticket number input
    const ticketNumberInput = document.getElementById('relevantTicketNumber');
    if (ticketNumberInput) {
        ticketNumberInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTicketNumber();
            }
        });
        
        ticketNumberInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                addTicketNumber();
            }
        });
    }
    
    // Setup info assist input
    const infoAssistInput = document.getElementById('infoAssist');
    if (infoAssistInput) {
        infoAssistInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addInfoAssist();
            }
        });
        
        infoAssistInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                addInfoAssist();
            }
        });
    }
    
    // Setup flow input
    const flowInput = document.getElementById('flow');
    if (flowInput) {
        flowInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addFlowParagraph();
            }
        });
        
        flowInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                addFlowParagraph();
            }
        });
        
        // Auto-resize textarea
        flowInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    // Load saved equipment data
    loadEquipmentData();
}

function addEquipmentSN() {
    const input = document.getElementById('affectedEquipmentSN');
    const value = input.value.trim();
    
    if (value && !equipmentSNs.includes(value)) {
        equipmentSNs.push(value);
        renderEquipmentSNs();
        input.value = '';
        updateCaseNotesLive();
        saveEquipmentData();
    }
}

function addEquipmentModel() {
    const input = document.getElementById('affectedEquipmentModel');
    const value = input.value.trim();
    
    if (value) {
        // Allow adding the same model multiple times
        equipmentModels.push(value);
        renderEquipmentModels();
        input.value = '';
        updateCaseNotesLive();
        saveEquipmentData();
    }
}

function removeEquipmentSN(index) {
    equipmentSNs.splice(index, 1);
    renderEquipmentSNs();
    updateCaseNotesLive();
    saveEquipmentData();
}

function removeEquipmentModel(index) {
    equipmentModels.splice(index, 1);
    renderEquipmentModels();
    updateCaseNotesLive();
    saveEquipmentData();
}

function renderEquipmentSNs() {
    const container = document.getElementById('equipmentSNTags');
    container.innerHTML = '';
    
    equipmentSNs.forEach((sn, index) => {
        const tag = document.createElement('div');
        tag.className = 'equipment-tag';
        tag.innerHTML = `
            <span>${sn}</span>
            <button type="button" class="remove-tag" onclick="removeEquipmentSN(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
}

function renderEquipmentModels() {
    const container = document.getElementById('equipmentModelTags');
    container.innerHTML = '';
    
    equipmentModels.forEach((model, index) => {
        const tag = document.createElement('div');
        tag.className = 'equipment-tag';
        tag.innerHTML = `
            <span>${model}</span>
            <button type="button" class="remove-tag" onclick="removeEquipmentModel(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
}

// Resolution functions
function addResolution() {
    const input = document.getElementById('resolution');
    const value = input.value.trim();
    
    if (value) {
        // Allow adding the same resolution multiple times
        resolutions.push(value);
        renderResolutions();
        input.value = '';
        updateCaseNotesLive();
        saveEquipmentData();
    }
}

function removeResolution(index) {
    resolutions.splice(index, 1);
    renderResolutions();
    updateCaseNotesLive();
    saveEquipmentData();
}

function renderResolutions() {
    const container = document.getElementById('resolutionTags');
    container.innerHTML = '';
    
    resolutions.forEach((resolution, index) => {
        const tag = document.createElement('div');
        tag.className = 'equipment-tag';
        tag.innerHTML = `
            <span>${resolution}</span>
            <button type="button" class="remove-tag" onclick="removeResolution(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
}

// Ticket number functions
function addTicketNumber() {
    const input = document.getElementById('relevantTicketNumber');
    const value = input.value.trim();
    
    if (value && !ticketNumbers.includes(value)) {
        ticketNumbers.push(value);
        renderTicketNumbers();
        input.value = '';
        updateCaseNotesLive();
        saveEquipmentData();
    }
}

function removeTicketNumber(index) {
    ticketNumbers.splice(index, 1);
    renderTicketNumbers();
    updateCaseNotesLive();
    saveEquipmentData();
}

function renderTicketNumbers() {
    const container = document.getElementById('ticketNumberTags');
    container.innerHTML = '';
    
    ticketNumbers.forEach((ticket, index) => {
        const tag = document.createElement('div');
        tag.className = 'equipment-tag';
        tag.innerHTML = `
            <span>${ticket}</span>
            <button type="button" class="remove-tag" onclick="removeTicketNumber(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
}

// Info Assist functions
function addInfoAssist() {
    const input = document.getElementById('infoAssist');
    const value = input.value.trim();
    
    if (value && !infoAssistDocs.includes(value)) {
        infoAssistDocs.push(value);
        renderInfoAssist();
        input.value = '';
        updateCaseNotesLive();
        saveEquipmentData();
    }
}

function removeInfoAssist(index) {
    infoAssistDocs.splice(index, 1);
    renderInfoAssist();
    updateCaseNotesLive();
    saveEquipmentData();
}

function renderInfoAssist() {
    const container = document.getElementById('infoAssistTags');
    container.innerHTML = '';
    
    infoAssistDocs.forEach((doc, index) => {
        const tag = document.createElement('div');
        tag.className = 'equipment-tag';
        tag.innerHTML = `
            <span>${doc}</span>
            <button type="button" class="remove-tag" onclick="removeInfoAssist(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
}

// Flow functions
function extractFlowName(flowData) {
    // Look for the pattern "FLOW: [Flow Name]" in the flow data
    const flowMatch = flowData.match(/FLOW:\s*([^\n\r]+)/i);
    if (flowMatch && flowMatch[1]) {
        return flowMatch[1].trim();
    }
    // If no FLOW: pattern found, return first line or truncated content
    const firstLine = flowData.split('\n')[0].trim();
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
}

function addFlowParagraph() {
    const input = document.getElementById('flow');
    const value = input.value.trim();
    
    if (value) {
        // Allow adding the same flow multiple times
        flowParagraphs.push(value);
        renderFlowParagraphs();
        input.value = '';
        input.style.height = 'auto'; // Reset height
        updateCaseNotesLive();
        saveEquipmentData();
    }
}

function removeFlowParagraph(index) {
    flowParagraphs.splice(index, 1);
    renderFlowParagraphs();
    updateCaseNotesLive();
    saveEquipmentData();
}

function renderFlowParagraphs() {
    const container = document.getElementById('flowTags');
    container.innerHTML = '';
    
    flowParagraphs.forEach((paragraph, index) => {
        const tag = document.createElement('div');
        tag.className = 'flow-tag';
        
        // Extract the flow name for display
        const flowName = extractFlowName(paragraph);
        
        tag.innerHTML = `
            <div class="flow-preview" title="${paragraph}">${flowName}</div>
            <button type="button" class="remove-tag" onclick="removeFlowParagraph(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
}

function addAgentAssistSummary() {
    // This function is no longer needed since we only use paste functionality
    // Agent Assist Summary is now only added via paste button
}

function removeAgentAssistSummary(index) {
    agentAssistSummaries.splice(index, 1);
    renderAgentAssistSummaries();
    updateCaseNotesLive();
    saveEquipmentData();
}

function renderAgentAssistSummaries() {
    const container = document.getElementById('agentAssistTags');
    const placeholder = document.getElementById('agentAssistPlaceholder');
    container.innerHTML = '';
    
    agentAssistSummaries.forEach((summary, index) => {
        const tag = document.createElement('div');
        tag.className = 'equipment-tag';
        
        // Show first 30 characters with ellipsis for display
        const preview = summary.length > 30 ? summary.substring(0, 30) + '...' : summary;
        
        tag.innerHTML = `
            <span title="${summary}">${preview}</span>
            <button type="button" class="remove-tag" onclick="removeAgentAssistSummary(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
    
    // Show/hide placeholder based on whether there are tags
    if (placeholder) {
        if (agentAssistSummaries.length === 0) {
            placeholder.style.display = 'block';
        } else {
            placeholder.style.display = 'none';
        }
    }
}

function saveEquipmentData() {
    localStorage.setItem('caseNotes_equipmentSNs', JSON.stringify(equipmentSNs));
    localStorage.setItem('caseNotes_equipmentModels', JSON.stringify(equipmentModels));
    localStorage.setItem('caseNotes_resolutions', JSON.stringify(resolutions));
    localStorage.setItem('caseNotes_ticketNumbers', JSON.stringify(ticketNumbers));
    localStorage.setItem('caseNotes_infoAssist', JSON.stringify(infoAssistDocs));
    localStorage.setItem('caseNotes_flowParagraphs', JSON.stringify(flowParagraphs));
    localStorage.setItem('caseNotes_agentAssistSummaries', JSON.stringify(agentAssistSummaries));
}

function loadEquipmentData() {
    const savedSNs = localStorage.getItem('caseNotes_equipmentSNs');
    const savedModels = localStorage.getItem('caseNotes_equipmentModels');
    const savedResolutions = localStorage.getItem('caseNotes_resolutions');
    const savedTicketNumbers = localStorage.getItem('caseNotes_ticketNumbers');
    const savedInfoAssist = localStorage.getItem('caseNotes_infoAssist');
    const savedFlowParagraphs = localStorage.getItem('caseNotes_flowParagraphs');
    const savedAgentAssistSummaries = localStorage.getItem('caseNotes_agentAssistSummaries');
    
    if (savedSNs) {
        equipmentSNs = JSON.parse(savedSNs);
        renderEquipmentSNs();
    }
    
    if (savedModels) {
        equipmentModels = JSON.parse(savedModels);
        renderEquipmentModels();
    }
    
    if (savedResolutions) {
        resolutions = JSON.parse(savedResolutions);
        renderResolutions();
    }
    
    if (savedTicketNumbers) {
        ticketNumbers = JSON.parse(savedTicketNumbers);
        renderTicketNumbers();
    }
    
    if (savedInfoAssist) {
        infoAssistDocs = JSON.parse(savedInfoAssist);
        renderInfoAssist();
    }
    
    if (savedFlowParagraphs) {
        flowParagraphs = JSON.parse(savedFlowParagraphs);
        renderFlowParagraphs();
    }
    
    if (savedAgentAssistSummaries) {
        agentAssistSummaries = JSON.parse(savedAgentAssistSummaries);
        renderAgentAssistSummaries();
    }
}

// Reason selector functionality
function setupReasonSelector() {
    // Setup reason buttons
    document.querySelectorAll('.reason-btn').forEach(btn => {
        btn.addEventListener('click', toggleReason);
    });
    
    // Setup custom reason input
    const customReasonInput = document.getElementById('customReason');
    if (customReasonInput) {
        customReasonInput.addEventListener('input', updateReasonDisplay);
    }
    
    // Setup copy reason button
    const copyReasonBtn = document.querySelector('.copy-reason-btn');
    if (copyReasonBtn) {
        copyReasonBtn.addEventListener('click', copyReasonToClipboard);
    }
    
    // Setup clear reasons button
    const clearReasonsBtn = document.querySelector('.clear-reasons-btn');
    if (clearReasonsBtn) {
        clearReasonsBtn.addEventListener('click', clearSelectedReasons);
    }
    
    // Setup clear custom reason button
    const clearCustomReasonBtn = document.querySelector('.clear-custom-reason-btn');
    if (clearCustomReasonBtn) {
        clearCustomReasonBtn.addEventListener('click', clearCustomReason);
    }
}

function toggleReason(e) {
    const btn = e.currentTarget;
    const reason = btn.getAttribute('data-reason');
    
    // Toggle selected state
    btn.classList.toggle('selected');
    
    // Update display
    updateReasonDisplay();
}



function updateReasonDisplay() {
    const selectedReasons = [];
    
    // Get selected reason buttons
    document.querySelectorAll('.reason-btn.selected').forEach(btn => {
        selectedReasons.push(btn.getAttribute('data-reason'));
    });
    
    // Get custom reason
    const customReason = document.getElementById('customReason').value.trim();
    if (customReason) {
        selectedReasons.push(customReason);
    }
    
    // Update display
    const reasonDisplay = document.getElementById('reasonDisplay');
    if (selectedReasons.length === 0) {
        reasonDisplay.textContent = 'No reasons selected';
        reasonDisplay.style.fontStyle = 'italic';
        reasonDisplay.style.color = 'var(--text-muted)';
    } else {
        reasonDisplay.textContent = selectedReasons.join(', ');
        reasonDisplay.style.fontStyle = 'normal';
        reasonDisplay.style.color = 'var(--text-primary)';
    }
    
    // Update the hidden reasonOfCall field for form submission
    const reasonOfCallField = document.getElementById('reasonOfCall');
    if (reasonOfCallField) {
        reasonOfCallField.value = selectedReasons.join(', ');
    }
    
    // Trigger live update
    updateCaseNotesLive();
}

function copyReasonToClipboard() {
    const reasonText = document.getElementById('reasonDisplay').textContent;
    const copyBtn = document.querySelector('.copy-reason-btn');
    
    if (reasonText && reasonText !== 'No reasons selected') {
        // Use the same clipboard function but with small popup feedback
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(reasonText).then(() => {
                showInputActionFeedback(copyBtn, 'Copied!', 'success');
            }).catch(() => {
                fallbackCopyToClipboard(reasonText, 'Copied!');
                showInputActionFeedback(copyBtn, 'Copied!', 'success');
            });
        } else {
            fallbackCopyToClipboard(reasonText, 'Copied!');
            showInputActionFeedback(copyBtn, 'Copied!', 'success');
        }
    } else {
        showInputActionFeedback(copyBtn, 'No reason to copy', 'warning');
    }
}

function clearSelectedReasons() {
    // Clear all selected reason buttons only
    document.querySelectorAll('.reason-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Update display
    updateReasonDisplay();
    // showNotification('Selected reasons cleared!', 'success');
}

function clearCustomReason() {
    const customReasonInput = document.getElementById('customReason');
    if (customReasonInput) {
        customReasonInput.value = '';
        updateReasonDisplay();
        // showNotification('Custom reason cleared!', 'success');
    }
}

// Auto-population functionality
function setupAutoPopulation() {
    // Auto-populate SPINS from Case Notes when switching tabs
    const spinsTabBtn = document.querySelector('[data-tab="spins"]');
    spinsTabBtn.addEventListener('click', autoPopulateSpins);
    
    // Track manual modifications to SPINS fields
    const spinsFields = ['customerName', 'spinsPhoneNumber', 'serialNumber', 'equipmentNameModel', 'issue'];
    spinsFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => {
                spinsFieldsModified = true;
            });
        }
    });
}

function autoPopulateSpins() {
    // Only auto-populate if fields haven't been manually modified
    if (spinsFieldsModified) {
        return;
    }
    
    // Get data from case notes form
    const caseNotesData = getCaseNotesFormData();
    
    // Populate SPINS form with relevant data
    if (caseNotesData.spokenTo) {
        document.getElementById('customerName').value = caseNotesData.spokenTo;
    }
    if (caseNotesData.phoneNumber) {
        document.getElementById('spinsPhoneNumber').value = caseNotesData.phoneNumber;
    }
    if (caseNotesData.equipmentSNs && caseNotesData.equipmentSNs.length > 0) {
        document.getElementById('serialNumber').value = caseNotesData.equipmentSNs.join(', ');
    }
    if (caseNotesData.equipmentModels && caseNotesData.equipmentModels.length > 0) {
        document.getElementById('equipmentNameModel').value = caseNotesData.equipmentModels.join(', ');
    }
    if (caseNotesData.reasonOfCall) {
        document.getElementById('issue').value = caseNotesData.reasonOfCall;
    }
}

// Utility functions
function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(successMessage, 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text, successMessage);
        });
    } else {
        fallbackCopyToClipboard(text, successMessage);
    }
}

function fallbackCopyToClipboard(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification(successMessage, 'success');
    } catch (err) {
        showNotification('Failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Form validation and enhancement
document.addEventListener('DOMContentLoaded', function() {
    // Add input validation and enhancement for Case Notes form
    const caseNotesForm = document.getElementById('caseNotesForm');
    if (caseNotesForm) {
        const caseNotesInputs = caseNotesForm.querySelectorAll('input, textarea');
        caseNotesInputs.forEach(input => {
            // Skip equipment inputs as they are handled separately
            if (input.id === 'affectedEquipmentSN' || input.id === 'affectedEquipmentModel' || 
                input.id === 'resolution' || input.id === 'relevantTicketNumber' || input.id === 'infoAssist' ||
                input.id === 'flow') {
                return;
            }
            
            // Add focus effects
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
            
            // Auto-save to localStorage
            input.addEventListener('input', function() {
                localStorage.setItem(`caseNotes_${this.id}`, this.value);
            });
            
            // Load from localStorage (only if not cleared)
            if (!localStorageCleared) {
                const savedValue = localStorage.getItem(`caseNotes_${input.id}`);
                if (savedValue && savedValue.trim() !== '') {
                    input.value = savedValue;
                }
            }
        });
    }
    
    // Add input validation and enhancement for SPINS form
    const spinsForm = document.getElementById('spinsForm');
    if (spinsForm) {
        const spinsInputs = spinsForm.querySelectorAll('input, textarea');
        spinsInputs.forEach(input => {
            // Add focus effects
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
            
            // Auto-save to localStorage
            input.addEventListener('input', function() {
                localStorage.setItem(`spins_${this.id}`, this.value);
            });
            
            // Load from localStorage (only if not cleared)
            if (!localStorageCleared) {
                const savedValue = localStorage.getItem(`spins_${input.id}`);
                if (savedValue && savedValue.trim() !== '') {
                    input.value = savedValue;
                }
            }
        });
    }
    
    // Handle radio button state persistence (moved to setupRadioButtons)
    // Radio button localStorage handling is now done in setupRadioButtons function
    
    // Clear form button is now handled by floating action buttons
    
    // Force initial update after everything is loaded
    setTimeout(() => {
        console.log('DOM fully loaded, forcing initial update...');
        updateCaseNotesLive();
    }, 500);
}); 

function initializeCallBackScheduler() {
    setupCallBackScheduler();
    setupCallBackTracker();
    setupNotificationSystem();
    loadCallBacks();
    updateCallBackStats();
    startCallbackReminderCheck();
}

function setupCallBackScheduler() {
    // Get all required elements
    const callBackDate = document.getElementById('callBackDate');
    const scheduleCallBackBtn = document.getElementById('scheduleCallBackBtn');
    const clearSchedulerBtn = document.getElementById('clearSchedulerBtn');
    const callBackTime = document.getElementById('callBackTime');
    const specificTime = document.getElementById('specificTime');
    const callBackReason = document.getElementById('callBackReason');
    const callBackCaseNumber = document.getElementById('callBackCaseNumber');
    
    // Set default date to today if element exists
    if (callBackDate) {
        const today = new Date().toISOString().split('T')[0];
        callBackDate.value = today;
    }
    
    // Quick schedule buttons
    document.querySelectorAll('.quick-schedule-btn').forEach(btn => {
        btn.addEventListener('click', handleQuickSchedule);
    });
    
    // Add event listeners only if elements exist
    if (scheduleCallBackBtn) {
        scheduleCallBackBtn.addEventListener('click', scheduleCallBack);
    }
    
    if (clearSchedulerBtn) {
        clearSchedulerBtn.addEventListener('click', clearScheduler);
    }
    
    if (callBackTime) {
        callBackTime.addEventListener('change', handleTimeSelection);
    }
    
    if (specificTime) {
        specificTime.addEventListener('change', handleSpecificTime);
    }
    
    // Add event listeners for live preview updates with debouncing
    let callbackUpdateTimeout;
    const debouncedCallbackUpdate = () => {
        clearTimeout(callbackUpdateTimeout);
        callbackUpdateTimeout = setTimeout(() => {
            const currentTab = document.querySelector('.tab-btn.active');
            if (currentTab && currentTab.dataset.tab === 'case-notes') {
                updateCaseNotesLive();
            }
        }, 300);
    };
    
    if (callBackReason) {
        callBackReason.addEventListener('change', debouncedCallbackUpdate);
    }
    if (callBackCaseNumber) {
        callBackCaseNumber.addEventListener('input', debouncedCallbackUpdate);
    }
    if (callBackDate) {
        callBackDate.addEventListener('change', debouncedCallbackUpdate);
    }
    if (callBackTime) {
        callBackTime.addEventListener('change', debouncedCallbackUpdate);
    }
    if (specificTime) {
        specificTime.addEventListener('input', debouncedCallbackUpdate);
    }
}

function handleQuickSchedule(e) {
    const hours = parseFloat(e.target.dataset.hours);
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    
    // Set date
    document.getElementById('callBackDate').value = scheduledTime.toISOString().split('T')[0];
    
    // Set time based on hours
    if (hours <= 0.5) {
        document.getElementById('callBackTime').value = 'afternoon';
    } else if (hours <= 4) {
        document.getElementById('callBackTime').value = 'afternoon';
    } else if (hours <= 24) {
        document.getElementById('callBackTime').value = 'morning';
    } else {
        document.getElementById('callBackTime').value = 'evening';
    }
    
    // Set specific time
    const timeString = scheduledTime.toTimeString().slice(0, 5);
    document.getElementById('specificTime').value = timeString;
    
    // Highlight the button
    document.querySelectorAll('.quick-schedule-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Auto-fill reason if not set
    if (!document.getElementById('callBackReason').value) {
        if (hours <= 4) {
            document.getElementById('callBackReason').value = 'Follow Up';
        } else {
            document.getElementById('callBackReason').value = 'Customer Request';
        }
    }
}

function handleTimeSelection(e) {
    const timeValue = e.target.value;
    const specificTimeInput = document.getElementById('specificTime');
    
    if (timeValue === 'morning') {
        specificTimeInput.value = '10:00';
    } else if (timeValue === 'afternoon') {
        specificTimeInput.value = '14:00';
    } else if (timeValue === 'evening') {
        specificTimeInput.value = '18:00';
    }
}

function handleSpecificTime(e) {
    // Clear the time selection when specific time is entered
    document.getElementById('callBackTime').value = '';
}

function scheduleCallBack() {
    const reason = document.getElementById('callBackReason').value;
    const caseNumber = document.getElementById('callBackCaseNumber').value;
    const date = document.getElementById('callBackDate').value;
    const time = document.getElementById('callBackTime').value;
    const specificTime = document.getElementById('specificTime').value;
    
    console.log('Scheduling call back with:', { reason, caseNumber, date, time, specificTime });
    
    if (!reason || reason.trim() === '') {
        showNotification('Please select a reason for the call back', 'error');
        return;
    }
    
    if (!date || date.trim() === '') {
        showNotification('Please select a date for the call back', 'error');
        return;
    }
    
    // Get form data for case details
    const formData = getCaseNotesFormData();
    
    // Create call back object
    const callBack = {
        id: Date.now().toString(),
        reason: reason,
        caseNumber: caseNumber,
        date: date,
        time: time,
        specificTime: specificTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
        caseDetails: {
            contactId: formData.contactId,
            spokenTo: formData.spokenTo,
            phoneNumber: formData.phoneNumber,
            callBackNo: formData.callBackNo,
            accountNumber: formData.accountNumber
        }
    };
    
    // Add to callbacks array
    callbacks.push(callBack);
    
    // Save to localStorage
    saveCallBacks();
    
    // Add to current scheduled calls for this session
    currentScheduledCalls.push(callBack);
    
    // Update displays
    renderScheduledCalls();
    updateCallBackStats();
    
    // Update live case notes preview
    updateCaseNotesLive();
    
    // Clear scheduler
    clearScheduler();
    
    showNotification('Call back scheduled successfully!', 'success');
}

function clearScheduler() {
    document.getElementById('callBackReason').value = '';
    document.getElementById('callBackCaseNumber').value = '';
    document.getElementById('callBackDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('callBackTime').value = '';
    document.getElementById('specificTime').value = '';
    
    // Remove active class from quick schedule buttons
    document.querySelectorAll('.quick-schedule-btn').forEach(btn => btn.classList.remove('active'));
}

function renderScheduledCalls() {
    const container = document.getElementById('scheduledCallsList');
    container.innerHTML = '';
    
    if (currentScheduledCalls.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-style: italic;">No call backs scheduled for this session</p>';
        return;
    }
    
    currentScheduledCalls.forEach(call => {
        const callElement = createScheduledCallElement(call);
        container.appendChild(callElement);
    });
}

function createScheduledCallElement(call) {
    const div = document.createElement('div');
    div.className = 'scheduled-call-item';
    
    const timeDisplay = call.specificTime || (call.time === 'morning' ? 'Morning' : call.time === 'afternoon' ? 'Afternoon' : 'Evening');
    const caseNumberDisplay = call.caseNumber ? ` | Case: ${call.caseNumber}` : '';
    
    div.innerHTML = `
        <div class="call-info">
            <div class="call-reason">${call.reason}${caseNumberDisplay}</div>
            <div class="call-details">${call.date} at ${timeDisplay}</div>
        </div>
        <div class="call-actions">
            <button type="button" class="call-action-btn edit-call-btn" onclick="editScheduledCall('${call.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button type="button" class="call-action-btn delete-call-btn" onclick="deleteScheduledCall('${call.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return div;
}

function editScheduledCall(id) {
    const call = currentScheduledCalls.find(c => c.id === id);
    if (!call) return;
    
    // Populate scheduler with call data
    document.getElementById('callBackReason').value = call.reason;
    document.getElementById('callBackCaseNumber').value = call.caseNumber || '';
    document.getElementById('callBackDate').value = call.date;
    document.getElementById('callBackTime').value = call.time;
    document.getElementById('specificTime').value = call.specificTime;
    
    // Remove from current scheduled calls only
    currentScheduledCalls = currentScheduledCalls.filter(c => c.id !== id);
    
    // Update displays
    renderScheduledCalls();
    updateCaseNotesLive();
    
    // showNotification('Call back loaded for editing', 'info');
}

function deleteScheduledCall(id) {
    if (confirm('Are you sure you want to delete this call back from the current session?')) {
        // Only remove from current session, not from the tracker
        currentScheduledCalls = currentScheduledCalls.filter(c => c.id !== id);
        
        renderScheduledCalls();
        updateCaseNotesLive();
        
        // showNotification('Call back removed from current session', 'success');
    }
}

// Call Back Tracker functionality
function setupCallBackTracker() {
    // Filters
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const refreshCallbacksBtn = document.getElementById('refreshCallbacksBtn');
    const clearAllCallBacksBtn = document.getElementById('clearAllCallBacksBtn');
    
    // Only add event listeners if elements exist
    if (statusFilter) {
        statusFilter.addEventListener('change', filterCallBacks);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', filterCallBacks);
    }
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', clearCompletedCallBacks);
    }
    if (refreshCallbacksBtn) {
        refreshCallbacksBtn.addEventListener('click', refreshCallBacks);
    }
    if (clearAllCallBacksBtn) {
        clearAllCallBacksBtn.addEventListener('click', clearAllCallBacks);
    }
}

function loadCallBacks() {
    renderCallBacksList();
}

function renderCallBacksList() {
    const container = document.getElementById('callbacksList');
    const noCallbacks = document.getElementById('noCallbacks');
    
    // Check if elements exist before proceeding
    if (!container || !noCallbacks) {
        return;
    }
    
    if (callbacks.length === 0) {
        container.style.display = 'none';
        noCallbacks.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noCallbacks.style.display = 'none';
    
    // Sort callbacks by date and time
    const sortedCallbacks = [...callbacks].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.specificTime || getDefaultTime(a.time)}`);
        const dateB = new Date(`${b.date} ${b.specificTime || getDefaultTime(b.time)}`);
        return dateA - dateB;
    });
    
    container.innerHTML = '';
    
    // Separate today's callbacks from others
    const today = new Date().toISOString().split('T')[0];
    const todaysCallbacks = sortedCallbacks.filter(callback => callback.date === today);
    const otherCallbacks = sortedCallbacks.filter(callback => callback.date !== today);
    
    // Add today's callbacks section
    if (todaysCallbacks.length > 0) {
        // Add today's section header
        const todayHeader = document.createElement('div');
        todayHeader.className = 'today-section-header';
        todayHeader.innerHTML = `
            <div class="today-header-content">
                <i class="fas fa-calendar-day"></i>
                <span>Today's Call Backs (${todaysCallbacks.length})</span>
            </div>
        `;
        container.appendChild(todayHeader);
        
        // Add today's callbacks
        todaysCallbacks.forEach(callback => {
            const callbackElement = createCallBackElement(callback);
            container.appendChild(callbackElement);
        });
    } else {
        // Add "no callbacks today" message
        const noTodayHeader = document.createElement('div');
        noTodayHeader.className = 'today-section-header no-today';
        noTodayHeader.innerHTML = `
            <div class="today-header-content">
                <i class="fas fa-calendar-day"></i>
                <span>Today's Call Backs</span>
            </div>
        `;
        container.appendChild(noTodayHeader);
        
        const noTodayMessage = document.createElement('div');
        noTodayMessage.className = 'no-today-message';
        noTodayMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>No call backs scheduled for today</span>
        `;
        container.appendChild(noTodayMessage);
    }
    
    // Add separator if there are other callbacks
    if (otherCallbacks.length > 0) {
        const separator = document.createElement('div');
        separator.className = 'callback-separator';
        separator.innerHTML = `
            <div class="separator-content">
                <span>Upcoming Call Backs</span>
            </div>
        `;
        container.appendChild(separator);
        
        // Add other callbacks
        otherCallbacks.forEach(callback => {
            const callbackElement = createCallBackElement(callback);
            container.appendChild(callbackElement);
        });
    }
}

function getDefaultTime(timeSlot) {
    switch (timeSlot) {
        case 'morning': return '10:00';
        case 'afternoon': return '14:00';
        case 'evening': return '18:00';
        default: return '10:00';
    }
}

function formatDateForDisplay(dateString) {
    // Parse the date string (YYYY-MM-DD) and format it without timezone issues
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return 'Invalid Date';
    }
    
    const [year, month, day] = dateString.split('-');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = monthNames[parseInt(month) - 1];
    const dayNum = parseInt(day);
    
    return `${monthName} ${dayNum}, ${year}`;
}

function createCallBackElement(callback) {
    const div = document.createElement('div');
    div.className = `callback-item ${callback.status}`;
    
    const today = new Date().toISOString().split('T')[0];
    if (callback.date === today) {
        div.classList.add('today');
    }
    
    const timeDisplay = callback.specificTime || getDefaultTime(callback.time);
    
    // Format date without timezone issues - use direct string manipulation
    const formattedDate = formatDateForDisplay(callback.date);
    
    div.innerHTML = `
        <div class="callback-header">
            <div class="callback-title">
                <i class="fas fa-phone"></i>
                ${callback.reason}
            </div>
            <div class="callback-status ${callback.status}">
                ${callback.status}
            </div>
        </div>
        <div class="callback-content">
            <div class="callback-detail">
                <div class="callback-detail-label">Date & Time</div>
                <div class="callback-detail-value">
                    ${formattedDate} at ${timeDisplay}
                    <button type="button" class="copy-detail-btn" onclick="copyToClipboard('${formattedDate} at ${timeDisplay}', 'Date & Time copied!')" title="Copy Date & Time">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="callback-detail">
                <div class="callback-detail-label">Case Number</div>
                <div class="callback-detail-value">
                    ${callback.caseNumber || 'N/A'}
                    ${callback.caseNumber ? `<button type="button" class="copy-detail-btn" onclick="copyToClipboard('${callback.caseNumber}', 'Case Number copied!')" title="Copy Case Number">
                        <i class="fas fa-copy"></i>
                    </button>` : ''}
                </div>
            </div>
            <div class="callback-detail">
                <div class="callback-detail-label">Customer</div>
                <div class="callback-detail-value">
                    ${callback.caseDetails.spokenTo || 'N/A'}
                    ${callback.caseDetails.spokenTo ? `<button type="button" class="copy-detail-btn" onclick="copyToClipboard('${callback.caseDetails.spokenTo}', 'Customer name copied!')" title="Copy Customer Name">
                        <i class="fas fa-copy"></i>
                    </button>` : ''}
                </div>
            </div>
            <div class="callback-detail">
                <div class="callback-detail-label">Phone</div>
                <div class="callback-detail-value">
                    ${callback.caseDetails.callBackNo || callback.caseDetails.phoneNumber || 'N/A'}
                    ${(callback.caseDetails.callBackNo || callback.caseDetails.phoneNumber) ? `<button type="button" class="copy-detail-btn" onclick="copyToClipboard('${callback.caseDetails.callBackNo || callback.caseDetails.phoneNumber}', 'Phone number copied!')" title="Copy Phone Number">
                        <i class="fas fa-copy"></i>
                    </button>` : ''}
                </div>
            </div>
            <div class="callback-detail">
                <div class="callback-detail-label">Account</div>
                <div class="callback-detail-value">
                    ${callback.caseDetails.accountNumber || 'N/A'}
                    ${callback.caseDetails.accountNumber ? `<button type="button" class="copy-detail-btn" onclick="copyToClipboard('${callback.caseDetails.accountNumber}', 'Account number copied!')" title="Copy Account Number">
                        <i class="fas fa-copy"></i>
                    </button>` : ''}
                </div>
            </div>
        </div>
        <div class="callback-actions">
            ${callback.status === 'pending' ? `
                <button type="button" class="callback-action-btn complete-callback-btn" onclick="completeCallBack('${callback.id}')">
                    <i class="fas fa-check"></i> Complete
                </button>
            ` : ''}
            <button type="button" class="callback-action-btn edit-callback-btn" onclick="editCallBack('${callback.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button type="button" class="callback-action-btn delete-callback-btn" onclick="deleteCallBack('${callback.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return div;
}

function completeCallBack(id) {
    const callback = callbacks.find(c => c.id === id);
    if (callback) {
        callback.status = 'completed';
        callback.completedAt = new Date().toISOString();
        
        saveCallBacks();
        renderCallBacksList();
        updateCallBackStats();
        
        // showNotification('Call back marked as completed', 'success');
    }
}

function editCallBack(id) {
    const callback = callbacks.find(c => c.id === id);
    if (!callback) return;
    
    // Create a simple edit modal or use the scheduler
    const newReason = prompt('Enter new reason:', callback.reason);
    if (newReason === null) return;
    
    const newCaseNumber = prompt('Enter new case number:', callback.caseNumber || '');
    if (newCaseNumber === null) return;
    
    const newDate = prompt('Enter new date (YYYY-MM-DD):', callback.date);
    if (newDate === null) return;
    
    const newTime = prompt('Enter new time (HH:MM):', callback.specificTime || getDefaultTime(callback.time));
    if (newTime === null) return;
    
    // Validate date format
    if (newDate && !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        showNotification('Invalid date format. Please use YYYY-MM-DD', 'error');
        return;
    }
    
    // Validate that the date is valid (without timezone issues)
    if (newDate) {
        const [year, month, day] = newDate.split('-');
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const dayNum = parseInt(day);
        
        if (yearNum < 1900 || yearNum > 2100 || monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
            showNotification('Invalid date. Please enter a valid date.', 'error');
            return;
        }
        
        // Check for valid day in month
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (yearNum % 4 === 0 && (yearNum % 100 !== 0 || yearNum % 400 === 0)) {
            daysInMonth[1] = 29; // Leap year
        }
        
        if (dayNum > daysInMonth[monthNum - 1]) {
            showNotification('Invalid date. Please enter a valid date.', 'error');
            return;
        }
    }
    
    callback.reason = newReason;
    callback.caseNumber = newCaseNumber;
    callback.date = newDate;
    callback.specificTime = newTime;
    
    saveCallBacks();
    renderCallBacksList();
    updateCallBackStats();
    
    showNotification('Call back updated', 'success');
}

function deleteCallBack(id) {
    if (confirm('Are you sure you want to delete this call back?')) {
        callbacks = callbacks.filter(c => c.id !== id);
        currentScheduledCalls = currentScheduledCalls.filter(c => c.id !== id);
        
        saveCallBacks();
        renderCallBacksList();
        renderScheduledCalls();
        updateCallBackStats();
        
        showNotification('Call back deleted', 'success');
    }
}

function filterCallBacks() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    const filteredCallbacks = callbacks.filter(callback => {
        // Status filter
        if (statusFilter !== 'all' && callback.status !== statusFilter) {
            return false;
        }
        
        // Date filter
        if (dateFilter !== 'all') {
            const callbackDate = new Date(callback.date + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Calculate start and end of current week (Sunday to Saturday)
            const startOfWeek = new Date(today);
            const dayOfWeek = today.getDay();
            startOfWeek.setDate(today.getDate() - dayOfWeek);
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            switch (dateFilter) {
                case 'today':
                    return callback.date === today.toISOString().split('T')[0];
                case 'tomorrow':
                    return callback.date === tomorrow.toISOString().split('T')[0];
                case 'week':
                    return callbackDate >= startOfWeek && callbackDate <= endOfWeek;
                default:
                    return true;
            }
        }
        
        return true;
    });
    
    renderFilteredCallBacks(filteredCallbacks);
}

function renderFilteredCallBacks(filteredCallbacks) {
    const container = document.getElementById('callbacksList');
    const noCallbacks = document.getElementById('noCallbacks');
    
    if (filteredCallbacks.length === 0) {
        container.style.display = 'none';
        noCallbacks.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noCallbacks.style.display = 'none';
    
    // Sort filtered callbacks
    const sortedCallbacks = [...filteredCallbacks].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.specificTime || getDefaultTime(a.time)}`);
        const dateB = new Date(`${b.date} ${b.specificTime || getDefaultTime(b.time)}`);
        return dateA - dateB;
    });
    
    container.innerHTML = '';
    
    // Separate today's callbacks from others (only if not filtering by date)
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    if (dateFilter === 'all' || dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        const todaysCallbacks = sortedCallbacks.filter(callback => callback.date === today);
        const otherCallbacks = sortedCallbacks.filter(callback => callback.date !== today);
        
        // Add today's callbacks section
        if (todaysCallbacks.length > 0) {
            const todayHeader = document.createElement('div');
            todayHeader.className = 'today-section-header';
            todayHeader.innerHTML = `
                <div class="today-header-content">
                    <i class="fas fa-calendar-day"></i>
                    <span>Today's Call Backs (${todaysCallbacks.length})</span>
                </div>
            `;
            container.appendChild(todayHeader);
            
            todaysCallbacks.forEach(callback => {
                const callbackElement = createCallBackElement(callback);
                container.appendChild(callbackElement);
            });
        } else if (dateFilter === 'all') {
            const noTodayHeader = document.createElement('div');
            noTodayHeader.className = 'today-section-header no-today';
            noTodayHeader.innerHTML = `
                <div class="today-header-content">
                    <i class="fas fa-calendar-day"></i>
                    <span>Today's Call Backs</span>
                </div>
            `;
            container.appendChild(noTodayHeader);
            
            const noTodayMessage = document.createElement('div');
            noTodayMessage.className = 'no-today-message';
            noTodayMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>No call backs scheduled for today</span>
            `;
            container.appendChild(noTodayMessage);
        }
        
        // Add separator if there are other callbacks
        if (otherCallbacks.length > 0) {
            const separator = document.createElement('div');
            separator.className = 'callback-separator';
            separator.innerHTML = `
                <div class="separator-content">
                    <span>Upcoming Call Backs</span>
                </div>
            `;
            container.appendChild(separator);
            
            otherCallbacks.forEach(callback => {
                const callbackElement = createCallBackElement(callback);
                container.appendChild(callbackElement);
            });
        }
    } else {
        // For other date filters, show all callbacks without separation
        sortedCallbacks.forEach(callback => {
            const callbackElement = createCallBackElement(callback);
            container.appendChild(callbackElement);
        });
    }
}

function clearCompletedCallBacks() {
    if (confirm('Are you sure you want to clear all completed call backs?')) {
        callbacks = callbacks.filter(c => c.status !== 'completed');
        currentScheduledCalls = currentScheduledCalls.filter(c => c.status !== 'completed');
        
        saveCallBacks();
        renderCallBacksList();
        renderScheduledCalls();
        updateCallBackStats();
        
        showNotification('Completed call backs cleared', 'success');
    }
}

function clearAllCallBacks() {
    if (confirm('Are you sure you want to clear ALL call backs? This action cannot be undone.')) {
        callbacks = [];
        currentScheduledCalls = [];
        
        saveCallBacks();
        renderCallBacksList();
        renderScheduledCalls();
        updateCallBackStats();
        
        showNotification('All call backs cleared', 'success');
    }
}

function refreshCallBacks() {
    loadCallBacks();
    updateCallBackStats();
    showNotification('Call backs refreshed', 'success');
}

function updateCallBackStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const todayCalls = callbacks.filter(c => c.date === today).length;
    const pendingCalls = callbacks.filter(c => c.status === 'pending').length;
    const completedCalls = callbacks.filter(c => c.status === 'completed').length;
    
    const todayCallsCount = document.getElementById('todayCallsCount');
    const pendingCallsCount = document.getElementById('pendingCallsCount');
    const completedCallsCount = document.getElementById('completedCallsCount');
    
    if (todayCallsCount) {
        todayCallsCount.textContent = todayCalls;
    }
    if (pendingCallsCount) {
        pendingCallsCount.textContent = pendingCalls;
    }
    if (completedCallsCount) {
        completedCallsCount.textContent = completedCalls;
    }
}

function saveCallBacks() {
    localStorage.setItem('callbacks', JSON.stringify(callbacks));
}

// Notification System
let notificationSettings = {
    enabled: true,
    reminderTime: 5,
    soundEnabled: true,
    browserNotificationsEnabled: false
};

let notificationCheckInterval;

function setupNotificationSystem() {
    loadNotificationSettings();
    setupNotificationSettingsModal();
    requestNotificationPermission();
}

function loadNotificationSettings() {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
        notificationSettings = { ...notificationSettings, ...JSON.parse(saved) };
    }
}

function saveNotificationSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
}

function setupNotificationSettingsModal() {
    const modal = document.getElementById('notificationSettingsModal');
    const openBtn = document.getElementById('notificationSettingsBtn');
    const closeBtn = document.getElementById('closeNotificationSettings');
    const saveBtn = document.getElementById('saveNotificationSettings');
    const testBtn = document.getElementById('testNotificationBtn');
    
    // Load current settings into modal
    const notificationsEnabled = document.getElementById('notificationsEnabled');
    const reminderTime = document.getElementById('reminderTime');
    const soundEnabled = document.getElementById('soundEnabled');
    const browserNotificationsEnabled = document.getElementById('browserNotificationsEnabled');
    
    if (notificationsEnabled) notificationsEnabled.checked = notificationSettings.enabled;
    if (reminderTime) reminderTime.value = notificationSettings.reminderTime;
    if (soundEnabled) soundEnabled.checked = notificationSettings.soundEnabled;
    if (browserNotificationsEnabled) browserNotificationsEnabled.checked = notificationSettings.browserNotificationsEnabled;
    
    // Event listeners
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('show');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            notificationSettings.enabled = notificationsEnabled.checked;
            notificationSettings.reminderTime = parseInt(reminderTime.value);
            notificationSettings.soundEnabled = soundEnabled.checked;
            notificationSettings.browserNotificationsEnabled = browserNotificationsEnabled.checked;
            
            saveNotificationSettings();
            modal.classList.remove('show');
            showNotification('Notification settings saved!', 'success');
        });
    }
    
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            showCallbackNotification('Test Callback', 'This is a test notification for callback reminders');
        });
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function startCallbackReminderCheck() {
    // Clear any existing interval
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
    }
    
    // Check every minute for callbacks that need reminders
    notificationCheckInterval = setInterval(() => {
        if (!notificationSettings.enabled) return;
        
        const now = new Date();
        const reminderTimeMs = notificationSettings.reminderTime * 60 * 1000; // Convert minutes to milliseconds
        
        callbacks.forEach(callback => {
            if (callback.status === 'pending') {
                const callbackTime = new Date(callback.date + ' ' + callback.time);
                const timeUntilCallback = callbackTime.getTime() - now.getTime();
                
                // Check if it's time to show reminder (within the reminder time window)
                if (timeUntilCallback > 0 && timeUntilCallback <= reminderTimeMs && !callback.reminderShown) {
                    showCallbackNotification(
                        'Callback Reminder',
                        `You have a callback scheduled in ${notificationSettings.reminderTime} minutes: ${callback.customerName} - ${callback.reason}`
                    );
                    callback.reminderShown = true;
                    saveCallBacks();
                }
            }
        });
    }, 60000); // Check every minute
}

function showCallbackNotification(title, message) {
    // Play sound if enabled
    if (notificationSettings.soundEnabled) {
        const audio = document.getElementById('notificationSound');
        if (audio) {
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    // Show browser notification if enabled and permitted
    if (notificationSettings.browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            tag: 'callback-reminder'
        });
    }
    
    // Show in-app notification
    showInAppNotification(title, message);
}

function showInAppNotification(title, message) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-bell"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button type="button" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
    }
} 
