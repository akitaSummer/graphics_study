import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

function App() {
  const [amount, setAmount] = useState(10);
  const [count, setCount] = useState(Math.pow(amount, 3));
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
  const axesHelper = useRef(new THREE.AxesHelper(20));
  const hemisphereLight = useRef(new THREE.HemisphereLight(0xffffff, 0x888888)); // 纵向过渡光,模拟大气
  const gui = useRef<GUI>();
  const white = useRef(new THREE.Color().setHex(0xffffff));
  const color = useRef(new THREE.Color());
  const icosahedronGeometry = useRef(new THREE.IcosahedronGeometry(0.5, 3)); // 正二十面体
  const material = useRef(new THREE.MeshPhongMaterial({ color: 0xffffff })); // 镜面高光材质，一般模拟金属或者瓷器
  const raycaster = useRef(new THREE.Raycaster()); // 射线投影
  const mouse = useRef(new THREE.Vector2(1, 1));
  const meshes = useRef(
    new THREE.InstancedMesh( // 批量创建mesh
      icosahedronGeometry.current,
      material.current,
      count
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
    camera.current.position.z = 10;
    camera.current.position.y = 10;
    camera.current.position.x = 10;

    camera.current.lookAt(0, 0, 0);
  };

  const initAxesHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);
  };

  const initLight = () => {
    hemisphereLight.current.position.set(0, 1, 0);
    scene.current.add(hemisphereLight.current);
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

  const initMeshes = () => {
    let index = 0;

    const offset = (amount - 1) / 2; // 4.5

    const matrix = new THREE.Matrix4();

    for (let i = 0; i < amount; i++) {
      for (let j = 0; j < amount; j++) {
        for (let k = 0; k < amount; k++) {
          matrix.setPosition(offset - i, offset - j, offset - k);
          meshes.current.setMatrixAt(index, matrix);
          meshes.current.setColorAt(index, white.current);
          index += 1;
        }
      }
    }

    scene.current.add(meshes.current);
  };

  const render = () => {
    if (threeRef.current) {
      renderer.current.render(scene.current, camera.current);
      raycaster.current.setFromCamera(mouse.current, camera.current);
      const intersection = raycaster.current.intersectObject(meshes.current);
      if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId;
        meshes.current.getColorAt(instanceId!, color.current);
        if (color.current.equals(white.current)) {
          meshes.current.setColorAt(
            instanceId!,
            color.current.setHex(Math.random() * 0xffffff)
          );
          if (meshes.current.instanceColor) {
            meshes.current.instanceColor.needsUpdate = true;
          }
        }
      }
      requestID.current = requestAnimationFrame(render);
    }
  };

  useEffect(() => {
    initRender();
    initCamera();
    initAxesHelper();
    initLight();
    initMeshes();
    render();
    buildGUI();
    const mouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const resize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", mouseMove);
    return () => {
      scene.current.clear();
      if (requestID.current) {
        cancelAnimationFrame(requestID.current);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", mouseMove);
      gui.current?.destroy();
    };
  }, []);

  return <div ref={threeRef}></div>;
}

export default App;
