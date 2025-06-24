
import Plot from 'react-plotly.js';


interface Plotly3DChartProps {
  x: string[];
  y: number[];
}

export default function Plotly3DChart({ x, y }: Plotly3DChartProps) {
  return (
    <div className="w-full">
      <Plot
        data={[
          {
            type: 'scatter3d',   // ✅ only one valid type
            mode: 'markers',
            x: x,
            y: y,
            z: y, // z gives the "height" for 3D effect
            marker: {
              size: 10,
              color: y,
              colorscale: 'Viridis',
            },
          },
        ]}
        layout={{
          title: '3D Scatter Chart',
          autosize: true,
          height: 400,
          scene: {
            xaxis: { title: 'X Axis' },
            yaxis: { title: 'Y Axis' },
            zaxis: { title: 'Z Axis (Value)' },
          },
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
