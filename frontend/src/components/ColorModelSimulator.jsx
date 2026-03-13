import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function hsvToRgb(h, s, v) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp01(s / 100);
  const val = clamp01(v / 100);
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) [r1, g1, b1] = [c, x, 0];
  else if (hue < 120) [r1, g1, b1] = [x, c, 0];
  else if (hue < 180) [r1, g1, b1] = [0, c, x];
  else if (hue < 240) [r1, g1, b1] = [0, x, c];
  else if (hue < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function hslToRgb(h, s, l) {
  const color = new THREE.Color();
  color.setHSL((((h % 360) + 360) % 360) / 360, clamp01(s / 100), clamp01(l / 100));
  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255),
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0'))
    .join('')}`;
}

function ColorMarker({ position }) {
  return (
    <mesh position={position} renderOrder={999}>
      <torusGeometry args={[0.05, 0.015, 16, 32]} />
      <meshBasicMaterial color="black" depthTest={false} depthWrite={false} />
    </mesh>
  );
}

function RGBCube({ rgb }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
    const position = geo.attributes.position;
    const colors = [];

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i) + 0.5;
      const y = position.getY(i) + 0.5;
      const z = position.getZ(i) + 0.5;
      colors.push(x, y, z);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  const pos = [rgb.r / 255 - 0.5, rgb.g / 255 - 0.5, rgb.b / 255 - 0.5];
  return (
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial vertexColors />
      </mesh>
      <ColorMarker position={pos} />
    </>
  );
}

function HSVModel({ hsv }) {
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 128, 64, true);
    const pos = geo.attributes.position;
    const colors = [];

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const angle = Math.atan2(z, x);
      const hue = (angle + Math.PI) / (2 * Math.PI);
      const value = clamp01(y + 0.5);
      const color = new THREE.Color();
      color.setHSL(hue, 1, 0.5 * value + 0.1);
      colors.push(color.r, color.g, color.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  const radius = (hsv.s / 100) * 0.5;
  const angle = (hsv.h * Math.PI) / 180;
  const y = hsv.v / 100 - 0.5;
  const pos = [radius * Math.cos(angle), y, radius * Math.sin(angle)];
  return (
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
      </mesh>
      <ColorMarker position={pos} />
    </>
  );
}

function HSLModel({ hsl }) {
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 128, 64, true);
    const pos = geo.attributes.position;
    const colors = [];

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const angle = Math.atan2(z, x);
      const hue = (angle + Math.PI) / (2 * Math.PI);
      const sat = clamp01(Math.sqrt(x * x + z * z) / 0.5);
      const light = clamp01(y + 0.5);
      const color = new THREE.Color();
      color.setHSL(hue, sat, light);
      colors.push(color.r, color.g, color.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  const radius = (hsl.s / 100) * 0.5;
  const angle = (hsl.h * Math.PI) / 180;
  const y = hsl.l / 100 - 0.5;
  const pos = [radius * Math.cos(angle), y, radius * Math.sin(angle)];
  return (
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
      </mesh>
      <ColorMarker position={pos} />
    </>
  );
}

function channelLabel(key) {
  if (key === 'r') return 'R';
  if (key === 'g') return 'G';
  if (key === 'b') return 'B';
  if (key === 'h') return 'Hue';
  if (key === 's') return 'Saturation';
  if (key === 'v') return 'Value';
  if (key === 'l') return 'Lightness';
  return key;
}

export default function ColorModelSimulator() {
  const [mode, setMode] = useState('RGB');
  const [rgb, setRGB] = useState({ r: 120, g: 120, b: 120 });
  const [hsv, setHSV] = useState({ h: 180, s: 50, v: 50 });
  const [hsl, setHSL] = useState({ h: 180, s: 50, l: 50 });
  const [copyState, setCopyState] = useState('');

  const activeRGB = useMemo(() => {
    if (mode === 'RGB') return rgb;
    if (mode === 'HSV') return hsvToRgb(hsv.h, hsv.s, hsv.v);
    return hslToRgb(hsl.h, hsl.s, hsl.l);
  }, [mode, rgb, hsv, hsl]);

  const hex = rgbToHex(activeRGB.r, activeRGB.g, activeRGB.b);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopyState('Copied');
    } catch {
      setCopyState('Copy failed');
    }
  };

  const activeControls = mode === 'RGB'
    ? [
        { key: 'r', min: 0, max: 255, value: rgb.r, onChange: (val) => setRGB((prev) => ({ ...prev, r: val })) },
        { key: 'g', min: 0, max: 255, value: rgb.g, onChange: (val) => setRGB((prev) => ({ ...prev, g: val })) },
        { key: 'b', min: 0, max: 255, value: rgb.b, onChange: (val) => setRGB((prev) => ({ ...prev, b: val })) },
      ]
    : mode === 'HSV'
      ? [
          { key: 'h', min: 0, max: 360, value: hsv.h, onChange: (val) => setHSV((prev) => ({ ...prev, h: val })) },
          { key: 's', min: 0, max: 100, value: hsv.s, onChange: (val) => setHSV((prev) => ({ ...prev, s: val })) },
          { key: 'v', min: 0, max: 100, value: hsv.v, onChange: (val) => setHSV((prev) => ({ ...prev, v: val })) },
        ]
      : [
          { key: 'h', min: 0, max: 360, value: hsl.h, onChange: (val) => setHSL((prev) => ({ ...prev, h: val })) },
          { key: 's', min: 0, max: 100, value: hsl.s, onChange: (val) => setHSL((prev) => ({ ...prev, s: val })) },
          { key: 'l', min: 0, max: 100, value: hsl.l, onChange: (val) => setHSL((prev) => ({ ...prev, l: val })) },
        ];

  return (
    <section className="module-block color-model-simulator">
      <div className="lab-header">
        <h3>Color Model Simulator (RGB, HSV, HSL)</h3>
        <p>Rotate the 3D model, adjust channels, and copy the resulting HEX color for design or processing tasks.</p>
      </div>

      <div className="color-sim-layout">
        <div className="color-canvas-wrap">
          <Canvas camera={{ position: [2, 2, 2], fov: 55 }}>
            <ambientLight intensity={1} />
            <OrbitControls enablePan={false} />
            {mode === 'RGB' && <RGBCube rgb={rgb} />}
            {mode === 'HSV' && <HSVModel hsv={hsv} />}
            {mode === 'HSL' && <HSLModel hsl={hsl} />}
          </Canvas>
        </div>

        <div className="color-controls">
          <label className="param-input">
            Color Model
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setCopyState('');
              }}
            >
              <option value="RGB">RGB</option>
              <option value="HSV">HSV</option>
              <option value="HSL">HSL</option>
            </select>
          </label>

          {activeControls.map((control) => (
            <label className="param-input" key={control.key}>
              {channelLabel(control.key)}: {control.value}
              <input
                type="range"
                min={control.min}
                max={control.max}
                value={control.value}
                onChange={(e) => {
                  control.onChange(Number(e.target.value));
                  setCopyState('');
                }}
              />
            </label>
          ))}

          <div className="color-readout">
            <div className="color-preview" style={{ background: hex }} />
            <p>RGB: {activeRGB.r}, {activeRGB.g}, {activeRGB.b}</p>
            <p>HEX: {hex}</p>
            <button className="primary-btn" type="button" onClick={handleCopy}>
              {copyState === 'Copied' ? 'Copied' : 'Copy HEX'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
