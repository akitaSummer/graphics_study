import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

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
  const axesHelper = useRef(new THREE.AxesHelper(100));
  const ambientLight = useRef(new THREE.AmbientLight(0x222222));
  const gui = useRef<GUI>();
  const requestID = useRef<number>();
  const controls = useRef<TrackballControls>();
  const pointLight = useRef(new THREE.PointLight(0xffffff));
  const pointLightHelper = useRef(
    new THREE.PointLightHelper(pointLight.current, 1)
  );

  const initScene = () => {
    scene.current.background = new THREE.Color(0x888888);
  };

  const initRender = () => {
    // renderer.current.setClearColor(new THREE.Color(0xeeeeee));
    renderer.current.setPixelRatio(window.devicePixelRatio);
    renderer.current.setSize(window.innerWidth, window.innerHeight);

    controls.current = new TrackballControls(
      camera.current,
      renderer.current.domElement
    );
    controls.current.minDistance = 200;
    controls.current.maxDistance = 800;

    if (threeRef.current) {
      threeRef.current.appendChild(renderer.current.domElement);
    }
  };

  const initCamera = () => {
    // camera.current.position.z = 50;
    // camera.current.position.y = 30;
    camera.current.position.set(0, 0, 500);

    camera.current.lookAt(0, 0, 0);
  };

  const initHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);
    scene.current.add(pointLightHelper.current);
  };

  const initLight = () => {
    scene.current.add(ambientLight.current);
    pointLight.current.position.copy(camera.current.position);
    scene.current.add(pointLight.current);
  };

  const initMesh = () => {
    // 1
    const closedSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-60, -100, 60),
      new THREE.Vector3(-60, 20, 60),
      new THREE.Vector3(-60, 120, -60),
      new THREE.Vector3(60, 20, -60),
      new THREE.Vector3(60, -100, -60),
    ]);

    // @ts-ignore
    closedSpline.curveType = "catmullrom";
    // @ts-ignore
    closedSpline.closed = true;
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 100, // 平滑度
      bevelEnabled: false,
      extrudePath: closedSpline,
    };

    const r = 20;
    const pts1: THREE.Vector2[] = [];
    const count = 3; // 截面边数
    for (let i = 0; i < count; i++) {
      const a = (i / count) * 2 * Math.PI;
      pts1.push(new THREE.Vector2(r * Math.cos(a), r * Math.sin(a)));
    }

    const shape1 = new THREE.Shape(pts1);

    const geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings);
    const material1 = new THREE.MeshLambertMaterial({
      color: 0xb00000,
    });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    scene.current.add(mesh1);

    // 2
    const randomPoints = [];
    for (let i = 0; i < 10; i++) {
      randomPoints.push(
        new THREE.Vector3(
          (i - 4.5) * 50,
          THREE.MathUtils.randFloat(-50, 50),
          THREE.MathUtils.randFloat(-50, 50)
        )
      );
    }
    const randomSpline = new THREE.CatmullRomCurve3(randomPoints);
    const extrudeSettings2: THREE.ExtrudeGeometryOptions = {
      steps: 200, // 平滑度
      bevelEnabled: false,
      extrudePath: randomSpline,
    };
    const pts2 = [];
    const numPts = 5;
    for (let i = 0; i < numPts * 2; i++) {
      const l = i % 2 === 1 ? 10 : 20;
      const a = (i / numPts) * Math.PI;
      pts2.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
    }
    const shape2 = new THREE.Shape(pts2);
    const geometry2 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);
    const material2 = new THREE.MeshLambertMaterial({
      color: 0xff8000,
    });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    scene.current.add(mesh2);

    // 3
    const material3 = [material1, material2];
    const extrudeSettings3: THREE.ExtrudeGeometryOptions = {
      depth: 20,
      steps: 1, // 平滑度
      bevelEnabled: true, // 平滑过度
      bevelThickness: 2, // 平滑过度几个单位
      bevelSize: 4, // 外部平滑大小
      bevelSegments: 1, // 过度的平滑成都
    };
    const geometry3 = new THREE.ExtrudeGeometry(shape2, extrudeSettings3);
    const mesh3 = new THREE.Mesh(geometry3, material3);
    mesh3.position.set(50, 100, 50);
    scene.current.add(mesh3);
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
      controls.current?.update();

      requestID.current = requestAnimationFrame(render);
    }
  };

  useEffect(() => {
    initScene();
    initRender();
    initCamera();
    initLight();
    initHelper();
    initMesh();
    render();
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
