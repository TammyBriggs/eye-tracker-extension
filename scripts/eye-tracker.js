(function() {
    let eyeCursor = null;
    let calibrationOverlay = null;
    let calibrationPoints = [];
    let calibrationIndex = 0;
    let isCalibrating = false;
    let calibrationClicks = {}; 
    const maxClicksPerPoint = 2;
    let styleAdded = false;

    // Listener for starting/stopping tracking
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Received message:", request);
        if (request.action === "stop-tracking") {
            if (eyeCursor) {
                eyeCursor.remove();
                eyeCursor = null;
            }
            if (window.webgazer) {
                window.webgazer.end(); 
                const webgazerContainer = document.getElementById('webgazerVideoContainer');
                if (webgazerContainer) {
                    webgazerContainer.style.display = 'none';
                }
                isCalibrating = false;
            }
        }

        if (request.action === "start-tracking") {
            if (!eyeCursor) {
                eyeCursor = document.createElement('div');
                eyeCursor.style.width = '10px';
                eyeCursor.style.height = '10px';
                eyeCursor.style.background = 'red';
                eyeCursor.style.borderRadius = '50%';
                eyeCursor.style.position = 'absolute';
                eyeCursor.style.pointerEvents = 'none';
                eyeCursor.style.zIndex = '9996';
                document.body.appendChild(eyeCursor);

                webgazer.setRegression('ridge').showPredictionPoints(true).begin();
            }
        }

        if (request.action === "start-calibration") {
            startCalibration();
        }
    });

    function startCalibration() {
        isCalibrating = true;
        calibrationPoints = [
            { x: 0.5, y: 0.2 }, { x: 0.8, y: 0.2 },
            { x: 0.2, y: 0.5 }, { x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }, { x: 0.8, y: 0.5 },
            { x: 0.2, y: 0.8 }, { x: 0.4, y: 0.8 }, { x: 0.6, y: 0.8 }, { x: 0.8, y: 0.8 }
        ];
        calibrationIndex = 0;
        calibrationClicks = {};
        calibrationPoints.forEach((_, index) => calibrationClicks[index] = 0);

        // Create white overlay
        calibrationOverlay = document.createElement('div');
        calibrationOverlay.style.position = 'fixed';
        calibrationOverlay.style.top = 0;
        calibrationOverlay.style.left = 0;
        calibrationOverlay.style.width = '100vw';
        calibrationOverlay.style.height = '100vh';
        calibrationOverlay.style.background = 'white';
        // calibrationOverlay.style.zIndex = '9997';
        document.body.appendChild(calibrationOverlay);

        setTimeout(() => {
            const webgazerContainer = document.getElementById('webgazerVideoContainer');
            if (webgazerContainer) {
                webgazerContainer.style.zIndex = '10000';
                webgazerContainer.style.display = 'block';
            }
        }, 500); // Delay to ensure container is created

        showCalibrationPoint();
    }

    // Function to Show Calibration Point
    function showCalibrationPoint() {
        if (!styleAdded) {
            const style = document.createElement('style');
            style.innerHTML = `
                .calibration-dot {
                    width: 40px;
                    height: 40px;
                    background: blue;
                    border-radius: 50%;
                    position: absolute;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
            styleAdded = true;
        }

        if (calibrationIndex < calibrationPoints.length) {
            const point = calibrationPoints[calibrationIndex];

            const calibrationDot = document.createElement('div');
            calibrationDot.classList.add('calibration-dot');
            calibrationDot.style.left = `calc(${point.x * 100}% - 10px)`;
            calibrationDot.style.top = `calc(${point.y * 100}% - 10px)`;
            calibrationOverlay.appendChild(calibrationDot);

            calibrationDot.addEventListener('click', () => {
                calibrationClicks[calibrationIndex]++;
                webgazer.recordScreenPosition(point.x, point.y, 'click');
                if (calibrationClicks[calibrationIndex] >= maxClicksPerPoint) {
                    calibrationDot.style.background = 'green';
                    setTimeout(() => {
                        calibrationDot.remove();
                        calibrationIndex++;
                        showCalibrationPoint();
                    }, 500);
                }
            });
        } else {
            isCalibrating = false;
            showSuccessMessage();
        }
    }

    // Display Calibration Success Message
    function showSuccessMessage() {
        // Clear calibration overlay
        calibrationOverlay.innerHTML = '';

        // Display success message
        const successMessage = document.createElement('div');
        successMessage.innerText = 'Calibration Successful!';
        successMessage.style.position = 'absolute';
        successMessage.style.top = '50%';
        successMessage.style.left = '50%';
        successMessage.style.transform = 'translate(-50%, -50%)';
        successMessage.style.fontSize = '30px';
        successMessage.style.color = 'green';
        calibrationOverlay.appendChild(successMessage);

        setTimeout(() => {
            // Remove overlay and restore original page
            calibrationOverlay.remove();
            calibrationOverlay = null;
        }, 2000); 
    }
})();