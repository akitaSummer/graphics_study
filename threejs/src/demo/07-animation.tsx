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
  const ambientLight = useRef(new THREE.AmbientLight(0xffffff, 0.2));
  const gui = useRef<GUI>();
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const clock = useRef(new THREE.Clock());
  const directionalLight = useRef(new THREE.DirectionalLight(0xffffff, 0.4)); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );
  const boxes = useRef(
    new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true })
    )
  );
  const clip = useRef<THREE.AnimationClip>();
  const mixer = useRef<THREE.AnimationMixer>();

  const initScene = () => {
    scene.current.background = new THREE.Color(0x888888);
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
    scene.current.add(ambientLight.current);

    directionalLight.current.position.set(10, 10, 5);
    scene.current.add(directionalLight.current);
  };

  const initMesh = () => {
    scene.current.add(boxes.current);
  };

  const initAnimation = () => {
    const positionKF = new THREE.VectorKeyframeTrack(
      ".position",
      [0, 1, 2, 3],
      [
        // 0
        0, 0, 0,
        // 1
        10, 10, 0,
        // 2
        10, 0, 0,
        // 3
        0, 0, 0,
      ]
    );

    const scaleKF = new THREE.VectorKeyframeTrack(
      ".scale",
      [0, 1, 2, 3],
      [
        // 0
        1, 1, 1,
        // 1
        2, 2, 2,
        // 2
        0.5, 2, 2,
        // 3
        1, 1, 1,
      ]
    );

    const xAxis = new THREE.Vector3(1, 0, 0);
    const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
    const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
    const quaternionKF = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, 1, 2, 3],
      [
        // 0
        qInitial.x,
        qInitial.y,
        qInitial.z,
        qInitial.w,
        // 1
        qFinal.x,
        qFinal.y,
        qFinal.z,
        qFinal.w,
        // 2
        qInitial.x,
        qInitial.y,
        qInitial.z,
        qInitial.w,
        // 3
        qFinal.x,
        qFinal.y,
        qFinal.z,
        qFinal.w,
      ]
    );

    const colorKF = new THREE.ColorKeyframeTrack(
      ".material.color",
      [0, 1, 2, 3],
      [
        // 0
        1, 0, 0,
        // 1
        0, 1, 0,
        // 2
        0, 0, 1,
        // 3
        0, 0, 0,
      ]
    );

    const opacityKF = new THREE.NumberKeyframeTrack(
      ".material.opacity",
      [0, 1, 2, 3],
      [
        // 0
        1,
        // 1
        0,
        // 2
        1,
        // 3
        0,
      ]
    );

    clip.current = new THREE.AnimationClip("Action", 4, [
      positionKF,
      scaleKF,
      quaternionKF,
      colorKF,
      opacityKF,
    ]);
  };
  const enbaleAnimation = () => {
    mixer.current = new THREE.AnimationMixer(boxes.current);
    const clipAction = mixer.current.clipAction(clip.current!);
    clipAction.play();
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
    initMesh();
    initLight();
    initAnimation();
    enbaleAnimation();
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
