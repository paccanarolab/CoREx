
// math part 
const sum = math.sum;

var alpha = 10.0/100.0;

function diffusion_step(Y, S){
    return math.add(
        math.multiply(alpha, math.multiply(S, Y)),
        math.multiply(1.0 - alpha, Y)
    );
}

function calculate_diffusion_matrix(W) {
    //build D
    var sums= math.apply(W,1,sum); //sum every column per row

    //in the JS implementation we don't handle disconnected matrices :c
    var diagonalValues = sums.map(function (v, i, m){
        return 1/math.sqrt(v);
    });
    var D = math.diag(diagonalValues);
    //build S
    return math.multiply(math.multiply(D,W),D);
}

function build_adjacency_matrix(data, flow_factor = 1.0){
    var A = math.zeros(data.nodes.length, data.nodes.length);
    for (var i = data.links.length - 1; i >= 0; i--) {
        var id1 = data.nodes.findIndex(node => node.id == data.links[i].source);
        var id2 = data.nodes.findIndex(node => node.id == data.links[i].target);
        A.set([id1, id2], data.links[i].weight * flow_factor);
        A.set([id2, id1], data.links[i].weight * flow_factor);
    }
    return A;
}

function extract_initial_prediction(data){
    var Y = math.zeros(data.nodes.length,1);
    for (var i = data.nodes.length - 1; i >= 0; i--) {
        Y.set([i,0], data.nodes[i].label? 1 : 0);
    }
    return Y;
}

function assign_prediction(Y, graph){
    var y_min = math.min(Y);
    var y_max = math.max(Y);
    for (var i = graph.nodes.length - 1; i >= 0; i--) {
        graph.nodes[i].label = Y.get([i, 0]) > 0;
        var strength = map_range(Y.get([i, 0]), y_min, y_max);
        //var strength = Y.get([i, 0]);
        graph.nodes[i].label_strength = graph.nodes[i].label? strength : 0 ;
    }
}

function map_range(x, in_min, in_max, out_min=0.1, out_max=1.0) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


class Diffusion{

