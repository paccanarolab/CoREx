class GraphDiagram{
    constructor(container, json_url){
        this.margin = {top: 30, right: 20, bottom: 70, left: 70};
        this.container = d3.select(`#${container}`);
        this.width = 700;
        this.height = 700;
        this.graph;

        //${this.width - this.margin.left - this.margin.right} ${this.height - this.margin.top - this.margin.bottom}

        this.svg = this.container.append('svg')
            .attr('viewBox', `0 0 ${this.width - this.margin.left - this.margin.right} ${this.height - this.margin.top - this.margin.bottom}`)
            // .append('g')
            // .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        this.svg.append("rect")
            .attr("width",this.width)
            .attr("height",this.height)
            .attr('fill', 'lightgray');

        this.colorScale = d3.scaleLinear()
            .domain([0, 0.25, 0.6, 1])
            .range(["#c67727", "#a9db3d", "#26ebbd"]); // twitter gif

        d3.json(json_url)
            .then((data) => {
                this.graph = data;
            }).then(() =>{
                this.plot_graph();
            });
    }

    dragstarted(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    dragended(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    drag(simulation){
        return d3.drag()
            .on("start", (d) => {this.dragstarted(d);})
            .on("drag", (d) => {this.dragged(d);})
            .on("end", (d) => {this.dragended(d);});
    };

    plot_graph(){
        var proportion = this.width/750.0;
        var radius = 10;
        var force = -8 * proportion;


        this.simulation = d3.forceSimulation(this.graph.nodes)
            .force("link", d3.forceLink(this.graph.edges).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(force))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .stop();

        //.interpolate(d3.interpolateHcl);


        this.link = this.svg.append("g")
            .attr("stroke", "#888")
            .attr("stroke-opacity", 1)
            .selectAll("line")
            .data(this.graph.edges)
            .join("line")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
            .attr("stroke-width", d => d.weight * 5.5);
        
        this.node = this.svg.append("g")
            .attr("stroke", "#888")
            //.attr("stroke-width", 4.5)
            .selectAll("circle")
            .data(this.graph.nodes)
            .join("circle")
            .attr("r", radius)
            .attr("fill",d => this.colorScale(d['drug target']))
            .attr("id", d => 'circle' + d.id)
            .attr("class", d => 'circle')
            .attr("cx", d => d.x = Math.max(radius, Math.min(this.width - radius, d.x)))
            .attr("cy", d => d.y = Math.max(radius, Math.min(this.height - radius, d.y)))
            .call(this.drag(this.simulation));



        // this.node_labels = this.svg.selectAll(".text")
        //     .data(this.graph.nodes)
        //     .enter().append("text")
        //     .attr("class", "label")
        //     .attr("text-anchor", "middle")
        //     .attr('dy', '.4em')
        //     .attr('font-size', 5)
        //     .attr("x", function(d) { return d.x; })
        //     .attr("y", function(d) { return d.y; })
        //     .text((d) => d.label)
        //     .call(this.drag(this.simulation));

        this.simulation.tick(300);
        

        this.simulation.on("tick", () => {
            this.link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

            this.node
            .attr("cx", d => d.x = Math.max(radius, Math.min(this.width - radius, d.x)))
            .attr("cy", d => d.y = Math.max(radius, Math.min(this.height - radius, d.y)));

            // this.node_labels
            // .attr("x", d => d.x)
            // .attr("y", d => d.y);
        });
    }
}

let ppi = new GraphDiagram("PPI", 'data/ppi.json');
