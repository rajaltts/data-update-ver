import React, { Component } from 'react'
import { CSVReader } from 'react-papaparse';

const buttonRef = React.createRef()

class FileLoader extends Component {
  

    handleOpenDialog = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef.current) {
          buttonRef.current.open(e)
        }
      }
     
      handleOnError = (err, file, inputElem, reason) => {
        console.log(err)
      }
     
      handleOnRemoveFile = (data) => {
        console.log('---------------------------')
        console.log(data)
        console.log('---------------------------')
      }
     
      handleRemoveFile = (e) => {
        // Note that the ref is set async, so it might be null at some point
        if (buttonRef.current) {
          buttonRef.current.removeFile(e)
        }
      }

      render() {
          return(
            <CSVReader
            ref={buttonRef}
            onFileLoad={this.props.handleOnFileLoad}
            onError={this.handleOnError}
            noClick
            noDrag
            onRemoveFile={this.handleOnRemoveFile}
        >
            {({ file }) => (
            <aside
                style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 10
                }}
            >
                <button
                type='button'
                onClick={this.handleOpenDialog}
                style={{
                    borderRadius: 0,
                    marginLeft: 0,
                    marginRight: 0,
                    width: '10%',
                    paddingLeft: 0,
                    paddingRight: 0
                }}
                >
                Browse file
                </button>
                <div
                style={{
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: '#ccc',
                    height: 35,
                    lineHeight: 2.5,
                    marginTop: 5,
                    marginBottom: 5,
                    paddingLeft: 13,
                    paddingTop: 3,
                    width: '20%'
                }}
                >
                {file && file.name}
                </div>
               
            </aside>
            )}
            </CSVReader>
          );
      }

}

export default FileLoader;