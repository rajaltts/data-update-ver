import React, {useState } from 'react'
import { Layout, Button, Col, Row} from 'antd';
import PlotBuilder from '../../containers/PlotBuilder/PlotBuilder'
import FileLoader from '../FileLoader/FileLoader.js';
import PhysicalMeasurementForm from "../PhysicalMeasurementForm/PhysicalMeasurementForm"

interface ImportFromDiskProps {
    template_input: any;
    data_input: any;
};

const ImportFromDisk: React.FC<ImportFromDiskProps> = (props) => {

    const { Header, Footer, Sider, Content } = Layout;

    const [input,setInput] = useState(
        {
          "type": "tensile",
          "xtype": "strain_engineering",
          "ytype": "stress_engineering",
          "xunit": "no",
          "yunit": "MPa",
          "groups" : [{"label": "my_group1",
                        "curves": [ {"label": "curve1",
                                     "x" : [ ],
                                     "y" : [ ]
                                    }
                                  ]
                        }
                      ]
        }
      );
    const [curves,setCurves] = useState([]);

    const handleOnFileLoad = (result) => {
        console.log("----CSV handler ----");
        const s = result[0].data.length;
        let curves_ = [];
        // st = [ { x: [1,2,..], y: [1,2,3,..], label: 'curve1'} , ....]
        for(let i=0; i<s/2; i++){
            const xs = result.map( line => line.data[2*i]);
            const ys = result.map( line => line.data[2*i+1]);

            let xs_:number[]=[];
            let ys_:number[]=[];
            for(let i=0; i<xs.length; i++){
                if(xs[i] !== undefined && xs[i].length >0){
                xs_.push(parseFloat(xs[i]));
                ys_.push(parseFloat(ys[i]));
                }
            }
            const curve_id = i+1;
            const curve = { id: i+1, x: xs_, y: ys_, label: 'curve'+curve_id};
            curves_.push(curve);
        } 

        setCurves(curves_);
    }

    const addDataHandler = () => {
        if(curves.length > 0) {
            const group_ = [{ label: 'browse', curves: curves }];
            const input_updated = {...input, groups: group_};
            setInput(input_updated);
        } else {
            setInput(props.data_input);
        }
    }

    const handleCoordType = (event, variable) => {
        const name = event.target.value;
        const input_update = {...input};
        if(variable==='x'){
            input_update.xtype = name;
        } else if(variable==='y'){
            input_update.ytype = name;
        }
        setInput(input_update);
    }
    
    //---------RENDER-----------------------------------------
    return (
    <Layout style={{height:"100vh"}}>
    <Content >
        <h1>Data Reduction App</h1>
        <p>Select a strain-stress csv file (comma separated, no headers) </p>
        <Row>
            <Col span={6}>
                <FileLoader handleOnFileLoad={handleOnFileLoad}/>
            </Col>
                
            {/* <Col span={4}>
                <Row> <PhysicalMeasurementForm variable='x' handleChange={handleCoordType}/> </Row>
                <Row> <PhysicalMeasurementForm variable='y'handleChange={handleCoordType}/> </Row>
            </Col> */}
            <Col span={6}>
            <Button disabled={curves.length===0} type="primary" onClick={addDataHandler}>Run</Button>
            </Col>
        </Row>

        <hr style={{width:"100%"}}/>
        
        <PlotBuilder  
                    data_input = {input}
                    template_input = {props.template_input}
                    parentCallback = {""}/>
    </Content>
    </Layout>
    )

  


};

export default ImportFromDisk;

