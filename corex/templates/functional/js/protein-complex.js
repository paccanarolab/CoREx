var atc_names = {
    'A':'Alimentary tract and metabolism',
    'B':'Blood and blood forming organs',
    'C':'Cardiovascular system',
    'D':'Dermatologicals',
    'G':'Genito-urinary system and sex hormones',
    'H':'Systemic hormonal preparations',
    'J':'Antiinfectives for systemic use',
    'L':'Antineoplastic and immunomodulating',
    'M':'Musculo-skeletal system',
    'N':'Nervous system',
    'P':'Antiparasitic, insecticides, repellents',
    'R':'Respiratory system',
    'S':'Sensory organs',
    'V':'Various'
};
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

const cmap_domain = [-100, 0, 100];
const cmap_colours = ["rgb(255, 132, 132)", "#ddd", "rgb(132, 255, 132)"];
const drug_highlight = "rgb(255,80,80)";
const other_drug = 'rgb(173, 219, 255)';



class ProteinComplex{
    constructor(container, complex_id){
        this.container = d3.select(`#${container}`);

        this.margin = {top: 10, right: 10, bottom: 30, left: 0};
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 1080 - this.margin.top - this.margin.bottom;
        this.max_ppi_width = 390;
        this.max_ppi_height = 600;
        this.y_start_drugs = 190;
        this.x_start_drugs = this.max_ppi_width + 70;

        this.CMAP_tissues = [
            'Lung (H1299)',
            'Lung (A549)',
            'Lung (NHBE)',
            'Lung (Calu-3)',
            'Colon (Caco-2)'];

        this.CMAPcolorScale = d3.scaleLinear()
            .domain(cmap_domain)
            .range(cmap_colours);

        this.symbols = d3.symbol().size(300);

        this.complex_id = complex_id;
        this.data;
        this.graph;
        this.applyFilter();
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
        d.targeted_by.forEach(drug => {
            this.svg
                .select(`#${this.complex_id}-${drug.drug}`)
                .attr('class', `drug_bg type-${d.is_covid?'covid':''}-${d.this_drug?'drug':''}-${d.any_drug?'other':''}`);
        });
        this.svg
            .select(`#node_label-${this.complex_id}-${d.id}`)
            //.attr('stroke', 'white')
            .attr('fill', 'black');
    }

    protein_mouseout(d){
        d.targeted_by.forEach(drug => 
            this.svg.select(`#${this.complex_id}-${drug.drug}`)
                .attr('class', 'drug_bg')
        );
        this.svg
            .select(`#node_label-${this.complex_id}-${d.id}`)
            .attr('stroke', 'transparent')
            .attr('fill', 'transparent');
    }

