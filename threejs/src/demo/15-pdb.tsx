import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import GUI from "lil-gui";
import { PDBLoader } from "three/examples/jsm/loaders/PDBLoader";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

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
  const controls = useRef<TrackballControls>();
  const requestID = useRef<number>();
  const light1 = useRef(new THREE.DirectionalLight(0xffffff, 0.8));
  const light2 = useRef(new THREE.DirectionalLight(0xffffff, 0.5));
  const meshes = useRef<THREE.Mesh[]>([]);
  const bonds = useRef<THREE.Mesh[]>([]);
  const css2DRenderer = useRef(new CSS2DRenderer());
  const labels = useRef<CSS2DObject[]>([]);

  const initScene = () => {};

  const initRender = () => {
    // renderer.current.setClearColor(new THREE.Color(0xeeeeee));
    renderer.current.setPixelRatio(window.devicePixelRatio);
    renderer.current.setSize(window.innerWidth, window.innerHeight);

    controls.current = new TrackballControls(
      camera.current,
      renderer.current.domElement
    );

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

    light1.current.position.set(1, 1, 1);
    scene.current.add(light1.current);

    light2.current.position.set(1, 1, 1);
    scene.current.add(light2.current);
  };

  const initMesh = () => {
    const loader = new PDBLoader();
    loader.load("src/models/pdb/caf2.pdb", (pdb) => {
      if (meshes.current.length > 0) {
        meshes.current.forEach((mesh) => {
          scene.current.remove(scene.current.getObjectById(mesh.id)!);
        });
        meshes.current = [];
      }
      if (bonds.current.length > 0) {
        bonds.current.forEach((bond) => {
          scene.current.remove(scene.current.getObjectById(bond.id)!);
        });
        bonds.current = [];
      }
      if (labels.current.length > 0) {
        labels.current.forEach((label) => {
          scene.current.remove(scene.current.getObjectById(label.id)!);
        });
        bonds.current = [];
      }
      // caffeine.pdb geometryAtoms: colors [24], positon [24] 原子模型颜色及位置
      // caffeine.pdb geometryBonds: positon [50]
      // json: atoms [24] 0-2: 位置，3: rgb，4: label

      const positions = pdb.geometryAtoms.getAttribute("position");
      const colors = pdb.geometryAtoms.getAttribute("color");

      const position = new THREE.Vector3();
      const color = new THREE.Color();

      for (let i = 0; i < positions.count; i++) {
        position.x = positions.getX(i);
        position.y = positions.getY(i);
        position.z = positions.getZ(i);

        color.r = colors.getX(i);
        color.g = colors.getY(i);
        color.b = colors.getZ(i);

        // mesh
        const geometry = new THREE.IcosahedronGeometry(0.25, 3);
        const material = new THREE.MeshPhongMaterial({
          color: color,
        });

        const object = new THREE.Mesh(geometry, material);
        object.position.copy(position);

        scene.current.add(object);

        meshes.current.push(object);
      }

      {
        const positions = pdb.geometryBonds.getAttribute("position");

        const start = new THREE.Vector3();
        const end = new THREE.Vector3();

        for (let i = 0; i < positions.count; i += 2) {
          start.x = positions.getX(i);
          start.y = positions.getY(i);
          start.z = positions.getZ(i);

          end.x = positions.getX(i + 1);
          end.y = positions.getY(i + 1);
          end.z = positions.getZ(i + 1);

          // mesh
          const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
          });

          const object = new THREE.Mesh(geometry, material);
          object.position.copy(start);
          object.position.lerp(end, 0.5);
          object.scale.z = start.distanceTo(end) * 10;
          object.lookAt(end);

          scene.current.add(object);

          bonds.current.push(object);
        }
      }

      {
        const json = pdb.json;

        for (let i = 0; i < json.atoms.length; i++) {
          const atom = json.atoms[i];
          const text = document.createElement("div");

          text.style.color = `rgb(${atom[3][0]}, ${atom[3][1]}, ${atom[3][2]})`;
          text.textContent = atom[4];

          position.x = atom[0];
          position.y = atom[1];
          position.z = atom[2];

          const label = new CSS2DObject(text);
          label.position.copy(position);
          scene.current.add(label);

          labels.current.push(label);
        }
      }
    });
  };

  const initCSS2DRenderer = () => {
    css2DRenderer.current.setSize(window.innerWidth, window.innerHeight);
    css2DRenderer.current.domElement.style.position = "absolute";
    css2DRenderer.current.domElement.style.top = "0px";
    css2DRenderer.current.domElement.style.pointerEvents = "none";

    document.body.appendChild(css2DRenderer.current.domElement);
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
    controls.current?.update();
    if (threeRef.current) {
      renderer.current.render(scene.current, camera.current);
      css2DRenderer.current.render(scene.current, camera.current);
    }
  };

  useEffect(() => {
    initScene();
    initRender();
    initCSS2DRenderer();
    initCamera();
    initHelper();
    initLight();
    initMesh();
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
      document.body.removeChild(css2DRenderer.current.domElement);
      window.removeEventListener("resize", resize);
      gui.current?.destroy();
    };
  }, []);

  return <div ref={threeRef}></div>;
}

export default App;
