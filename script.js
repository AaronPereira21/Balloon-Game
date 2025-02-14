document.addEventListener("DOMContentLoaded", () => {
    const handle = document.getElementById("handle");
    const inflater = document.querySelector(".inflater");
    const popAllButton = document.getElementById("popAllButton");

    // Balloon settings
    const maxSize = 80; // Max size before flying
    const inflationStep = 20; // Size increase per click
    const balloons = []; // Array to track all active balloons

    // Array of balloon image paths
    const balloonImages = [
        "assets/balloon1.png",
        "assets/balloon2.png",
        "assets/balloon3.png",
        "assets/balloon4.png",
        "assets/balloon5.png",
        "assets/balloon6.png",
        "assets/balloon7.png",
        "assets/balloon8.png",
        "assets/balloon9.png",
        "assets/balloon10.png"
    ];

        // Array of alphabet image paths (A-Z)
    const alphabetImages = ["assets/a.png","assets/b.png","assets/c.png","assets/d.png","assets/e.png",
        "assets/f.png","assets/g.png","assets/h.png","assets/i.png","assets/j.png",
        "assets/k.png","assets/l.png","assets/m.png","assets/n.png","assets/o.png",
        "assets/p.png","assets/q.png","assets/r.png","assets/s.png","assets/t.png",
        "assets/u.png","assets/v.png","assets/w.png","assets/x.png","assets/y.png",
        "assets/z.png"
];

    // Index to track the current balloon image
    let balloonImageIndex = 0;

    // Index to track the current alphabet image
    let alphabetImageIndex = 0;

    // Inflater dimensions and position
    const inflaterRect = inflater.getBoundingClientRect();
    const inflaterWidth = inflaterRect.width;
    const inflaterHeight = inflaterRect.height;
    const inflaterLeft = inflaterRect.left;
    const inflaterTop = inflaterRect.top;

    // Function to create a new balloon
    function createBalloon() {
        const balloon = document.createElement("div");
        balloon.classList.add("balloon");

        // Set balloon background image
        balloon.style.backgroundImage = `url('${balloonImages[balloonImageIndex]}')`;
        balloonImageIndex = (balloonImageIndex + 1) % balloonImages.length; // Wrap around after the last image

        // Set initial size
        balloon.style.width = "0px";
        balloon.style.height = "0px";
        balloon.style.left = "77.5%";
        balloon.style.top = "75%";
        inflater.appendChild(balloon);

        // Create and append alphabet image
        const alphabet = document.createElement("img");
        alphabet.src = alphabetImages[alphabetImageIndex];
        alphabetImageIndex = (alphabetImageIndex + 1) % alphabetImages.length; // Wrap around after the last alphabet
        alphabet.classList.add("alphabet");
        balloon.appendChild(alphabet);

        // Initialize balloon properties
        const balloonData = {
            element: balloon,
            alphabetElement: alphabet,
            size: 0, // Start from zero
            isFlying: false,
            velocityX: (Math.random() - 0.5) * 6, // Random horizontal velocity
            velocityY: -3, // Upward velocity
            centerX: window.innerWidth * 0.775, // Initial center X
            centerY: window.innerHeight * 0.75, // Initial center Y,
        };

        // Add balloon to the array
        balloons.push(balloonData);

        // Add click event to pop the balloon
        balloon.addEventListener("click", () => {
            popBalloon(balloonData);
        });

        // Update button visibility
        updatePopAllButtonVisibility();

        return balloonData;
    }

    // Function to pop a single balloon
    function popBalloon(balloonData) {
        balloonData.element.classList.add("popped");
        setTimeout(() => {
            balloonData.element.remove();
            // Remove the balloon from the array immediately
            const index = balloons.indexOf(balloonData);
            if (index !== -1) balloons.splice(index, 1);

            // Update button visibility
            updatePopAllButtonVisibility();
        }, 300);
    }

    // Function to pop all balloons
    function popAllBalloons() {
        balloons.forEach((balloonData) => {
            popBalloon(balloonData);
        });
    }

    // Function to update the visibility of the "Pop All Balloons" button
    function updatePopAllButtonVisibility() {
        if (balloons.length > 5) {
            popAllButton.style.display = "block";
        } else {
            popAllButton.style.display = "none";
        }
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

            // Update alphabet size proportionally
            const alphabetSize = activeBalloon.size * 0.5; // Alphabet size is 50% of the balloon size
            activeBalloon.alphabetElement.style.width = `${alphabetSize}px`;
            activeBalloon.alphabetElement.style.height = `${alphabetSize}px`;

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

            // Collision detection with other balloons (only flying balloons)
            for (const otherBalloon of balloons) {
                if (
                    otherBalloon !== balloonData &&
                    otherBalloon.isFlying &&
                    !otherBalloon.element.classList.contains("popped") // Skip popped balloons
                ) {
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
            balloon.style.left = `${balloonData.centerX - halfWidth}px`;
            balloon.style.top = `${balloonData.centerY - halfHeight}px`;

            // Continue the animation if the balloon is still flying
            if (balloonData.isFlying) {
                requestAnimationFrame(update);
            }
        }
        update();
    }

    // Add click event to the "Pop All Balloons" button
    popAllButton.addEventListener("click", popAllBalloons);
});






