    plot_graph(){
        var proportion = this.width/750.0;
        var radius = 10;
        var force = -200 * proportion;

        var possible_nodes = [
            //{class:'covid-drug-other', name:`SARS-CoV-2 host targeted by ${this.data.drug_name} and other drugs`},
            //{class:'covid-drug-', name:`SARS-CoV-2 host targeted by ${this.data.drug_name}`},
            //{class:'covid--other', name:'SARS-CoV-2 host targeted by other drugs'},
            //{class:'covid--', name:'SARS-CoV-2 host protein'},
            //{class:'-drug-other', name:`targeted by ${this.data.drug_name} and other drugs`},
            {class:'-drug-', name:`Targeted by ${drug}`},
            {class:'--other', name:'Targeted by other drug'},
            {class:'--', name:'Other protein'}
        ];

        var labels = this.svg.selectAll('.labels')
            .data(possible_nodes)
            .enter()
            .append('g').attr('class', 'labels');
        labels.append('rect')
            .attr('class', d=>`type-${d.class}`)
            .attr('x', 0)
            .attr('y', (d,i)=> 17*i)
            .attr('width',15)
            .attr('height',15);
        labels.append('text')
            .attr('x', 20)
            .attr('y', (d,i)=> 17*i + 12)
            .attr('text-anchor','start')
            .attr('fill','gray')
            .text(d => d.name);

        var node_types = [
            {name:'SARS-CoV-2 host Proteins', symbol:d3.symbolDiamond, class:'type-covid--'},
            {name:'Other proteins', symbol:d3.symbolCircle, class:'type---'}
        ]

        var node_types = this.svg.selectAll('.nodetypes')
            .data(node_types)
            .enter()
            .append('g')
            .attr('class', 'nodetypes')
            .attr('transform','translate(200,0)');

        node_types.append('path')
            .attr("stroke", "#222")
            .attr("stroke-width",3)
            .attr("d", this.symbols.type(d => d.symbol))
            .attr('transform', (d, i) => `translate(0,${10 + 40 * i})`)
            .attr('fill', 'transparent');
            //.attr('class', d => d.class);
        node_types.append('text')
            .attr('x',20)
            .attr('y',(d, i) => 14 + 40 * i)
            .attr('fill','gray')
            .text(d => d.name);
        


        this.simulation = d3.forceSimulation(this.data.proteins)
            .force("link", d3.forceLink(this.data.interactions).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(force))
            .force("center", d3.forceCenter(this.max_ppi_width / 2, this.max_ppi_height / 2));
//            .stop();

        //.interpolate(d3.interpolateHcl);

        var links = this.svg.selectAll(".links")
            .data(this.data.interactions);


        this.link = links.enter()
            .append('g')
            .attr('class', 'links').merge(links);
        
        var nodes = this.svg.selectAll(".nodes")
            .data(this.data.proteins);

        this.node = nodes.enter()
            .append('g')
            .attr('class', 'nodes').merge(nodes)
            .on('mouseover', d => this.protein_hover(d))
            .on('mouseout', d => this.protein_mouseout(d))
            .attr("cx", d => d.x = Math.max(radius, Math.min(this.max_ppi_width - radius, d.x)))
            .attr("cy", d => d.y = Math.max(radius, Math.min(this.max_ppi_height - radius, d.y)))
            .call(this.drag(this.simulation));
        
        this.link.append('line').attr('class', 'link');
        this.link.select('.link')
            .attr("stroke", "#888")
            .attr("stroke-opacity", d => d.weight)
            .join("line")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
            .attr("stroke-width", d => 5 * d.weight)
            .attr("alpha", d => d.weight);
        
        this.node.append('path').attr('class', 'node');
        this.node.select(".node")
            .attr('class', d => `node type-${d.is_covid?'covid':''}-${d.this_drug?'drug':''}-${d.any_drug?'other':''}`)
            .attr("stroke", "#222")
            .attr("stroke-width",3)
            .attr("d", this.symbols.type(d => d.is_covid?d3.symbolDiamond:d3.symbolCircle))
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



        //this.simulation.run();
        

        this.simulation.on("tick", () => {

            this.node.select('.node')
            .attr('transform', d => {
                d.x = Math.max(radius, Math.min(this.max_ppi_width - radius, d.x));
                d.y = Math.max(radius, Math.min(this.max_ppi_height - radius, d.y));
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

    plot_drugs(){
        var drug_name_x = this.x_start_drugs + (this.CMAP_tissues.length + 1) * 15 + 8;
        //plot names and stuff
        this.svg.append('text')
            .attr('x', drug_name_x)
            .attr('y', this.y_start_drugs - 20)
            .style('font-size','24px')
            .text('Drug');

        this.svg.append('text')
            .attr("x", this.x_start_drugs + 3.5*15)
            .attr("y", this.y_start_drugs - 180)
            .attr('text-anchor', 'middle')
            .text('CMAP scores');
        
        this.svg.append('text')
            .attr("x", this.x_start_drugs + 15)
            .attr("y", this.y_start_drugs - 165)
            .attr('text-anchor', 'middle')
            .text('-100');
        
        this.svg.append('text')
            .attr("x", this.x_start_drugs + 6*15)
            .attr("y", this.y_start_drugs - 165)
            .attr('text-anchor', 'middle')
            .text('100');

        this.svg.append("rect")
            .attr("class", "legendRect")
            .attr("x", this.x_start_drugs + 15)
            .attr("y", this.y_start_drugs - 160)
            .attr("width", 15*5)
            .attr("height", 13)
            .style("fill", "url(#cmap-gradient)");
        

        var involved_drugs = this.svg.selectAll('.drugs')
            .data(this.data.involved_drugs.sort((a,b)=> b.cmap.length - a.cmap.length));
        
        var drug_el = involved_drugs.enter()
            .append('g').attr('class', 'drugs')
            .on('mouseover', d => {
                this.svg.select(`#${this.complex_id}-${d.drug}`)
                    .attr('fill', drug_highlight);
                d.targets.forEach(prot => {
                    this.svg
                        .select(`#node-${this.complex_id}-${prot}`)
                        .attr('stroke', drug_highlight);
                })
            })
            .on('mouseout', d => {
                this.svg.select(`#${this.complex_id}-${d.drug}`)
                    .attr('fill', 'transparent');
                d.targets.forEach(prot => {
                    this.svg
                        .select(`#node-${this.complex_id}-${prot}`)
                        .attr('stroke', '#222');
                })
            });

        drug_el.append('rect').attr('class', 'drug_bg');
        drug_el.select('.drug_bg')
            .attr('x', this.x_start_drugs)
            .attr('y', (d,i) => this.y_start_drugs + 18*i - 12)
            .attr('id', d => `${this.complex_id}-${d.drug}`)
            .attr('fill', 'transparent')
            .attr('height', 15)
            .attr('width', this.width - this.x_start_drugs);
    
        for (let tissue = 0; tissue < this.CMAP_tissues.length; tissue++) {
            const element = this.CMAP_tissues[tissue];
            var x = this.x_start_drugs + (tissue+1) * 15;
            var y = this.y_start_drugs - 5;
            this.svg.append('text')
                .attr('transform', `rotate(-90 ${x} ${y})`)
                .attr('x', x + 15)
                .attr('y', y + 10)
                .text(`CMAP ${element}`);

            drug_el.append('rect').attr('class', `cmap_t${tissue}`);
            drug_el.select(`.cmap_t${tissue}`)
                .attr('x', x)
                .attr('y', (d,i) => this.y_start_drugs + 18*i - 12 + 1)
                .attr('height', 13)
                .attr('width', 13)
                .attr('fill', d => {
                    if(d.cmap.length > 0){
                        var cmap_tissue = d.cmap.filter(t => {return t.tissue == element;});
                        if(cmap_tissue.length > 0){
                            return this.CMAPcolorScale(cmap_tissue[0].score);
                        }
                    }
                    return 'transparent';
                });
        }
        
        //var clinical_trial_x = this.x_start_drugs + (this.CMAP_tissues.length + 1) * 15 + 5;
        var clinical_trial_x = drug_name_x + 300;
        this.svg.append('text')
            .attr('transform', `rotate(-90 ${clinical_trial_x} ${y})`)
            .attr('x', clinical_trial_x + 15)
            .attr('y', y + 12)
            .style('font-size','15px')
            .text('COVID-19 Clinical Trial');
        drug_el.append('rect').attr('class','clinical_trial');
        drug_el.select('.clinical_trial')
            .attr('x', clinical_trial_x)
            .attr('y', (d,i) => this.y_start_drugs + 18*i - 12 + 1)
            .attr('height', 13)
            .attr('width', 13)
            .attr('fill', d => d.clinical_trial?'rgb(137, 212, 255)':'#ddd');


        drug_el.append('text').attr('class', 'drug');
        drug_el.select('.drug')
            .attr('x', drug_name_x)
            .attr('y', (d,i) => this.y_start_drugs + 18*i)
            .attr('fill', d => d.drug == drug? '#23CB87': 'black')
            //.attr('id', d => `${this.complex_id}-${d.drug}`)
            .text(d => `${d.name} (${d.drug})`);
    }

    plot_atc(){
        var atc_freqs = this.data.atcs.map(d => {
            var drugs_in_atc = this.data.involved_drugs.filter(dr => dr.atc.includes(d));
            return {atc:atc_names[d], freq:drugs_in_atc.length};
        }).sort((a,b) => a.freq - b.freq).reverse();

        var bar_width = 20;
        var y_start = this.max_ppi_height + 60;
        var x_start = 230;
        var max_atc_freq = d3.max(atc_freqs.map(d => d.freq));

        this.svg.append('text')
            .attr('x',(this.max_ppi_width - 20)/2)
            .attr('y',this.max_ppi_height + 5)
            .text('ATC category distribution')
            .attr('text-anchor','middle')
            .style('font-size',14)
            .attr('fill', 'black');

        this.svg.append('text')
            .attr('x',x_start + (this.max_ppi_width - 20 - x_start)/2)
            .attr('y',this.max_ppi_height + 25)
            .text('Number of drugs')
            .attr('text-anchor','middle')
            .style('font-size',14)
            .attr('fill', 'black');

        var atc_x = d3.scaleLinear()
            .range([x_start, this.max_ppi_width - 20])
            .domain([0, max_atc_freq]);
        var atc_xAxis = this.svg.append('g')
            .attr('transform', `translate(0,${y_start})`)
            .call(
                d3.axisTop(atc_x)
                .tickFormat(e => {
                    if(Math.floor(e) != e){
                        return;
                    }
                    return e;
                }))
            .selectAll('text')
            .attr('y', 0)
            .attr('x', 10)
            .attr('dy', '.35em')
            .attr('transform','rotate(-90)')
            .style('text-anchor', 'start');

        var colorScale = d3.scalePow()
            .domain([0,max_atc_freq])
            .range(["#ddd","rgb(89, 168, 230)"]);


        var atc_y = d3.scaleBand()
            .range([y_start, y_start + this.data.atcs.length * bar_width])
            .domain(atc_freqs.map(d => d.atc));
        var atc_yAxis = this.svg.append('g')
            .attr('transform', `translate(${x_start},0)`)
            .call(d3.axisLeft(atc_y));

        var atcs = this.svg.selectAll('.ATCS')
            .data(atc_freqs);

        var atc_el = atcs.enter()
            .append('g').attr('class', 'ATCS');
        atc_el.append('rect').attr('class', 'atc');
        atc_el.select('.atc')
            .attr('y',d => atc_y(d.atc))
            .attr('x',x_start+1)
            .attr('width', d => atc_x(d.freq) - atc_x(0))
            .attr('height', atc_y.bandwidth()-1)
            .attr('fill', d => colorScale(d.freq));
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
        this.svg = this.container.append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);    
    
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