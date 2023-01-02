import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import GUI from "lil-gui";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);
  const scene = useRef(new THREE.Scene());
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const camera = useRef(
    new THREE.PerspectiveCamera(
      60, // 竖直方向想能看到的最大范围夹角的1/2
      window.innerWidth / window.innerHeight,
      1,
      20000
    )
  ); // 透视相机
  const axesHelper = useRef(new THREE.AxesHelper(100));
  const ambientLight = useRef(new THREE.AmbientLight(0xffffff, 0.2));
  const gui = useRef<GUI>();
  const clock = useRef(new THREE.Clock());
  const controls = useRef<FirstPersonControls>(
    new FirstPersonControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const plane = useRef<THREE.Mesh>();
  const geometry = useRef<THREE.PlaneGeometry>();

  const directionalLight = useRef(new THREE.DirectionalLight(0xffffff, 0.2)); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );

  const initScene = () => {
    scene.current.background = new THREE.Color(0xaaccff);

    scene.current.fog = new THREE.FogExp2(0xaaccff, 0.0007);
  };

  const initRender = () => {
    // renderer.current.setClearColor(new THREE.Color(0xeeeeee));
    renderer.current.setPixelRatio(window.devicePixelRatio);
    renderer.current.setSize(window.innerWidth, window.innerHeight);

    if (threeRef.current) {
      threeRef.current.appendChild(renderer.current.domElement);
    }
  };

  const initControls = () => {
    controls.current.movementSpeed = 500;
    controls.current.lookSpeed = 0.1;
  };

  const initCamera = () => {
    camera.current.position.z = 200;
    camera.current.position.y = 200;
    camera.current.position.x = 0;

    camera.current.lookAt(0, 0, 0);
  };

  const initHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);
    scene.current.add(directionalLightHelper.current);
  };

  const initLight = () => {
    directionalLight.current.position.set(10, 10, 5);
    scene.current.add(directionalLight.current);
    scene.current.add(ambientLight.current);
  };

  const initMesh = async () => {
    const texture = new THREE.TextureLoader();
    const tx = await texture.loadAsync("src/textures/water.jpg");
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(5, 5);
    geometry.current = new THREE.PlaneGeometry(20000, 20000, 31, 31);
    geometry.current.rotateX(-Math.PI / 2);
    const positions = geometry.current.attributes
      .position as THREE.BufferAttribute;
    positions.usage = THREE.DynamicDrawUsage;
    for (let i = 0; i < positions.count; i++) {
      const y = 35 * Math.sin(i / 2);
      positions.setY(i, y);
    }
    const material = new THREE.MeshBasicMaterial({ color: 0x44ccff, map: tx });

    if (plane.current) {
      scene.current.remove(plane.current.getObjectById(plane.current.id)!);
    }
    plane.current = new THREE.Mesh(geometry.current, material);
    scene.current.add(plane.current);
  };

  const buildGUI = () => {
    gui.current = new GUI();
    gui.current.close();
    const cameraFolder = gui.current.addFolder("Camera");
    cameraFolder
      .add(camera.current.position, "x", -100, 100)
      .step(1)
      .onChange((val: number) => {
        camera.current.position.x = val;
      });
    cameraFolder
      .add(camera.current.position, "y", -100, 100)
      .step(1)
      .onChange((val: number) => {
        camera.current.position.y = val;
      });
    cameraFolder
      .add(camera.current.position, "z", -100, 100)
      .step(1)
      .onChange((val: number) => {
        camera.current.position.z = val;
      });
    cameraFolder.close();
  };

  const render = () => {
    if (threeRef.current) {
      renderer.current.render(scene.current, camera.current);
      const delta = clock.current.getDelta();
      const time = clock.current.getElapsedTime() * 10;
      if (geometry.current) {
        const positions = geometry.current.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const y = 35 * Math.sin(i / 5 + (time + i) / 7);
          positions.setY(i, y);
        }
        positions.needsUpdate = true;
      }
      controls.current?.update(delta);
      requestID.current = requestAnimationFrame(render);
    }
  };

  useEffect(() => {
    initScene();
    initRender();
    initCamera();
    initHelper();
    initControls();
    initLight();
    initMesh().then(() => {
      render();
    });
    buildGUI();
    const resize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(window.innerWidth, window.innerHeight);
      controls.current?.handleResize();
    };
    window.addEventListener("resize", resize);
    return () => {
      scene.current.clear();
      if (requestID.current) {
        cancelAnimationFrame(requestID.current);
      }
      window.removeEventListener("resize", resize);
      gui.current?.destroy();
    };
  }, []);

  return <div ref={threeRef}></div>;
}

export default App;
