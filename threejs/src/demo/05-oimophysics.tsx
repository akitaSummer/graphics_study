import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// @ts-ignore
import { OimoPhysics } from "three/examples/jsm/physics/OimoPhysics";
import GUI from "lil-gui";

const oimo = await OimoPhysics();

function App() {
  const threeRef = useRef<HTMLDivElement>(null);
  const scene = useRef(new THREE.Scene());
  const renderer = useRef(new THREE.WebGLRenderer());
  const camera = useRef(
    new THREE.PerspectiveCamera(
      60, // 竖直方向想能看到的最大范围夹角的1/2
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
  ); // 透视相机
  const axesHelper = useRef(new THREE.AxesHelper(5));
  const hemisphereLight = useRef(new THREE.HemisphereLight()); // 白光，环境光，没有参数时等于AmbientLight
  const gui = useRef<GUI>();
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const directionalLight = useRef(new THREE.DirectionalLight()); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );
  const hemisphereLightHelper = useRef(
    new THREE.HemisphereLightHelper(hemisphereLight.current, 5)
  );
  const floor = useRef(
    new THREE.Mesh(
      new THREE.BoxGeometry(10, 1, 10),
      new THREE.ShadowMaterial({ color: 0x111111 }) // 接受阴影，可设置影子的颜色
    )
  );
  const floorHelper = useRef(new THREE.BoxHelper(floor.current));
  const boxes = useRef(
    new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshLambertMaterial(), // 一般用于模拟木头等非光滑材料
      100
    )
  );
  const spheres = useRef(
    new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.075, 3),
      new THREE.MeshLambertMaterial(), // 一般用于模拟木头等非光滑材料
      100
    )
  );
  const position = useRef(new THREE.Vector3());
  const physics = useRef<any>();
  const f = useRef<number>(0);

  const initScene = () => {
    scene.current.background = new THREE.Color(0x888888);
  };

  const initRender = () => {
    // renderer.current.setClearColor(new THREE.Color(0xeeeeee));
    renderer.current.setPixelRatio(window.devicePixelRatio);
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    renderer.current.outputEncoding = THREE.sRGBEncoding;

    if (threeRef.current) {
      threeRef.current.appendChild(renderer.current.domElement);
    }
  };

  const initCamera = () => {
    camera.current.position.z = 10;
    camera.current.position.y = 10;
    camera.current.position.x = 10;

    camera.current.lookAt(0, 0, 0);
  };

  const initControls = () => {
    controls.current.target.y = 1;
    controls.current.update();
  };

  const initHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);

    directionalLightHelper.current.update();
    scene.current.add(directionalLightHelper.current);
    hemisphereLightHelper.current.update();
    scene.current.add(hemisphereLightHelper.current);

    floorHelper.current.update();
    scene.current.add(floorHelper.current);
  };

  const initLight = () => {
    hemisphereLight.current.intensity = 0.3;
    // hemisphereLight.current.position.set(0, 1, 0);
    scene.current.add(hemisphereLight.current);

    directionalLight.current.position.set(5, 5, -5);
    scene.current.add(directionalLight.current);
  };

  const initMeshes = () => {
    // floor
    floor.current.position.set(0, -1, 0);
    scene.current.add(floor.current);

    // boxes
    boxes.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    for (let i = 0; i < boxes.current.count; i++) {
      matrix.setPosition(
        Math.random() - 0.5,
        Math.random() * 2,
        Math.random() - 0.5
      );
      boxes.current.setMatrixAt(i, matrix);
      boxes.current.setColorAt(i, color.setHex(Math.random() * 0xffffff));
    }
    scene.current.add(boxes.current);

    // spheres
    spheres.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < boxes.current.count; i++) {
      matrix.setPosition(
        Math.random() - 0.5,
        Math.random() * 2,
        Math.random() - 0.5
      );
      spheres.current.setMatrixAt(i, matrix);
      spheres.current.setColorAt(i, color.setHex(Math.random() * 0xffffff));
    }
    scene.current.add(spheres.current);
  };

  const initShadow = () => {
    renderer.current.shadowMap.enabled = true;
    directionalLight.current.castShadow = true;
    directionalLight.current.shadow.camera.zoom = 2;
    floor.current.receiveShadow = true;
    boxes.current.castShadow = true;
    boxes.current.receiveShadow = true;
  };

  const initPhysics = async () => {
    physics.current = oimo;
    physics.current.addMesh(floor.current);
    physics.current.addMesh(boxes.current, 1);
    physics.current.addMesh(spheres.current, 1);
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
    requestID.current = requestAnimationFrame(render);
    if (threeRef.current && physics.current) {
      let index = Math.floor(Math.random() * boxes.current.count);
      position.current.set(0, Math.random() + 1, 0);
      physics.current.setMeshPosition(boxes.current, position.current, index);

      index = Math.floor(Math.random() * spheres.current.count);
      position.current.set(0, Math.random() + 1, 0);
      physics.current.setMeshPosition(spheres.current, position.current, index);
      f.current = 0;

      renderer.current.render(scene.current, camera.current);
    }
  };

  useEffect(() => {
    initScene();
    initRender();
    initCamera();
    initLight();
    initMeshes();
    initShadow();
    initPhysics();
    initHelper();
    initControls();
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
