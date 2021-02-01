import React from 'react';
import { Col, Row, Descriptions, Button, Checkbox ,Skeleton, Layout, Modal, Input, Space} from 'antd';
import 'antd/dist/antd.css';
import axios from '../axios-orders';
import PlotCurve from '../components/PlotCurveComponent/PlotCurve';
import "../App.css";
import DragNDrop  from '../components/DragNDrop/DragNDrop.js'

class SaveResults extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            groups:[],
            selectedCurves:[],
            selectedPropDef:[],
            groupSelected:[0],
            loadCurve: false,
            isModalVisible: false,
            selectedCriteria:[],
            groupsCriteria:{},
            showGroupCriteria: false,
        }
        this.sendData = this.sendData.bind(this);
        this.handlePrevious = this.handlePrevious.bind(this);
        this.onCheckBoxChange = this.onCheckBoxChange.bind(this);
     }

     onCheckBoxChange(checked,e){
        let upDatedGroups =this.state.groups.map((grp, grpI) =>  { 
            
            if(e === grpI){
                 grp.isSelected = checked;
            }
            return grp;
        }
        )
        this.setState({
            groups:upDatedGroups
        })
        let json = {
            current: 3,
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
            numberOfGroups:1,
            selectedCriteria:this.state.selectedCriteria,
            groupsCriteria:this.state.groupsCriteria,
            criteria:this.state.criteria,
        }
     this.sendData(json);
 }
    handlePrevious() {
        let json = {
            current: 2,
            previous: true,
            selectedCurves: this.state.selectedCurves,
            groups: this.state.groups,
            type: this.state.xyDisplayScale,
            xtype: this.state.xtype,
            xunit: this.state.xunit,
            ytype: this.state.ytype,
            yunit: this.state.yunit,
            groupSelected:this.state.groupSelected,		
            selectedCriteria:this.state.selectedCriteria,
            groupsCriteria:this.state.groupsCriteria,
            criteria:this.state.criteria,
        }
        this.sendData(json);
    } 

    componentDidMount() {
        if(this.props.propState.groups.length == 0 ||this.props.propState.reload)
        this.getCurves();
    else{
        
        if(this.props.propState.selectedCriteria.length>0){
            this.state.showGroupCriteria = true;
        }
        this.setState({
            groups: this.props.propState.groups,
            selectedCurves: this.props.propState.selectedCurves,
            selectedPropDef : this.props.propState.selectedPropDef,
            loaded: true,
            type: this.props.propState.xyDisplayScale,
            xtype:this.props.propState.xtype,
            xunit: this.props.propState.xunit,
            ytype: this.props.propState.ytype,
            yunit: this.props.propState.yunit,		
            selected_group: 0,
            groupSelected:this.props.propState.groupSelected,		
            selectedCriteria:this.props.propState.selectedCriteria,
            groupsCriteria:this.props.propState.groupsCriteria,
            criteria:this.props.propState.criteria,
            selectedAnalysisType: this.props.propState.selectedAnalysisType,
        })
    }


        
    }

    

    sendData = (result) => {
        this.props.parentCallback(result);
    }


    render() {

          let allCurves = [];
          let colorsArray = [];
   let criteria=[];
   let count = 1;
   let numberOfGroups = this.state.numberOfGroups;
   if(this.state.isModalVisible){
    Object.keys(this.state.criteria).map((key, i) => {
        let obj = new Object();
        obj["label"] = key;
        obj["value"] = key;
        criteria.push(obj);
    })
    
    if(this.state.groupsCriteria !== undefined)
        count =  Object.keys(this.state.groupsCriteria).length;

}    
 
let criteriaGrp = {};
              
                this.state.groups.map((group, index1)=>{
                 let critObj = group.criteria;
                 if(critObj !== undefined){
                    this.state.selectedCriteria.map((key, i) => {
                    let valArray = criteriaGrp[key];
                    if(valArray === undefined){
                        valArray = [];
                    }
                    valArray.push(critObj[key]===undefined?"":critObj[key]);
                    criteriaGrp[key] = valArray;
                 })}
})
    


          
let table = !(this.state.showGroupCriteria && this.state.selectedCriteria.length>0)?"":<table className="Grid">
<thead><tr key={'mattr01'}><th key='propCol0'></th>{
    
this.state.groups.map((group, index)=>{
    return(index!==0?<th style={{textAlign: 'center'}}  key={'propCol'+index+1}><Checkbox key={"checkbox"+index+1} checked={group.isSelected} onChange={(e)=>this.onCheckBoxChange(e.target.checked,index)}/>{group.label}</th>:"")
})}</tr>
</thead>
<tbody>
    {
        this.state.selectedCriteria.map((cr, index) =>{
            let crObj = this.state.criteria[cr];
            let leftHeaderLabel = crObj.name +" - "+crObj.targetName;
            let values = criteriaGrp[cr];
            return(
                <tr key={'proptr'+index}>
                     <td  key={'proptd'+index} className="MatData"> <span> {leftHeaderLabel }</span></td>
                     { 
                       values!==undefined?values.map((val,i)=>{
                           return(<td><span className='AttributeValue' style={{width:'60%'}}>{val}</span></td>) 

                       }):""                         
                       
                     }
                </tr>
            )

        })
    }
    </tbody>
    </table>  



        return (
            <> 
                <Layout className="DRLayout">
               <Row className="DefineGroupsDiv">
                <Col>              

                    <Skeleton loading={!this.state.loaded}>
                <div id='DefineGroup' className="DefineGroup">
                    <Space direction='vertical'>
                    <div  className="AnalysisTypeContainer">
                    <span className='AnalysisResultLabel'> Analysis Result Type </span>
                        <Input size='small' value={this.props.propState.selectedAnalysisType.title} style={{width: 150}} disabled='true' >                      
                        </Input>
                    </div>
                    <div className="DropContainer">
                       { table}
                    </div>                   
                    </Space>
                </div>
                        </Skeleton>


             
                </Col>
               
                    </Row>
                <div className="ButtonPanel">
                    <div className="ButtonPrevious">
                        <Button  onClick={e => { this.handlePrevious() }}>Previous</Button>
                    </div>
                    <div className="ButtonNext">
                        <Button type="primary">Save</Button>
                    </div>
                    <div className="ButtonNext">
                        <Button type="primary">Cancel</Button>
                    </div>
                </div>


                </Layout>
                
            </>
        )
    }
}

export default SaveResults;