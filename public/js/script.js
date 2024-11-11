const urlInput = document.querySelector('#url');
const clearButton = document.querySelector('#clear-button');
const pasteButton = document.querySelector('#paste-button');

// Clear button Functionality
clearButton.addEventListener('click', (e) => {
    urlInput.value = '';
});


// Paste button functionality
pasteButton.addEventListener('click', async (e) => {
    try {
        const text = await navigator.clipboard.readText();
        urlInput.value = text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
});

// Remove metadata toggle functionality
const removeMetadataToggle = document.querySelector('#remove-metadata-toggle');
removeMetadataToggle.addEventListener('click', (e) => {
    const toggle = removeMetadataToggle.querySelector('input[type="checkbox"]');
    toggle.checked = !toggle.checked;

    if (toggle.checked) {
        toggle.classList.add('on');
    } else if (!toggle.checked) {
        toggle.classList.remove('on');
    }
});


// Button Switchers
const buttonSwitchers = document.querySelectorAll('.button-switcher');

buttonSwitchers.forEach(switcher => {
    switcher.addEventListener('click', (e) => {
        if (e.target.classList.contains('switcher-option')) {
            switcher.querySelector('.switcher-option.active').classList.remove('active');
            e.target.classList.add('active');

            if (e.target.parentNode.id == 'video-quality-options') {
                resetVideoBitrates();
                if (e.target.textContent !== 'best') {
                    updateVideoBitrates(e.target.textContent);
                }
            }
        }
    });
});

// Global Switcher
const globalSwitcher = document.querySelector('.global-switcher');
const videoOptions = document.querySelector('.options-container.video-options-container');
const audioOptions = document.querySelector('.options-container.audio-options-container');

globalSwitcher.addEventListener('click', (e) => {
    const activeOption = globalSwitcher.querySelector('.switcher-option.active');

    if (activeOption.classList.contains('audio')) {
        videoOptions.classList.add('disabled');
        audioOptions.classList.remove('disabled');
    }
    else if (activeOption.classList.contains('video')) {
        videoOptions.classList.remove('disabled');
        audioOptions.classList.add('disabled');
    }
    else if (activeOption.classList.contains('audiovideo')) {
        videoOptions.classList.remove('disabled');
        audioOptions.classList.remove('disabled');
    }
});

// Search Functionality
const fetchForm = document.querySelector('#search-form');
let videoData = [];
let audioData = [];

fetchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = fetchForm.url.value;

    try {
        const response = await fetch('/fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching data:', errorData.error);
            // alert('Failed to fetch data: ' + errorData.error);
            return;
        }

        const data = await response.json();
        if (response.ok) {
            videoFormats = data.filter(format => (format.audio_bitrate == 0 && format.video_extension !== 'none' && format.video_bitrate !== 0)); // modify if needed
            audioFormats = data.filter(format => format.video_bitrate == 0 && format.audio_extension !== 'none' && format.audio_codec); // modify if needed
            populateVideoFilters(videoFormats);
            populateAudioFilters(audioFormats);
        }
    }
    catch (error) {
        console.error('Fetch error: ', error);
    }

});

function populateVideoFilters(videoFormats) {
    videoData = videoFormats;

    const videoResolutions = [...new Set(videoFormats.map(format => format.video_resolution).sort((a, b) => b - a).map(resolution => `${resolution}p`))];
    const videoBitrates = [...new Set(videoFormats.map(format => format.video_bitrate).sort((a, b) => b - a).map(bitrate => `${bitrate}kb/s`))];
    const videoExtensions = [...new Set(videoFormats.map(format => format.video_extension).map(format => format.toUpperCase()))];
    const videoCodecs = [...new Set(videoFormats.map(format => format.video_codec.split('.')[0].toUpperCase()))];

    populateOptions('video-quality-options', videoResolutions);
    populateOptions('video-bitrate-options', videoBitrates);
    populateOptions('video-format-options', videoExtensions);
    populateOptions('video-codec-options', videoCodecs);
}

function populateAudioFilters(audioFormats) {
    const audioBitrates = [...new Set(audioFormats.map(format => format.audio_bitrate).sort((a, b) => b - a).map(bitrate => `${bitrate}kb/s`))];
    const audioExtensions = [...new Set(audioFormats.map(format => format.audio_extension).map(format => format.toUpperCase()))];
    const audioCodecs = [...new Set(audioFormats.map(format => format.audio_codec.split('.')[0].toUpperCase()))];

    populateOptions('audio-bitrate-options', audioBitrates);
    populateOptions('audio-format-options', audioExtensions);
    populateOptions('audio-codec-options', audioCodecs);
}

function populateOptions(containerID, options) {
    const container = document.getElementById(containerID);
    options.forEach(option => {
        const switcherOption = document.createElement('div');
        switcherOption.classList.add('switcher-option')
        switcherOption.textContent = option;
        container.appendChild(switcherOption);
    });
};

// Update video bitrates when video resolution is selected
function updateVideoBitrates(videoResolution) {
    let videoResolutionNumber = parseInt(videoResolution.replace('p', ''));
    console.log("The selected video resolution is: ", videoResolution, videoResolutionNumber);

    let filteredVideos = videoData.filter(video => video.video_resolution == videoResolutionNumber);
    let filteredBitrates = [];
    filteredVideos.map(video => filteredBitrates.push(video.video_bitrate));

    let options = document.querySelectorAll('#video-bitrate-options .switcher-option');

    options.forEach(option => {

        if (!filteredBitrates.includes(parseInt(option.textContent.replace('kb/s', '')))) {
            option.classList.add('filtered-out');
        }
    });
}

function resetVideoBitrates() {
    // TODO: reset the selected bitrate to "best" as well
    let options = document.querySelectorAll('#video-bitrate-options .switcher-option');

    options.forEach(option => {
        option.classList.remove('filtered-out');
    });
}