    constructor(div_id, json_url, name){
        var self = this;
        this.div_id = div_id;
        this.name = name;
        this.graph;
        this.A; // adjacency matrix
        this.S; // diffusion matrix
        this.Y; // initial labelling
        this.Y_curr; // current labelling
        this.counter = 0;
        this.anim_duration = 350;
        this.anim_initial_frames = 10;
        this.frames = this.anim_duration + this.anim_initial_frames;
        this.duration = 700;

        this.width = 750;
        this.height = 750;
        this.svg = d3.select(this.div_id)
            .attr("width",this.width)
            .attr("height",this.height);

        this.svg.append("rect")
            .attr("width",this.width)
            .attr("height",this.height)
            .attr('fill', '#fff');

        this.svg.append(() => { return document.getElementById("chart-style"); });

        //Append title
        this.svg.append("text")
            .attr("class", "iteration-text"+ this.name)
            .attr("x", this.width/2)
            .attr("y", 50)
            .style("text-anchor", "middle")
            .attr('font-size', '1.5em')
            .text("Iteration 0");



        this.colorScale = d3.scaleLinear()
            //.domain([0, d3.max(accidents, function(d) {return d.count; })/2, d3.max(accidents, function(d) {return d.count; })])
            //.domain([0, 0.25, 0.6, 1])
            //.range(["#ED7D31","#5B9BD5","#23CB87", "#23CB87"]);
            
            // DIEGO
            //.domain([0, 0.25, 0.75, 1])
            //.range(["white","yellow","orange", "red"]);

            // DIEGO 2
            //.domain([0, 1])
            //.range(["white", "red"]);

            .domain([0, 0.25, 0.6, 1])
            .range(["#c67727", "#a9db3d", "#26ebbd"]); // twitter gif

        //Extra scale since the color scale is interpolated
        this.countScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.width]);


        //Calculate the variables for the temp gradient
        this.numStops = 10;
        this.countRange = this.countScale.domain();
        this.countRange[2] = this.countRange[1] - this.countRange[0];
        this.countPoint = [];
        for(var i = 0; i < this.numStops; i++) {
            this.countPoint.push(i * this.countRange[2]/(this.numStops-1) + this.countRange[0]);
        }//for i

        //Create the gradient
        this.svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-traffic" + this.name)
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%")
            .selectAll("stop") 
            .data(d3.range(this.numStops))                
            .enter().append("stop") 
            .attr("offset", function(d,i) { 
                return self.countScale( self.countPoint[i] )/self.width;
            })   
            .attr("stop-color", function(d,i) { 
                return self.colorScale( self.countPoint[i] ); 
            });

        this.legendWidth = Math.min(this.width*0.8, 400);
        //Color Legend container
        this.legendsvg = this.svg.append("g")
            .attr("class", "legendWrapper")
            .attr("transform", "translate(" + (this.width/2) + "," + (this.height - 40) + ")");

        //Draw the Rectangle
        this.legendsvg.append("rect")
            .attr("class", "legendRect" + this.name)
            .attr("x", -this.legendWidth/2)
            .attr("y", 0)
            //.attr("rx", hexRadius*1.25/2)
            .attr("width", this.legendWidth)
            .attr("height", 10)
            .style("fill", "url(#legend-traffic"+this.name+")");
            
        //Append title
        this.legendsvg.append("text")
            .attr("class", "legendTitle" + this.name)
            .attr("x", 0)
            .attr("y", -10)
            .attr('font-size', '1.5em')
            .style("text-anchor", "middle")
            .text("Amount of label");

        d3.json(json_url)
            .then((data) => {
                this.graph = data;
                this.A = build_adjacency_matrix(this.graph);
                this.S = calculate_diffusion_matrix(this.A);
                this.Y = extract_initial_prediction(this.graph);
                this.Y_curr = extract_initial_prediction(this.graph);
            }).then(() => {
                this.draw_graph();
            }).then(() => {
                var t = d3.interval((e) => {this.animate(e);}, 100);
                //this.create_gif();
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

    draw_graph(){

        // calculate the right radius and force for the size of the plot
        // I know that r=20 works for width=750, and I assume the plot is a square
        var proportion = this.width/750.0;
        var radius = 20 * proportion;
        var force = -800 * proportion;


        this.simulation = d3.forceSimulation(this.graph.nodes)
            .force("link", d3.forceLink(this.graph.links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(force))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .stop();

        this.simulation.tick(300);
        //.interpolate(d3.interpolateHcl);

        this.link = this.svg.append("g")
            .attr("stroke", "#888")
            .attr("stroke-opacity", 1)
            .selectAll("line")
            .data(this.graph.links)
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
            .attr("fill",d => this.colorScale(d.label_strength))
            .attr("id", d => 'circle' + d.id)
            .attr("class", d => 'circle' + this.name)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .call(this.drag(this.simulation));

        this.node_labels = this.svg.selectAll(".text")
            .data(this.graph.nodes)
            .enter().append("text")
            .attr("class", "label" + this.name)
            .attr("text-anchor", "middle")
            .attr('dy', '.4em')
            .attr('font-size', 20)
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .text((d) => d.id)
            .call(this.drag(this.simulation));

        this.simulation.on("tick", () => {
            this.link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

            this.node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

            this.node_labels
            .attr("x", d => d.x)
            .attr("y", d => d.y);
        });

    }

    animate(elapsed){
        this.counter += 1;
        if(this.counter > this.anim_initial_frames){
            this.update_nodes();
        }
        if(this.counter >= this.anim_initial_frames + this.anim_duration){
            this.counter = 0;
            this.reset_nodes();
        }
    }

    animate_diffusion(steps=200){
        for (var i = steps - 1; i >= 0; i--) {
            this.update_nodes();
        }
    }

    update_chart(){
        assign_prediction(this.Y_curr, this.graph);
        d3.selectAll(".circle" + this.name)
            .data(this.graph.nodes)
            .attr("fill",d => this.colorScale(d.label_strength));

        let iteration = (this.counter < this.anim_initial_frames)? 0 : this.counter - this.anim_initial_frames;
        d3.selectAll(".iteration-text" + this.name)
            .text("Iteration " + iteration.toString());
    }

    update_nodes(){
        this.Y_curr = diffusion_step(this.Y_curr, this.S);
        this.update_chart();
    }

    reset_nodes(){
        this.Y_curr = this.Y;
        this.update_chart();
    }
}

let diffusion1 = new Diffusion("#demo svg", 'data/network.json', 'demo1');
let diffusion2 = new Diffusion("#demo2 svg", 'data/toy.json','demo2');