# OptiCusor Extension Setup

This document provides instructions on how to set up and use the OptiCusor extension.

## Prerequisites

* **Chrome Browser:** The extension is designed for web browsers.
* **Webcam:** A functioning webcam is required for eye tracking.
* **Basic Understanding of Extensions:** Familiarity with installing and managing extensions is helpful.

## Installation

1.  **Clone repository locally**

2.   **Install from Source Code:**
    * Open Google Chrome.
    * Navigate to `chrome://extensions/`.
    * Enable "Developer mode" in the top right corner.
    * Click "Load unpacked" in the top left corner.
    * Select the directory containing the extension's `manifest.json` file.
    * The extension will be loaded.

## Usage

1.  **Enable the Extension:**
    * Once installed, the OptiCursor icon should appear in your Chrome toolbar.
    * If you do not see it, click the puzzle piece icon, and pin the Eye Mouse extension.

2.  **Start Eye Tracking:**
    * Click the Eye Mouse extension icon in your Chrome toolbar.
    * A popup window will appear with "Start Tracking", "Stop Tracking" and "Caliberate" buttons.
    * Click "Start Tracking."
    * Chrome will request permission to use your webcam. Grant the permission.

3.  **Calibration:**
    * Click on Caliberate
    * Blue dots will appear on the screen.
    * Look at each dot and click on it with your physical mouse.
    * Click on each dot five times until it turns green.
    * This calibration process helps WebGazer learn your eye movements for accurate tracking.
    * Once all dots are clicked, the calibration process will end.

5.  **Using OptiCusor**
    * After calibration, a single red dot (the eye cursor) will appear on the screen.
    * Move your eyes, and the red dot should follow your gaze.

6.  **Stop Eye Tracking:**
    * Click the Eye Mouse extension icon.
    * Click the "Stop Tracking" button.
    * The camera feed will stop, and the WebGazer container will disappear.

## Troubleshooting

* **Camera Not Working:**
    * Ensure your webcam is properly connected and functioning.
    * Check Chrome's camera permissions in `chrome://settings/content/camera`.
    * Restart Chrome.
* **Calibration Issues:**
    * Ensure you are in a well-lit environment.
    * Position yourself at a comfortable distance from the screen.
    * Recalibrate if the cursor is inaccurate.
* **Extension Not Loading:**
    * Ensure "Developer mode" is enabled.
    * Check the Chrome extensions page for any error messages.
    * Reload the extension.
* **Connection Errors:**
    * Ensure that the content script is running on the page.
    * Ensure that the manifest.json file has the permissions "tabs" and "scripting" declared.
    * If you are sending messages to all URLs, ensure that the manifest.json file has the "host_permissions" property set to "<all_urls>".

## Contributing

If you'd like to contribute to the Eye Mouse extension, please feel free to submit pull requests or report issues on the project's repository.

## License

This extension is released under the [Specify your license here, e.g., MIT License].
