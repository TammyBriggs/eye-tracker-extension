console.log("Eye tracking script loaded");

// Dummy cursor
let eyeCursor = document.createElement('div');
eyeCursor.style.width = '10px';
eyeCursor.style.height = '10px';
eyeCursor.style.background = 'red';
eyeCursor.style.borderRadius = '50%';
eyeCursor.style.position = 'absolute';
eyeCursor.style.pointerEvents = 'none';
document.body.appendChild(eyeCursor);

// Simulated eye movement
document.addEventListener('mousemove', (event) => {
    eyeCursor.style.left = event.pageX + 'px';
    eyeCursor.style.top = event.pageY + 'px';
});
