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
      40, // 竖直方向想能看到的最大范围夹角的1/2
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
  ); // 透视相机
  const axesHelper = useRef(new THREE.AxesHelper(10));
  const ambientLight = useRef(new THREE.AmbientLight(0x505050));
  const gui = useRef<GUI>();
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const directionalLight = useRef(new THREE.DirectionalLight(0xffffff, 0.2)); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );

  const ground = useRef(
    new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9, 1, 1),
      new THREE.MeshPhongMaterial({
        color: 0xa0adaf,
        shininess: 150,
      })
    )
  );
  const torusKnotMaterial = useRef(
    new THREE.MeshPhongMaterial({
      color: 0x80ee10,
      shininess: 100,
    })
  );
  const torusKnot = useRef(
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.4, 0.08, 95, 20),
      torusKnotMaterial.current
    )
  );

  const spotLight = useRef(new THREE.SpotLight(0xffffff));

  const spotLightHelper = useRef(new THREE.SpotLightHelper(spotLight.current));

  const initScene = () => {
    scene.current.background = new THREE.Color(0x999999);
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
    scene.current.add(spotLightHelper.current);
  };

  const initLight = () => {
    scene.current.add(directionalLight.current);
    scene.current.add(ambientLight.current);

    spotLight.current.angle = Math.PI / 5;
    spotLight.current.penumbra = 0.3;
    spotLight.current.position.set(2, 3, 3);
    scene.current.add(spotLight.current);
  };

  const initMesh = () => {
    // scene.current.add(boxes.current);
    ground.current.rotation.x = -Math.PI / 2;
    ground.current.position.y = -1;
    scene.current.add(ground.current);
    scene.current.add(torusKnot.current);
  };

  const enabledShadow = () => {
    renderer.current.shadowMap.enabled = true;

    spotLight.current.castShadow = true;
    spotLight.current.shadow.camera.near = 3;
    spotLight.current.shadow.camera.far = 10;
    spotLight.current.shadow.mapSize.width = 1024;
    spotLight.current.shadow.mapSize.height = 1024;

    directionalLight.current.castShadow = true;
    directionalLight.current.shadow.camera.near = 1;
    directionalLight.current.shadow.camera.far = 10;
    directionalLight.current.shadow.camera.right = 1;
    directionalLight.current.shadow.camera.left = -1;
    directionalLight.current.shadow.camera.top = 1;
    directionalLight.current.shadow.camera.bottom = -1;
    directionalLight.current.shadow.mapSize.width = 1024;
    directionalLight.current.shadow.mapSize.height = 1024;

    ground.current.receiveShadow = true;
    torusKnot.current.castShadow = true;
  };

  const enableClipping = () => {
    const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

    torusKnotMaterial.current.clippingPlanes = [plane];
    torusKnotMaterial.current.side = THREE.DoubleSide;

    torusKnotMaterial.current.clipShadows = true;

    renderer.current.localClippingEnabled = true;

    const plane1 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.5);

    renderer.current.clippingPlanes = [plane1];
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
    initLight();
    enabledShadow();
    initMesh();
    initHelper();
    enableClipping();
    render();
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
