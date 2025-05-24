import React, { useEffect, useRef, useState } from 'react'
import { Scene } from '@/data/scenes'
import { StoryPhase } from '@/app/types'
import * as d3 from 'd3'

interface SceneGraphProps {
    scenes: Record<string, Scene>
    connections: { source: string; target: string }[]
}

interface TreeNode {
    id: string
    phase: StoryPhase
    children: TreeNode[]
}

interface ExtendedHierarchyPointNode extends d3.HierarchyPointNode<TreeNode> {
    _children?: ExtendedHierarchyPointNode[] | null
    x0?: number
    y0?: number
}

const phaseColors: Record<StoryPhase, string> = {
    [StoryPhase.PEACEFUL_BEGINNINGS]: '#4CAF50',
    [StoryPhase.FIRST_VENTURES]: '#FFC107',
    [StoryPhase.EXPANSION]: '#2196F3',
    [StoryPhase.SETTLEMENT]: '#9C27B0',
    [StoryPhase.CONFLICT]: '#F44336',
    [StoryPhase.LEGACY]: '#795548',
}

export default function SceneGraph({ scenes, connections }: SceneGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [, setUpdate] = useState(0) // Force re-render

    useEffect(() => {
        if (!svgRef.current) return

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const width = 1200
        const height = 800
        const margin = { top: 20, right: 90, bottom: 30, left: 90 }

        // Find the first scene (root node)
        const rootNodeId = Object.keys(scenes).find(id =>
            !connections.some(conn => conn.target === id)
        )

        if (!rootNodeId) {
            console.error("No root node found")
            return
        }

        const createTree = (id: string): TreeNode => ({
            id,
            phase: scenes[id]?.storyPhase || StoryPhase.PEACEFUL_BEGINNINGS,
            children: connections
                .filter(conn => conn.source === id)
                .map(conn => createTree(conn.target))
        })

        const root = d3.hierarchy(createTree(rootNodeId)) as ExtendedHierarchyPointNode

        const treeLayout = d3.tree<TreeNode>().size([height - margin.top - margin.bottom, width - margin.left - margin.right])

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        const update = (source: ExtendedHierarchyPointNode) => {
            const treeData = treeLayout(root)

            const nodes = treeData.descendants() as ExtendedHierarchyPointNode[]
            const links = treeData.links()

            nodes.forEach((d) => {
                d.y = d.depth * 180
            })

            const node = g.selectAll<SVGGElement, ExtendedHierarchyPointNode>("g.node")
                .data(nodes, d => d.data.id)

            const nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", () => `translate(${source.y0 || 0},${source.x0 || 0})`)
                .on("click", (_event, d) => {
                    if (d.children) {
                        d._children = d.children
                        d.children = undefined
                    } else {
                        d.children = d._children || undefined
                        d._children = null
                    }
                    update(d)
                    setUpdate(prev => prev + 1) // Force re-render
                })

            nodeEnter.append("circle")
                .attr("r", 5)
                .attr("fill", d => phaseColors[d.data.phase])
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)

            nodeEnter.append("text")
                .attr("dy", ".35em")
                .attr("x", d => d.children || d._children ? -8 : 8)
                .attr("text-anchor", d => d.children || d._children ? "end" : "start")
                .text(d => d.data.id)
                .style("font-size", "10px")
                .style("font-family", "Arial, sans-serif")

            const nodeUpdate = nodeEnter.merge(node)

            nodeUpdate.transition()
                .duration(750)
                .attr("transform", d => `translate(${d.y},${d.x})`)

            nodeUpdate.select("circle")
                .attr("r", 5)
                .attr("fill", d => d._children ? "#lightsteelblue" : phaseColors[d.data.phase])

            const nodeExit = node.exit<ExtendedHierarchyPointNode>().transition()
                .duration(750)
                .attr("transform", d => `translate(${d.parent?.y || 0},${d.parent?.x || 0})`)
                .remove()

            nodeExit.select("circle")
                .attr("r", 1e-6)

            nodeExit.select("text")
                .style("fill-opacity", 1e-6)

            const link = g.selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>("path.link")
                .data(links, d => d.target.data.id)

            const linkEnter = link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", () => {
                    const o = { x: source.x0 || 0, y: source.y0 || 0 }
                    return diagonal(o, o)
                })
                .attr("fill", "none")
                .attr("stroke", "#555")
                .attr("stroke-width", 1)

            const linkUpdate = linkEnter.merge(link)

            linkUpdate.transition()
                .duration(750)
                .attr("d", d => diagonal(d.source, d.target))

            link.exit().transition()
                .duration(750)
                .attr("d", function(this: SVGPathElement, d: d3.HierarchyLink<TreeNode>) {
                    const o = { x: d.source.x || 0, y: d.source.y || 0 }
                    return diagonal(o, o)
                } as never)
                .remove()

            nodes.forEach((d) => {
                d.x0 = d.x
                d.y0 = d.y
            })
        }

        function diagonal(s: { x: number; y: number }, d: { x: number; y: number }) {
            return `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                      ${(s.y + d.y) / 2} ${d.x},
                      ${d.y} ${d.x}`
        }

        root.x0 = height / 2
        root.y0 = 0

        // Collapse all nodes initially except the root
        root.descendants().forEach((d: ExtendedHierarchyPointNode) => {
            if (d.depth > 0) {
                d._children = d.children
                d.children = undefined
            }
        })

        update(root)

        // Add zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform)
            })

        svg.call(zoom)

    }, [scenes, connections])

    return (
        <div className="overflow-auto">
            <svg ref={svgRef} width={1200} height={800}></svg>
        </div>
    )
}