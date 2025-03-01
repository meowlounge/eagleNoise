'use client';

import { useEffect } from 'react';
import * as THREE from 'three';
import type { NoiseSettings } from '@/types/noise';

interface NoiseCanvasProps {
	settings: NoiseSettings;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	sceneRef: React.RefObject<THREE.Scene | null>;
	rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
	cameraRef: React.RefObject<THREE.Camera | null>;
	materialRef: React.RefObject<THREE.ShaderMaterial | null>;
}

export default function NoiseCanvas({
	settings,
	canvasRef,
	sceneRef,
	rendererRef,
	cameraRef,
	materialRef,
}: NoiseCanvasProps) {
	useEffect(() => {
		if (!canvasRef.current) return;

		while (canvasRef.current.firstChild) {
			canvasRef.current.removeChild(canvasRef.current.firstChild);
		}

		const scene = new THREE.Scene();
		sceneRef.current = scene;
    
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		cameraRef.current = camera;

		const renderer = new THREE.WebGLRenderer({
			antialias: false,
			canvas: canvasRef.current!,
		});
		renderer.setSize(settings.width, settings.height);
		rendererRef.current = renderer;

		const noiseLibrary = `
      // Common utility functions
      vec4 permute(vec4 x) {
        return mod(((x*34.0)+1.0)*x, 289.0);
      }
      
      vec3 permute(vec3 x) { 
        return mod(((x*34.0)+1.0)*x, 289.0); 
      }
      
      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      
      vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
      }
      
      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      // Perlin noise implementation
      float cnoise(vec3 P) {
        vec3 Pi0 = floor(P); // Integer part for indexing
        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
        Pi0 = mod(Pi0, 289.0);
        Pi1 = mod(Pi1, 289.0);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 / 7.0;
        vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 / 7.0;
        vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
      }
      
      // Simplex noise implementation
      float snoise(vec3 v) { 
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        //  x0 = x0 - 0. + 0.0 * C 
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1. + 3.0 * C.xxx;

        // Permutations
        i = mod(i, 289.0); 
        vec4 p = permute(permute(permute( 
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        // Gradients
        float n_ = 1.0/7.0; // N=7
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), 
                          dot(p2,x2), dot(p3,x3)));
      }
      
      // Worley noise implementation
      float worley(vec3 p) {
        float minDist = 1.0;
        vec3 scaledP = p * 5.0;
        
        // Integer part (cell coordinates)
        vec3 pi = floor(scaledP);
        
        // Loop over neighboring cells
        for (float i = -1.0; i <= 1.0; i++) {
          for (float j = -1.0; j <= 1.0; j++) {
            for (float k = -1.0; k <= 1.0; k++) {
              vec3 cellPosition = pi + vec3(i, j, k);
              
              // Get a random point within the cell
              vec3 featurePoint = cellPosition + vec3(
                rand(cellPosition.xy + cellPosition.z),
                rand(cellPosition.yz + cellPosition.x),
                rand(cellPosition.zx + cellPosition.y)
              );
              
              // Distance to the feature point
              float dist = length(scaledP - featurePoint);
              minDist = min(minDist, dist);
            }
          }
        }
        
        return minDist;
      }
      
      // Value noise implementation
      float valueNoise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        
        // Smoothing
        vec3 u = f * f * (3.0 - 2.0 * f);
        
        // Get random values at corners of cube
        float a = rand(i.xy + i.z);
        float b = rand(i.xy + vec2(1.0, 0.0) + i.z);
        float c = rand(i.xy + vec2(0.0, 1.0) + i.z);
        float d = rand(i.xy + vec2(1.0, 1.0) + i.z);
        float e = rand(i.xy + i.z + 1.0);
        float f1 = rand(i.xy + vec2(1.0, 0.0) + i.z + 1.0);
        float g = rand(i.xy + vec2(0.0, 1.0) + i.z + 1.0);
        float h = rand(i.xy + vec2(1.0, 1.0) + i.z + 1.0);
        
        // Trilinear interpolation
        return mix(
          mix(
            mix(a, b, u.x),
            mix(c, d, u.x),
            u.y
          ),
          mix(
            mix(e, f1, u.x),
            mix(g, h, u.x),
            u.y
          ),
          u.z
        );
      }
    `;

		const colorsArray = settings.colors.map((color) => {
			const r = parseInt(color.slice(1, 3), 16) / 255;
			const g = parseInt(color.slice(3, 5), 16) / 255;
			const b = parseInt(color.slice(5, 7), 16) / 255;
			return new THREE.Vector3(r, g, b);
		});

		const colorUniforms: { [key: string]: { value: THREE.Vector3 } } = {};

		colorsArray.forEach((color, index) => {
			colorUniforms[`color${index}`] = { value: color };
		});

		const material = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
				noiseScale: { value: settings.noiseScale },
				noiseOpacity: { value: settings.noiseOpacity },
				colorCount: { value: colorsArray.length },
				noiseType: {
					value:
						settings.noiseType === 'perlin'
							? 0
							: settings.noiseType === 'simplex'
							? 1
							: settings.noiseType === 'worley'
							? 2
							: 3,
				},
				...colorUniforms,
			},
			vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
			fragmentShader: `
        uniform float time;
        uniform float noiseScale;
        uniform float noiseOpacity;
        uniform int colorCount;
        uniform int noiseType;
        
        ${Array(5)
			.fill(0)
			.map((_, i) => `uniform vec3 color${i};`)
			.join('\n')}
        
        varying vec2 vUv;
        
        ${noiseLibrary}
        
        vec3 blendColors(float t) {
          t = clamp(t, 0.0, 1.0);
          float step = 1.0 / float(colorCount - 1);
          
          for (int i = 0; i < 4; i++) {
            if (i >= colorCount - 1) break;
            
            float lowerBound = float(i) * step;
            float upperBound = float(i + 1) * step;
            
            if (t >= lowerBound && t <= upperBound) {
              float localT = (t - lowerBound) / step;
              
              vec3 colorA, colorB;
              
              if (i == 0) colorA = color0;
              else if (i == 1) colorA = color1;
              else if (i == 2) colorA = color2;
              else if (i == 3) colorA = color3;
              
              if (i + 1 == 1) colorB = color1;
              else if (i + 1 == 2) colorB = color2;
              else if (i + 1 == 3) colorB = color3;
              else if (i + 1 == 4) colorB = color4;
              
              return mix(colorA, colorB, localT);
            }
          }
          
          return color0;
        }
        
        void main() {
          float noiseValue;
          
          if (noiseType == 0) {
            noiseValue = cnoise(vec3(vUv * noiseScale * 5.0, time * 0.1)) * 0.5 + 0.5;
          } else if (noiseType == 1) {
            noiseValue = snoise(vec3(vUv * noiseScale * 5.0, time * 0.1)) * 0.5 + 0.5;
          } else if (noiseType == 2) {
            noiseValue = 1.0 - worley(vec3(vUv * noiseScale, time * 0.1));
          } else {
            noiseValue = valueNoise(vec3(vUv * noiseScale * 10.0, time * 0.1));
          }
          
          vec3 baseColor = blendColors(noiseValue);
          float staticNoise = rand(vUv * 1.0) * noiseOpacity;
          vec3 finalColor = baseColor + vec3(staticNoise);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
		});

		materialRef.current = material;

		const geometry = new THREE.PlaneGeometry(2, 2);
		const plane = new THREE.Mesh(geometry, material);
		scene.add(plane);

		let animationFrame: number;
		const startTime = Date.now();

		const animate = () => {
			const time =
				(Date.now() - startTime) * 0.001 * settings.animationSpeed;

			if (material && material.uniforms.time) {
				material.uniforms.time.value = time;
			}

			renderer.render(scene, camera);
			animationFrame = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
			if (renderer) {
				renderer.dispose();
			}
			if (geometry) {
				geometry.dispose();
			}
			if (material) {
				material.dispose();
			}
		};
	}, [cameraRef, canvasRef, materialRef, rendererRef, sceneRef, settings]);

	useEffect(() => {
		if (materialRef.current) {
			materialRef.current.uniforms.noiseScale.value = settings.noiseScale;
			materialRef.current.uniforms.noiseOpacity.value =
				settings.noiseOpacity;
			materialRef.current.uniforms.noiseType.value =
				settings.noiseType === 'perlin'
					? 0
					: settings.noiseType === 'simplex'
					? 1
					: settings.noiseType === 'worley'
					? 2
					: 3;

			settings.colors.forEach((color, index) => {
				const r = parseInt(color.slice(1, 3), 16) / 255;
				const g = parseInt(color.slice(3, 5), 16) / 255;
				const b = parseInt(color.slice(5, 7), 16) / 255;
				materialRef.current!.uniforms[`color${index}`].value =
					new THREE.Vector3(r, g, b);
			});

			materialRef.current.uniforms.colorCount.value =
				settings.colors.length;
		}

		if (rendererRef.current) {
			rendererRef.current.setSize(settings.width, settings.height);
		}
	}, [materialRef, rendererRef, settings]);

	return <canvas ref={canvasRef} className='w-full h-full' />;
}
