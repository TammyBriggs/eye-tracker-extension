(function() {
    let eyeCursor = null;
    let mouseMoveHandler = null;
    let calibrationPoints = [];
    let calibrationIndex = 0;
    let isCalibrating = false;
    let calibrationClicks = {}; // Track clicks per point
    const maxClicksPerPoint = 1; // Required clicks per point
    let styleAdded = false; // Track if style has been added

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "stop-tracking") {
            if (eyeCursor) {
                eyeCursor.remove();
                eyeCursor = null;
            }
            if (mouseMoveHandler) {
                document.removeEventListener('mousemove', mouseMoveHandler);
                mouseMoveHandler = null;
            }
            if (window.webgazer) {
                window.webgazer.end(); // End WebGazer completely

                const webgazerContainer = document.getElementById('webgazerVideoContainer');
                if (webgazerContainer) {
                    webgazerContainer.remove();
                }
                isCalibrating = false;
            }
        }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "start-tracking") {
            if (!eyeCursor) {
                eyeCursor = document.createElement('div');
                eyeCursor.style.width = '10px';
                eyeCursor.style.height = '10px';
                eyeCursor.style.background = 'red';
                eyeCursor.style.borderRadius = '50%';
                eyeCursor.style.position = 'absolute';
                eyeCursor.style.pointerEvents = 'none';
                document.body.appendChild(eyeCursor);

                webgazer.setRegression('ridge').showPredictionPoints(true).begin();
                startCalibration();
            }
        }
    });

    function startCalibration() {
        isCalibrating = true;
        calibrationPoints = [
            { x: 0.2, y: 0.2 }, { x: 0.5, y: 0.2 }, { x: 0.8, y: 0.2 },
            { x: 0.2, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.5 },
            { x: 0.2, y: 0.8 }, { x: 0.5, y: 0.8 }, { x: 0.8, y: 0.8 }
        ];
        calibrationIndex = 0;
        calibrationClicks = {};
        calibrationPoints.forEach((_, index) => calibrationClicks[index] = 0);
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
                    z-index: 10000;
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
            document.body.appendChild(calibrationDot);

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
            webgazer.setGazeListener((data, elapsedTime) => {
                if (data && !isCalibrating) {
                    eyeCursor.style.left = data.x + 'px';
                    eyeCursor.style.top = data.y + 'px';
                }
            }).begin();
        }
    }
})();