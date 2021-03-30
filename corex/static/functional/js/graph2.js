
var graph;
var A; // adjacency matrix
var S; // diffusion matrix
var Y; // initial labelling
var Y_curr; // current labelling
var counter = 0;
var anim_duration = 150;
var anim_initial_frames = 10;
var frames = anim_duration + anim_initial_frames;
var duration = 700;

var width = 750;
var height = 750;

let svg = d3.select("#demo svg")
    .attr("width",width)
    .attr("height",height);


svg.append("rect")
    .attr("width",width)
    .attr("height",height)
    .attr('fill', '#fff');

svg.append(() => { return document.getElementById("chart-style"); });
///////////////////////////////////////////////////////////////////////////
//////////////// Create the gradient for the graph ///////////////////////
///////////////////////////////////////////////////////////////////////////

var colorScale = d3.scaleLinear()
    //.domain([0, d3.max(accidents, function(d) {return d.count; })/2, d3.max(accidents, function(d) {return d.count; })])
    .domain([0, 0.25, 0.6, 1])
    //.range(["#c67727", "#a9db3d", "#26ebbd"]); // twitter gif
    .range(["#ED7D31","#5B9BD5","#23CB87", "#23CB87"]);
    // .range(["#e3e3e3", "#2de3c5", "#24d169"]);

///////////////////////////////////////////////////////////////////////////
//////////////// Create the gradient for the legend ///////////////////////
///////////////////////////////////////////////////////////////////////////

//Extra scale since the color scale is interpolated
var countScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width])

//Calculate the variables for the temp gradient
var numStops = 10;
countRange = countScale.domain();
countRange[2] = countRange[1] - countRange[0];
countPoint = [];
for(var i = 0; i < numStops; i++) {
    countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
}//for i

//Create the gradient
svg.append("defs")
    .append("linearGradient")
    .attr("id", "legend-traffic")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop") 
    .data(d3.range(numStops))                
    .enter().append("stop") 
    .attr("offset", function(d,i) { 
        return countScale( countPoint[i] )/width;
    })   
    .attr("stop-color", function(d,i) { 
        return colorScale( countPoint[i] ); 
    });

//Append title
svg.append("text")
    .attr("class", "iteration-text")
    .attr("x", width/2)
    .attr("y", 50)
    .style("text-anchor", "middle")
    .attr('font-size', '1.5em')
    .text("Iteration 0");

///////////////////////////////////////////////////////////////////////////
////////////////////////// Draw the legend ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var legendWidth = Math.min(width*0.8, 400);
//Color Legend container
var legendsvg = svg.append("g")
    .attr("class", "legendWrapper")
    .attr("transform", "translate(" + (width/2) + "," + (height - 40) + ")");

//Draw the Rectangle
legendsvg.append("rect")
    .attr("class", "legendRect")
    .attr("x", -legendWidth/2)
    .attr("y", 0)
    //.attr("rx", hexRadius*1.25/2)
    .attr("width", legendWidth)
    .attr("height", 10)
    .style("fill", "url(#legend-traffic)");
    
//Append title
legendsvg.append("text")
    .attr("class", "legendTitle")
    .attr("x", 0)
    .attr("y", -10)
    .attr('font-size', '1.5em')
    .style("text-anchor", "middle")
    .text("Amount of label");



///////////////////////////////////////////////////////////////////////////
//////////////// CHART ///////////////////////
///////////////////////////////////////////////////////////////////////////

