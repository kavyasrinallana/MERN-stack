// chart-component.tsx

type ChartComponentProps = {
  chartData: any; // Replace any with actual data type later
};

const ChartComponent = ({ chartData }: ChartComponentProps) => {
  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center animate-fadeIn">No data available</div>
      </div>
    );
  }

  return (
    <div>
      {/* Render your chart using chartData here */}
      <pre>{JSON.stringify(chartData, null, 2)}</pre>
    </div>
  );
};

export default ChartComponent;
"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Environment, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"

interface Chart3DProps {
  data: any[]
  chartType: string
  xAxis: string
  yAxis: string
}

function Bar3D({
  position,
  height,
  color,
  label,
}: { position: [number, number, number]; height: number; color: string; label: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.3}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>
    </group>
  )
}

function Sphere3D({
  position,
  size,
  color,
  label,
}: { position: [number, number, number]; size: number; color: string; label: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group>
      <mesh ref={meshRef} position={position} castShadow receiveShadow>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.3} />
      </mesh>
      <Text
        position={[position[0], position[1] - size - 0.5, position[2]]}
        fontSize={0.25}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

function Line3D({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const lineRef = useRef<THREE.Line>(null)

  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [points])

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} linewidth={5} />
    </line>
  )
}

function Chart3DScene({ data, chartType, xAxis, yAxis }: Chart3DProps) {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316"]

  const processedData = useMemo(() => {
    if (!data || !xAxis || !yAxis) return []

    const maxValue = Math.max(...data.map((item) => Math.abs(item[yAxis])))
    const scaleFactor = 3 / maxValue

    return data.map((item, index) => ({
      label: String(item[xAxis]),
      value: item[yAxis],
      scaledValue: item[yAxis] * scaleFactor,
      color: colors[index % colors.length],
      position: [(index - data.length / 2) * 2, 0, 0] as [number, number, number],
    }))
  }, [data, xAxis, yAxis])

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return processedData.map((item, index) => (
          <Bar3D
            key={index}
            position={[item.position[0], 0, item.position[2]]}
            height={Math.abs(item.scaledValue)}
            color={item.color}
            label={item.label}
          />
        ))

      case "scatter":
        return processedData.map((item, index) => (
          <Sphere3D
            key={index}
            position={[item.position[0], item.scaledValue, item.position[2]]}
            size={0.3}
            color={item.color}
            label={item.label}
          />
        ))

      case "line":
        const points = processedData.map(
          (item) => new THREE.Vector3(item.position[0], item.scaledValue, item.position[2]),
        )
        return (
          <>
            <Line3D points={points} color={colors[0]} />
            {processedData.map((item, index) => (
              <Sphere3D
                key={index}
                position={[item.position[0], item.scaledValue, item.position[2]]}
                size={0.15}
                color={item.color}
                label={item.label}
              />
            ))}
          </>
        )

      default:
        return processedData.map((item, index) => (
          <Bar3D
            key={index}
            position={[item.position[0], 0, item.position[2]]}
            height={Math.abs(item.scaledValue)}
            color={item.color}
            label={item.label}
          />
        ))
    }
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 6, 8]} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      <Environment preset="studio" />

      <gridHelper args={[20, 20, "#e5e7eb", "#f3f4f6"]} />

      <group>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 10]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <Text position={[6, 0, 0]} fontSize={0.4} color="#374151">
          {xAxis}
        </Text>

        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 6]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <Text position={[0, 4, 0]} fontSize={0.4} color="#374151">
          {yAxis}
        </Text>

        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 10]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      </group>

      {renderChart()}

      <Text
        position={[0, 5, 0]}
        fontSize={0.6}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.ttf"
      >
        {`3D ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
      </Text>
    </>
  )
}

export function Chart3D({ data, chartType, xAxis, yAxis }: Chart3DProps) {
  if (!data || !xAxis || !yAxis) {
    return (
      <div className="flex items-center justify-center h-full text-purple-600 bg-gradient-to-br from-gray-50 to-purple-100 rounded-xl shadow-inner">
        <p className="text-xl font-medium animate-pulse">📊 Please select columns to generate 3D chart!</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 rounded-xl shadow-xl overflow-hidden border border-blue-200 animate-fadeIn">
      <Canvas shadows>
        <Chart3DScene data={data} chartType={chartType} xAxis={xAxis} yAxis={yAxis} />
      </Canvas>
    </div>
  )
}