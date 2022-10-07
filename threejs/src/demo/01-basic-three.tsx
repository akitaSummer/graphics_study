import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);
  const scene = useRef(new THREE.Scene());
  const renderer = useRef(new THREE.WebGLRenderer());
  const camera = useRef(
    new THREE.PerspectiveCamera(
      75, // 竖直方向想能看到的嘴阀范围夹角的1/2
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  ); // 透视相机
  const cube = useRef<THREE.Mesh>();
  const AxesHelper = useRef(new THREE.AxesHelper(20));
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );
  const requestID = useRef<number>();

  const init = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(AxesHelper.current);

    // 几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // 材质
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    // 物体
    cube.current = new THREE.Mesh(geometry, material);

    scene.current.add(cube.current);

    camera.current.position.z = 5;
    camera.current.position.y = 5;
    camera.current.position.x = 5;

    camera.current.lookAt(scene.current.position);

    renderer.current.setClearColor(new THREE.Color(0xeeeeee));

    renderer.current.setSize(window.innerWidth, window.innerHeight);

    if (threeRef.current) {
      threeRef.current.appendChild(renderer.current.domElement);
    }
  };

  const render = () => {
    if (threeRef.current && cube.current) {
      renderer.current.render(scene.current, camera.current);
      // cube.current?.rotateY(0.01);
      cube.current.rotation.y += 0.01;
      requestID.current = requestAnimationFrame(render);
    }
  };

  useEffect(() => {
    init();
    render();
    return () => {
      scene.current.clear();
      if (requestID.current) {
        cancelAnimationFrame(requestID.current);
      }
    };
  }, []);

  return <div ref={threeRef}></div>;
}

export default App;
