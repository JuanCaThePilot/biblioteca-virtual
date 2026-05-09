import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function HologramScene() {
  const containerRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0.35, 5.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const geometry = new THREE.IcosahedronGeometry(1.24, 2)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x8d7dff,
      roughness: 0.18,
      metalness: 0.22,
      transmission: 0.35,
      thickness: 0.65,
      transparent: true,
      opacity: 0.8,
      emissive: 0x2d1b72,
      emissiveIntensity: 0.34
    })
    const mesh = new THREE.Mesh(geometry, material)
    group.add(mesh)

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x7de8ff, transparent: true, opacity: 0.26 })
    )
    group.add(wire)

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00d1ff, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    const rings = [1.65, 2.05, 2.45].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 0.008, 96), ringMaterial.clone())
      ring.rotation.x = Math.PI / 2 + index * 0.24
      ring.rotation.z = index * 0.7
      group.add(ring)
      return ring
    })

    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const key = new THREE.PointLight(0x7c5cff, 18, 9)
    key.position.set(-2, 2.8, 3)
    scene.add(key)
    const rim = new THREE.PointLight(0x00d1ff, 14, 8)
    rim.position.set(2.4, -1.4, 2.8)
    scene.add(rim)

    let frame = 0
    let raf = 0
    const clock = new THREE.Clock()

    function resize() {
      const width = container.clientWidth || 420
      const height = container.clientHeight || 420
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    function animate() {
      const elapsed = clock.getElapsedTime()
      frame += 1
      mesh.rotation.x = elapsed * 0.18
      mesh.rotation.y = elapsed * 0.32
      wire.rotation.copy(mesh.rotation)
      rings.forEach((ring, index) => {
        ring.rotation.z += 0.0025 * (index + 1)
        ring.position.y = Math.sin(elapsed * 1.2 + index) * 0.025
      })
      group.position.y = Math.sin(elapsed * 1.15) * 0.09
      renderer.render(scene, camera)
      if (!reduced || frame % 4 === 0) raf = requestAnimationFrame(animate)
      else raf = requestAnimationFrame(animate)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      geometry.dispose()
      material.dispose()
      wire.geometry.dispose()
      wire.material.dispose()
      rings.forEach((ring) => {
        ring.geometry.dispose()
        ring.material.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reduced])

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
}
