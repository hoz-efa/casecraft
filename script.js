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

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeCallBackScheduler();
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
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Tab switching functionality
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

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
                    
                    updateSpinsLive();
                } else if (targetTab === 'case-notes') {
                    // Show case notes output and floating buttons, hide SPINS
                    if (caseNotesOutput) caseNotesOutput.style.display = 'block';
                    if (spinsOutput) spinsOutput.style.display = 'none';
                    
                    // Show case notes floating buttons, hide SPINS floating buttons
                    if (caseNotesFabGroup) caseNotesFabGroup.style.display = 'flex';
                    if (spinsFabGroup) spinsFabGroup.style.display = 'none';
                    
                    updateCaseNotesLive();
                }
            } else {
                console.error('Target tab content not found:', targetTab);
            }
        });
    });
}

// Troubleshooting steps functionality
function setupTroubleshootingSteps() {
    const addStepBtn = document.getElementById('addStepBtn');
    const stepInput = document.getElementById('stepInput');
    const stepsList = document.getElementById('stepsList');

    // Add step button click handler
    addStepBtn.addEventListener('click', addTroubleshootingStep);
    
    // Enhanced key handler for multi-line support
    stepInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addTroubleshootingStep();
        }
    });

    // Auto-resize textarea
    stepInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Initialize drag and drop
    setupDragAndDrop();
}

function addTroubleshootingStep() {
    const stepInput = document.getElementById('stepInput');
    const stepText = stepInput.value.trim();
    
    if (stepText) {
        troubleshootingSteps.push(stepText);
        stepInput.value = '';
        stepInput.style.height = 'auto'; // Reset height
        renderTroubleshootingSteps();
        stepInput.focus();
        
        // Trigger live update
        updateCaseNotesLive();
    }
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
    
    // Escape HTML and preserve line breaks
    const escapedText = stepText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
    
    stepItem.innerHTML = `
        <div class="step-number">${index + 1}</div>
        <div class="step-text">${escapedText}</div>
        <div class="step-actions">
            <button class="step-action-btn move-up-btn" onclick="moveStep(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>
                <i class="fas fa-arrow-up"></i>
            </button>
            <button class="step-action-btn move-down-btn" onclick="moveStep(${index}, 'down')" ${index === troubleshootingSteps.length - 1 ? 'disabled' : ''}>
                <i class="fas fa-arrow-down"></i>
            </button>
            <button class="step-action-btn delete-step-btn" onclick="deleteStep(${index})">
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
    const clearSpinsBtn = document.getElementById('clearSpinsBtn');
    
    if (copySpinsBtn) {
        copySpinsBtn.addEventListener('click', copySpins);
    }
    
    if (clearSpinsBtn) {
        clearSpinsBtn.addEventListener('click', clearSpinsForm);
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
        
        // Reset textarea height
        const stepInput = document.getElementById('stepInput');
        if (stepInput) {
            stepInput.style.height = 'auto';
        }
        
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
        
        // Clear SPINS form
        const spinsForm = document.getElementById('spinsForm');
        if (spinsForm) {
            const spinsInputs = spinsForm.querySelectorAll('input, textarea');
            spinsInputs.forEach(input => {
                input.value = '';
            });
        }
        
        // Re-setup radio buttons to ensure event listeners are working
        setupRadioButtons();
        
        // Update live previews
        updateCaseNotesLive();
        updateSpinsLive();
        
        showNotification('Case Notes and SPINS forms cleared successfully!', 'success');
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
    
    console.log('Authentication method changed to:', selectedMethod);
    
    // Remove the step if it exists (for any method change)
    const stepIndex = troubleshootingSteps.findIndex(step => 
        step.includes(pinStepText)
    );
    
    if (stepIndex !== -1) {
        troubleshootingSteps.splice(stepIndex, 1);
        console.log('Removed existing troubleshooting step');
    }
    
    // Add the step back if OTP or Personal Questions Asked is selected
    if (selectedMethod === 'OTP' || selectedMethod === 'Personal Questions Asked') {
        troubleshootingSteps.push(pinStepText);
        console.log('Added troubleshooting step for:', selectedMethod);
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
        showNotification('No issues selected', 'warning');
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
        showNotification('No instructions selected', 'warning');
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
    if (data.authenticationMethod) notes += `Authentication Method: ${data.authenticationMethod}\n\n`;
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
        showNotification('No SPINS content to copy', 'warning');
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
        
        showNotification('SPINS form cleared', 'success');
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
}

async function handlePaste(e) {
    const targetId = e.target.closest('.paste-btn').getAttribute('data-target');
    const targetInput = document.getElementById(targetId);
    
    try {
        const text = await navigator.clipboard.readText();
        targetInput.value = text;
        targetInput.focus();
        
        // Trigger live update
        if (targetId === 'contactId' || targetId === 'spokenTo' || targetId === 'phoneNumber' || 
            targetId === 'callBackNo' || targetId === 'accountNumber') {
            updateCaseNotesLive();
        }
        
        // Show success feedback
        showInputActionFeedback(e.target, 'Pasted!', 'success');
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
    const targetId = e.target.closest('.clear-btn').getAttribute('data-target');
    const targetInput = document.getElementById(targetId);
    
    targetInput.value = '';
    targetInput.focus();
    
    // Trigger live update
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
    feedback.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--warning-color)'};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
        animation: feedbackSlideIn 0.3s ease forwards;
    `;
    
    element.parentElement.appendChild(feedback);
    
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
    
    // Setup agent assist summary input
    const agentAssistInput = document.getElementById('agentAssistSummary');
    if (agentAssistInput) {
        agentAssistInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addAgentAssistSummary();
            }
        });
        
        agentAssistInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                addAgentAssistSummary();
            }
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
    const input = document.getElementById('agentAssistSummary');
    const value = input.value.trim();
    
    if (value) {
        // Allow adding the same summary multiple times
        agentAssistSummaries.push(value);
        renderAgentAssistSummaries();
        input.value = '';
        updateCaseNotesLive();
        saveEquipmentData();
    }
}

