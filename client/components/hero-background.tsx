"use client";

import { useEffect, useRef, useState } from "react";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// One glass ribbon: tube-shaded strip with a soft halo.
// o = origin, a = angle, w0 = half-width, sharp: 1 = crisp glass, 0 = soft-focus
vec3 ribbon(vec2 p, float t, vec2 o, float a, float w0,
            float amp, float freq, float ph, float sharp, vec3 tint) {
  float c = cos(a), s = sin(a);
  vec2 d0 = p - o;
  vec2 q = vec2(c * d0.x + s * d0.y, -s * d0.x + c * d0.y);

  float off = amp * (sin(q.x * freq + ph + t * 0.22)
                   + 0.5 * sin(q.x * freq * 2.1 - ph * 1.3 - t * 0.15));
  float w = w0 * (0.8 + 0.3 * sin(q.x * 1.7 + ph * 2.0 + t * 0.18));

  float d = (q.y - off) / w;
  float ad = abs(d);

  // brightness varies along the ribbon (dark -> bright -> dark)
  float env = 0.15 + 0.85 * pow(0.5 + 0.5 * sin(q.x * 1.1 + ph + t * 0.12), 1.6);

  // tube normal
  float h = sqrt(max(1.0 - ad * ad, 0.0));
  vec3 n = normalize(vec3(0.0, d, h + 0.001));
  vec3 L1 = normalize(vec3(-0.35, 0.65, 0.65));
  vec3 L2 = normalize(vec3(0.30, -0.70, 0.50));
  vec3 V = vec3(0.0, 0.0, 1.0);

  float diff = max(dot(n, L1), 0.0);
  float spec1 = pow(max(dot(reflect(-L1, n), V), 0.0), 24.0);
  float spec2 = pow(max(dot(reflect(-L2, n), V), 0.0), 30.0);
  float fres = pow(1.0 - h, 2.5);

  float stripe = 0.5 + 0.5 * sin(d * 3.0 + q.x * 0.9 + ph + t * 0.2);
  vec3 glass = mix(tint * 0.25, vec3(0.75, 0.88, 1.0), stripe * diff);

  vec3 body = glass * (0.35 + 0.9 * diff)
            + vec3(0.8, 0.9, 1.0) * (spec1 * 1.2 + spec2 * 0.7) * sharp
            + tint * fres * 1.4;

  float soft = mix(0.9, 0.05, sharp);
  float mask = 1.0 - smoothstep(1.0 - soft, 1.0, ad);

  vec3 halo = tint * exp(-ad * ad * 0.7) * 0.25 * env;
  return halo + body * env * mask;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = gl_FragCoord.xy / uRes.y; // y: 0 bottom -> 1 top
  float t = uTime;

  vec3 col = vec3(0.0);

  // ambient blue glow, top-left
  vec2 g1 = p - vec2(0.18 * aspect, 0.85);
  col += vec3(0.05, 0.18, 0.55) * exp(-dot(g1, g1) * 4.0) * 0.9;

  // top-right ribbon
  col += ribbon(p, t, vec2(aspect * 0.90, 0.90), -0.62, 0.07,
                0.05, 2.0, 0.5, 1.0, vec3(0.23, 0.51, 0.96));

  // left sweeping ribbon
  col += ribbon(p, t, vec2(aspect * 0.10, 0.52), -0.33, 0.055,
                0.04, 2.4, 2.0, 0.9, vec3(0.40, 0.65, 1.0));

  // big soft-focus ribbon (the blurred white glow in the middle)
  col += 0.7 * ribbon(p, t, vec2(aspect * 0.62, 0.36), -0.28, 0.20,
                      0.05, 1.4, 4.0, 0.08, vec3(0.75, 0.87, 1.0));

  // tone map, then dither to avoid banding in the dark gradients
  col = 1.0 - exp(-col * 1.25);
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFallback(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      setFallback(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      setFallback(true);
      return;
    }
    gl.useProgram(prog);

    // one oversized triangle covers the whole canvas
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // render below native resolution: cheaper, and the upscale suits the soft look
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const scale = 0.75;
      const w = Math.max(2, Math.floor(canvas.clientWidth * dpr * scale));
      const h = Math.max(2, Math.floor(canvas.clientHeight * dpr * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = (t: number) => {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let visible = true;
    const start = performance.now();

    const loop = () => {
      if (visible && !document.hidden) {
        draw(10 + (performance.now() - start) / 1000);
      }
      raf = requestAnimationFrame(loop);
    };

    if (reduceMotion) {
      draw(12); // single static frame
    } else {
      raf = requestAnimationFrame(loop);
    }

    // stop rendering once the hero scrolls out of view
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      if (reduceMotion) draw(12);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

    return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
    >
      {/* static fallback if WebGL is unavailable */}
      {fallback && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 50% 40% at 18% 12%, rgba(37,99,235,0.45), transparent), radial-gradient(ellipse 60% 25% at 60% 45%, rgba(207,228,255,0.25), transparent), radial-gradient(ellipse 40% 30% at 85% 15%, rgba(59,130,246,0.35), transparent)",
          }}
        />
      )}

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* readability: uniform dim + edge vignette */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}