import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import Form from 'react-bootstrap/Form'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap';
const App = () => {

  const [videoSize, setVideoSize] = useState('1080x720');
  const [selectedFile, setSelectedFile] = useState(null);
  const API = `http://localhost:8000/`

  const requestWatermark = () => {
    axios.post(`${API}createwatermark`, { data: "yolo" }, { headers: { "Access-Control-Allow-Origin": "*", 'Content-Type': 'application/json' } })
      .then((data) => { alert("Requested Watermark " + data) })
      .catch((err) => { console.log(err) })

  }

  const handleVideoSizeSubmit = (event) => {
    event.preventDefault()
    axios.post(`${API}resizevideos`, { size: videoSize }, { headers: { "Access-Control-Allow-Origin": "*", 'Content-Type': 'application/json' } })
      .then(() => { alert("Requested Videos Resizing") })
      .catch((err) => { console.log(err) })
  }

  const unzipFile = () => {
    selectedFile ?
      axios.post(`${API}fileupload`, { file: selectedFile.name })
        .then((data) => (console.log(data)), alert("unzipped the file")) : console.log(`no items selected`)
          .catch((err) => console.log(err))

  }



  return (
    <div className="App">
      <h1>Vide-o-Infinie</h1>
      <p>Start by selecting a zip file with video files</p>
      <Form onSubmit={unzipFile} style={{ display: "flex", justifyContent: "center" }}>
        <input onChange={(e) => setSelectedFile(e.target.files[0])} type="file" id="chosen-zip" accept=".zip"></input>
        <Button type="submit">unzip file</Button>
      </Form>
      <p>Select the dimension for all the videos</p>
      <form onSubmit={handleVideoSizeSubmit}>
        <input type="text"
          id="message"
          name="message"
          onChange={(event) => setVideoSize(event.target.value)}
          value={videoSize} placeholder="widthxheight"></input>
        <Button variant="dark" type='submits'>change video size</Button>
      </form>
      <p>Clicking on button below will apply watermark to all the videos</p>
      <Button id="watermarkButton" variant="dark" onClick={requestWatermark}>requestWatermark</Button>
    </div >
  );
}

export default App;
