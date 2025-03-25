// joystickUtils.js
export const createJoystickRefs = () => ({
    moveRef: {
        current: { x: 0, y: 0, startX: 0, startY: 0, active: false },
    },
    lookRef: {
        current: { dx: 0, dy: 0, lastX: 0, lastY: 0, active: false },
    },
});

// 🎮 Movement touch handlers
export const createMovementHandlers = (moveRef) => ({
    onMoveStart: (e) => {
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        moveRef.current.startX = centerX;
        moveRef.current.startY = centerY;
        moveRef.current.active = true;

        // Calculate initial position
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const maxDistance = 50;

        moveRef.current.x = Math.max(-1, Math.min(1, dx / maxDistance));
        moveRef.current.y = Math.max(-1, Math.min(1, dy / maxDistance));

        console.log("Move start:", moveRef.current);
    },

    onMove: (e) => {
        if (!moveRef.current.active) return;

        const touch = e.touches[0];
        const dx = touch.clientX - moveRef.current.startX;
        const dy = touch.clientY - moveRef.current.startY;
        const maxDistance = 50;

        // Normalize values to -1 to 1 range
        moveRef.current.x = Math.max(-1, Math.min(1, dx / maxDistance));
        moveRef.current.y = Math.max(-1, Math.min(1, dy / maxDistance));

        console.log("Move update:", moveRef.current.x, moveRef.current.y);
    },

    onMoveEnd: () => {
        console.log("Move end");
        moveRef.current.x = 0;
        moveRef.current.y = 0;
        moveRef.current.active = false;
    },
});

// 📷 Look touch handlers
export const createLookHandlers = (lookRef) => ({
    onLookStart: (e) => {
        const touch = e.touches[0];
        lookRef.current.lastX = touch.clientX;
        lookRef.current.lastY = touch.clientY;
        lookRef.current.active = true;
        lookRef.current.dx = 0;
        lookRef.current.dy = 0;

        console.log("Look start:", touch.clientX, touch.clientY);
    },

    onLook: (e) => {
        if (!lookRef.current.active) return;

        const touch = e.touches[0];
        const dx = touch.clientX - lookRef.current.lastX;
        const dy = touch.clientY - lookRef.current.lastY;

        // Add deltas for this frame
        lookRef.current.dx = dx;
        lookRef.current.dy = dy;

        // Update last position
        lookRef.current.lastX = touch.clientX;
        lookRef.current.lastY = touch.clientY;

        console.log("Look update:", dx, dy);
    },

    onLookEnd: () => {
        console.log("Look end");
        lookRef.current.dx = 0;
        lookRef.current.dy = 0;
        lookRef.current.active = false;
    },
});

// Visual joystick utility functions
export const updateVisualJoystick = (touchEvent, baseRef, thumbRef, maxRadius = 40) => {
    if (!baseRef.current || !thumbRef.current) return { x: 0, y: 0 };

    const touch = touchEvent.touches[0];
    const baseRect = baseRef.current.getBoundingClientRect();

    // Calculate center of joystick base
    const centerX = baseRect.left + baseRect.width / 2;
    const centerY = baseRect.top + baseRect.height / 2;

    // Calculate distance from center
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    // Limit joystick movement within base radius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > maxRadius) {
        const ratio = maxRadius / distance;
        deltaX *= ratio;
        deltaY *= ratio;
    }

    // Update thumb position
    thumbRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Return normalized values (-1 to 1)
    return {
        x: deltaX / maxRadius,
        y: deltaY / maxRadius
    };
};

export const resetVisualJoystick = (thumbRef) => {
    if (thumbRef.current) {
        thumbRef.current.style.transform = 'translate(0px, 0px)';
    }
};