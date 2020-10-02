
class Adjacency{

    constructor(container, n_rows, n_columns, binary = false, adjacency = false, th=0.5){
        this.container = d3.select(`#${container}`);
        this.container_id = container;
        this.width = this.height = 300;
        this.svg = this.container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        this.svg.append("rect")
            .attr("width",this.width)
            .attr("height",this.height)
            .attr('fill', 'gray');

        this.scale = 30;
        var self = this;
        this.r = n_rows;
        this.c = n_columns;
        this.th = th;

        if(!adjacency){
            this.adjacency = math.zeros(this.r, this.c)
            this.populateMatrix()
        }else{
            this.adjacency = adjacency;
        }

        this.colorScale = d3.scalePow()
            //.domain([0, d3.max(accidents, function(d) {return d.count; })/2, d3.max(accidents, function(d) {return d.count; })])
            .exponent(2.42)
            .domain([0,  1])
            .range(["#ddd","#23CB87"]);
            
            // DIEGO
            //.domain([0, 0.25, 0.75, 1])
            //.range(["white","yellow","orange", "red"]);

            // DIEGO 2
            //.domain([0, 1])
            //.range(["white", "red"]);

            //.domain([0, 0.25, 0.6, 1])
            //.range(["#c67727", "#a9db3d", "#26ebbd"]);

        this.drawMatrix(binary);
        this.bindSavePNG();

    }

    populateMatrix(){
        for (let x = 0; x < this.r; x++) {
            for (let y = x; y < this.c; y++) {
                let strength = (x != y)? Math.random() : 0;
                this.adjacency.set([x, y], strength);
                if(x != y) this.adjacency.set([y, x], strength);
            }
        }
    }

    drawMatrix(binary = true){
        let newx = this.width/2 - this.c/2 * this.scale
        let newy = this.height/2 - this.r/2 * this.scale
        this.gGrid = this.svg.append('g')
            .attr('transform', `translate(${newx}, ${newy})`);
        for (let x = 0; x < this.r; x++) {
            for (let y = 0; y < this.c; y++) {
                let strength = this.adjacency.get([x, y]);
                strength = (strength > this.th)? strength : 0;
                if(binary) strength = (strength > this.th)? 1 : 0;
                this.gGrid.append('rect')
                    .attr('transform', `translate(${x*this.scale}, ${y*this.scale})`)
                    .attr('width', this.scale)
                    .attr('height', this.scale)
                    .attr('fill', this.colorScale(strength))
                    .attr('stroke', 'white');
            }
        }
    }

    bindSavePNG(){
        d3.select(`#${this.container_id}-btn`)
            .on('click', () => {saveSvgAsPng(this.svg.node(), `${this.container_id}.png`);})
    }
}

let adj1 = new Adjacency('adj-binary', 10, 10, true);
let adj2 = new Adjacency('adj-weighted', 10, 10, false, adj1.adjacency, 0.5);
let adj3 = new Adjacency('adj-rebinary', 10, 10, true, adj1.adjacency, 0.8);
