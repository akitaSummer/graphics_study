import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
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
  const axesHelper = useRef(new THREE.AxesHelper(10));
  const hemisphereLight = useRef(new THREE.HemisphereLight(0xffffff, 0x444444));
  const gui = useRef<GUI>();
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const loader = useRef(new GLTFLoader());
  const hemisphereLightHelper = useRef(
    new THREE.HemisphereLightHelper(hemisphereLight.current, 5)
  );
  const directionalLight = useRef(new THREE.DirectionalLight(0xffffff)); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );
  const plane = useRef(
    new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({
        color: 0x999999,
      })
    )
  );

  const mixer = useRef<THREE.AnimationMixer>();
  const clock = useRef(new THREE.Clock());
  const soldier = useRef<GLTF>();

  const initScene = () => {
    scene.current.background = new THREE.Color(0xa0a0a0);

    scene.current.fog = new THREE.Fog(0xa0a0a0, 10, 50);
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
    camera.current.position.z = -10;
    camera.current.position.y = 10;
    camera.current.position.x = 10;

    camera.current.lookAt(0, 0, 0);
  };

  const initHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);
    scene.current.add(hemisphereLightHelper.current);
    scene.current.add(directionalLightHelper.current);
  };

  const initLight = () => {
    scene.current.add(hemisphereLight.current);

    directionalLight.current.position.set(-3, 10, -10);
    scene.current.add(directionalLight.current);
  };

  const initMesh = () => {
    plane.current.rotation.x = -Math.PI / 2;
    scene.current.add(plane.current);
    loader.current.load("src/models/gltf/Soldier.glb", (gltf) => {
      console.log(gltf);
      if (soldier.current) {
        scene.current.remove(
          scene.current.getObjectById(soldier.current.scene.id)!
        );
      }
      soldier.current = gltf;
      scene.current.add(gltf.scene);
      gltf.scene.traverse((obj) => {
        // @ts-ignore
        if (obj.isMesh) {
          obj.castShadow = true;
        }
      });
      const clip = gltf.animations[3];
      mixer.current = new THREE.AnimationMixer(gltf.scene);
      const action = mixer.current.clipAction(clip);
      action.play();

      render();
    });
  };

  const enabledShadow = () => {
    renderer.current.shadowMap.enabled = true;
    directionalLight.current.castShadow = true;
    plane.current.receiveShadow = true;
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
      if (mixer.current) {
        const delta = clock.current.getDelta();
        mixer.current.update(delta);
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
    initMesh();
    enabledShadow();
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
