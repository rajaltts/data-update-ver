import React, {useState, useReducer } from 'react'
import { Layout, Button, Col, Row} from 'antd';
import PlotBuilder from '../../containers/PlotBuilder/PlotBuilder'
import FileLoader from '../FileLoader/FileLoader.js';
import initialData from '../../containers/PlotBuilder/Model/InitialData';
import dataReducer from '../../containers/PlotBuilder/Model/Reducer';
import actions from '../../containers/PlotBuilder/Model/Actions';
import { Data, Curve, Group } from '../../containers/PlotBuilder/Model/data.model';
import tensile_template from '../../data/template_tensile.json'

const ImportFromDisk: React.FC = () => {

    const { Header, Footer, Sider, Content } = Layout;

    const [data, dispatch]  =  useReducer(dataReducer,initialData);
    const [template,setTemplate] = useState(tensile_template);
    const [show,setShow] = useState(true);

    const handleOnFileLoad = (result) => {
        console.log("----CSV handler ----");
        const format_3headers = (result[0].data[0]==="3headers"?true:false);
        let header_line0, header_line1, header_line2;
        let keys;
        let index_strat = 0;
        let number_col = result[0].data.length;
        let number_row = result.length;
        let nbr_groups = 1; 
        if(format_3headers){
            header_line0 = result[1].data;
            header_line1 = result[2].data;
            header_line2 = result[3].data;
            index_strat = 4;
            number_col = result[index_strat].data.length;
            number_row -= 4;
            keys = new Set(header_line0);
            nbr_groups :  keys.length;    
        }
        const nbr_curves = Math.floor(number_col/2);
        let grs = new Array<Group>();
        let curves_ = new Array<Curve>();
        let strain_unit: string;
        let stress_unit: string;
    
        for(let i=0; i<number_col/2; i++){
            
            let xs = new Array(number_row);
            let ys = new Array(number_row);
            for(let j = index_strat; j<index_strat+number_row; j++){
                xs[j-index_strat] = result[j].data[2*i];
                ys[j-index_strat] = result[j].data[2*i+1];
            }
            
            let xs_:number[]=[];
            let ys_:number[]=[];
            for(let i=0; i<xs.length; i++){
                if(xs[i] !== undefined && xs[i].length >0){
                xs_.push(parseFloat(xs[i]));
                ys_.push(parseFloat(ys[i]));
                }
            }
            const key = header_line0[2*i];
            const name_x =  header_line1[2*i];
            const name_y =  header_line1[2*i+1];
            const unit_x =  header_line2[2*i];
            const unit_y =  header_line2[2*i+1];
            strain_unit = unit_x;
            stress_unit = unit_y;
            const curve_id = i+1;
            const curve:Curve = { id: i+1, oid: (i+1).toString(), name: i.toString(),matDataLabel: i.toString() , selected: true, opacity: 1, x: xs_, y: ys_, label: 'curve_'+key+"_"+curve_id};
            curves_.push(curve);
            if(i===nbr_curves-1 || key !== header_line0[2*(i+1)]){
                let gr = { id:i, data:[], result:false,label:key, curves: [...curves_]};
                grs.push(gr);
                curves_.length=0;
            }
        } 
      
        // create Data
        let data_2 =  {type: "tensile",
                    xtype: "strain_engineering",
                    ytype: "stress_engineering",
                    xunit: strain_unit,
                    yunit: stress_unit,
                    measurement: "engineering",
                    precision: 3,
                    // groups: [{
                    //     id: 1,
                    //     data: [],
                    //     result: false,
                    //     label: "toto",
                    //     curves: [
                    //         // {
                    //         // id: 1,
                    //         // label: "titi",
                    //         // name: "toto",
                    //         // selected: true,
                    //         // opacity: 1,
                    //         // x: [0,1,.2],
                    //         // y: [0,10,20],
                    //         // oid: "c1",
                    //         // matDataLabel: "toto",
                    //         // markerId: 1
                    //         // }
                    //     ]
                    // }]
        };
        
        const data_3:Data = {...data_2, groups: grs };
        dispatch(actions.setModel(data_3));
        setShow( prev => !prev);
    }
    
    //---------RENDER-----------------------------------------
    return (
    <Layout style={{height:"100vh"}}>
    <Content >
        <Row>
            <Col span={6}>
                {show&&<FileLoader handleOnFileLoad={handleOnFileLoad}/>}
            </Col>
        </Row>

        <hr style={{width:"100%"}}/>
        
        <PlotBuilder  
                    data_input = {data}
                    template_input = {template}
                    parentCallback = {""}/>
    </Content>
    </Layout>
    )
};

export default ImportFromDisk;

