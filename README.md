# Case Craft

A comprehensive web application for generating professional case notes and SPINS (Service Provider Information Notes) with advanced features for call back scheduling and tracking.

## 🌟 Features

### 📋 Case Notes Generator Tab
- **Contact Information Management**
  - Contact ID with copy/paste functionality
  - Customer name (Spoken To)
  - Phone number with copy/paste
  - Call back number with "Same as Phone" option
  - Account number with copy/paste

- **Verification & Authentication**
  - Verification Completed (YES/NO radio buttons)
  - Authentication Method selection:
    - PIN
    - PASSPHRASE
    - OTP
    - Personal Questions Asked
    - NOT DONE

- **Reason of Call Selection**
  - Categorized reason buttons with icons:
    - 📺 TV Issues (not working, wrong input, stuck, freezing, no sound, no signal, channel issues, Wi-Fi, missing channels)
    - 🌐 Internet Issues (not working, no internet, intermittent, lost access, slow speed, weak signal, Wi-Fi not showing)
    - 🔧 Equipment Issues (doorbell, damaged equipment, modem setup, TV box setup)
    - 📞 Phone Issues (not working, voicemail)
    - 📧 Email Issues (stopped working, can't receive, login issues, webmail locked, invalid credentials)
    - 👤 Account Issues (billing, cancel services, general queries, Shaw ID login, vacation suspension, address transfer)
    - ▶️ Streaming Issues (Disney+, Netflix)
  - Custom reason input field
  - Copy/clear functionality for selected reasons

- **Troubleshooting Steps**
  - Dynamic step addition with multi-line support
  - Drag and drop reordering
  - Step editing and deletion
  - Move up/down functionality
  - Automatic step numbering

- **Equipment Management**
  - Affected Equipment Serial Numbers (multiple entries)
  - Equipment Model selection:
    - XiOne Box, Xi6 Box, XB7, XB8, XB6, XiG, Hitron, Plume
  - Custom model input

- **Resolution & Documentation**
  - Resolution selection:
    - Resolved, Not Resolved, Booked an SC, BOSR Filled
    - Outage, Planned Outage (Incident), Escalated
    - Transfers: Bulk, Billing, TeleSales, Rogers (East)
  - Relevant Ticket Numbers (multiple entries)
  - Info Assist / Support Documentation URLs
  - Flow paragraphs with preview
  - Agent Assist Summary with paste functionality

- **Call Back Scheduler**
  - Quick schedule options (2 hours, 4 hours, tomorrow, 3 days)
  - Manual scheduling with:
    - Reason selection (Follow Up, Disconnected, Customer out of home, Battery dying, Customer request)
    - Case number
    - Date picker
    - Time selection (morning, afternoon, evening)
    - Specific time input
  - Scheduled calls list with edit/delete functionality

### 🔧 SPINS Generator Tab
- **Customer Information**
  - Customer name
  - Phone number
  - Case number
  - Equipment name & model
  - Serial number

- **Issue Selection**
  - Categorized issue types:
    - 📞 Phone Issues (no dialtone, DPT offline, one way voice, flapping, poor quality, wiring issues, poor levels)
    - 🌐 Internet Issues (modem offline, flapping, WiFi dropping, poor speeds, poor range, hardware errors, poor levels, Rx/Tx out of spec)
    - 📺 Video Issues (missing channels, missing all channels/OMP, DCT offline, pixelation, all IP TV, hardware errors, poor levels)
    - 🔧 General Issues (full service outage, drop removal, drop damage, quality of service, noise issues, repeat call, FTTP, smart home, alarm/lifeline, check nimble)
  - Custom issue description
  - Copy/clear functionality for selected issues

- **Special Instructions**
  - Access Instructions (back door, side door, meet 3rd party, blind service call, pets)
  - Notifications (call upon arrival, call before arrival, speedtest before leaving)
  - Custom instructions input
  - Copy/clear functionality for selected instructions

- **Additional Features**
  - Tools info textarea for modem statistics
  - Repeat service call information
  - Character counter (976 character limit)
  - Live preview with progress bar

### 📞 Call Back Tracker Tab
- **Statistics Dashboard**
  - Today's calls count
  - Pending calls count
  - Completed calls count

- **Filtering & Management**
  - Status filter (All, Pending, Completed)
  - Date filter (All dates, Today, Tomorrow, This week)
  - Clear completed calls
  - Refresh functionality

- **Call Back List**
  - Organized by today's calls and upcoming calls
  - Call details display (reason, case number, date, time)
  - Status indicators
  - Copy functionality for call details
  - Complete, edit, and delete actions

## 🎨 User Interface Features

### Theme System
- **Light/Dark Mode Toggle**
  - Persistent theme preference
  - Smooth transitions
  - Icon and text updates

### Tab Navigation
- **Smooth Tab Switching**
  - Fade in/out animations
  - Active tab highlighting
  - Floating action buttons per tab

### Floating Action Buttons
- **Case Notes Tab**
  - Clear form button
  - Copy case notes button
- **SPINS Tab**
  - Clear form button
  - Copy SPINS button
- **Call Back Tracker Tab**
  - Refresh call backs button
  - Clear all call backs button

### Input Enhancements
- **Copy/Paste Actions**
  - Copy to clipboard buttons
  - Paste from clipboard buttons
  - Clear field buttons
  - Visual feedback animations

- **Auto-save Functionality**
  - Form data persistence in localStorage
  - Automatic restoration on page reload
  - Radio button state preservation

### Live Preview
- **Real-time Updates**
  - Instant case notes preview
  - Live SPINS preview
  - Character counting
  - Smooth animations

## 💾 Data Management

### Local Storage
- **Form Data Persistence**
  - All form inputs automatically saved
  - Radio button selections preserved
  - Equipment data saved
  - Call back data stored

### Data Export
- **Copy to Clipboard**
  - Formatted case notes
  - Formatted SPINS
  - Selected reasons and issues
  - Call back details

### Data Clearing
- **Form Reset**
  - Confirmation dialogs
  - Complete form clearing
  - localStorage cleanup
  - Visual feedback

## 🔧 Technical Features

### Responsive Design
- **Mobile-Friendly**
  - Responsive grid layouts
  - Touch-friendly buttons
  - Optimized for all screen sizes

### Performance Optimizations
- **Debounced Updates**
  - Live preview throttling
  - Efficient DOM updates
  - Smooth animations

### Accessibility
- **Keyboard Navigation**
  - Tab navigation support
  - Enter key support
  - Focus management

### Browser Compatibility
- **Modern Browsers**
  - Chrome, Firefox, Safari, Edge
  - ES6+ JavaScript features
  - CSS Grid and Flexbox

## 🚀 Getting Started

1. **Download/Clone** the repository
2. **Open** `index.html` in a web browser
3. **Start** generating case notes and SPINS!

## 📱 Usage

### Creating Case Notes
1. Fill in contact information
2. Select verification and authentication methods
3. Choose reason(s) for the call
4. Add troubleshooting steps
5. Enter equipment information
6. Select resolution and add documentation
7. Schedule call backs if needed
8. Copy the generated case notes

### Creating SPINS
1. Enter customer and equipment details
2. Select relevant issues from categories
3. Add special instructions
4. Include tools information
5. Monitor character count
6. Copy the generated SPINS

### Managing Call Backs
1. Schedule call backs with quick options or manual entry
2. Track call back status in the tracker
3. Filter and manage call backs
4. Mark calls as completed
5. Edit or delete call backs as needed

## 🛠️ File Structure

```
Case Craft/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and theming
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## 🔄 Updates and Maintenance

The application automatically:
- Saves form data as you type
- Restores previous sessions
- Maintains call back history
- Preserves user preferences

## 📞 Support

For issues or feature requests, please check the console for debugging information and ensure you're using a modern web browser.

---

**Note**: This application is designed for internal use and stores all data locally in the browser's localStorage. No data is transmitted to external servers. 