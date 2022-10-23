import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ShadowMapViewer } from "three/examples/jsm/utils/ShadowMapViewer";
import GUI from "lil-gui";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);
  const scene = useRef(new THREE.Scene());
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const camera = useRef(
    new THREE.PerspectiveCamera(
      45, // 竖直方向想能看到的最大范围夹角的1/2
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
  ); // 透视相机
  const axesHelper = useRef(new THREE.AxesHelper(20));
  const ambientLight = useRef(new THREE.AmbientLight(0x404040)); // 背景光
  const gui = useRef<GUI>();
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const clock = useRef(new THREE.Clock());
  const directionalLight = useRef(new THREE.DirectionalLight()); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );
  const spotLight = useRef(new THREE.SpotLight(0xffffff, 1)); // 聚光灯
  const spotLightHelper = useRef(new THREE.SpotLightHelper(spotLight.current));
  const spotLightCameraHelper = useRef(
    new THREE.CameraHelper(spotLight.current.shadow.camera)
  );
  const directionalLightCameraHelper = useRef(
    new THREE.CameraHelper(directionalLight.current.shadow.camera)
  );
  const directionalLightShadowMapViewer = useRef(
    new ShadowMapViewer(directionalLight.current)
  );
  const spotLightShadowMapViewer = useRef(
    new ShadowMapViewer(spotLight.current)
  );
  const material = useRef(
    new THREE.MeshPhongMaterial({
      color: 0xff0000,
      shininess: 150,
      specular: 0x222222,
    })
  );
  const torusKont = useRef(
    new THREE.Mesh(new THREE.TorusKnotGeometry(25, 8, 75, 20), material.current)
  );
  const cube = useRef(
    new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), material.current)
  );
  const ground = useRef(
    new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.15, 10),
      new THREE.MeshPhongMaterial({
        color: 0xa0adaf,
        shininess: 150,
        specular: 0x111111,
      })
    )
  );

  const initScene = () => {
    // scene.current.background = new THREE.Color();
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
    camera.current.position.z = 30;
    camera.current.position.y = 30;
    camera.current.position.x = 10;

    camera.current.lookAt(0, 0, 0);
  };

  const initHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);

    directionalLightHelper.current.update();
    scene.current.add(directionalLightHelper.current);

    spotLightHelper.current.update();
    scene.current.add(spotLightHelper.current);

    spotLightCameraHelper.current.update();
    scene.current.add(spotLightCameraHelper.current);

    directionalLightCameraHelper.current.update();
    scene.current.add(directionalLightCameraHelper.current);
  };

  const initControls = () => {
    controls.current.target.set(0, 1, 0);
    controls.current.update();
  };

  const initLight = () => {
    scene.current.add(ambientLight.current);

    directionalLight.current.name = "Dir light";
    directionalLight.current.position.set(0, 10, 0);
    directionalLight.current.shadow.camera.near = 1;
    directionalLight.current.shadow.camera.far = 10;
    directionalLight.current.shadow.camera.right = 15;
    directionalLight.current.shadow.camera.left = -15;
    directionalLight.current.shadow.camera.top = 15;
    directionalLight.current.shadow.camera.bottom = -15;
    scene.current.add(directionalLight.current);

    spotLight.current.name = "Spot light";
    spotLight.current.position.set(10, 10, 5);
    spotLight.current.angle = Math.PI / 5; // 范围
    spotLight.current.penumbra = 0.1; // 虚化
    spotLight.current.shadow.camera.near = 8;
    spotLight.current.shadow.camera.far = 30;
    spotLight.current.shadow.mapSize.width = 1024;
    spotLight.current.shadow.mapSize.height = 1024;
    scene.current.add(spotLight.current);
  };

  const initMeshes = () => {
    torusKont.current.scale.multiplyScalar(1 / 5);
    torusKont.current.position.y = 3;
    scene.current.add(torusKont.current);

    cube.current.position.set(8, 3, 8);
    scene.current.add(cube.current);

    ground.current.scale.multiplyScalar(2);
    scene.current.add(ground.current);
  };

  const initShadow = () => {
    renderer.current.shadowMap.enabled = true;
    renderer.current.shadowMap.type = THREE.BasicShadowMap;

    spotLight.current.castShadow = true;
    directionalLight.current.castShadow = true;

    torusKont.current.castShadow = true;
    torusKont.current.receiveShadow = true;

    cube.current.castShadow = true;
    cube.current.receiveShadow = true;

    ground.current.castShadow = false;
    ground.current.receiveShadow = true;
  };

  const initShadowMapViewer = () => {
    reseizeShadowMapViewers();
  };

  const reseizeShadowMapViewers = () => {
    const size = window.innerWidth * 0.2;
    directionalLightShadowMapViewer.current.position.x = 10;
    directionalLightShadowMapViewer.current.position.y = 10;
    directionalLightShadowMapViewer.current.size.width = size;
    directionalLightShadowMapViewer.current.size.height = size;
    directionalLightShadowMapViewer.current.update();

    spotLightShadowMapViewer.current.size.set(size, size);
    spotLightShadowMapViewer.current.position.set(size + 20, 10);
    spotLightShadowMapViewer.current.update();
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
      const delta = clock.current.getDelta();
      renderer.current.render(scene.current, camera.current);

      torusKont.current.rotation.x += 0.25 * delta;
      torusKont.current.rotation.y += 2 * delta;
      torusKont.current.rotation.z += 1 * delta;

      cube.current.rotation.x += 0.25 * delta;
      cube.current.rotation.y += 2 * delta;
      cube.current.rotation.z += 1 * delta;

      directionalLightShadowMapViewer.current.render(renderer.current);
      spotLightShadowMapViewer.current.render(renderer.current);
      requestID.current = requestAnimationFrame(render);
    }
  };

  useEffect(() => {
    initScene();
    initRender();
    initCamera();
    initMeshes();
    initHelper();
    initControls();
    initLight();
    initShadow();
    initShadowMapViewer();
    render();
    buildGUI();
    const resize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(window.innerWidth, window.innerHeight);
      reseizeShadowMapViewers();
      directionalLightShadowMapViewer.current.updateForWindowResize();
      spotLightShadowMapViewer.current.updateForWindowResize();
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
