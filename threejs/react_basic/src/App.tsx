import { useEffect, useRef } from "react";
import * as THREE from "three";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);

  const init = () => {
    const sence = new THREE.Scene();

    const axes = new THREE.AxesHelper(20);

    sence.add(axes);

    const renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(new THREE.Color(0xeeeeee));

    renderer.setSize(window.innerWidth, window.innerHeight);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 40;

    camera.lookAt(sence.position);

    if (threeRef.current) {
      threeRef.current.appendChild(renderer.domElement);

      renderer.render(sence, camera);
    }
  };

  useEffect(() => {
    init();
  }, []);
  return <div ref={threeRef}></div>;
}

export default App;
