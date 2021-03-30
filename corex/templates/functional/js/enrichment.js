
class Enrichment{
    constructor(container, library, complex_id){
        this.container = d3.select(`#${container}`);
        this.container_id = container;
        this.library = library;
        this.complex_id = complex_id;

        var margin = {top: 60, right: 30, bottom: 30, left: 40};
        this.width = 950 - margin.left - margin.right;
        this.height = 330 - margin.top - margin.bottom;
        this.bar_max_width = 150;
        this.svg = this.container.append('svg')
            .attr('width', this.width + margin.left + margin.right)
            .attr('height', this.height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        this.svg.append('text')
            .attr('x',this.bar_max_width/2)
            .attr('y',-40)
            .text('-log(Adjusted p-value)')
            .attr('text-anchor','middle')
            .style('font-size',14)
            .attr('fill', 'black');
        // this.svg.append("rect")
        //     .attr("width",this.width)
        //     .attr("height",this.height)
        //     .attr('fill', 'gray');

        this.scale = 30;
        self = this;
        this.y = d3.scaleBand().range([0, this.height]);
        this.yAxis = this.svg.append('g')
            .attr("transform", "translate(0,0)");
        this.x = d3.scaleLinear().range([0, this.bar_max_width]);
        this.xAxis = this.svg.append("g")
            .attr("transform", "translate(0,0)");
        this.data;
        this.colorScale = d3.scalePow()
            //.exponent(2.42)
            //.domain([0,1])
            .range(["#ddd","#23CB87"]);

        this.applyFilter();
    }

    drawEnrichment(){
        var metric = 'Adjusted p-value';
        
        var curr_data=this.data.enrichment.filter(d => d.library == this.library)[0].enrichment
            .sort((a,b) => a[metric] - b[metric]);
        var max_metric = d3.max(curr_data.map(d => -Math.log(d[metric])));
        var min_metric = d3.min(curr_data.map(d => 1-d[metric]));
        this.colorScale.domain([0, max_metric]);

        //this.x.domain([0, max_metric]);
        this.x.domain([0, max_metric]);
        this.xAxis.transition()
            .duration(1000)
            .call(d3.axisTop(this.x))
            .selectAll('text')
            .attr('y', 0)
            .attr('x', 10)
            .attr('dy', '.35em')
            .attr('transform','rotate(-90)')
            .style('text-anchor', 'start');
        
        this.y.domain(curr_data.map((d, i) => i+1));
        this.yAxis.transition()
             .duration(1000)
             .call(d3.axisLeft(this.y));
        
        var b = this.svg.selectAll(".enrichment_data")
            .data(curr_data);

        var enter = b.enter()
            .append('g').attr("class","enrichment_data").merge(b);        
        
        enter.append('rect').attr('class', 'bar');
        enter.select('.bar').transition().duration(1000)
            .attr('y',1)
            .attr('transform', (d, i) => `translate(1,${this.y(i+1)})`)
            .attr("width", d => this.x(-Math.log(d[metric])))
            .attr("height", this.y.bandwidth()-1)
            .style('fill', d => this.colorScale(-Math.log(d[metric])));
        
        enter.append('text').attr('class', 'text');
        enter.select('.text').transition().duration(1000)
            .attr('y', (d, i) => this.y(i+1) + this.y.bandwidth()/2 + 3)
            .attr('x', d => this.x(-Math.log(d[metric])) + 10)
            .attr('fill',"gray")
            .attr('text-anchor','left')
            .attr('alignment-baseline','middle')
            //.text(d => d['Term name'] + `${metric}: (${d[metric]})`);
            .text(d => d['Term name']);

        b.exit().remove();
    }

    applyFilter(){
        this.data = complexData.filter((d) => {
            return d.complex_id == this.complex_id;
        })[0];
        this.drawEnrichment();
    }
}

