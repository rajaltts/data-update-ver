import React from 'react';
import { Col, Row, Descriptions, Button, Checkbox ,Skeleton, Layout} from 'antd';
import 'antd/dist/antd.css';
import axios from '../axios-orders';
import PlotCurve from '../components/PlotCurveComponent/PlotCurve';
import "../App.css";
import DragNDrop  from '../components/DragNDrop/DragNDrop.js'

const colors =["#e51c23", // red
"#3f51b5", // indigo
"#259b24", // green
"#9c27b0", // purple
"#00bcd4", // cyan
"#795548", // brown
"#827717", // dark lime
"#607d8b", // blue grey
"#e91e63", // pink
"#009688", // teal
"#673ab7", // deep purple

"#b0120a", // dark red
"#1a237e", // dark indigo
"#0d5302", // dark green
"#bf360c", // dark orange
"#4a148c", // dark purple
"#006064", // dark cyan
"#3e2723", // dark brown
"#263238", // dark grey
"#880e4f", // dark pink
"#004d40", // dark teal
"#311b92", // dark deep purple
"#ff5722", // dark orange (yellow)
//        "#b0120a", // light red
"#5677fc", // light blue
"#8bc34a", // light green
"#ef6c00", // light orange
"#ab47bc", // light purple
//        "#b0120a", // light cyan
"#8d6e63", // light brown
"#78909c", // light grey
//        "#b0120a", // light teal
"#b0120a", // light pink
"#7e57c2", // light deep purple
];

class DefineGroups extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            groups:[],
            selectedCurves:[],
            selectedPropDef:[],
            groupSelected:[0],
            loadCurve: false,
        }
        this.getCurves = this.getCurves.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
        this.sendData = this.sendData.bind(this);
        this.handlePrevious = this.handlePrevious.bind(this);
        this.callbackFunction = this.callbackFunction.bind(this);
    }

    handlePrevious() {
        let json = {
            current: 0,
            previous: true,
            selectedCurves: this.state.selectedCurves,
            groups: this.state.groups,
            type: this.state.xyDisplayScale,
            xtype: this.state.xtype,
            xunit: this.state.xunit,
            ytype: this.state.ytype,
            yunit: this.state.yunit,
            groupSelected:this.state.groupSelected,		
            selected_group: 0,
        }
        this.sendData(json);
    }

    handleNext() {
        let treeGroup = [];
        let keysGroup = [];
        const items = this.state.groups.map((group,index) =>{
            let groupNode = {};
            let id = group.id;
            let name = group.label
            let curves =[];
            groupNode.key = (index)+"-0";
            groupNode.title = name;
            if(index===0)
                keysGroup.push(groupNode.key);
            group.curves.map((curve,index1)=>{
                let curveName = curve.name;
                let curveKey = index+"-"+(index1+1);
                if(index===0)
                    keysGroup.push(curveKey);
                let curvetree = {title:curveName,key:curveKey};
                curves.push(curvetree);
            });

            groupNode.children = curves;
            treeGroup.push(groupNode);  
            
        }
      
    );




        let json = {
            current: 2,
            previous: false,
            selectedCurves: this.state.selectedCurves,
            groups: this.state.groups,
            type: this.state.xyDisplayScale,
            xtype: this.state.xtype,
            xunit: this.state.xunit,
            ytype: this.state.ytype,
            yunit: this.state.yunit,
            groupSelected:this.state.groupSelected,		
            selected_group: 0,
            tree: treeGroup,
            keys: keysGroup,
        }
        this.sendData(json);
    }

    onChangeCheckbox(checkedValues) {
        this.state.selectedCurves = checkedValues;
    }

    componentDidMount() {
        if(this.props.propState.groups.length == 0 ||this.props.propState.reload)
        this.getCurves();
    else{
        this.setState({
            groups: this.props.propState.groups,
            selectedCurves: this.props.propState.selectedCurves,
            selectedPropDef : this.props.propState.selectedPropDef,
            loaded: true,
            type: res.xyDisplayScale,
            xtype: res.xtype,
            xunit: res.xunit,
            ytype: res.ytype,
            yunit: res.yunit,		
            selected_group: 0,
            groupSelected:[0],		
        })
    }


        
    }

    getCurves() {
        let propDefs = [];
        console.log(this.props.propState);
        const url = this.props.propState.url;
        const query = this.props.propState.query;
        const selectedPropDef = this.props.propState.selectedPropDef;
        let selectedPropDefStr =selectedPropDef.join("','");
        selectedPropDefStr = "'"+selectedPropDefStr+"'";

        axios.get(url + '/servlet/rest/dr/get_Curve?query=' + query + '&propDef='+selectedPropDefStr+'&format=json&user=smroot&passwd=sdm')
            .then(response => {
                console.log(response);
                const res = response.data;
                this.setState({
                    groups: res.groups,
                    loaded: true,
                    type: res.xyDisplayScale,
                    xtype: res.xtype,
                    xunit: res.xunit,
                    ytype: res.ytype,
                    yunit: res.yunit,		
                    selected_group: 0,
                    tree: res.tree,
                    keys: res.keys,
                })



            })


    }

    sendData = (result) => {
        this.props.parentCallback(result);
    }

    callbackFunction = (e) => {
        this.state.groupSelected =[];
        e.map((grp, grpI) =>  { 
               
            if(grp.isSelected){
                 this.state.groupSelected.push(grpI);
            }
        })       
        this.state.groups = e;
        this.state.loadCurve = true;
        this.forceUpdate();
        //console.log(JSON.stringify(e));
    }




    render() {
        const curves = this.state.groups.map(group => (

                <Checkbox.Group options={group.curves} onChange={this.onChangeCheckbox} defaultValue={this.state.selectedCurves}/>        
            
          ))
          let index1 = 0;  
         const curvesli = this.state.groups.map((group, index) =>
         group.curves.map((curve) => 
            <li key={index1++}>
            {curve.name}
          </li>    
          
         // Only do this if items have no stable IDs
         
       ));
          let allCurves = [];
          let colorsArray = [];
    if(this.state.groups.length >0){
        this.state.groupSelected.map((grpIndex) =>{
           this.state.groups[grpIndex].curves.map((curve, index) =>{
                curve.marker = {color: colors[grpIndex]};
                allCurves.push(curve);
            });
        }) 
    }


          


        return (
            <> 
                <Layout className="DRLayout">
                    <Row className="DefineGroupsDiv">
                    <Col>
                    <Skeleton loading={!this.state.loaded}>
                         <PlotCurve
                        curves={allCurves} showLegend={false} 
                    />
                    </Skeleton>
                    </Col>
                        <Col>
                

                    <Skeleton loading={!this.state.loaded}>
                        <div id='DefineGroup' className="DefineGroup">
                    

                    <div className="DropContainer">
                        <header className="DropContainer-header" >
                        <DragNDrop data={this.state.groups} parentCallback = {this.callbackFunction}/>
                        
                        </header>
                    </div>
                        
                         </div>
                        </Skeleton>


             
                </Col>
               
                    </Row>
                <div className="ButtonPanel">
                    <div className="ButtonPrevious">
                        <Button  onClick={e => { this.handlePrevious() }}>Previous</Button>
                    </div>
                    <div className="ButtonNext">
                        <Button type="primary" onClick={e => { this.handleNext() }}>Next</Button>
                    </div>
                </div>


                </Layout>
                
            </>
        )
    }
}

export default DefineGroups;