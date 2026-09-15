import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as TextureLoader, D as WebGLRenderTarget, E as Vector3, S as SkinnedMesh, T as Uint16BufferAttribute, _ as PlaneGeometry, a as DirectionalLight, b as Scene, c as Group, d as Mesh, f as MeshBasicMaterial, g as PerspectiveCamera, h as OrthographicCamera, i as CylinderGeometry, l as HemisphereLight, m as NearestFilter, n as Bone, o as Float32BufferAttribute, p as MeshStandardMaterial, r as BufferGeometry, s as Fog, t as WebGLRenderer, u as Matrix4, v as Quaternion, w as TorusGeometry, x as Skeleton, y as SRGBColorSpace } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ring-canvas-Dt2gXv5m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function buildSkeleton(data) {
	const bones = [];
	for (const b of data.bones) {
		const bone = new Bone();
		bone.name = b.name;
		const m = new Matrix4().fromArray(b.matrix).transpose();
		const pos = new Vector3();
		const quat = new Quaternion();
		const scl = new Vector3();
		m.decompose(pos, quat, scl);
		bone.position.copy(pos);
		bone.quaternion.copy(quat);
		bone.scale.copy(scl);
		bones.push(bone);
	}
	for (let i = 0; i < data.bones.length; i++) {
		const p = data.bones[i].parent;
		if (p >= 0 && p < bones.length) bones[p].add(bones[i]);
	}
	const roots = data.bones.map((b, i) => b.parent < 0 ? i : -1).filter((i) => i >= 0);
	const root = new Group();
	root.name = "Armature";
	for (const i of roots) root.add(bones[i]);
	return {
		bones,
		root,
		skeleton: new Skeleton(bones)
	};
}
function sampleTrack(keys, time, n, fallback, fps) {
	if (!keys || keys.length === 0) return fallback;
	if (!(keys[0].length === n + 1)) return keys[Math.min(keys.length - 1, Math.max(0, Math.round(time * fps)))];
	if (time <= keys[0][0]) return keys[0].slice(1);
	if (time >= keys[keys.length - 1][0]) return keys[keys.length - 1].slice(1);
	for (let i = 0; i < keys.length - 1; i++) {
		const t0 = keys[i][0];
		const t1 = keys[i + 1][0];
		if (time >= t0 && time <= t1) {
			const u = t1 === t0 ? 0 : (time - t0) / (t1 - t0);
			const a = keys[i];
			const b = keys[i + 1];
			if (n === 4) {
				const q = new Quaternion(a[1], a[2], a[3], a[4]);
				const q2 = new Quaternion(b[1], b[2], b[3], b[4]);
				q.slerp(q2, u);
				return [
					q.x,
					q.y,
					q.z,
					q.w
				];
			}
			const out = [];
			for (let k = 1; k <= n; k++) out.push(a[k] * (1 - u) + b[k] * u);
			return out;
		}
	}
	return keys[keys.length - 1].slice(1);
}
function RingCanvas({ mesh, textureUrl, clip, psx, playing }) {
	const wrapRef = (0, import_react.useRef)(null);
	const clipRef = (0, import_react.useRef)(clip);
	const playingRef = (0, import_react.useRef)(playing);
	clipRef.current = clip;
	playingRef.current = playing;
	(0, import_react.useEffect)(() => {
		const el = wrapRef.current;
		if (!el) return;
		const renderer = new WebGLRenderer({
			antialias: !psx,
			alpha: false
		});
		renderer.setClearColor(657931, 1);
		renderer.outputColorSpace = SRGBColorSpace;
		el.appendChild(renderer.domElement);
		const scene = new Scene();
		scene.fog = new Fog(657931, 10, 24);
		const camera = new PerspectiveCamera(32, 1, .05, 40);
		scene.add(new HemisphereLight(14210252, 1841170, .9));
		const key = new DirectionalLight(16052712, 1.4);
		key.position.set(2.4, 5.2, 3.2);
		scene.add(key);
		const fill = new DirectionalLight(12107976, .5);
		fill.position.set(-2.6, 2.2, 1.4);
		scene.add(fill);
		const rim = new DirectionalLight(10134706, .55);
		rim.position.set(-3, 1.4, -2);
		scene.add(rim);
		const ringGeo = new CylinderGeometry(2.4, 2.4, .08, 16);
		const ringMat = new MeshStandardMaterial({
			color: 1842207,
			roughness: .92,
			metalness: .08
		});
		const ring = new Mesh(ringGeo, ringMat);
		ring.position.y = -.04;
		scene.add(ring);
		const apron = new Mesh(new TorusGeometry(2.42, .04, 6, 16), new MeshStandardMaterial({
			color: 2763312,
			roughness: .7
		}));
		apron.rotation.x = Math.PI / 2;
		apron.position.y = .02;
		scene.add(apron);
		const geo = new BufferGeometry();
		geo.setAttribute("position", new Float32BufferAttribute(mesh.positions, 3));
		geo.setAttribute("normal", new Float32BufferAttribute(mesh.normals, 3));
		geo.setAttribute("uv", new Float32BufferAttribute(mesh.uvs, 2));
		geo.setIndex(Array.from(mesh.indices));
		geo.setAttribute("skinIndex", new Uint16BufferAttribute(mesh.skinIndex, 4));
		geo.setAttribute("skinWeight", new Float32BufferAttribute(mesh.skinWeight, 4));
		geo.computeBoundingBox();
		const { bones, root, skeleton } = buildSkeleton(mesh);
		const restQuat = bones.map((b) => b.quaternion.clone());
		const restPos = bones.map((b) => b.position.clone());
		const tex = new TextureLoader().load(textureUrl);
		tex.colorSpace = SRGBColorSpace;
		tex.flipY = false;
		tex.magFilter = NearestFilter;
		tex.minFilter = NearestFilter;
		tex.generateMipmaps = false;
		const mat = new MeshStandardMaterial({
			map: tex,
			roughness: .72,
			metalness: .06
		});
		const skinned = new SkinnedMesh(geo, mat);
		skinned.add(root);
		skinned.bind(skeleton);
		skinned.frustumCulled = false;
		scene.add(skinned);
		let rt = null;
		const quadScene = new Scene();
		const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const quad = new Mesh(new PlaneGeometry(2, 2), new MeshBasicMaterial());
		quadScene.add(quad);
		const drag = {
			on: false,
			lx: 0,
			ly: 0,
			yaw: Math.PI + .28,
			pitch: .1
		};
		let cancelled = false;
		let last = performance.now();
		let elapsed = 0;
		let lastClip = clipRef.current;
		const onDown = (e) => {
			drag.on = true;
			drag.lx = e.clientX;
			drag.ly = e.clientY;
			el.setPointerCapture(e.pointerId);
		};
		const onMove = (e) => {
			if (!drag.on) return;
			drag.yaw += (e.clientX - drag.lx) * .005;
			drag.pitch = Math.max(-.2, Math.min(.55, drag.pitch + (e.clientY - drag.ly) * .004));
			drag.lx = e.clientX;
			drag.ly = e.clientY;
		};
		const onUp = () => {
			drag.on = false;
		};
		el.addEventListener("pointerdown", onDown);
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerup", onUp);
		const resize = () => {
			const w = el.clientWidth || 640;
			const h = el.clientHeight || 480;
			renderer.setSize(w, h, false);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			const dpr = psx ? 1 : Math.min(window.devicePixelRatio || 1, 2);
			renderer.setPixelRatio(psx ? 1 : dpr);
			if (psx) {
				rt?.dispose();
				rt = new WebGLRenderTarget(320, 240);
				rt.texture.magFilter = NearestFilter;
				rt.texture.minFilter = NearestFilter;
				quad.material.map = rt.texture;
			} else if (rt) {
				rt.dispose();
				rt = null;
			}
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(el);
		const boneIndex = new Map(bones.map((b, i) => [b.name, i]));
		const tick = (now) => {
			if (cancelled) return;
			const dt = Math.min((now - last) / 1e3, .1);
			last = now;
			elapsed += dt;
			if (!drag.on) drag.yaw += .12 * (playingRef.current ? 1 : .2) * dt;
			const dist = 3.35;
			camera.position.set(Math.sin(drag.yaw) * dist, 1.05 + drag.pitch * 1.4, Math.cos(drag.yaw) * dist);
			camera.lookAt(0, .88, 0);
			const active = clipRef.current;
			if (active !== lastClip) {
				elapsed = 0;
				lastClip = active;
			}
			if (active && playingRef.current && active.duration > 0) {
				const time = elapsed % active.duration;
				const fps = active.fps || 30;
				for (let i = 0; i < bones.length; i++) {
					bones[i].quaternion.copy(restQuat[i]);
					bones[i].position.copy(restPos[i]);
				}
				for (const [name, track] of Object.entries(active.tracks)) {
					const i = boneIndex.get(name);
					if (i == null) continue;
					const r = sampleTrack(track.r, time, 4, [
						0,
						0,
						0,
						1
					], fps);
					bones[i].quaternion.set(r[0], r[1], r[2], r[3]);
					if (track.t && track.t.length && name.toLowerCase().includes("hips")) {
						const p = sampleTrack(track.t, time, 3, [
							0,
							0,
							0
						], fps);
						bones[i].position.set(p[0], p[1], p[2]);
					}
				}
				skeleton.update();
			} else {
				for (let i = 0; i < bones.length; i++) {
					bones[i].quaternion.copy(restQuat[i]);
					bones[i].position.copy(restPos[i]);
				}
				skeleton.update();
			}
			if (psx && rt) {
				renderer.setRenderTarget(rt);
				renderer.render(scene, camera);
				renderer.setRenderTarget(null);
				renderer.render(quadScene, quadCam);
			} else renderer.render(scene, camera);
		};
		renderer.setAnimationLoop(tick);
		return () => {
			cancelled = true;
			renderer.setAnimationLoop(null);
			ro.disconnect();
			el.removeEventListener("pointerdown", onDown);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerup", onUp);
			geo.dispose();
			mat.dispose();
			tex.dispose();
			ringGeo.dispose();
			ringMat.dispose();
			rt?.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		};
	}, [
		mesh,
		textureUrl,
		psx
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: wrapRef,
		className: "absolute inset-0 touch-none"
	});
}
//#endregion
export { RingCanvas };
