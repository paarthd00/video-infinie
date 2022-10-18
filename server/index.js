//server
//server sent events
//node bull

const path = require('path');
const fs = require('fs');
const cors = require('cors');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

ffmpeg.setFfmpegPath(ffmpegPath);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
//joining path of directory to videos
const directoryPath = path.join(__dirname, 'videos');

const processAllVideos = (action, data) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach((file) => {
            action(directoryPath + '/' + file, file, data)
        });
    });
};

// resize the videos  // videoPath is the path to original video
//videoFileName is the name of the video file
//videoSize is the size you want to convert the video to.
const resizeVideo = async (videoPath, videoFileName, videoSize) => {
    await ffmpeg(videoPath)
        .size(videoSize)
        .output('./output_videos/' + videoFileName)
        .on('error', function (err) {
            console.log(err);
        })
        .on('end', function () {
            console.log(`Processing finished ${videoFileName}!`);
        })
        .run();
};

const applyWatermark = async (videoPath, videoFileName, watermarkImage) => {
    await ffmpeg(videoPath)
        .input(watermarkImage)
        .videoCodec("libx264")
        .complexFilter(
            [
                "scale=-2:720[overlayed]",
                {
                    filter: "overlay",
                    options: {
                        x: "(main_w-overlay_w)/2",
                        y: "(main_h-overlay_h)/2",
                    },
                    inputs: "overlayed",
                    outputs: "filterOutput",
                },
                "[filterOutput]scale=480:-2[output]",
            ],
            "output"
        )
        .on("error", (err) => {
            console.error(err);
        })
        .on("end", () => {
            console.log(`Finished processing ${videoFileName}!`);
        })
        .output('./output_videos/' + videoFileName)
        .run();
};

app.post("/createwatermark", (req, res) => {
    console.log("Trying to create watermarks")
    try {
        processAllVideos(applyWatermark, 'watermark.png')
    } catch (error) {
        console.log(error)
    }
    res.send("Processing watermark")
})

app.post("/resizevideos", (req, res) => {
    console.log("Trying to resize videos");
    try {
        processAllVideos(resizeVideo, req.body.size)
    } catch (error) {
        console.log(error)
    }
    res.send("Processing resizing")

})

app.post("/fileupload", async (req, res) => {
    exec(`unzip ${req.body.file}`, (err, data) => {
        (err) ? res.json(err) : res.json(data);
    })

})

const port = 8000
app.listen(port)
console.log(`Listening at http://localhost:${port}`)
