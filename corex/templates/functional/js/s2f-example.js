var svg = d3.select("#results"),
margin = {top: 20, right: 110, bottom: 110, left: 110},
width = +svg.attr("width") - margin.left - margin.right,
height = +svg.attr("height") - margin.top - margin.bottom;

var classes = {
    'HMMER':'HMMER',
    'HMMER w/ diffusion':'HMMER-diff',
    'InterPro':'InterPro',
    'InterPro w/ diffusion':'InterPro-diff',
    'InterPro + HMMER':'combination',
    'S2F':'S2F'
};

var axis_excess = 1.02;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var yAxis = d3.axisLeft();

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// create a variable that will hold the loaded data
var tsv;

var fontSize = 12;
let test = document.getElementById("Test");
test.style.fontSize = fontSize;

var labelXpos = function(d) {
    test.innerHTML = d.value.toFixed(2);
    return x(d.method) + (x.bandwidth() - test.clientWidth + 1)/2;
};

var labelYpos = function(d) {
     return y(d.value) - 25;
};


// load the data
d3.tsv("https://paccanarolab.org/static_content/s2f/data.tsv")
    .then((data) => {
        return data.map((d) => {
            d.value = +d.value;
            return d;
        })
    })
    .then((datafile) => {


        // put the original data in tsv
        tsv = datafile;

        // filter the data based on the inital value
        var data = tsv.filter(function(d) {
            var metric = d3.select("#filter-metric").property("value");
            var organism = d3.select("#filter-organism").property("value");
            return d.metric === metric && d.organism === organism;
        });

        // set the domains of the axes
        x.domain(data.map(function(d) { return d.method; }));
        y.domain([0, d3.max(data, function(d) { return d.value * axis_excess; })]);

        // add the svg elements
        g.append("g")
         .attr("class", "axis axis--x")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(x))
         .selectAll("text")
         .attr("y", 0)
         .attr("x", 9)
         .attr("transform", "rotate(45)").style("text-anchor", "start")
         .style("font-size", 15);
         //.attr("transform", "translate(0,9)");


        g.append("g")
         .attr("class", "axis axis--y")
         .call(d3.axisLeft(y).ticks(10))

        // create the bars
        g.selectAll(".bar")
         .data(data)
         .enter().append("rect")
         .attr("class", function(d) { return "bar " + classes[d.method]; })
         .attr("x", function(d) { return x(d.method); })
         .attr("y", function(d) { return y(d.value); })
         .attr("width", x.bandwidth())
         .attr("height", function(d) { return height - y(d.value); });

        g.selectAll(".text")
         .data(data)
         .enter().append("text")
         .attr("class", "label")
         .attr("x", labelXpos)
         .attr("y", labelYpos)
         .attr("dy", ".75em")
         .text(function(d) { return d.value.toFixed(2); });

        // add a change event handler
        d3.selectAll(".filter").on("change", function() {applyFilter();});


        // call this whenever the filter changes
        function applyFilter() {
            // transition
            var t = d3.transition().duration(1000);

            // filter the data
            var data = tsv.filter(function(d) {
                var metric = d3.select("#filter-metric").property("value");
                var organism = d3.select("#filter-organism").property("value");
                return d.metric === metric && d.organism === organism;
            });

            y.domain([0, d3.max(data, function(d) { return d.value * axis_excess; })]);
            yAxis.scale(y);

            g.select('.axis--y')
             .transition(t)
             .call(yAxis);

            // update the bars
            d3.selectAll(".bar")
              .data(data)
              .transition().duration(1000)
              .attr("x", function(d) { return x(d.method); })
              .attr("y", function(d) { return y(d.value); })
              .attr("height", function(d) { return height - y(d.value); });

            d3.selectAll(".label")
              .data(data)
              .transition().duration(1000)
              .attr("x", labelXpos)
              .attr("y", labelYpos)
              .text(function(d) { return d.value.toFixed(2); });
        }
    }
);
