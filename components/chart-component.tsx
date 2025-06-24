"use client"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useMemo, useState } from "react"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"

import {
  Bar,
  Line,
  Pie,
  Scatter,
  Radar,
  Doughnut,
  PolarArea,
  Bubble,
} from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface ChartComponentProps {
  data: any[]
  chartType: string
  xAxis: string
  yAxis: string
}

export function ChartComponent({ data, chartType, xAxis, yAxis }: ChartComponentProps) {
  const [chartStyle, setChartStyle] = useState<"2d" | "3d">("2d")

  // Generate chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !xAxis || !yAxis) return null

    const labels = data.map((item) => item[xAxis])
    const datasetValues = data.map((item) => item[yAxis])

    return {
      labels,
      datasets: [
        {
          label: `${yAxis} vs ${xAxis}`,
          data: datasetValues,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          fill: chartStyle === "3d", // optional use for styling
        },
      ],
    }
  }, [data, xAxis, yAxis, chartStyle])

  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: `${chartType.toUpperCase()} Chart`,
      },
    },
    scales: chartType === "pie" || chartType === "doughnut" || chartType === "polarArea"
      ? {}
      : {
          x: {
            title: {
              display: true,
              text: xAxis,
            },
          },
          y: {
            title: {
              display: true,
              text: yAxis,
            },
            beginAtZero: true,
          },
        },
  }

  const handleDownloadPDF = () => {
    const chartElement = document.getElementById("chart-to-download")
    if (!chartElement) return

    html2canvas(chartElement, { backgroundColor: "#ffffff" }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save("chart.pdf")
    })
  }

  const renderChart = () => {
    if (!chartData) return null

    const chartProps = { data: chartData, options }

    switch (chartType) {
      case "bar": return <Bar {...chartProps} />
      case "line": return <Line {...chartProps} />
      case "pie": return <Pie {...chartProps} />
      case "scatter": return <Scatter {...chartProps} />
      case "radar": return <Radar {...chartProps} />
      case "doughnut": return <Doughnut {...chartProps} />
      case "polarArea": return <PolarArea {...chartProps} />
      case "bubble": return <Bubble {...chartProps} />
      default: return <Bar {...chartProps} />
    }
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center animate-fadeIn">
          <p className="text-lg mb-2">⚠️ No valid numerical data found</p>
          <p className="text-sm mb-4">
            Please ensure your Excel file has valid Y-axis values
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto mt-6">
      {/* Chart Style Dropdown */}
      <div className="mb-6 text-center">
        <label className="mr-2 text-gray-700 font-semibold text-lg">Chart Style:</label>
        <select
          value={chartStyle}
          onChange={(e) => setChartStyle(e.target.value as "2d" | "3d")}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <option value="2d">2D</option>
          <option value="3d">3D</option>
        </select>
      </div>

      {/* Chart Display */}
      <div
        id="chart-to-download"
        className="bg-white p-6 rounded-xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 dark:bg-slate-900 dark:text-white transition duration-500"
        style={{ height: "400px" }}
      >
        {renderChart()}
      </div>

      {/* Download Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleDownloadPDF}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:scale-105 hover:shadow-xl transition duration-300"
        >
          📥 Download Chart as PDF
        </button>
      </div>
    </div>
  )
}
