

var dataset = {
    scores: [0.41729665, 0.46513592, 0.24792075, 0.6228784 , 0.18824286,
       0.07326773, 0.38964913, 0.5062214 , 0.39690477, 0.25293349,
       0.48356358, 0.49589857, 0.24960983, 0.54581809, 0.51318723,
       0.21157546, 0.24875134, 0.39053992, 0.35951289, 0.41297357,
       0.0813695 , 0.36628587, 0.41512282, 0.24168851, 0.24859984,
       0.42428687, 0.36851759, 0.50857803, 0.48785024, 0.63510646,
       0.28692112, 0.14940582, 0.50589667, 0.753637  , 0.02057883,
       0.54295401, 0.53834376, 0.52463686, 0.54987006, 0.57946855,
       0.31768164, 0.28686909, 0.47690484, 0.43270458, 0.33367461,
       0.36449497, 0.12432987, 0.37078744, 0.27490651, 0.27950516,
       0.30747635, 0.32511824, 0.26278265, 0.31905586, 0.66380093,
       0.20415214, 0.51477772, 0.52828716, 0.        , 0.12860137,
       0.45926274, 0.45170914, 0.47329712, 0.24655003, 0.39051246,
       0.42379439, 0.46066435, 0.52812575, 0.42328515, 0.33681331,
       0.43884972, 0.34209175, 0.42113293, 0.70503967, 0.56418495,
       0.40227289, 0.52158978, 0.41813767, 0.35739242, 0.17087664,
       0.16498712, 0.32913669, 0.29114218, 0.53513855, 0.62819716,
       0.13075977, 0.22262584, 0.48605925, 0.31336432, 0.39183382,
       0.58202277, 0.30724655, 0.54397435, 0.35838728, 0.3402791 ,
       0.12407349, 0.42543813, 0.22124955, 0.41641119, 0.12578895,
       0.99410314, 0.97563412, 0.93386447, 0.84312389, 0.89596327,
       0.58170022, 0.54947059, 1.        , 0.79659862, 0.79910984],
    labels: [0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
       0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
       0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
       0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
       0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 1., 0., 0., 0., 0., 0., 0.,
       0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 1., 1.,
       1., 1., 0., 1., 1., 1., 1., 1.]
};


function area_under_curve(points){
    var area = 0;
    for (var i = 0; i < points.length - 1; i++) {
        dx = points[i+1].x - points[i].x;
        area += 0.5*(points[i+1].y + points[i].y)*dx;
    }
    return area;
}

class LineDiagram{

    constructor(container, labels, legend_pos){
        this.margin = {top: 30, right: 20, bottom: 70, left: 70};
        this.labels = labels;
        this.legend_pos = legend_pos;
        this.container = d3.select(`#${container}`);
        this.container_id = container;
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 700 - this.margin.top - this.margin.bottom;
        this.svg = this.container.append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Add X axis
        this.x = d3.scaleLinear()
            .domain([0, 1])
            .range([ 0, this.width ]);
        
        this.svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x))
            .append("text")
            .attr("x", this.width / 2)
            .attr("y", 50 )
            .style("text-anchor", "middle")
            .text(labels.x);

        // Add Y axis
        this.y = d3.scaleLinear()
            .domain([0, 1])
            .range([ this.height, 0]);
        
        this.svg.append("g")
            .call(d3.axisLeft(this.y))
            .append("text")            
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.margin.left + 10 )
            .attr("x", 0 - this.height/2 )
            //.attr("x", 0 - this.height/1.6 )
            //.style("font-size","12px")              
            .style("text-anchor", "middle")
            .text(labels.y);

        this.charts = [];
        this.bindSavePNG();

    }

    bindSavePNG(){
        d3.select(`#${this.container_id}-btn`)
            .on('click', () => {saveSvgAsPng(this.svg.node(), `${this.container_id}.png`);})
    }

    add_path(points, path_color, point_color, point_radius = 1.5, draw_points = true){

        let g = this.svg.append('g'); 

        g.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", path_color)
            .attr("stroke-width", 2.5)
            .attr("d", d3.line()
                .x((p) => this.x(p.x) )
                .y((p) => this.y(p.y) )
            );

        let area = area_under_curve(points);
        g.append('text')
            .attr('x', this.x(this.legend_pos.x))
            .attr('y', this.y(this.legend_pos.y) + 20*this.charts.length)
            .style('fill', path_color)
            .text(`area = ${area.toFixed(2)}`);

        if(draw_points)
            g.append("g")
                .selectAll('dot')
                .data(points)
                .enter()
                .append('circle')
                .attr('cx', (p) => this.x(p.x))
                .attr('cy', (p) => this.y(p.y))
                .attr('r', point_radius)
                .style('fill', point_color);

        this.charts.push(g);
    }
}

