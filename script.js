document.addEventListener("DOMContentLoaded", () => {
    const handle = document.getElementById("handle");
    const inflater = document.querySelector(".inflater");

    // Balloon settings
    const maxSize = 100; // Max size before flying
    const inflationStep = 10; // Size increase per click
    const balloons = []; // Array to track all active balloons

    // Inflater dimensions and position
    const inflaterRect = inflater.getBoundingClientRect();
    const inflaterWidth = inflaterRect.width;
    const inflaterHeight = inflaterRect.height;
    const inflaterLeft = inflaterRect.left;
    const inflaterTop = inflaterRect.top;

    // Function to create a new balloon
    function createBalloon() {
        const balloon = document.createElement("img");
        balloon.src = "balloon.png";
        balloon.alt = "Balloon";
        balloon.classList.add("balloon");
        balloon.style.width = "0px";
        balloon.style.height = "0px";
        balloon.style.left = "77.5%";
        balloon.style.top = "75%";
        inflater.appendChild(balloon);

        // Initialize balloon properties
        const balloonData = {
            element: balloon,
            size: 0, // Start from zero
            isFlying: false,
            velocityX: (Math.random() - 0.5) * 6, // Random horizontal velocity
            velocityY: -3, // Upward velocity
            centerX: window.innerWidth * 0.775, // Initial center X
            centerY: window.innerHeight * 0.75, // Initial center Y
        };

        // Add balloon to the array
        balloons.push(balloonData);

        // Add click event to pop the balloon
        balloon.addEventListener("click", () => {
            balloon.classList.add("popped");
            setTimeout(() => {
                balloon.remove();
                // Remove the balloon from the array
                const index = balloons.indexOf(balloonData);
                if (index !== -1) balloons.splice(index, 1);
            }, 300);
        });

        return balloonData;
    }

    // Inflate balloon when handle is clicked
    handle.addEventListener("click", () => {
        // Move handle down and then back up
        handle.style.top = "5%";
        setTimeout(() => {
            handle.style.top = "-4%";
        }, 200);

        // Check if there's an active balloon that's not yet flying
        let activeBalloon = balloons.find((balloon) => !balloon.isFlying);

        // If no active balloon, create a new one
        if (!activeBalloon) {
            activeBalloon = createBalloon();
        }

        // Inflate the active balloon by the inflation step
        if (activeBalloon.size < maxSize) {
            activeBalloon.size += inflationStep;
            activeBalloon.element.style.width = `${activeBalloon.size}px`;
            activeBalloon.element.style.height = `${activeBalloon.size * 1.6}px`;

            // If the balloon reaches max size, start flying
            if (activeBalloon.size >= maxSize) {
                activeBalloon.isFlying = true;
                moveBalloon(activeBalloon);
            }
        }
    });

    // Move the balloon freely with clamped boundaries and collision detection
    function moveBalloon(balloonData) {
        function update() {
            const balloon = balloonData.element;
            const balloonRect = balloon.getBoundingClientRect();
            const halfWidth = balloonRect.width / 2;
            const halfHeight = balloonRect.height / 2;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Update the center position
            balloonData.centerX += balloonData.velocityX;
            balloonData.centerY += balloonData.velocityY;

            // Check horizontal boundaries
            if (balloonData.centerX - halfWidth < 0) {
                balloonData.centerX = halfWidth;
                balloonData.velocityX = Math.abs(balloonData.velocityX);
            } else if (balloonData.centerX + halfWidth > screenWidth) {
                balloonData.centerX = screenWidth - halfWidth;
                balloonData.velocityX = -Math.abs(balloonData.velocityX);
            }

            // Check vertical boundaries
            if (balloonData.centerY - halfHeight < 0) {
                balloonData.centerY = halfHeight;
                balloonData.velocityY = Math.abs(balloonData.velocityY);
            } else if (balloonData.centerY + halfHeight > screenHeight) {
                balloonData.centerY = screenHeight - halfHeight;
                balloonData.velocityY = -Math.abs(balloonData.velocityY);
            }

            // Collision detection with other balloons
            for (const otherBalloon of balloons) {
                if (otherBalloon !== balloonData && otherBalloon.isFlying) {
                    const otherRect = otherBalloon.element.getBoundingClientRect();
                    const distanceX = balloonData.centerX - otherBalloon.centerX;
                    const distanceY = balloonData.centerY - otherBalloon.centerY;
                    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                    const minDistance = halfWidth + (otherRect.width / 2);

                    if (distance < minDistance) {
                        // Adjust positions to avoid collision
                        const overlap = minDistance - distance;
                        const angle = Math.atan2(distanceY, distanceX);
                        balloonData.centerX += Math.cos(angle) * overlap / 2;
                        balloonData.centerY += Math.sin(angle) * overlap / 2;
                        otherBalloon.centerX -= Math.cos(angle) * overlap / 2;
                        otherBalloon.centerY -= Math.sin(angle) * overlap / 2;

                        // Adjust velocities to bounce off
                        const tempVX = balloonData.velocityX;
                        const tempVY = balloonData.velocityY;
                        balloonData.velocityX = otherBalloon.velocityX;
                        balloonData.velocityY = otherBalloon.velocityY;
                        otherBalloon.velocityX = tempVX;
                        otherBalloon.velocityY = tempVY;
                    }
                }
            }

            // Collision detection with the inflater
            const inflaterDistanceX = balloonData.centerX - (inflaterLeft + inflaterWidth / 2);
            const inflaterDistanceY = balloonData.centerY - (inflaterTop + inflaterHeight / 2);
            const inflaterDistance = Math.sqrt(inflaterDistanceX * inflaterDistanceX + inflaterDistanceY * inflaterDistanceY);
            const minInflaterDistance = halfWidth + (inflaterWidth / 2);

            if (inflaterDistance < minInflaterDistance) {
                // Adjust position to avoid collision with inflater
                const overlap = minInflaterDistance - inflaterDistance;
                const angle = Math.atan2(inflaterDistanceY, inflaterDistanceX);
                balloonData.centerX += Math.cos(angle) * overlap;
                balloonData.centerY += Math.sin(angle) * overlap;

                // Adjust velocity to bounce off
                balloonData.velocityX = -balloonData.velocityX;
                balloonData.velocityY = -balloonData.velocityY;
            }

            // Update the balloon's position
            balloon.style.left = `${balloonData.centerX}px`;
            balloon.style.top = `${balloonData.centerY}px`;

            // Continue the animation if the balloon is still flying
            if (balloonData.isFlying) {
                requestAnimationFrame(update);
            }
        }
        update();
    }
});