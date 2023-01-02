import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);
  const scene = useRef(new THREE.Scene());
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const camera = useRef(
    new THREE.PerspectiveCamera(
      70, // 竖直方向想能看到的最大范围夹角的1/2
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
  ); // 透视相机
  const axesHelper = useRef(new THREE.AxesHelper(10));
  const ambientLight = useRef(new THREE.AmbientLight(0xffffff, 0.2));
  const gui = useRef<GUI>();
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const boxes = useRef<THREE.Mesh>();

  const directionalLight = useRef(new THREE.DirectionalLight(0xffffff, 0.2)); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );

  const initScene = () => {
    scene.current.background = new THREE.Color(0x000000);
  };

  const initRender = () => {
    // renderer.current.setClearColor(new THREE.Color(0xeeeeee));
    renderer.current.setPixelRatio(window.devicePixelRatio);
    renderer.current.setSize(window.innerWidth, window.innerHeight);

    if (threeRef.current) {
      threeRef.current.appendChild(renderer.current.domElement);
    }
  };

  const initCamera = () => {
    camera.current.position.z = 50;
    camera.current.position.y = 30;
    camera.current.position.x = 10;

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
    const tx = await texture.loadAsync("src/textures/crate.gif");
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshBasicMaterial({ map: tx });

    if (boxes.current) {
      scene.current.remove(boxes.current.getObjectById(boxes.current.id)!);
    }
    boxes.current = new THREE.Mesh(geometry, material);
    scene.current.add(boxes.current);
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
      if (boxes.current) {
        boxes.current.rotation.x += 0.001;
        boxes.current.rotation.y += 0.001;
      }
      requestID.current = requestAnimationFrame(render);
    }
  };

  useEffect(() => {
    initScene();
    initRender();
    initCamera();
    initHelper();
    initLight();
    render();
    initMesh().then(() => render());
    buildGUI();
    const resize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(window.innerWidth, window.innerHeight);
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
