"use client"

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

export const description = "A linear area chart"

interface StatCardProps {
  label: string;
  value: string | number;
}

const chartData = [
  { month: "January", dog: 1861, cat: 80 },
  { month: "February", dog: 305, cat: 200 },
  { month: "March", dog: 237, cat: 120 },
  { month: "April", dog: 73, cat: 190 },
  { month: "May", dog: 209, cat: 130 },
  { month: "June", dog: 214, cat: 140 },
]

let totaldog = 0, totalcat = 0, totalpet = 0

for (const row of chartData) {
  totaldog = row['dog'] + totaldog
  totalcat = row.cat + totalcat
}
totalpet = totaldog + totalcat

const chartConfig = {
  dog: {
    label: "Doggy",
    color: "var(--chart-2)",
  },
  cat: {
    label: "Cat",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function Dashboard() {
  return (
  <div className="grid grid-rows-[7fr_3fr] h-screen gap-2 w-175 py-15">

    {/* Scrollable row of charts */}
    <div className="flex flex-col gap-3 overflow-y-auto snap-y snap-mandatory">
      <div className="min-w-[600px] flex-shrink-0 h-full snap-start">
        <ChartAreaLinear />
      </div>
      <div className="min-w-[600px] flex-shrink-0 h-full snap-start">
        <NormalBar />
      </div>
      <div className="min-w-[600px] flex-shrink-0 h-full snap-start">
        <ChartAreaLinear />
      </div>
    </div>

    <div className="grid grid-cols-[minmax(100px,_1fr)_minmax(100px,_1fr)_minmax(100px,_1fr)] gap-2">
      <StatCard label="Total Dogs" value={totaldog}/>
      <StatCard label="Total Cats" value={totalcat}/>
      <StatCard label="Total Pets" value={totalpet}/>
    </div>
  </div>
  )
}

function NormalBar() {
  return (
    <Card className="min-w-[600px] h-full">
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full bg-white">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="dog" fill="var(--color-dog)" radius={4} />
          <Bar dataKey="cat" fill="var(--color-cat)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}

function ChartAreaLinear() {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
        {/* <div className="flex flex-col">
            <Card>1</Card>
            <Card>2</Card>
            <Card>3</Card>
        </div> */}
      <CardHeader>
        <CardTitle className="text-2xl">Area Chart - Linear</CardTitle>
        <CardDescription className="text-lg">Showing total visitors for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full px-4 py-4">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              tick={{ fontSize: '0.9rem' }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="dog"
              type="linear"
              fill="var(--color-dog)"
              fillOpacity={0.4}
              stroke="var(--color-dog)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter> */}
        {/* <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div> */}

      {/* </CardFooter> */}
      {/* <div className="flex flex-row flex-wrap justify-center items-center">
        <Card>1</Card>
        <Card>2</Card>
        <Card>3</Card>
        </div> */}
    </Card>
  )
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="flex flex-col justify-center items-center h-full">
      <p className="text-muted-foreground text-xl">{label}</p>
      <p className="text-4xl font-bold">{value}</p>
    </Card>
  )
}
    // <div>01</div>
    // <div>02</div>
    // <div>03</div>
    // <div>04</div>
    // <div>05</div>
    // <div>06</div>
    // <div>07</div>
    // <div>08</div>
    // <div>09</div>