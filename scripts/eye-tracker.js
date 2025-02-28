(function() {
    let eyeCursor = null;
    let calibrationOverlay = null;
    let calibrationPoints = [];
    let calibrationIndex = 0;
    let isCalibrating = false;
    let calibrationClicks = {}; 
    const maxClicksPerPoint = 5;
    let styleAdded = false;
    const accuracyThreshold = 50;
    const requiredAccuratePredictions = 5;
    let verificationDots = [];
    let accuratePredictionsCount = [];
    const SCROLL_UP_THRESHOLD = 0.05;   // Top 5% of screen
    const SCROLL_DOWN_THRESHOLD = 0.5; // Bottom 35% of screen
    const GAZE_HOLD_TIME = 3000;        // 3 seconds

    let gazeStartTime = null;
    let currentScrollAction = null;

    // Listener for starting/stopping tracking
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

                webgazer.setRegression('weightedRidge') // Improved model for accuracy
                        .showPredictionPoints(true)
                        .begin();
                
                // Gaze Listener for Scrolling
                webgazer.setGazeListener((data, elapsedTime) => {
                    if (data) {
                        const gazeY = data.y / window.innerHeight; // Get normalized Y position

                        // Check if gaze is in the scroll up zone
                        if (gazeY < SCROLL_UP_THRESHOLD) {
                            if (currentScrollAction !== 'up') {
                                gazeStartTime = new Date().getTime();
                                currentScrollAction = 'up';
                            } else if (new Date().getTime() - gazeStartTime >= GAZE_HOLD_TIME) {
                                handleScroll('up');
                            }
                        }
                        // Check if gaze is in the scroll down zone
                        else if (gazeY > SCROLL_DOWN_THRESHOLD) {
                            if (currentScrollAction !== 'down') {
                                gazeStartTime = new Date().getTime();
                                currentScrollAction = 'down';
                            } else if (new Date().getTime() - gazeStartTime >= GAZE_HOLD_TIME) {
                                handleScroll('down');
                            }
                        }
                        // Reset if gaze is outside scroll zones
                        else {
                            gazeStartTime = null;
                            currentScrollAction = null;
                        }
                    }
                });
            }
        }
    });

    function startCalibration() {
        isCalibrating = true;
        calibrationPoints = [
            { x: 0.4, y: 0.2 }, { x: 0.6, y: 0.2 }, { x: 0.8, y: 0.2 },
            { x: 0.2, y: 0.5 }, { x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }, { x: 0.8, y: 0.5 },
            { x: 0.2, y: 0.8 }, { x: 0.4, y: 0.8 }, { x: 0.6, y: 0.8 }, { x: 0.8, y: 0.8 }
        ];
        calibrationIndex = 0;
        calibrationClicks = {};
        calibrationPoints.forEach((_, index) => calibrationClicks[index] = 0);

        calibrationOverlay = document.createElement('div');
        calibrationOverlay.style.position = 'fixed';
        calibrationOverlay.style.top = 0;
        calibrationOverlay.style.left = 0;
        calibrationOverlay.style.width = '100vw';
        calibrationOverlay.style.height = '100vh';
        calibrationOverlay.style.background = 'white';
        document.body.appendChild(calibrationOverlay);

        setTimeout(() => {
            const webgazerContainer = document.getElementById('webgazerVideoContainer');
            if (webgazerContainer) {
                webgazerContainer.style.zIndex = '10000';
                webgazerContainer.style.display = 'block';
            }
        }, 500); 

        showCalibrationPoint();
    }

    function showCalibrationPoint() {
        if (!styleAdded) {
            const style = document.createElement('style');
            style.innerHTML = `
                .calibration-dot {
                    width: 20px;
                    height: 20px;
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

    function showSuccessMessage() {
        calibrationOverlay.innerHTML = '';
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
            verifyCalibration();
        }, 2000);
    }

    function verifyCalibration() {
        calibrationOverlay.innerHTML = '';
        const verificationPoints = [
            { x: 0.4, y: 0.3 }, { x: 0.7, y: 0.3 },
            { x: 0.4, y: 0.7 }, { x: 0.7, y: 0.7 }
        ];

        verificationPoints.forEach((point) => {
            const verificationDot = document.createElement('div');
            verificationDot.classList.add('calibration-dot');
            verificationDot.style.background = 'red';
            verificationDot.style.left = `calc(${point.x * 100}% - 10px)`;
            verificationDot.style.top = `calc(${point.y * 100}% - 10px)`;
            calibrationOverlay.appendChild(verificationDot);

            setTimeout(() => {
                verificationDot.remove();
            }, 1000);
        });

        setTimeout(() => {
            calibrationOverlay.remove();
        }, 3000);
    }

    function handleScroll(action) {
        if (action === 'up') {
            window.scrollBy({ top: -30, behavior: 'smooth' });
        } else if (action === 'down') {
            window.scrollBy({ top: 30, behavior: 'smooth' });
        }
    }
})();
