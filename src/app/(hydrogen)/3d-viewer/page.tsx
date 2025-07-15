'use client';

import * as THREE from 'three';
import { useEffect, useRef, useState, useCallback } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// IMPORTANT: Define the dimensions of your fixed UI elements here.
const SIDEBAR_WIDTH = '250px'; // Width of your sidebar menu
const TOPBAR_HEIGHT = '60px';  // Height of your top bar/navbar

// Constants for spacing and sizing
const VIEWER_RIGHT_OFFSET = '30px'; // Additional space from the right edge of the content area
const OVERALL_CONTAINER_MARGIN = '40px'; // Margin around the entire viewer component (the "card")

export default function Page() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentModelRef = useRef<THREE.Object3D | null>(null); // Ref for single jaw
  const currentUpperModelRef = useRef<THREE.Object3D | null>(null); // Ref for upper model in combined view
  const currentLowerModelRef = useRef<THREE.Object3D | null>(null); // Ref for lower model in combined view

  const [selectedJaw, setSelectedJaw] = useState<string>('lower'); // Renamed for clarity: selects specific jaw
  const [viewMode, setViewMode] = useState<string>('single'); // New state: 'single', 'combined', or 'open-combined'

  // --- TWEAKABLE OFFSETS FOR COMBINED VIEW ---
  // Adjust these values to bring the jaws closer/further
  const COMBINED_VIEW_VERTICAL_OFFSET = 0.15; // Vertical separation
  const COMBINED_VIEW_FORWARD_OFFSET = 0;    // Z-axis adjustment (front-to-back)
  const COMBINED_VIEW_HORIZONTAL_OFFSET = 0; // Horizontal (X-axis) adjustment

  // NEW: Constants for "Open Mouth" Combined View
  // Angle to open the mouth (in radians). Math.PI / 180 is 1 degree.
  const OPEN_MOUTH_ANGLE_DEGREES = 15; // Start with 15 degrees, adjust as needed
  const OPEN_MOUTH_ROTATION_ANGLE = THREE.MathUtils.degToRad(OPEN_MOUTH_ANGLE_DEGREES);

  // Pivot point for the upper jaw rotation relative to the *combined center* of the models.
  // This is a critical value that depends heavily on your specific models.
  // You'll likely need to fine-tune this with trial and error using console.log.
  // For example, if your combined jaws are centered at (0,0,0), and the hinge is at the back,
  // the pivot might be (0, 0.5, -1) if molars are at Y=0.5, Z=-1.
  const PIVOT_POINT_X = 0;
  const PIVOT_POINT_Y = 0; // Relative to the combined center of the jaws
  const PIVOT_POINT_Z = -1; // Adjust this: negative Z means towards the back of the mouth
  // ------------------------------------------------

  // Function to load and add models to scene
  const loadModels = useCallback((mode: string, jaw: string, scene: THREE.Scene, controls: OrbitControls, camera: THREE.PerspectiveCamera) => {
    const loader = new OBJLoader();

    // --- Cleanup existing models ---
    const cleanupModel = (modelRef: React.MutableRefObject<THREE.Object3D | null>) => {
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (Array.isArray(object.material)) {
              object.material.forEach(materialItem => materialItem.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
            object.geometry.dispose();
          }
        });
        modelRef.current = null;
      }
    };

    cleanupModel(currentModelRef);
    cleanupModel(currentUpperModelRef);
    cleanupModel(currentLowerModelRef);

    // --- Load models based on mode ---
    const loadSingleModel = (modelPath: string, ref: React.MutableRefObject<THREE.Object3D | null>, initialLoad = false) => {
      loader.load(
        modelPath,
        (obj) => {
          const box = new THREE.Box3().setFromObject(obj);
          const center = box.getCenter(new THREE.Vector3());
          obj.position.sub(center); // Center model at origin

          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const desiredSize = 2;
          obj.scale.setScalar(desiredSize / maxDim);

          obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xd4d4d4),
                metalness: 0.1,
                roughness: 0.3,
                clearcoat: 0.5,
                clearcoatRoughness: 0.2,
                envMapIntensity: 1.0
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          scene.add(obj);
          ref.current = obj; // Store in the specific ref

          if (initialLoad) { // Only update camera/controls for the primary model or initial load
            controls.target.copy(obj.position);
            camera.lookAt(obj.position);
            controls.update();
          }
        },
        undefined,
        (error) => {
          console.error(`Error loading ${modelPath} model:`, error);
        }
      );
    };

    if (mode === 'single') {
      const modelPath = jaw === 'lower' ? '/models/Pred_Lower_Mesh_Tag=1.obj' : '/models/Pred_Upper_Mesh_Tag=1.obj';
      loadSingleModel(modelPath, currentModelRef, true);
    } else if (mode === 'combined' || mode === 'open-combined') {
      const upperPath = '/models/Pred_Upper_Mesh_Tag=1.obj';
      const lowerPath = '/models/Pred_Lower_Mesh_Tag=1.obj';

      let lowerLoaded = false;
      let upperLoaded = false;
      let lowerObjGlobal: THREE.Object3D | null = null;
      let upperObjGlobal: THREE.Object3D | null = null;

      const checkAndFinalizeCombined = () => {
        if (lowerLoaded && upperLoaded && lowerObjGlobal && upperObjGlobal) {
          // --- Positioning for both combined modes ---
          // Use the offsets for vertical, forward, horizontal
          lowerObjGlobal.position.y = -COMBINED_VIEW_VERTICAL_OFFSET;
          lowerObjGlobal.position.z = COMBINED_VIEW_FORWARD_OFFSET;
          lowerObjGlobal.position.x = -COMBINED_VIEW_HORIZONTAL_OFFSET;

          upperObjGlobal.position.y = COMBINED_VIEW_VERTICAL_OFFSET;
          upperObjGlobal.position.z = -COMBINED_VIEW_FORWARD_OFFSET;
          upperObjGlobal.position.x = COMBINED_VIEW_HORIZONTAL_OFFSET;

          // --- NEW: Apply rotation for 'open-combined' mode ---
          if (mode === 'open-combined') {
            // 1. Move upper jaw to pivot point
            upperObjGlobal.position.sub(new THREE.Vector3(PIVOT_POINT_X, PIVOT_POINT_Y, PIVOT_POINT_Z));
            // 2. Apply rotation around the X-axis (for opening mouth downwards)
            upperObjGlobal.rotation.x = -OPEN_MOUTH_ROTATION_ANGLE; // Negative for downward rotation
            // 3. Move upper jaw back from pivot point
            upperObjGlobal.position.add(new THREE.Vector3(PIVOT_POINT_X, PIVOT_POINT_Y, PIVOT_POINT_Z));
          }

          scene.add(lowerObjGlobal);
          scene.add(upperObjGlobal);
          currentLowerModelRef.current = lowerObjGlobal;
          currentUpperModelRef.current = upperObjGlobal;

          console.log("Lower Jaw Position (final):", lowerObjGlobal.position);
          console.log("Upper Jaw Position (final):", upperObjGlobal.position);

          // --- Adjust camera and controls for combined view ---
          const combinedBox = new THREE.Box3().setFromObject(lowerObjGlobal);
          combinedBox.union(new THREE.Box3().setFromObject(upperObjGlobal));

          const combinedCenter = combinedBox.getCenter(new THREE.Vector3());
          const combinedSize = combinedBox.getSize(new THREE.Vector3());
          const maxCombinedDim = Math.max(combinedSize.x, combinedSize.y, combinedSize.z);

          controls.target.copy(combinedCenter);

          const fov = camera.fov * (Math.PI / 180);
          const distance = Math.abs(maxCombinedDim / 2 / Math.tan(fov / 2)) * 1.5;
          camera.position.set(combinedCenter.x, combinedCenter.y, distance + combinedCenter.z); // Adjust camera Z based on combined center
          camera.lookAt(combinedCenter);
          controls.update();
        }
      };

      // Load lower jaw
      loader.load(lowerPath, (lowerObj) => {
        const lowerBox = new THREE.Box3().setFromObject(lowerObj);
        const lowerCenter = lowerBox.getCenter(new THREE.Vector3());
        lowerObj.position.sub(lowerCenter);

        const maxLowerDim = Math.max(lowerBox.getSize(new THREE.Vector3()).x, lowerBox.getSize(new THREE.Vector3()).y, lowerBox.getSize(new THREE.Vector3()).z);
        lowerObj.scale.setScalar(2 / maxLowerDim); // Scale to desired size (e.g., 2 units)

        lowerObj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xd4d4d4),
              metalness: 0.1, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.0
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        lowerObjGlobal = lowerObj;
        lowerLoaded = true;
        checkAndFinalizeCombined();
      }, undefined, (error) => {
        console.error(`Error loading ${lowerPath} model:`, error);
      });

      // Load upper jaw
      loader.load(upperPath, (upperObj) => {
        const upperBox = new THREE.Box3().setFromObject(upperObj);
        const upperCenter = upperBox.getCenter(new THREE.Vector3());
        upperObj.position.sub(upperCenter);

        const maxUpperDim = Math.max(upperBox.getSize(new THREE.Vector3()).x, upperBox.getSize(new THREE.Vector3()).y, upperBox.getSize(new THREE.Vector3()).z);
        upperObj.scale.setScalar(2 / maxUpperDim); // Scale to desired size (e.g., 2 units)

        upperObj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xd4d4d4),
              metalness: 0.1, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.0
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        upperObjGlobal = upperObj;
        upperLoaded = true;
        checkAndFinalizeCombined();
      }, undefined, (error) => {
        console.error(`Error loading ${upperPath} model:`, error);
      });
    }

  }, [COMBINED_VIEW_VERTICAL_OFFSET, COMBINED_VIEW_FORWARD_OFFSET, COMBINED_VIEW_HORIZONTAL_OFFSET, OPEN_MOUTH_ROTATION_ANGLE, PIVOT_POINT_X, PIVOT_POINT_Y, PIVOT_POINT_Z]); // ADDED new constants to dependencies

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    const backgroundColor1 = new THREE.Color(0x1a1a1a);
    const backgroundColor2 = new THREE.Color(0x3a3a3a);
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, backgroundColor1.getStyle());
    gradient.addColorStop(1, backgroundColor2.getStyle());
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    scene.background = new THREE.CanvasTexture(canvas);

    // CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.5;
    controls.maxDistance = 50;

    // LIGHTING
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // GROUND PLANE
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.1 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    scene.add(plane);

    // ENVIRONMENT MAP
    new RGBELoader()
      .setPath('/environments/')
      .load('venice_sunset_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
      }, undefined, (error) => {
        console.warn('Error loading HDR environment map:', error);
      });

    // Initial model load based on selectedJaw and viewMode states
    loadModels(viewMode, selectedJaw, scene, controls, camera);

    const onWindowResize = () => {
      if (containerRef.current) {
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
      controls.dispose();
      // Dispose all potential models during cleanup
      const disposeAllModels = (modelRef: React.MutableRefObject<THREE.Object3D | null>) => {
        if (modelRef.current) {
          scene.remove(modelRef.current);
          modelRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              if (Array.isArray(object.material)) {
                object.material.forEach(materialItem => materialItem.dispose());
              } else if (object.material) {
                object.material.dispose();
              }
              object.geometry.dispose();
            }
          });
          modelRef.current = null;
        }
      };
      disposeAllModels(currentModelRef);
      disposeAllModels(currentUpperModelRef);
      disposeAllModels(currentLowerModelRef);

      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [loadModels, selectedJaw, viewMode]);

  const handleJawChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJaw(event.target.value);
    setViewMode('single'); // When selecting a specific jaw, switch to single view mode
  };

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMode(event.target.value);
  };


  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: `calc(100vh - ${TOPBAR_HEIGHT} - ${OVERALL_CONTAINER_MARGIN} * 2)`,
      width: `calc(100vw - ${SIDEBAR_WIDTH} - ${OVERALL_CONTAINER_MARGIN} * 2 - ${VIEWER_RIGHT_OFFSET})`,
      marginLeft: `calc(${SIDEBAR_WIDTH} + ${OVERALL_CONTAINER_MARGIN})`,
      marginTop: `calc(${TOPBAR_HEIGHT} + ${OVERALL_CONTAINER_MARGIN})`,
      background: '#151515',
      borderRadius: '20px',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7)',
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
    }}>
      {/* Header with TWO Dropdowns */}
      <div
        style={{
          padding: '10px 20px',
          background: '#222',
          color: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          flexShrink: 0,
          width: `calc(100% - 40px)`,
          margin: '0 20px 0 20px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5em', fontWeight: 300 }}>3D Model Viewer</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* View Mode Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor="view-mode-select" style={{ marginRight: '10px' }}>View Mode:</label>
            <select
              id="view-mode-select"
              value={viewMode}
              onChange={handleViewModeChange}
              style={{
                padding: '8px 12px', borderRadius: '5px', border: '1px solid #555', background: '#333',
                color: '#eee', cursor: 'pointer', outline: 'none', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23ccc' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px',
              }}
            >
              <option value="single">Single Jaw</option>
              <option value="combined">Combined Jaws (Closed)</option> {/* Updated label */}
              <option value="open-combined">Combined Jaws (Open)</option> {/* New option */}
            </select>
          </div>

          {/* Single Jaw Select Dropdown (conditionally rendered) */}
          {viewMode === 'single' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="jaw-select" style={{ marginRight: '10px' }}>Select Jaw:</label>
              <select
                id="jaw-select"
                value={selectedJaw}
                onChange={handleJawChange}
                style={{
                  padding: '8px 12px', borderRadius: '5px', border: '1px solid #555', background: '#333',
                  color: '#eee', cursor: 'pointer', outline: 'none', appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23ccc' class='bi bi-chevron-down' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px',
                }}
              >
                <option value="lower">Lower Jaw</option>
                <option value="upper">Upper Jaw</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3D Viewer Container */}
      <div
        ref={containerRef}
        style={{
          flexGrow: 1,
          overflow: 'hidden',
          margin: '20px', // Uniform 20px margin around the viewer within the card
          background: '#333', // Fallback background for the viewer area
        }}
      />
    </div>
  );
}