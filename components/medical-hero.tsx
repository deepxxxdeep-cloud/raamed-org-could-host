'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Html, OrbitControls, RoundedBox } from '@react-three/drei'
import { useRef } from 'react'
import type { Group } from 'three'

function MonitorModel() {
  const group = useRef<Group>(null)
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.12 })
  return <group ref={group}><Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.25}><RoundedBox args={[3.8, 2.5, .35]} radius={.22} smoothness={4} position={[0, .2, 0]}><meshStandardMaterial color="#f8fbfc" metalness={.2} roughness={.25} /></RoundedBox><RoundedBox args={[3.05, 1.7, .08]} radius={.12} smoothness={3} position={[0, .25, .22]}><meshStandardMaterial color="#12395a" metalness={.1} roughness={.3} /></RoundedBox><mesh position={[0, .25, .28]}><planeGeometry args={[2.75, 1.45]} /><meshStandardMaterial color="#d9f2ef" emissive="#0c6670" emissiveIntensity={.28} /></mesh><mesh position={[-.85, .48, .31]}><planeGeometry args={[1.25, .04]} /><meshStandardMaterial color="#f36f2b" /></mesh><mesh position={[-.7, .05, .31]}><planeGeometry args={[1.55, .035]} /><meshStandardMaterial color="#49a878" /></mesh><RoundedBox args={[.5, .35, .45]} radius={.08} smoothness={3} position={[1.25, -.15, .22]}><meshStandardMaterial color="#f36f2b" metalness={.15} roughness={.3} /></RoundedBox></Float></group>
}

import { useLanguage } from '@/lib/language-context'

export function MedicalHero() {
  const { t } = useLanguage()
  return (
    <div className="relative h-[430px] w-full overflow-hidden rounded-[2rem] bg-[#102a43] shadow-2xl shadow-[#102a43]/15">
      <Canvas camera={{ position: [0, .2, 7], fov: 34 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#102a43']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[4, 5, 5]} intensity={3} color="#ffffff" />
        <pointLight position={[-4, 1, 2]} intensity={18} color="#f36f2b" />
        <Environment preset="studio" />
        <MonitorModel />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={1.25} maxPolarAngle={1.8} />
      </Canvas>
      <div className="pointer-events-none absolute left-6 top-6 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-orange-200 backdrop-blur">
        {t('clinicalTechTag')}
      </div>
      <div className="pointer-events-none absolute bottom-6 left-6 max-w-[230px] text-white">
        <p className="text-2xl font-semibold tracking-tight">{t('precisionCare')}</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{t('exploreClearerStandard')}</p>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-6 hidden rounded-2xl border border-white/20 bg-white/10 p-3 text-right backdrop-blur sm:block">
        <p className="font-mono text-xs text-orange-200">{t('thrMonitor')}</p>
        <p className="mt-1 text-xs text-white">{t('liveReadyInterface')}</p>
      </div>
    </div>
  )
}
