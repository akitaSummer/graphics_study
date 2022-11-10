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
      60, // 竖直方向想能看到的最大范围夹角的1/2
      window.innerWidth / window.innerHeight,
      0.01,
      100
    )
  ); // 透视相机
  const axesHelper = useRef(new THREE.AxesHelper(10));
  const ambientLight = useRef(new THREE.AmbientLight(0xffffff, 0.2));
  const gui = useRef<GUI>();
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();
  const [count] = useState(500);
  // const [spheres, setSpheres] = useState<
  //   THREE.Mesh<THREE.SphereGeometry, THREE.Material>[]
  // >([]);
  const spheres = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.Material>[]>(
    []
  );

  const textureCube = useRef(
    new THREE.CubeTextureLoader().load([
      "src/textures/cube/pisa/px.png",
      "src/textures/cube/pisa/nx.png",
      "src/textures/cube/pisa/py.png",
      "src/textures/cube/pisa/ny.png",
      "src/textures/cube/pisa/pz.png",
      "src/textures/cube/pisa/nz.png",
    ])
  );

  const initScene = () => {
    // const urls = [
    //   "src/textures/cube/pisa/px.png",
    //   "src/textures/cube/pisa/py.png",
    //   "src/textures/cube/pisa/pz.png",
    //   "src/textures/cube/pisa/nx.png",
    //   "src/textures/cube/pisa/ny.png",
    //   "src/textures/cube/pisa/nz.png",
    // ];

    scene.current.background = textureCube.current;
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
  };

  const initLight = () => {
    scene.current.add(ambientLight.current);
  };

  const initMesh = () => {
    const geometry = new THREE.SphereGeometry(0.1, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      envMap: textureCube.current,
    });
    spheres.current = [];
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.random() * 10 - 5;
      mesh.position.y = Math.random() * 10 - 5;
      mesh.position.z = Math.random() * 10 - 5;

      if (i === 2) {
        console.log(mesh);
      }
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

      scene.current.add(mesh);

      spheres.current.push(mesh);
    }
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
    if (threeRef.current) {
      const timer = 0.0001 * Date.now();
      for (let i = 0; i < count; i++) {
        const s = spheres.current[i];
        if (i === 2) {
          console.log(spheres.current.length, s);
        }
        if (s) {
          s.position.x = 5 * Math.cos(timer + i);
          s.position.y = 5 * Math.sin(timer + i * 1.1);
        }
      }

      renderer.current.render(scene.current, camera.current);
    }
  };

  useEffect(() => {
    initScene();
    initRender();
    initCamera();
    initHelper();
    initLight();
    initMesh();
    render();
    buildGUI();
    console.log("initMesh");
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
