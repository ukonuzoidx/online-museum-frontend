import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

const PlayerControls = () => {
  const { camera } = useThree();
  const [keysPressed, setKeysPressed] = useState({});
  const moveSpeed = 0.1; // Speed of movement
  const lookSpeed = 0.002; // Speed of mouse look
  const velocity = useRef(new Vector3());

  useEffect(() => {
    const handleKeyDown = (event) =>
      setKeysPressed((prev) => ({ ...prev, [event.key]: true }));
    const handleKeyUp = (event) =>
      setKeysPressed((prev) => ({ ...prev, [event.key]: false }));

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) => {
      camera.rotation.y -= event.movementX * lookSpeed;
      camera.rotation.x -= event.movementY * lookSpeed;
    };

    document.body.requestPointerLock =
      document.body.requestPointerLock || document.body.mozRequestPointerLock;

    const handleClick = () => document.body.requestPointerLock();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
    };
  }, [camera]);

  useFrame(() => {
    const direction = new Vector3();
    camera.getWorldDirection(direction);

    let moveVector = new Vector3();
    if (keysPressed["w"]) moveVector.add(direction);
    if (keysPressed["s"]) moveVector.sub(direction);
    if (keysPressed["a"])
      moveVector.add(new Vector3().crossVectors(direction, camera.up).negate());
    if (keysPressed["d"])
      moveVector.add(new Vector3().crossVectors(direction, camera.up));

    moveVector.normalize().multiplyScalar(moveSpeed);
    velocity.current.lerp(moveVector, 0.2);
    camera.position.add(velocity.current);
  });

  return null;
};

export default PlayerControls;