function removeAgentAssistSummary(index) {
    agentAssistSummaries.splice(index, 1);
    renderAgentAssistSummaries();
    updateCaseNotesLive();
    saveEquipmentData();
}

function renderAgentAssistSummaries() {
    const container = document.getElementById('agentAssistTags');
    container.innerHTML = '';
    
    agentAssistSummaries.forEach((summary, index) => {
        const tag = document.createElement('div');
        tag.className = 'flow-tag';
        
        // Show first 50 characters with ellipsis for display
        const preview = summary.length > 50 ? summary.substring(0, 50) + '...' : summary;
        
        tag.innerHTML = `
            <div class="flow-preview" title="${summary}">${preview}</div>
            <button type="button" class="remove-tag" onclick="removeAgentAssistSummary(${index})" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(tag);
    });
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
    if (reasonText && reasonText !== 'No reasons selected') {
        copyToClipboard(reasonText, 'Reason copied to clipboard!');
    } else {
        showNotification('No reason to copy', 'warning');
    }
}

function clearSelectedReasons() {
    // Clear all selected reason buttons only
    document.querySelectorAll('.reason-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Update display
    updateReasonDisplay();
    showNotification('Selected reasons cleared!', 'success');
}

function clearCustomReason() {
    const customReasonInput = document.getElementById('customReason');
    if (customReasonInput) {
        customReasonInput.value = '';
        updateReasonDisplay();
        showNotification('Custom reason cleared!', 'success');
    }
}

// Auto-population functionality
function setupAutoPopulation() {
    // Auto-populate SPINS from Case Notes when switching tabs
    const spinsTabBtn = document.querySelector('[data-tab="spins"]');
    spinsTabBtn.addEventListener('click', autoPopulateSpins);
}

function autoPopulateSpins() {
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
    // Add input validation and enhancement
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
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
        
        // Load from localStorage
        const savedValue = localStorage.getItem(`caseNotes_${input.id}`);
        if (savedValue) {
            input.value = savedValue;
        }
    });
    
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
    loadCallBacks();
    updateCallBackStats();
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
    const hours = parseInt(e.target.dataset.hours);
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    
    // Set date
    document.getElementById('callBackDate').value = scheduledTime.toISOString().split('T')[0];
    
    // Set time based on hours
    if (hours <= 4) {
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
    
    showNotification('Call back loaded for editing', 'info');
}

function deleteScheduledCall(id) {
    if (confirm('Are you sure you want to delete this call back from the current session?')) {
        // Only remove from current session, not from the tracker
        currentScheduledCalls = currentScheduledCalls.filter(c => c.id !== id);
        
        renderScheduledCalls();
        updateCaseNotesLive();
        
        showNotification('Call back removed from current session', 'success');
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
        
        showNotification('Call back marked as completed', 'success');
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
            const callbackDate = new Date(callback.date);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
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