// taken from https://observablehq.com/@d3/color-legend
function ramp(color, n = 256) {
    const canvas = DOM.canvas(n, 1);
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(i, 0, 1, 1);
    }
    return canvas;
}

// taken from https://stackoverflow.com/a/49434653/943138
function randn_bm(min, max, skew) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

class PPI{
    constructor(container, graph_file){
        this.container = d3.select(`${container}`);
        this.margin = {top: 10, right: 10, bottom: 30, left: 25};
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 900 - this.margin.top - this.margin.bottom;
        this.totWidth = this.width + this.margin.left + this.margin.right;
        this.totHeight = this.height + this.margin.top + this.margin.bottom;

        this.symbols = d3.symbol().size(300);
        this.color_range = ["#ddd", "#23CB87", "gold", "#F08080"];

        this.colorScale = d3.scalePow()
            .exponent(0.41)
            .range(this.color_range);

        this.drugColorScale = d3.scalePow()
            .exponent(0.21)
            .range(['#ddd', "#23CB87", 'gold', 'orange','crimson']);

        this.radius = 10;
        

        this.graph = graph_file;
        this.draw();
        // d3.json(graph_file)
        // .then(response => this.graph = response)
        // .then(() => this.draw());
    }
    
    draw(){
        this.graph.nodes.map(d => d.score = Math.random())

        this.svg = this.container.append('svg')
            .attr("viewBox", `0 0 ${this.totWidth} ${this.totHeight}`)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);


        this.color_svg = this.container.append('svg')
            .attr('viewBox', `0 0 ${this.totWidth} 150`)
            .append('g')
            .attr('transform', `translate(${this.margin.left},0)`);

        //this.interactive_property = this.select_elem.node().value;
        this.interactive_property = -1;

        this.color_domain = [
            0, 1
        ];

