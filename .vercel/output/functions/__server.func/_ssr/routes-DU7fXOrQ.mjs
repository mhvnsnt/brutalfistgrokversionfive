import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Pause, n as RotateCcw, r as Play } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DU7fXOrQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Badge({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border border-border bg-elevated px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted", className),
		...props
	});
}
function Button({ className, variant = "primary", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn("inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] px-4 text-sm font-medium tracking-wide transition-opacity duration-[var(--motion-quick,150ms)] disabled:opacity-40", variant === "primary" && "bg-accent text-accent-fg", variant === "ghost" && "bg-transparent text-fg hover:bg-elevated", variant === "outline" && "border border-border bg-surface text-fg", className),
		...props
	});
}
function stripComments(src) {
	return src.replace(/\/\/[^\n]*/g, "");
}
function readMatrix(block) {
	const nums = block.match(/-?\d+\.\d+(?:[eE][+-]?\d+)?|-?\d+/g);
	if (!nums || nums.length < 16) return [
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	];
	return nums.slice(0, 16).map(Number);
}
function extractBalanced(src, openIdx) {
	let depth = 0;
	for (let i = openIdx; i < src.length; i++) {
		const ch = src[i];
		if (ch === "{") depth++;
		else if (ch === "}") {
			depth--;
			if (depth === 0) return {
				inner: src.slice(openIdx + 1, i),
				end: i + 1
			};
		}
	}
	throw new Error("Unbalanced brace in .x file");
}
function parseFrames(src) {
	const bones = [];
	const walk = (block, parent) => {
		let i = 0;
		while (i < block.length) {
			const slice = block.slice(i);
			const match = /Frame\s+([A-Za-z0-9_]+)\s*\{/.exec(slice);
			if (!match || match.index == null) return;
			const abs = i + match.index;
			const { inner, end } = extractBalanced(block, block.indexOf("{", abs));
			const name = match[1];
			if (name !== "Root") {
				const mtxMatch = inner.match(/FrameTransformMatrix\s*\{([^}]*)\}/);
				const matrix = mtxMatch ? readMatrix(mtxMatch[1]) : [
					1,
					0,
					0,
					0,
					0,
					1,
					0,
					0,
					0,
					0,
					1,
					0,
					0,
					0,
					0,
					1
				];
				const idx = bones.length;
				bones.push({
					name,
					parent,
					matrix
				});
				walk(inner, idx);
			} else walk(inner, parent);
			i = end;
		}
	};
	walk(src, -1);
	return bones;
}
function parseMeshBlock(meshInner, boneIndex) {
	const textureName = meshInner.match(/TextureFilename\s*\{\s*"([^"]+)"/)?.[1] ?? "bannon.png";
	const header = meshInner.match(/^\s*(\d+);/);
	if (!header) throw new Error("Mesh missing vertex count");
	const vertexCount = Number(header[1]);
	const vertSection = meshInner.slice(header.index + header[0].length);
	const faceCountMatch = vertSection.match(/(\d+);(?=\s*3;)/);
	if (!faceCountMatch) throw new Error("Mesh missing face count");
	const triangleCount = Number(faceCountMatch[1]);
	const vertNums = vertSection.slice(0, faceCountMatch.index).match(/-?\d+\.\d+(?:[eE][+-]?\d+)?|-?\d+/g);
	if (!vertNums || vertNums.length < vertexCount * 3) throw new Error("Vertex list truncated");
	const positions = new Float32Array(vertexCount * 3);
	for (let i = 0; i < vertexCount * 3; i++) positions[i] = Number(vertNums[i]);
	const faceNums = vertSection.slice(faceCountMatch.index + faceCountMatch[0].length).match(/\d+/g);
	if (!faceNums) throw new Error("Face list truncated");
	const indices = new Uint32Array(triangleCount * 3);
	let fi = 0;
	let cursor = 0;
	while (fi < triangleCount && cursor < faceNums.length) {
		const n = Number(faceNums[cursor++]);
		for (let k = 0; k < n; k++) indices[fi * 3 + k] = Number(faceNums[cursor++]);
		fi++;
	}
	const normals = new Float32Array(vertexCount * 3);
	const nrmStart = meshInner.search(/MeshNormals\s*\{/);
	if (nrmStart >= 0) {
		const { inner } = extractBalanced(meshInner, meshInner.indexOf("{", nrmStart));
		const nCount = inner.match(/^\s*(\d+);/);
		const nNums = (nCount ? inner.slice(nCount.index + nCount[0].length) : inner).match(/-?\d+\.\d+(?:[eE][+-]?\d+)?|-?\d+/g) ?? [];
		for (let i = 0; i < Math.min(vertexCount * 3, nNums.length); i++) normals[i] = Number(nNums[i]);
	}
	const uvs = new Float32Array(vertexCount * 2);
	const uvStart = meshInner.search(/MeshTextureCoords\s*\{/);
	if (uvStart >= 0) {
		const { inner } = extractBalanced(meshInner, meshInner.indexOf("{", uvStart));
		const uCount = inner.match(/^\s*(\d+);/);
		const uNums = (uCount ? inner.slice(uCount.index + uCount[0].length) : inner).match(/-?\d+\.\d+(?:[eE][+-]?\d+)?|-?\d+/g) ?? [];
		for (let i = 0; i < Math.min(vertexCount * 2, uNums.length); i++) uvs[i] = Number(uNums[i]);
	}
	const skinIndex = new Uint16Array(vertexCount * 4);
	const skinWeight = new Float32Array(vertexCount * 4);
	const filled = new Uint8Array(vertexCount);
	let searchFrom = 0;
	while (true) {
		const found = meshInner.indexOf("SkinWeights", searchFrom);
		if (found < 0) break;
		const brace = meshInner.indexOf("{", found);
		if (brace < 0) break;
		const { inner, end } = extractBalanced(meshInner, brace);
		searchFrom = end;
		const nameMatch = inner.match(/"([^"]+)"/);
		if (!nameMatch) continue;
		const bi = boneIndex.get(nameMatch[1]);
		if (bi == null) continue;
		const nMatch = inner.match(/;\s*(\d+);/);
		const n = nMatch ? Number(nMatch[1]) : 0;
		if (n <= 0) continue;
		const afterCount = inner.slice(inner.indexOf(nMatch[0]) + nMatch[0].length);
		const ints = afterCount.match(/-?\d+/g) ?? [];
		const floats = afterCount.match(/-?\d+\.\d+(?:[eE][+-]?\d+)?/g) ?? [];
		const idxs = ints.slice(0, n).map(Number);
		const ws = floats.slice(0, n).map(Number);
		for (let i = 0; i < n; i++) {
			const vi = idxs[i];
			if (vi < 0 || vi >= vertexCount) continue;
			const slot = filled[vi];
			if (slot < 4) {
				skinIndex[vi * 4 + slot] = bi;
				skinWeight[vi * 4 + slot] = ws[i] ?? 0;
				filled[vi] = slot + 1;
			}
		}
	}
	for (let i = 0; i < vertexCount; i++) {
		const b = i * 4;
		const sum = skinWeight[b] + skinWeight[b + 1] + skinWeight[b + 2] + skinWeight[b + 3];
		if (sum > 1e-8) {
			skinWeight[b] /= sum;
			skinWeight[b + 1] /= sum;
			skinWeight[b + 2] /= sum;
			skinWeight[b + 3] /= sum;
		} else skinWeight[b] = 1;
	}
	return {
		positions,
		normals,
		uvs,
		indices,
		skinIndex,
		skinWeight,
		textureName,
		vertexCount,
		triangleCount
	};
}
function parseDirectXText(source) {
	if (!source.startsWith("xof ")) throw new Error("Not a DirectX .x file");
	const text = stripComments(source);
	const meshMatch = text.match(/Mesh\s*\{/);
	if (!meshMatch || meshMatch.index == null) throw new Error("No Mesh block in .x");
	const { inner } = extractBalanced(text, text.indexOf("{", meshMatch.index));
	const bones = parseFrames(text.slice(0, meshMatch.index));
	return {
		...parseMeshBlock(inner, new Map(bones.map((b, i) => [b.name, i]))),
		bones
	};
}
function xMeshToPreview(mesh, sourceX) {
	return {
		vertexCount: mesh.vertexCount,
		triangleCount: mesh.triangleCount,
		positions: mesh.positions,
		normals: mesh.normals,
		uvs: mesh.uvs,
		indices: mesh.indices,
		skinIndex: mesh.skinIndex,
		skinWeight: mesh.skinWeight,
		bones: mesh.bones,
		texture: mesh.textureName,
		sourceX,
		parsedFromEngineX: true,
		headerBones: mesh.bones.length
	};
}
var CATS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "locomotion",
		label: "Loco"
	},
	{
		id: "strike",
		label: "Strikes"
	},
	{
		id: "reaction",
		label: "Hits"
	},
	{
		id: "grapple",
		label: "Grapple"
	},
	{
		id: "defense",
		label: "Defense"
	},
	{
		id: "knockdown",
		label: "Down"
	}
];
var FIGHT_KEYS = {
	KeyA: "Combo Punch",
	Digit1: "Combo Punch",
	KeyS: "Drop Kick",
	Digit2: "Drop Kick",
	KeyK: "Hurricane Kick",
	Digit3: "Hurricane Kick",
	KeyG: "Esquiva 4",
	KeyT: "Capoeira",
	KeyI: "idle",
	KeyW: "walkFast",
	KeyR: "running"
};
var ONESHOT = /* @__PURE__ */ new Set([
	"strike",
	"reaction",
	"grapple",
	"defense",
	"getup",
	"knockdown",
	"taunt"
]);
function Home() {
	const [status, setStatus] = (0, import_react.useState)(null);
	const [mesh, setMesh] = (0, import_react.useState)(null);
	const [clip, setClip] = (0, import_react.useState)(null);
	const [clipId, setClipId] = (0, import_react.useState)("idle");
	const [cat, setCat] = (0, import_react.useState)("all");
	const [psx, setPsx] = (0, import_react.useState)(true);
	const [playing, setPlaying] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [parsedLive, setParsedLive] = (0, import_react.useState)(false);
	const [Canvas, setCanvas] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		import("./ring-canvas-Dt2gXv5m.mjs").then((mod) => {
			setCanvas(() => mod.RingCanvas);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		Promise.all([fetch("/native/chara_bannon/status.json").then((r) => {
			if (!r.ok) throw new Error("status.json missing");
			return r.json();
		}), fetch("/native/chara_bannon/BF_bannon.x").then(async (r) => {
			if (!r.ok) throw new Error("BF_bannon.x missing");
			return r.text();
		})]).then(([s, xText]) => {
			if (cancelled) return;
			setStatus(s);
			const parsed = parseDirectXText(xText);
			setMesh(xMeshToPreview(parsed, "Mesh1/BF_bannon.x"));
			setParsedLive(true);
		}).catch(async (err) => {
			if (cancelled) return;
			try {
				const [s, m] = await Promise.all([fetch("/native/chara_bannon/status.json").then((r) => r.json()), fetch("/native/chara_bannon/engine-mesh.json").then((r) => r.json())]);
				setStatus(s);
				setMesh(m);
				setParsedLive(Boolean(m.parsedFromEngineX));
			} catch {
				setError(err instanceof Error ? err.message : "Failed to load engine .x");
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const row = status?.clips.find((c) => c.clip === clipId);
		const slug = clipId.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
		const path = row?.viewer ?? `clips/${slug}.json`;
		let cancelled = false;
		fetch(`/native/chara_bannon/${path}`).then((r) => {
			if (!r.ok) throw new Error(`clip ${clipId} missing`);
			return r.json();
		}).then((data) => {
			if (!cancelled) setClip(data);
		}).catch(() => {
			if (!cancelled) setClip(null);
		});
		return () => {
			cancelled = true;
		};
	}, [clipId, status]);
	(0, import_react.useEffect)(() => {
		if (!clip || !playing) return;
		const row = status?.clips.find((c) => c.clip === clipId);
		if (!row || !ONESHOT.has(row.cat ?? "") || clipId === "idle") return;
		const t = window.setTimeout(() => setClipId("idle"), Math.max(400, clip.duration * 1e3));
		return () => window.clearTimeout(t);
	}, [
		clip,
		clipId,
		playing,
		status
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
			const target = FIGHT_KEYS[e.code];
			if (!target) return;
			e.preventDefault();
			setClipId(target);
			setPlaying(true);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const mocap = status?.mocap;
	const clipRows = (0, import_react.useMemo)(() => {
		const rows = status?.clips ?? [];
		if (cat === "all") return rows;
		return rows.filter((r) => r.cat === cat);
	}, [status, cat]);
	const fight = (0, import_react.useMemo)(() => [
		{
			id: "idle",
			label: "Idle"
		},
		{
			id: "walkFast",
			label: "Walk"
		},
		{
			id: "running",
			label: "Run"
		},
		{
			id: "Combo Punch",
			label: "Jab · A"
		},
		{
			id: "Drop Kick",
			label: "Heavy · S"
		},
		{
			id: "Hurricane Kick",
			label: "Kick · K"
		},
		{
			id: "Esquiva 4",
			label: "Block · G"
		},
		{
			id: "Capoeira",
			label: "Taunt · T"
		}
	], []);
	const stats = (0, import_react.useMemo)(() => {
		if (!status) return [];
		return [
			["Source GLB", "BANNON_rigged.glb"],
			[".x mesh", status.mesh.file],
			["Triangles", status.mesh.triangles.toLocaleString()],
			["Vertices", status.mesh.vertices.toLocaleString()],
			["Bones", String(status.mesh.bones)],
			["Outfit scale", status.mesh.scale.toFixed(2)],
			["FBX exported", `${mocap?.exported ?? 0} / ${mocap?.listed ?? 0}`],
			["Mixamo / J-rig", `${mocap?.mixamo ?? 0} / ${mocap?.J_rig ?? 0}`]
		];
	}, [status, mocap]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-dvh overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				children: mesh && Canvas ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
					mesh,
					textureUrl: "/native/chara_bannon/bannon.png",
					clip,
					psx,
					playing
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-full items-center justify-center px-6 text-center text-muted",
					children: error ?? "Loading BF_bannon.x from the Schwarzerblitz media slot"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 md:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto max-w-sm rounded-[var(--radius-md)] border border-border bg-bg/80 px-4 py-3 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xs uppercase tracking-[0.28em] text-muted",
							children: "Brutal Fist"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-semibold uppercase leading-none tracking-wide",
							children: "Bannon"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: "Canonical BANNON_rigged.glb converted to DirectX .x and installed as roster 0 in the Schwarzerblitz character slot. This viewer parses that same mesh."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto hidden flex-col items-end gap-2 sm:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "REAL_GLB_ONLY" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "chara_bannon · roster 0" }),
						parsedLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "live parse of BF_bannon.x" }) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "pointer-events-none absolute bottom-40 left-4 z-10 hidden max-w-xs lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto rounded-[var(--radius-md)] border border-border bg-bg/80 p-4 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xs uppercase tracking-[0.22em] text-muted",
							children: "Native pipeline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1.5 text-sm",
							children: stats.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: k
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-fg",
									children: v
								})]
							}, k))
						}),
						status?.bound?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 border-t border-border pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.18em] text-subtle",
								children: "Engine binds"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1 text-sm",
								children: status.bound.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-muted hover:text-fg",
										onClick: () => setClipId(b.clip),
										children: b.engine
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-fg",
										children: b.clip
									})]
								}, b.engine))
							})]
						}) : null,
						status?.engine?.win32Note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 border-t border-border pt-3 text-xs leading-relaxed text-subtle",
							children: status.engine.win32Note
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 md:p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto rounded-[var(--radius-md)] border border-border bg-bg/85 p-3 backdrop-blur-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "primary",
									onClick: () => setPlaying((p) => !p),
									"aria-label": playing ? "Pause clip" : "Play clip",
									children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2",
										children: playing ? "Pause" : "Play"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setPsx((p) => !p),
									children: psx ? "PSX 320×240" : "Full res"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									onClick: () => {
										setClipId("idle");
										setPlaying(true);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2",
										children: "Idle"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-auto hidden max-w-[40%] truncate text-xs uppercase tracking-[0.16em] text-subtle sm:inline",
									children: [
										clipId,
										" · ",
										clip?.source ?? clip?.cat ?? "rest pose"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 flex gap-2 overflow-x-auto pb-1",
							children: fight.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setClipId(f.id);
									setPlaying(true);
								},
								className: "min-h-11 shrink-0 rounded-[var(--radius-sm)] border px-3 text-sm " + (clipId === f.id ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-fg"),
								children: f.label
							}, f.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 flex gap-2 overflow-x-auto pb-1",
							children: CATS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCat(c.id),
								className: "min-h-11 shrink-0 rounded-full border px-3 text-sm " + (cat === c.id ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-muted"),
								children: c.label
							}, c.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2 overflow-x-auto pb-1",
							children: clipRows.map((row) => {
								const active = row.clip === clipId;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 shrink-0 rounded-[var(--radius-sm)] border px-3 text-sm " + (active ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-fg"),
									onClick: () => setClipId(row.clip),
									children: row.clip
								}, row.clip);
							})
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Home as component };
