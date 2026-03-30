import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BudgetYearChartProps {
  data: { name: string; year: number; budget: number; genre: string }[];
}

const GENRE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(260, 50%, 45%)",
  "hsl(200, 60%, 50%)",
  "hsl(150, 50%, 45%)",
  "hsl(30, 70%, 55%)",
  "hsl(340, 55%, 55%)",
  "hsl(180, 45%, 45%)",
  "hsl(60, 55%, 48%)",
  "hsl(280, 40%, 55%)",
];

const BudgetYearChart = ({ data }: BudgetYearChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = 500;
    const margin = { top: 20, right: 180, bottom: 60, left: 80 };

    // Extract primary genre for each movie
    const withGenre = data.map((d) => ({
      ...d,
      primaryGenre: d.genre.split(",")[0].trim(),
    }));

    // Get top genres by count, group the rest as "Other"
    const genreCounts = d3.rollup(withGenre, (v) => v.length, (d) => d.primaryGenre);
    const sortedGenres = [...genreCounts.entries()].sort((a, b) => b[1] - a[1]);
    const topGenres = sortedGenres.slice(0, 8).map(([g]) => g);
    const allGenres = [...topGenres, "Other"];

    const processed = withGenre.map((d) => ({
      ...d,
      displayGenre: topGenres.includes(d.primaryGenre) ? d.primaryGenre : "Other",
    }));

    // Create year bins (decades)
    const yearExtent = d3.extent(processed, (d) => d.year) as [number, number];
    const decadeStart = Math.floor(yearExtent[0] / 10) * 10;
    const decadeEnd = Math.ceil((yearExtent[1] + 1) / 10) * 10;
    const decades: [number, number][] = [];
    for (let y = decadeStart; y < decadeEnd; y += 10) {
      decades.push([y, y + 10]);
    }

    // Aggregate budget by decade and genre
    const stackData = decades.map(([start, end]) => {
      const label = `${start}s`;
      const row: Record<string, number | string> = { decade: label, decadeStart: start };
      allGenres.forEach((g) => {
        row[g] = d3.sum(
          processed.filter((d) => d.year >= start && d.year < end && d.displayGenre === g),
          (d) => d.budget
        );
      });
      return row;
    });

    const stack = d3.stack<Record<string, number | string>>().keys(allGenres);
    const series = stack(stackData as any);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleBand()
      .domain(stackData.map((d) => d.decade as string))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yMax = d3.max(series, (s) => d3.max(s, (d) => d[1])) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal<string>().domain(allGenres).range(GENRE_COLORS);

    // Gridlines
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(() => ""))
      .selectAll("line")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-opacity", 0.5);
    svg.selectAll(".domain").remove();

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "hsl(var(--popover))")
      .style("color", "hsl(var(--popover-foreground))")
      .style("border", "1px solid hsl(var(--border))")
      .style("border-radius", "6px")
      .style("padding", "8px 12px")
      .style("font-size", "12px")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
      .style("opacity", 0)
      .style("z-index", 10)
      .style("max-width", "300px")
      .style("max-height", "280px")
      .style("overflow-y", "auto");

    // Bars
    svg
      .append("g")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d.map((v) => ({ ...v, key: d.key })))
      .join("rect")
      .attr("x", (d) => x(d.data.decade as string)!)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .attr("rx", 2)
      .attr("opacity", 0.85)
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("opacity", 1);
        const val = d[1] - d[0];
        const decadeLabel = d.data.decade as string;
        const decadeStartNum = Number(d.data.decadeStart);
        const genre = (d as any).key as string;
        const movies = processed.filter(
          (m) => m.year >= decadeStartNum && m.year < decadeStartNum + 10 && m.displayGenre === genre
        );
        const movieList = movies
          .sort((a, b) => b.budget - a.budget)
          .map((m) => `<div style="display:flex;justify-content:space-between;gap:8px"><span>${m.name} (${m.year})</span><span style="white-space:nowrap">$${m.budget.toLocaleString()}</span></div>`)
          .join("");
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${decadeLabel} — ${genre}</strong><br/><span style="color:hsl(var(--muted-foreground))">Total: $${val.toLocaleString()}</span><hr style="margin:4px 0;border-color:hsl(var(--border))"/>${movieList || "<em>No movies</em>"}`
          );
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        tooltip.style("left", `${mx + 15}px`).style("top", `${my - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 0.85);
        tooltip.style("opacity", 0);
      });

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .attr("color", "hsl(var(--muted-foreground))")
      .selectAll("text")
      .attr("fill", "hsl(var(--muted-foreground))");

    // Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y).tickFormat((d) => {
          const val = d as number;
          if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
          if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(0)}M`;
          return `$${val}`;
        })
      )
      .attr("color", "hsl(var(--muted-foreground))")
      .selectAll("text")
      .attr("fill", "hsl(var(--muted-foreground))");

    // Axis labels
    svg
      .append("text")
      .attr("x", (margin.left + width - margin.right) / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "hsl(var(--muted-foreground))")
      .attr("font-size", "13px")
      .text("Decade");

    svg
      .append("text")
      .attr("x", -(height / 2))
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("fill", "hsl(var(--muted-foreground))")
      .attr("font-size", "13px")
      .text("Total Budget (USD)");

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    allGenres.forEach((genre, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 22})`);
      g.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("rx", 3)
        .attr("fill", color(genre))
        .attr("opacity", 0.85);
      g.append("text")
        .attr("x", 20)
        .attr("y", 11)
        .attr("fill", "hsl(var(--muted-foreground))")
        .attr("font-size", "12px")
        .text(genre);
    });

    return () => {
      tooltip.remove();
    };
  }, [data]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
};

export default BudgetYearChart;
