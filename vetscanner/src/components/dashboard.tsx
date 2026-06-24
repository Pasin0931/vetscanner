"use client"

import { useState, useEffect } from "react"

import { TrendingUp } from "lucide-react"
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

import { motion } from "framer-motion"

export const description = "A linear area chart"

interface StatCardProps {
  label: string;
  value: string | number;
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

export default function Dashboard() {

  const [data, setData] = useState<DataProps[]>([])

  const fetch_data = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/histories`, { credentials: "include" })
      const this_ = await res.json()
      setData(this_)
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

  const tumorPositiveScores = data
    .filter((log) => log.result.tumor_detected && log.confidence_score != null)
    .map((log) => log.confidence_score as number)
  const averageConfidence = tumorPositiveScores.length > 0
    ? Math.round((tumorPositiveScores.reduce((sum, score) => sum + score, 0) / tumorPositiveScores.length) * 100)
    : null

  const diagnosisCounts: Record<string, number> = {}
  for (const log of data) {
    if (log.result.tumor_detected && log.result.diagnosis) {
      diagnosisCounts[log.result.diagnosis] = (diagnosisCounts[log.result.diagnosis] ?? 0) + 1
    }
  }
  const diagnosisChartData = Object.entries(diagnosisCounts)
    .map(([diagnosis, count]) => ({ diagnosis, count }))
    .sort((a, b) => b.count - a.count)

  const scansByDate: Record<string, number> = {}
  for (const log of data) {
    if (!log.created_at) continue
    const day = new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    scansByDate[day] = (scansByDate[day] ?? 0) + 1
  }
  const timelineChartData = Object.entries(scansByDate).map(([day, scans]) => ({ day, scans }))

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4 w-auto">
      <Card className="border border-3 p-10">
        <div className="flex flex-col gap-3 overflow-y-auto snap-y snap-mandatory h-140 w-250">
          <div className="min-w-[600px] flex-shrink-0 h-full snap-start">
            <ChartAreaLinear data={timelineChartData} />
          </div>
          <div className="min-w-[600px] flex-shrink-0 h-full snap-start">
            <NormalBar data={diagnosisChartData} />
          </div>
        </div>

        {data?.length === 0 ? (
          <div className="flex flex-row justify-center items-center gap-4 w-full">
            <StatCard label="Total Scans" value={"--"} />
            <StatCard label="Tumors Detected" value={"--"} />
            <StatCard label="Avg. Confidence" value={"--"} />
            <StatCard label="Tumors Detected" value={"--"} />
          </div>
        ) : (
          <div className="flex flex-row justify-center items-center gap-4 w-full">
            <StatCard label="Total Scans" value={totalScans} />
            <StatCard label="Tumors Detected" value={tumorsDetected} />
            <StatCard label="Avg. Confidence" value={averageConfidence !== null ? `${averageConfidence}%` : "--"} />
            <StatCard label="Tumors Detected" value={tumorsDetected} />
          </div>
        )}
      </Card>
    </div>
  )
}

function NormalBar({ data }: { data: { diagnosis: string; count: number }[] }) {
  return (
    <Card className="min-w-[600px] h-full border">
      <CardHeader className="pl-7">
        <CardTitle className="text-2xl font-bold">Tumor Type Breakdown</CardTitle>
        <CardDescription className="text-lg">Diagnosed cases by tumor type</CardDescription>
      </CardHeader>
      <ChartContainer config={diagnosisChartConfig} className="min-h-[200px] w-full bg-white p-10">
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
    <Card className="flex flex-col h-full overflow-hidden border">
      <CardHeader className="pl-7">
        <CardTitle className="text-2xl font-bold">Scans Over Time</CardTitle>
        <CardDescription className="text-lg">Number of scans performed per day</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={timelineChartConfig} className="h-full w-full px-4 py-4">
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

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="flex flex-col justify-center items-center h-25 w-40">
      <p className="text-muted-foreground text-lg">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  )
}