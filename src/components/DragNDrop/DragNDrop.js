import React, {useState, useRef, useEffect} from 'react'
import {PlusOutlined,DeleteOutlined,CheckOutlined } from '@ant-design/icons'
import {Input, Row, Col, Checkbox} from'antd'

export const colors =["#e51c23", // red
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

function DragNDrop({data,parentCallback}) {

    const [list, setList] = useState(data); 
    const [dragging, setDragging] = useState(false);
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    useEffect(() => {
        setList(data);
    }, [setList, data])

    const dragItem = useRef();
    const dragItemNode = useRef();
    
    const handletDragStart = (e, item) => {
        console.log('Starting to drag', item)

        dragItemNode.current = e.target;
        dragItemNode.current.addEventListener('dragend', handleDragEnd)
        dragItem.current = item;

        setTimeout(() => {
            setDragging(true); 
        },0)       
    }
    const handleDragEnter = (e, targetItem) => {
        console.log('Entering a drag target', targetItem)
        if (dragItemNode.current !== e.target) {
            console.log('Target is NOT the same as dragged item')
            setList(oldList => {
                let newList = JSON.parse(JSON.stringify(oldList))
                newList[targetItem.grpI].curves.splice(targetItem.itemI, 0, newList[dragItem.current.grpI].curves.splice(dragItem.current.itemI,1)[0])
                dragItem.current = targetItem;
                //localStorage.setItem('List', JSON.stringify(newList));
                parentCallback(newList);
                return newList
            })
        }
    }

    const handleOnNodeClick = (targetItem) =>{
        let groups = list;
        let opacity = list[targetItem.grpI].curves[targetItem.itemI].opacity;
        opacity = opacity === 0.3 ? 1: 0.3;
        list[targetItem.grpI].curves[targetItem.itemI].opacity = opacity;
        forceUpdate();
        parentCallback(list);
    }
    const handleDragEnd = (e) => {
        setDragging(false);
        dragItem.current = null;
        dragItemNode.current.removeEventListener('dragend', handleDragEnd)
        dragItemNode.current = null;
        
    }

    const createGroup = () =>{
        let size = list.length;
        let row = {label:'Group '+(size),isSelected: true, isEditable:false,curves: [] , id:size};
        setList(list =>[...list,row]);
    }
    
    const removeGroup = (e) =>{
        let groups = list;
        groups[0].curves= [...groups[0].curves,...groups[e].curves]
        groups.splice(e, 1);
        setList(list =>groups);
        list[0].isSelected = true;
        forceUpdate();
        parentCallback(list);
    }

    const updateGroupLabel = (label,e) =>{
        let groups = list;
        groups[e].label= label;
        setList(list =>groups);
        forceUpdate();
        parentCallback(list);
    }

    const onCheckBoxChange= (checked,e) =>{
           let groups =list.map((grp, grpI) =>  { 
               
               if(e === grpI){
                    grp.isSelected = checked;
               }
               return grp;
           }
           )
        setList(list =>groups);
        forceUpdate();
        parentCallback(list);
    }

    const makeGroupLabelEditable = (e) =>{
        let groups = list;
        groups[e].isEditable= !groups[e].isEditable;
        setList(list =>groups);
        forceUpdate();
    }


    const getStyles = (item) => {
        if (dragItem.current.grpI === item.grpI && dragItem.current.itemI === item.itemI) {
            return "dnd-item current"
        }
        if (item.opacity === 1) {
            return "dnd-item DNDSelect"
        }
        return "dnd-item"
    }

    if (list) {
        //const addGroup = <PlusOutlined onClick={createGroup}/>;
        return (                
            <div className="drag-n-drop">
            {list.map((grp, grpI) => (
                <><div>
              <Row className='GroupLabel'><Col><Checkbox key={"checkbox"+grpI} checked={grp.isSelected} onChange={(e)=>onCheckBoxChange(e.target.checked,grpI)}/>{grp.isEditable?<><Input value={grp.label} onChange={(e)=>updateGroupLabel(e.target.value,grpI)} hidden={!grp.isEditable} style={{width:'60%'}} placeholder="Group Name" /><CheckOutlined onClick={(e)=>makeGroupLabelEditable(grpI)}/></>:<span style={{color:colors[grpI]}} hidden={grp.isEditable} onClick={(e)=>makeGroupLabelEditable(grpI)}>{grp.label}</span>}  <span value={grpI} >{grpI===0?"" :<DeleteOutlined onClick={()=>removeGroup(grpI)}/>}</span></Col>
              </Row> <div key={grp.id} onDragEnter={dragging && !grp.curves.length?(e) => handleDragEnter(e,{grpI, itemI: 0}):null} className="dnd-group">
                {grp.curves.map((item, itemI) => (
                  <div draggable key={item.id}  onClick={()=>handleOnNodeClick({grpI, itemI})} onDragStart={(e) => handletDragStart(e, {grpI, itemI})} onDragEnter={dragging?(e) => {handleDragEnter(e, {grpI, itemI})}:null} className={dragging?getStyles({grpI, itemI}):item.opacity ===1 ? "dnd-item DNDSelect" :"dnd-item"}>
                  <div>
                  <Row className="CardTitle">
                   {item.matDataLabel}</Row> <Row>{item.name}</Row></div>
                  </div>
                ))}
              </div></div></>
            ))}
            </div>
        )
    } else { return null}

}

export default DragNDrop;