import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
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
  // const ambientLight = useRef(new THREE.AmbientLight(0xffffff, 0.2));
  const gui = useRef<GUI>();
  // const controls = useRef(
  //   new OrbitControls(camera.current, renderer.current.domElement)
  // );
  const requestID = useRef<number>();

  const directionalLight = useRef(new THREE.DirectionalLight(0xffffff)); // 平行光, 太阳光
  const directionalLightHelper = useRef(
    new THREE.DirectionalLightHelper(directionalLight.current)
  );

  const hemiLight = useRef(new THREE.HemisphereLight(0xffffff, 0x444444)); // 平行光, 太阳光
  const hemiLightHelper = useRef(
    new THREE.HemisphereLightHelper(hemiLight.current, 5)
  );

  const mixer = useRef<THREE.AnimationMixer>();
  const actions = useRef<Record<string, THREE.AnimationAction>>({});
  const activeAction = useRef<THREE.AnimationAction>();
  const previousAction = useRef<THREE.AnimationAction>();
  const activeActionObject = useRef({
    state: "Walking",
  });
  const clock = useRef(new THREE.Clock());

  const initScene = () => {
    scene.current.background = new THREE.Color(0xe0e0e0);
    scene.current.fog = new THREE.Fog(0xe0e0e0, 20, 100);
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
    camera.current.position.z = 10;
    camera.current.position.y = 3;
    camera.current.position.x = -5;

    camera.current.lookAt(0, 2, 0);
  };

  const initHelper = () => {
    // x 红 y 绿 z 蓝
    scene.current.add(axesHelper.current);
    scene.current.add(directionalLightHelper.current);
    scene.current.add(hemiLightHelper.current);
  };

  const initLight = () => {
    directionalLight.current.position.set(0, 20, 10);
    scene.current.add(directionalLight.current);

    hemiLight.current.position.set(0, 20, 0);
    scene.current.add(hemiLight.current);
    // scene.current.add(ambientLight.current);
  };

  const initMesh = async () => {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({
        color: 0x999999,
      })
    );
    const grid = new THREE.GridHelper(100, 40, 0, 0);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.2;
    scene.current.add(grid);
    plane.rotation.x = -Math.PI / 2;
    scene.current.add(plane);

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(
      "src/models/gltf/RobotExpressive/RobotExpressive.glb"
    );
    const model = gltf.scene;
    scene.current.add(model);
    const clips = gltf.animations;
    mixer.current = new THREE.AnimationMixer(model);
    // activeAction.current = mixer.current.clipAction(clips[0]);
    // activeAction.current.play();

    const face = model.getObjectByName("Head_4") as THREE.Mesh;
    // 变形种类
    // face.morphTargetDictionary;
    // 变形值
    // face.morphTargetInfluences;

    buildGUI(model, clips, face);
  };

  const buildGUI = (
    model: THREE.Group,
    clips: THREE.AnimationClip[],
    face: THREE.Mesh
  ) => {
    gui.current = new GUI();
    // gui.current.close();
    const actionNames: string[] = [];

    const loopMany = ["Idle", "Walking", "Running", "Dance"];

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const action = mixer.current!.clipAction(clip);
      actions.current[clip.name] = action;

      actionNames.push(clip.name);

      if (!loopMany.includes(clip.name)) {
        // 停止在最终态
        action.clampWhenFinished = true;
        // 仅执行一次
        action.loop = THREE.LoopOnce;
      }

      // if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
      //   action.clampWhenFinished = true;
      //   action.loop = THREE.LoopOnce;
      // }
    }

    activeAction.current = actions.current["Walking"];

    actions.current["Walking"].play();

    const clipFolder = gui.current.addFolder("States");
    clipFolder
      .add(activeActionObject.current, "state")
      .options(actionNames)
      .onChange((val: number) => {
        const nextActionName = activeActionObject.current.state;
        fadeAction(nextActionName, 0.5);
      });

    const emotesFolder = gui.current.addFolder("Emotes");
    const states = [
      "Idle",
      "Walking",
      "Running",
      "Dance",
      "Death",
      "Sitting",
      "Standing",
    ];
    const emotes = ["Jump", "Yes", "No", "Wave", "Punch", "ThumbsUp"];
    const api: Record<string, () => void> = {};
    for (let i = 0; i < emotes.length; i++) {
      const name = emotes[i];
      api[name] = () => {
        fadeAction(name, 0.2);
        mixer.current?.addEventListener("finished", restoreState);
      };
      emotesFolder.add(api, name);
    }

    const morphFolder = gui.current.addFolder("Expressions");
    const morphNames = Object.keys(face.morphTargetDictionary!);

    for (let i = 0; i < morphNames.length; i++) {
      morphFolder
        // @ts-ignore
        .add(face.morphTargetInfluences!, i, 0, 1, 0.01)
        .name(morphNames[i]);
    }
  };

  const fadeAction = (name: string, duration: number) => {
    previousAction.current = activeAction.current;
    activeAction.current = actions.current[name];

    previousAction.current?.fadeOut(duration);

    activeAction.current.reset().fadeIn(duration).play();
  };

  const restoreState = () => {
    mixer.current?.removeEventListener("finished", restoreState);
    fadeAction(activeActionObject.current.state, 0.2);
  };

  const render = () => {
    if (threeRef.current) {
      renderer.current.render(scene.current, camera.current);
      const delta = clock.current.getDelta();

      if (mixer.current) {
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
    initMesh().then(() => {
      render();
    });
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