        this.init_scores();
        this.plot_graph();
        this.plot_colorbars();
    }

    plot_colorbars(){
        this.color_defs = this.color_svg.append('defs');
        this.colorbar_gradient = this.color_defs.append('linearGradient')
            .attr('id', 'colorbar-gradient')
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .selectAll("stop")
            .data(this.color_domain)
            .enter()
            .append('stop')
            //.attr('offset',(d,i) => `${i/(this.color_domain.length - 1) * 100}%`)
            .attr('offset',(d,i) => `${d/d3.max(this.color_domain) * 100}%`)
            .attr('stop-color', d => this.colorScale(d));
            
        this.colorbar = this.color_svg.append("rect")
            .attr("class", "legendRect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.width)
            .attr("height", 15)
            .style("fill", "url(#colorbar-gradient)");

        this.color_axis_scale = d3.scaleLinear()
            .range([0, this.width])
            .domain([
                d3.min(this.color_domain),
                d3.max(this.color_domain)
            ]); 
        this.color_axis = this.color_svg.append('g')
            .attr('transform', `translate(0, 15)`)
            .attr('class', 'color-axis');

        this.color_axis.call(d3.axisBottom(this.color_axis_scale));

        //drug specific colorbar
        this.drug_colorbar_gradient = this.color_defs.append('linearGradient')
            .attr('id', 'drug-colorbar-gradient')
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .selectAll("stop")
            .data(this.drug_color_domain)
            .enter()
            .append('stop')
            //.attr('offset',(d,i) => `${i/(this.color_domain.length - 1) * 100}%`)
            .attr('offset',(d,i) => `${d/d3.max(this.drug_color_domain) * 100}%`)
            .attr('stop-color', d => this.drugColorScale(d));

        this.drug_colorbar = this.color_svg.append("rect")
            .attr("class", "legendRect")
            .attr("x", 0)
            .attr("y", 50)
            .attr("width", this.width)
            .attr("height", 15)
            .style("fill", "url(#drug-colorbar-gradient)");

        this.drug_color_axis_scale = d3.scaleLinear()
            .range([0, this.width])
            .domain([
                d3.min(this.drug_color_domain),
                d3.max(this.drug_color_domain)
            ]); 
        this.drug_color_axis = this.color_svg.append('g')
            .attr('transform', `translate(0, 65)`)
            .attr('class', 'color-axis');

        this.drug_color_axis.call(d3.axisBottom(this.drug_color_axis_scale));

    }

    plot_drug_colbar(){
        //this function will plot the colorbar for the currently selected drug.

    }

    init_scores(){
        var max_score = drugs.max;
        this.color_domain = [0, max_score * 0.25, max_score * 0.5, max_score];
        var drug_min_score = d3.min(scores, d => d.score);
        var drug_max_score = d3.max(scores, d => d.score);
        var drug_low_quartile = drug_min_score + (drug_max_score - drug_min_score) * 0.25
        var drug_middle = drug_min_score + (drug_max_score - drug_min_score) * 0.5
        var drug_high_quartile = drug_min_score + (drug_max_score - drug_min_score) * 0.75
        this.drug_color_domain = [
            drug_min_score, 
            drug_low_quartile,
            drug_middle,
            drug_high_quartile,
            drug_max_score];
        // this.load_drug_score(this.interactive_property, `/static/data/${this.interactive_property}.json`);
        var score_name = this.interactive_property;
        this.graph.nodes.map(d => {
            var new_score = scores.filter(s => s.protein == d.id);
            if(new_score.length > 0){
                d[score_name] = new_score[0].score
            }else{
                d[score_name] = 0;
            }
        });
        
    }

    set_scores(score_name, scores, default_score='min'){
        console.log(score_name, scores);
        if(default_score == 'min'){
            default_score = d3.min(scores.map(d => d[1]));
        } else {
            default_score = +default_score;
        }

        if(score_name in this.graph.nodes[0]){
            // we already have this score
        } else {
            this.graph.nodes.map(d => {
                var new_score = scores.filter(s => s[0] == d.id);
                if(new_score.length > 0){
                    d[score_name] = new_score[0][1]
                }else{
                    d[score_name] = default_score;
                }
            });
        }
    }

    load_drug_score(score_name, scores_file){
        console.log('checking for ', score_name, scores_file);
        if(score_name in this.graph.nodes[0]){
            this.update_chart(score_name);
        } else {
            fetch(scores_file)
                .then(response => response.json())
                .then(scores => {
                    this.graph.nodes.map(d => {
                        var new_score = scores.filter(s => s.protein == d.id);
                        if(new_score.length > 0){
                            d[score_name] = new_score[0].score
                        }else{
                            d[score_name] = 0;
                        }
                    });
                    this.update_chart(score_name);
                });
        }
        
    }

    update_chart(property){
        if(property in this.graph.nodes[0]){

        }else{
            console.log('property not found');
            var min = 100 * Math.random();
            var max = min + 100 * Math.random();
            var skew = 100 * Math.random();
            this.graph.nodes.map(d => d[property] = randn_bm(min, max, skew));
        }
        this.interactive_property = property;


        // this.color_domain = [
        //     d3.min(this.graph.nodes.map(d=> d[this.interactive_property])),
        //     d3.max(this.graph.nodes.map(d=> d[this.interactive_property]))
        // ];

        var drug_min_score = d3.min(this.graph.nodes, d => d[this.interactive_property]);
        var drug_max_score = d3.max(this.graph.nodes, d => d[this.interactive_property]);
        var drug_low_quartile = drug_min_score + (drug_max_score - drug_min_score) * 0.25
        var drug_middle = drug_min_score + (drug_max_score - drug_min_score) * 0.5
        var drug_high_quartile = drug_min_score + (drug_max_score - drug_min_score) * 0.75
        this.drug_color_domain = [
            drug_min_score, 
            drug_low_quartile,
            drug_middle,
            drug_high_quartile,
            drug_max_score];

        //shuffle nodes a little bit
        var m = 20 * this.radius;
        this.node.select('.node')
            .attr('transform', d => {
                d.x = Math.max(this.radius, Math.min(this.width - this.radius, d.x + getRandomArbitrary(-m, m)));
                d.y = Math.max(this.radius, Math.min(this.height - this.radius, d.y + getRandomArbitrary(-m, m)));
                return `translate(${d.x},${d.y})`
            });
        
        this.simulation.alpha(0.5).restart();
        
        this.color_axis_scale.domain([
            d3.min(this.color_domain),
            d3.max(this.color_domain)
        ]);

        this.drug_color_axis_scale.domain([
            d3.min(this.drug_color_domain),
            d3.max(this.drug_color_domain)
        ]);

        this.colorScale.domain(this.color_domain);
        this.drugColorScale.domain(this.drug_color_domain);
        
        this.color_axis
            .transition()
            .duration(1000)
            .call(d3.axisBottom(this.color_axis_scale));
            
        this.drug_color_axis
            .transition()
            .duration(1000)
            .call(d3.axisBottom(this.drug_color_axis_scale));

        this.node.select(".node").transition()
            .duration(1000)
            .attr('fill', d => this.drugColorScale(d[this.interactive_property]));
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

    protein_hover(d){
        this.svg
            .select(`#node_label-${this.complex_id}-${d.id}`)
            //.attr('stroke', 'white')
            .attr('fill', 'black');
    }

    protein_mouseout(d){
        
        this.svg
            .select(`#node_label-${this.complex_id}-${d.id}`)
            .attr('stroke', 'transparent')
            .attr('fill', 'transparent');
    }

    plot_graph(){
        var proportion = this.width/750.0;
        var force = -20 * proportion;

        this.colorScale.domain(this.color_domain);
        this.drugColorScale.domain(this.drug_color_domain);

        this.simulation = d3.forceSimulation(this.graph.nodes)
            .force("link", d3.forceLink(this.graph.links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(force))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));
            //.stop();

        //this.simulation.tick(300);

        var links = this.svg.selectAll(".links")
            .data(this.graph.links);

        this.link = links.enter()
            .append('g')
            .attr('class', 'links').merge(links);
        
        var nodes = this.svg.selectAll(".nodes")
            .data(this.graph.nodes);

        this.node = nodes.enter()
            .append('g')
            .attr('class', 'nodes').merge(nodes)
            .on('mouseover', d => this.protein_hover(d))
            .on('mouseout', d => this.protein_mouseout(d))
            .attr("cx", d => d.x = Math.max(this.radius, Math.min(this.width - this.radius, d.x)))
            .attr("cy", d => d.y = Math.max(this.radius, Math.min(this.height - this.radius, d.y)))
            .call(this.drag(this.simulation));
            
        this.link.append('line').attr('class', 'link');
        this.link.select('.link')
            .attr("stroke", "#888")
            .attr("stroke-opacity", d => d.w)
            .join("line")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
            .attr("stroke-width", d => 5 * d.w)
            .attr("alpha", d => d.w);
            
        this.node.append('path').attr('class', 'node');
        this.node.select(".node")
            //.attr('class', d => `node type-${d.is_covid?'covid':''}-${d.this_drug?'drug':''}-${d.any_drug?'other':''}`)
            .attr("stroke", "#222")
            .attr("stroke-width",3)
            .attr("d", this.symbols.type(d3.symbolCircle))
            .attr('fill', d => this.drugColorScale(d[this.interactive_property]))
            .attr('transform', d=>`translate(${d.x},${d.y})`)
            .attr("id", d => `node-${this.complex_id}-${d.id}`);
        
        this.node.append('text').attr('class', 'node_label');
        this.node.select('.node_label')
            .attr("id", d => `node_label-${this.complex_id}-${d.id}`)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr('text-anchor','middle')
            .attr('font-weight','bold')
            .attr('stroke-width',0.5)
            .attr('stroke-alignment','outer')
            .style('font-size',14)
            .attr('stroke','transparent')
            .attr('fill', 'transparent')
            .text(d => d.id);

        links.exit().remove();
        nodes.exit().remove();

        this.simulation.tick();

        this.simulation.on("tick", () => {

            this.node.select('.node')
            .attr('transform', d => {
                d.x = Math.max(this.radius, Math.min(this.width - this.radius, d.x));
                d.y = Math.max(this.radius, Math.min(this.height - this.radius, d.y));
                return `translate(${d.x},${d.y})`
            });
            // .attr("cx", d => d.x = Math.max(radius, Math.min(this.max_ppi_width - radius, d.x)))
            // .attr("cy", d => d.y = Math.max(radius, Math.min(this.max_ppi_height - radius, d.y)))
            // .attr("x", d => d.x)
            // .attr("y", d => d.y);

            this.link.select('.link')
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            this.node.select('.node_label')
                .attr("x", d => d.x)
                .attr("y", d => d.y - 15);
        });
    }

    applyFilter(){
        this.data = complexData.filter((d) => {
            return d.complex_id == this.complex_id;
        })[0];
        this.graph = this.data.interactions;
        this.height = d3.max(
            [
                this.height,
                this.y_start_drugs + (this.data.involved_drugs.length + 2) * 18 - this.margin.top - this.margin.bottom
            ]
        );
            
    
        this.defs = this.svg.append("defs");
        this.CMAP_gradient = this.defs.append("linearGradient")
            .attr("id", "cmap-gradient");
        this.CMAP_gradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .selectAll("stop")
            .data(cmap_domain)
            .enter()
            .append('stop')
            .attr('offset',(d,i) => `${i/(cmap_domain.length - 1) * 100}%`)
            .attr('stop-color', d => this.CMAPcolorScale(d));

        this.grap_gradient = this.defs.append('linearGradient')
            .attr('id', 'graph-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');
        this.grap_gradient
            .append('stop')
            .attr('offset','0%')
            .attr('class','type---other');
        this.grap_gradient
            .append('stop')
            .attr('offset','50%')
            .attr('class','type---other');
        this.grap_gradient
            .append('stop')
            .attr('offset','50%')
            .attr('class','type--drug-');

        this.plot_graph();
        this.plot_drugs();
        this.plot_atc();
    }
}