function draw_graph(){
    const simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .stop();

    simulation.tick(300);
    //.interpolate(d3.interpolateHcl);

    const link = svg.append("g")
        .attr("stroke", "#888")
        .attr("stroke-opacity", 1)
        .selectAll("line")
        .data(graph.links)
        .join("line")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .attr("stroke-width", d => d.weight * 5.5);

    const node = svg.append("g")
        .attr("stroke", "#888")
        .attr("stroke-width", 4.5)
        .selectAll("circle")
        .data(graph.nodes)
        .join("circle")
        .attr("r", 20)
        .attr("fill",d => colorScale(d.label_strength))
        .attr("id", d => 'circle' + d.id)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .call(drag(simulation));

    const node_labels = svg.selectAll(".text")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr('dy', '.4em')
        .attr('font-size', 20)
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .text((d) => d.id)
        .call(drag(simulation));

    simulation.on("tick", () => {
        link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

        node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

        node_labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    d3.select("#next-step").on("click", () => update_nodes());
    d3.select("#reset").on("click", () => reset_nodes());
}


var drag = simulation => {
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
};

function animate_diffusion(steps=200){
    for (var i = steps - 1; i >= 0; i--) {
        update_nodes();
    }
}

function update_chart(){
    assign_prediction(Y_curr);
    d3.selectAll("circle")
        .data(graph.nodes)
        .attr("fill",d => colorScale(d.label_strength));

    d3.selectAll(".iteration-text")
        .text("Iteration " + ((counter < anim_initial_frames)? 0 : counter - anim_initial_frames).toString());
}

function update_nodes(){
    Y_curr = diffusion_step(Y_curr);
    update_chart();
}

function reset_nodes(){
    Y_curr = Y;
    update_chart();
}


function create_gif(){
    var gif = new GIF({
        workers: 3,
        quality: 1,
        repeat: 0
    });

    gif.on("progress",function(p){

        //drawFrame(p * duration);

        d3.select(".gif").text(d3.format("%")(p) + " rendered");

    });

    gif.on("finished",function(blob){

        d3.select(".gif")
            .text("")
            .append("img")
            .attr("src",URL.createObjectURL(blob));

        gif_created = true;

        var t = d3.interval(animate, 20);
    });

    // Sequential queue to ensure frames are added in order
    // Probably not necessary but onload behavior is a little unpredictable
    var q = queue(1);

    // Queue up frames to add to gif stack
    d3.range(frames).forEach(function(f){
        q.defer(addFrame,f * duration / (frames - 1));
    });

    // Once all frames are added
    q.awaitAll(function(){

        // Show SVG as progress bar
        svg.style("display","block");

        // Start web workers
        gif.render();

    });

    // Add a frame for time t
    function addFrame(t,cb) {

        // Update SVG
        animate();
        // Create a blob URL from SVG
        // including "charset=utf-8" in the blob type breaks in Safari
        var img = new Image(),
        serialized = new XMLSerializer().serializeToString(svg.node()),
        sv = new Blob([serialized], {type: "image/svg+xml"}),
        url = URL.createObjectURL(sv);

        // Onload, callback to move on to next frame
        img.onload = function(){

            gif.addFrame(img, {
            delay: duration / frames,
            copy: true
            });

            cb(null,t);
        };

        img.src = url;
    }
}

function animate(elapsed){
    counter += 1;
    if(counter > anim_initial_frames){
        update_nodes();
    }
    if(counter >= anim_initial_frames + anim_duration){
        counter = 0;
        reset_nodes();
    }
}





d3.json('data/network.json')
    .then((data) => {
        graph = data;
        A = build_adjacency_matrix(graph);
        S = calculate_diffusion_matrix(A);
        Y = extract_initial_prediction(graph);
        Y_curr = extract_initial_prediction(graph);
    }).then(() => {
        draw_graph();
    }).then(() => {
        //var t = d3.interval(animate, 20);
        create_gif();
    });

// math part 
const sum = math.sum;

var alpha = 5/100.0;

function diffusion_step(Y){
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

function build_adjacency_matrix(data, flow_factor = 5.0){
    A = math.zeros(data.nodes.length, data.nodes.length);
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

function assign_prediction(Y){
    y_min = math.min(Y);
    y_max = math.max(Y);
    for (var i = graph.nodes.length - 1; i >= 0; i--) {
        graph.nodes[i].label = Y.get([i, 0]) > 0;
        strength = map_range(Y.get([i, 0]), y_min, y_max);
        graph.nodes[i].label_strength = graph.nodes[i].label? strength : 0 ;
    }
}

function map_range(x, in_min, in_max, out_min=0.1, out_max=1.0) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}