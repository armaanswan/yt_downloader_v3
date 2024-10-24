const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

function parseData(rawData) {
    const lines = rawData.trim().split('\n').slice(8);

    const audioLines = lines.filter(line => line.includes('audio only'));
    const videoLines = lines.filter(line => line.includes('video only'));

    const audioLeft = audioLines.map(line => line.split('|')[0].trim().split(/\s+/));
    const audioRight = audioLines.map(line => line.split('|')[2].trim().split(/\s+/));
    const videoLeft = videoLines.map(line => line.split('|')[0].trim().split(/\s+/));
    const videoRight = videoLines.map(line => line.split('|')[2].trim().split(/\s+/));

    const audioData = [];
    const videoData = [];

    for (i = 0; i < audioLines.length; i++) {
        let audioObj = {
            audio_id: audioLeft[i][0],
            audio_extention: audioLeft[i][1],
            audio_codec: audioRight[i][2],
            audio_bitrate: audioRight[i][3],
            audio_sample_rate: audioRight[i][4]
        }

        if (audioObj.audio_codec !== 'unknown') {
            audioData.push(audioObj);
        }
    }

    for (i = 0; i < videoLines.length; i++) {
        let videoObj = {
            video_id: videoLeft[i][0],
            video_resolution: videoLeft[i][2],
            video_extention: videoLeft[i][1],
            video_codec: videoRight[i][0],
            video_bitrate: videoRight[i][1]
        }

        videoData.push(videoObj);
    }

    const data = audioData.concat(videoData);
    return data;
}

// Function to fetch video formats using yt-dlp
function fetchData(url, callback) {
    const command = `yt-dlp -F ${url}`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            callback(err, null);
            return;
        }

        data = parseData(stdout);
        callback(null, data);
    });
}

// Define a route to handle fetching formats
app.get('/fetch', (req, res) => {
    const videoUrl = req.query.url;

    fetchData(videoUrl, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch data' });
            return;
        }
        res.json({ data });
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});