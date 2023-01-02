import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import GUI from "lil-gui";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);
  const scene = useRef(new THREE.Scene());
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const camera = useRef(
    new THREE.PerspectiveCamera(
      50, // 竖直方向想能看到的最大范围夹角的1/2
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
  ); // 透视相机
  const axesHelper = useRef(new THREE.AxesHelper(100));
  // const ambientLight = useRef(new THREE.AmbientLight(0xffffff, 0.2));
  const gui = useRef<GUI>();
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const directionalLight = useRef(new THREE.DirectionalLight(0xffffff, 0.125)); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );

  const pointLight = useRef(new THREE.PointLight(0xffffff, 1.5)); // 平行光, 太阳光
  const pointLightHelper = useRef(
    new THREE.PointLightHelper(pointLight.current)
  );

  const initScene = () => {
    scene.current.background = new THREE.Color(0x000000);
    scene.current.fog = new THREE.Fog(0, 250, 1400);
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
    camera.current.position.z = 700;
    camera.current.position.y = 250;
    camera.current.position.x = 0;

    camera.current.lookAt(new THREE.Vector3(0, 0, 0));
  };

  const initHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);
    scene.current.add(directionalLightHelper.current);
    scene.current.add(pointLightHelper.current);
  };

  const initLight = () => {
    directionalLight.current.position.set(-100, 100, 0);
    scene.current.add(directionalLight.current);
    pointLight.current.position.set(0, 100, 90);
    pointLight.current.color.setHSL(Math.random(), 1, 0.5);
    scene.current.add(pointLight.current);
    // scene.current.add(ambientLight.current);
  };

  const initMesh = async () => {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
      })
    );

    plane.rotation.x = -Math.PI / 2;
    scene.current.add(plane);

    const materials = [
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
      }),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
      }),
    ];

    const loader = new FontLoader();
    const font = await loader.loadAsync(
      "src/fonts/helvetiker_bold.typeface.json"
    );

    const geometry = new TextGeometry("hello world", {
      font,
      size: 50,
      height: 20,
      curveSegments: 20,
      bevelThickness: 2,
      bevelSize: 1.5,
      bevelEnabled: true,
    });

    geometry.computeBoundingBox();
    const xOffset =
      ((geometry.boundingBox?.max.x ?? 0) -
        (geometry.boundingBox?.min.x ?? 0)) /
      2;
    const textMesh = new THREE.Mesh(geometry, materials);
    textMesh.position.set(-xOffset, 30, 0);
    scene.current.add(textMesh);

    const reflectionMesh = new THREE.Mesh(geometry, materials);
    reflectionMesh.position.set(-xOffset, 0, 20);
    reflectionMesh.rotation.x = Math.PI;
    scene.current.add(reflectionMesh);
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

      requestID.current = requestAnimationFrame(render);
    }
  };

  useEffect(() => {
    initScene();
    initRender();
    initCamera();
    initHelper();
    initLight();
    buildGUI();
    initMesh().then(() => {
      render();
    });
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
