document.getElementById('start-tracking').addEventListener('click', () => {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            let tabId = tabs[0].id;
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['scripts/eye-tracker.js']
            });
        } else {
            console.error('No active tab found.');
        }
    });
});

document.getElementById('stop-tracking').addEventListener('click', () => {
    alert('Stop tracking feature is under development.');
});
