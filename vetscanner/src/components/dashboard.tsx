"use client"

import { useState, useEffect } from "react"

import { ScanLine, Activity, Gauge, Grid3x3, type LucideIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Bar, BarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import {
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

import { Page, PageHeader } from "@/components/layout/page"

export const description = "A linear area chart"

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

type ResultProps = {
  tumor_detected: boolean
  diagnosis: string | null
  tumor_tile_count: number
  message: string
}

type DataProps = {
  id: number
  patient_id: number
  patient: string
  result: ResultProps
  confidence_score: number | null
  pdf_report: string | null
  created_at?: string
}

const diagnosisChartConfig = {
  count: {
    label: "Cases",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const timelineChartConfig = {
  scans: {
    label: "Scans",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const TUMOR_TYPES = [
  "Melanoma",
  "Plasmacytoma",
  "Mast Cell Tumor",
  "Peripheral Nerve Sheath Tumor",
  "Squamous Cell Carcinoma",
  "Trichoblastoma",
  "Histiocytoma",
]

export default function Dashboard() {

  const [data, setData] = useState<DataProps[]>([])

  const fetch_data = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/histories`, { credentials: "include" })
      const this_ = await res.json()
      setData(Array.isArray(this_) ? this_ : [])
    } catch (error) {
      alert("Error while fetching dashboard data")
      console.error("error while fetching data in dashboard !!")
    }
  }

  useEffect(() => {
    fetch_data()
  }, [])

  const totalScans = data.length
  const tumorsDetected = data.filter((log) => log.result.tumor_detected).length

  const tumorPositiveLogs = data.filter((log) => log.result.tumor_detected)

  const tumorPositiveScores = tumorPositiveLogs
    .filter((log) => log.confidence_score != null)
    .map((log) => log.confidence_score as number)
  const averageConfidence = tumorPositiveScores.length > 0
    ? Math.round((tumorPositiveScores.reduce((sum, score) => sum + score, 0) / tumorPositiveScores.length) * 100)
    : null

  const averageFlaggedTiles = tumorPositiveLogs.length > 0
    ? Math.round(
        tumorPositiveLogs.reduce((sum, log) => sum + log.result.tumor_tile_count, 0) / tumorPositiveLogs.length
      )
    : null

  const diagnosisCounts: Record<string, number> = {}
  for (const type of TUMOR_TYPES) {
    diagnosisCounts[type] = 0
  }
  for (const log of tumorPositiveLogs) {
    if (log.result.diagnosis) {
      diagnosisCounts[log.result.diagnosis] = (diagnosisCounts[log.result.diagnosis] ?? 0) + 1
    }
  }
  const diagnosisChartData = TUMOR_TYPES.map((diagnosis) => ({
    diagnosis,
    count: diagnosisCounts[diagnosis],
  }))

  const scansByDate: Record<string, number> = {}
  for (const log of data) {
    if (!log.created_at) continue
    const day = new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    scansByDate[day] = (scansByDate[day] ?? 0) + 1
  }
  const timelineChartData = Object.entries(scansByDate).map(([day, scans]) => ({ day, scans }))

  return (
    <Page>
      <PageHeader title="Dashboard" description="Overview of your scans" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ScanLine} label="Total Scans" value={data.length === 0 ? "--" : totalScans} />
        <StatCard icon={Activity} label="Tumors Detected" value={data.length === 0 ? "--" : tumorsDetected} />
        <StatCard icon={Gauge} label="Avg. Confidence" value={averageConfidence !== null ? `${averageConfidence}%` : "--"} />
        <StatCard icon={Grid3x3} label="Avg. Flagged Tiles" value={averageFlaggedTiles !== null ? averageFlaggedTiles : "--"} />
      </div>

      <ChartAreaLinear data={timelineChartData} />
      <NormalBar data={diagnosisChartData} />
    </Page>
  )
}

function NormalBar({ data }: { data: { diagnosis: string; count: number }[] }) {
  return (
    <Card className="rounded-xl bg-[#F4F6F6] ring-0 border-0 drop-shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Tumor Type Breakdown</CardTitle>
        <CardDescription>Diagnosed cases by tumor type</CardDescription>
      </CardHeader>
      <ChartContainer config={diagnosisChartConfig} className="h-72 w-full px-6">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="diagnosis"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: "0.8rem" }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}

function ChartAreaLinear({ data }: { data: { day: string; scans: number }[] }) {
  return (
    <Card className="rounded-xl bg-[#F4F6F6] ring-0 border-0 drop-shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Scans Over Time</CardTitle>
        <CardDescription>Number of scans performed per day</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={timelineChartConfig} className="h-64 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: '0.9rem' }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="scans"
              type="linear"
              fill="var(--color-scans)"
              fillOpacity={0.4}
              stroke="var(--color-scans)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#F4F6F6] p-5 drop-shadow-md">
      <div className="flex items-center justify-center size-11 rounded-xl bg-[#E6F2F1] text-[#156E68]">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-[#0E4E4A]">{value}</p>
      </div>
    </div>
  )
}