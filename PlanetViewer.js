// Get the canvas elements
const canvas = document.getElementById('sphereCanvas');
const debugCanvas = document.getElementById('debugCanvas');

// Create buffer canvases
const bufferCanvas1 = document.createElement('canvas');
const bufferCanvas2 = document.createElement('canvas');

// Get the 2D rendering contexts
const ctx = canvas.getContext('2d');
const debugCtx = debugCanvas.getContext('2d');
const bufferCtx1 = bufferCanvas1.getContext('2d');
const bufferCtx2 = bufferCanvas2.getContext('2d');

// Create image objects
const img = new Image();
const clouds = new Image();

// Set the image sources
img.src = 'planets/earth.jpg';
clouds.src = 'planets/earth_clouds.png';

// Set the dimensions of the buffer canvases
bufferCanvas1.width = canvas.width;
bufferCanvas1.height = canvas.height;

bufferCanvas2.width = canvas.width;
bufferCanvas2.height = canvas.height;

// Initialize rotation angles
let angle = 0;
let cloudAngle = 0;

// Create a canvas for cloud rendering
const cloudCanvas = document.createElement('canvas');
const cloudCtx = cloudCanvas.getContext('2d');

// Create a canvas for surface rendering
const surfaceCanvas = document.createElement('canvas');
const surfaceCtx = surfaceCanvas.getContext('2d');

// Variable to keep track of the number of images loaded
let imagesLoaded = 0;

// Event handlers for image load
img.onload = checkImagesLoaded;
clouds.onload = checkImagesLoaded;

// Function to check if all images are loaded
function checkImagesLoaded() {

    // Increment the count of loaded images
    imagesLoaded++;

    // Check if all images are loaded
    if (imagesLoaded === 2) {
        initializeCanvas();
        animate();
    }
}

// Function to initialize the canvas
function initializeCanvas() {

    // Set the dimensions of the cloud canvas
    cloudCtx.canvas.width = clouds.width * 2;
    cloudCtx.canvas.height = clouds.height;

    // Draw the clouds on the cloud canvas
    cloudCtx.drawImage(clouds, 0, 0);
    cloudCtx.drawImage(clouds, clouds.width, 0);

    // Set the dimensions of the surface canvas
    surfaceCanvas.width = img.width * 2;
    surfaceCanvas.height = img.height;

    // Draw the image on the surface canvas
    surfaceCtx.drawImage(img, 0, 0);
    surfaceCtx.drawImage(img, img.width, 0);
}

// Animation loop
function animate() {
    angle += 1; // Adjust the speed of rotation
    cloudAngle += 0.5; // Adjust the speed of cloud rotation
    drawSphereFromImage();
    requestAnimationFrame(animate);
}

// Function to draw the sphere from the image
function drawSphereFromImage() {
    const width = canvas.width;
    const height = canvas.height;

    // Clear the main canvas
    ctx.clearRect(0, 0, width, height);

    // Clear the buffer canvases
    bufferCtx1.clearRect(0, 0, width, height);
    bufferCtx2.clearRect(0, 0, width, height);

    // Draw the image and clouds on the buffer canvas
    for (let x = 0; x < width; x++) {

        // Calculate the tan value based on the x-coordinate
        const arcCosValue = -(Math.acos((x / width) * 2 - 1) / Math.PI) + 1;
        const sourceX = arcCosValue * (surfaceCanvas.width / 4) + angle % (surfaceCanvas.width / 2);
        const cloudsX = arcCosValue * (cloudCtx.canvas.width / 4) + cloudAngle % (cloudCtx.canvas.width / 2);

        // Draw a vertical slice of the image and clouds on the buffer canvas
        bufferCtx1.drawImage(surfaceCanvas, sourceX, 0, 1, surfaceCanvas.height, x, 0, 1, height);
        bufferCtx1.drawImage(cloudCtx.canvas, cloudsX, 0, 1, cloudCtx.canvas.height, x, 0, 1, height);
    }

    // Warp the buffer canvas vertically
    for (let y = 0; y < height; y++) {
        const tanValue = -(Math.acos((y / height) * 2 - 1) / Math.PI) + 1;
        const sourceY = tanValue * bufferCanvas1.height;
        bufferCtx2.drawImage(bufferCanvas1, 0, sourceY, bufferCanvas1.width, 1, 0, y, width, 1);
    }

    // Draw the warped image on the main canvas
    for (let y = 0; y < height; y++) {
        const normY = (y / height - 0.5) * 2;
        const x = Math.sqrt(1 - normY * normY);
        ctx.drawImage(bufferCanvas2, 0, y * (bufferCanvas2.height / height), bufferCanvas2.width, 1, ((x - 1) * -1) * (width / 2), y, x * width, 1);
    }

    // Draw the buffer canvases on the debug canvas
    debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
    debugCtx.drawImage(bufferCanvas1, 0, 0, bufferCanvas1.width, bufferCanvas1.height);
    debugCtx.drawImage(bufferCanvas2, 0, 0, bufferCanvas2.width, bufferCanvas2.height);
}
