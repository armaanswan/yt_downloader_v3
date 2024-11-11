const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

function parseData(rawData) {
    const data = JSON.parse(rawData);

    let parsedFormats = [];

    data.formats.forEach(format => {
        let formatData = {
            id: format.format_id,
            extension: format.ext,
            video_resolution: format.height,
            video_bitrate: Math.floor(format.vbr),
            video_codec: format.vcodec,
            video_extension: format.video_ext,
            audio_bitrate: Math.floor(format.abr),
            audio_codec: format.acodec,
            audio_extension: format.audio_ext,
        };

        if (!formatData.id.includes('sb')) {
            parsedFormats.push(formatData);
        }
    });

    return parsedFormats;
}

// Function to fetch video formats using yt-dlp
function fetchData(url, callback) {
    const command = `yt-dlp --skip-download --print-json "${url}"`;

    console.log("Executing exec command... with command: ", command);
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log("The error you are looking for is: ", err);
            callback(err, null);
            return;
        }

        console.log("Trying to parse data!");
        data = parseData(stdout);
        callback(null, data);
    });
}

// Define a route to handle fetching formats
app.post('/fetch', (req, res) => {
    const videoUrl = req.body.url;

    fetchData(videoUrl, (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch data' });
            return;
        }
        res.json(data);
    });
});

app.get('/', (req, res) => {
    res.render('index', { data: null });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});