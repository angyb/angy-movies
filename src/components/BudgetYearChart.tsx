import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BudgetYearChartProps {
  data: { name: string; year: number; budget: number }[];
}

const BudgetYearChart = ({ data }: BudgetYearChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.budget)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x).tickSize(-(height - margin.top - margin.bottom)).tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-opacity", 0.5);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-opacity", 0.5);

    // Remove grid domain lines
    svg.selectAll(".grid .domain").remove();

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
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
          if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
          return `$${val}`;
        })
      )
      .attr("color", "hsl(var(--muted-foreground))")
      .selectAll("text")
      .attr("fill", "hsl(var(--muted-foreground))");

    // Axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "hsl(var(--muted-foreground))")
      .attr("font-size", "13px")
      .text("Year");

    svg
      .append("text")
      .attr("x", -(height / 2))
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("fill", "hsl(var(--muted-foreground))")
      .attr("font-size", "13px")
      .text("Budget (USD)");

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
      .style("z-index", 10);

    // Dots
    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.budget))
      .attr("r", 5)
      .attr("fill", "hsl(var(--primary))")
      .attr("fill-opacity", 0.7)
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 1.5)
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("r", 8).attr("fill-opacity", 1);
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.name}</strong><br/>Year: ${d.year}<br/>Budget: $${d.budget.toLocaleString()}`
          );
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        tooltip
          .style("left", `${mx + 15}px`)
          .style("top", `${my - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 5).attr("fill-opacity", 0.7);
        tooltip.style("opacity", 0);
      });

    return () => {
      tooltip.remove();
    };
  }, [data]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
};

export default BudgetYearChart;
