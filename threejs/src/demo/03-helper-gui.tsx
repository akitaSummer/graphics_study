import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SpotLight } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);
  const scene = useRef(new THREE.Scene());
  const renderer = useRef(new THREE.WebGLRenderer());
  const camera = useRef(
    new THREE.PerspectiveCamera(
      40, // 竖直方向想能看到的最大范围夹角的1/2
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
  ); // 透视相机
  const axesHelper = useRef(new THREE.AxesHelper(20));
  const ambientLight = useRef(new THREE.AmbientLight(0xffffff, 0.2)); // 背景光
  const spotLight = useRef(new THREE.SpotLight(0xffffff, 1)); // 聚光灯
  const spotLightHelper = useRef(new THREE.SpotLightHelper(spotLight.current));
  const gui = useRef<GUI>();
  const plane = useRef(
    new THREE.Mesh(
      new THREE.PlaneGeometry(800, 400), // 面
      new THREE.MeshPhongMaterial({ color: 0x808080 })
    )
  ); // 平面
  const cylinder = useRef(
    new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 2, 24, 1, false), // 面
      new THREE.MeshPhongMaterial({ color: 0x4080ff })
    )
  );
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const initRender = () => {
    // renderer.current.setClearColor(new THREE.Color(0xeeeeee));
    renderer.current.setPixelRatio(window.devicePixelRatio);
    renderer.current.setSize(window.innerWidth, window.innerHeight);

    if (threeRef.current) {
      threeRef.current.appendChild(renderer.current.domElement);
    }
  };

  const initCamera = () => {
    camera.current.position.z = 200;
    camera.current.position.y = 120;
    camera.current.position.x = 100;

    camera.current.lookAt(0, 0, 0);
  };

  const initAxesHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);
  };

  const initAmbientLight = () => {
    scene.current.add(ambientLight.current);
  };

  const initMeshes = () => {
    plane.current.rotation.x = -Math.PI / 2;
    plane.current.position.set(0, -10, 0);
    scene.current.add(plane.current);

    cylinder.current.position.set(0, 10, 0);
    scene.current.add(cylinder.current);
  };

  const initSpotLight = () => {
    spotLight.current.position.set(-50, 60, 0);
    spotLight.current.angle = Math.PI / 6; // 范围
    spotLight.current.penumbra = 0.1; // 虚化
    scene.current.add(spotLight.current);
  };

  const initSpotLightHelper = () => {
    spotLightHelper.current.update();
    scene.current.add(spotLightHelper.current);
  };

  const initShadow = () => {
    cylinder.current.castShadow = true; // 产生影子
    plane.current.receiveShadow = true; // 接受影子
    spotLight.current.castShadow = true; // 产生影子
    renderer.current.shadowMap.enabled = true;
  };

  const buildGUI = () => {
    gui.current = new GUI();
    gui.current.close();
    const spotLightFolder = gui.current.addFolder("Spot Light");
    spotLightFolder
      .addColor(spotLight.current, "color")
      .onChange((val: string) => {
        spotLight.current.color.set(val);
      });
    spotLightFolder
      .add(spotLight.current, "angle", 0, Math.PI / 2)
      .onChange((val: number) => {
        spotLight.current.angle = val;
        spotLightHelper.current.update();
      });
    spotLightFolder
      .add(spotLight.current, "penumbra", 0, 1)
      .onChange((val: number) => {
        spotLight.current.penumbra = val;
      });

    const cameraFolder = gui.current.addFolder("Camera");
    cameraFolder
      .add(camera.current.position, "x", -1000, 1000)
      .step(1)
      .onChange((val: number) => {
        camera.current.position.x = val;
      });
    cameraFolder
      .add(camera.current.position, "y", -1000, 1000)
      .step(1)
      .onChange((val: number) => {
        camera.current.position.y = val;
      });
    cameraFolder
      .add(camera.current.position, "z", -1000, 1000)
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
    initRender();
    initCamera();
    initAxesHelper();
    initAmbientLight();
    initMeshes();
    initSpotLight();
    initSpotLightHelper();
    initShadow();
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