class PR{
    constructor(container, dataset){
        this.dataset = dataset;
        this.labels = {
            y: 'Precision',
            x: 'Recall'
        };
        this.pos = math.sum(this.dataset.labels);
        this.neg = this.dataset.labels.length - this.pos;
        
        this.ths = [...new Set(this.dataset.scores)].sort().reverse();
        this.ths_10 =  [0.0, 0.1, 0.2, 0.3, 0.4, 1.0].reverse();
        this.ths_10b = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].reverse();
        
        this.roc = this.get_pr_curve(this.ths);
        this.roc_10 = this.get_pr_curve(this.ths_10);
        this.roc_10b = this.get_pr_curve(this.ths_10b);

        this.diagram = new LineDiagram(container, this.labels, {x:0.1, y:0.4});
        var a = ["#ED7D31","#5B9BD5","#23CB87", "#23CB87"];
        this.diagram.add_path(this.roc, '#23CB87', '#23CB87', 3);
        this.diagram.add_path(this.roc_10b, '#5B9BD5', 'cyan', 3);
        this.diagram.add_path(this.roc_10, '#ED7D31', 'pink', 3);
    }

    get_pr_curve(ths){
        var pre = [];
        var rec = [];
        for (var i = ths.length - 1; i >= 0; i--) {
            var tp = [];
            var fp = [];
            for (var j = this.dataset.scores.length - 1; j >= 0; j--) {
                if(this.dataset.scores[j] > ths[i]){
                    if(this.dataset.labels[j] == 1.){
                        tp.push(j);
                    }else{
                        fp.push(j);
                    }
                }
            }
            if(tp.length + fp.length > 0){
                pre.push(tp.length / (tp.length + fp.length));
                rec.push(tp.length / this.pos);
            }
        }
        var data = [];
        for (var i = rec.length - 1; i >= 0; i--) {
            data.push({x:rec[i], y:pre[i]});
        }
        return data;
    }
}

class ROC{
    constructor(container, dataset){
        this.dataset = dataset;
        this.labels = {
            y: 'True Positive Rate',
            x: 'False Positive Rate'
        };
        this.pos = math.sum(this.dataset.labels);
        this.neg = this.dataset.labels.length - this.pos;
        
        this.ths = [...new Set(this.dataset.scores)].sort().reverse();
        this.ths_10 =  [0.0, 0.1, 0.2, 0.3, 0.4, 0.9, 1.0].reverse();
        this.ths_10b = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].reverse();
        
        this.roc = this.get_roc_curve(this.ths);
        this.roc_10 = this.get_roc_curve(this.ths_10);
        this.roc_10b = this.get_roc_curve(this.ths_10b);

        this.diagram = new LineDiagram(container, this.labels, {x:0.8, y:0.4});
        var a = ["#ED7D31","#5B9BD5","#23CB87", "#23CB87"];
        this.diagram.add_path(this.roc, '#23CB87', '#23CB87', 3);
        this.diagram.add_path(this.roc_10b, '#5B9BD5', 'cyan', 3);
        this.diagram.add_path(this.roc_10, '#ED7D31', 'pink', 3);
    }

    get_roc_curve(ths){
        var tpr = [];
        var fpr = []
        for (var i = ths.length - 1; i >= 0; i--) {
            var tp = [];
            var fp = [];
            for (var j = this.dataset.scores.length - 1; j >= 0; j--) {
                if(this.dataset.scores[j] > ths[i]){
                    if(this.dataset.labels[j] == 1.){
                        tp.push(j);
                    }else{
                        fp.push(j);
                    }
                }
            }
            tpr.push(tp.length / this.pos);
            fpr.push(fp.length / this.neg);
        }
        var data = [];
        for (var i = fpr.length - 1; i >= 0; i--) {
            data.push({x:fpr[i], y:tpr[i]});
        }
        return data;
    }
}

var roc = new ROC('roc-curve', dataset);
var pr = new PR('pr-curve', dataset);