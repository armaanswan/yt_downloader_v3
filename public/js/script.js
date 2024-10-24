document.addEventListener("DOMContentLoaded", function () {

    // Fetching video formats
    document.querySelector('.fetch-details-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const videoUrl = document.querySelector('#url-input').value;

        fetch(`/fetch?url=${encodeURIComponent(videoUrl)}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Error fetching formats:', error));
    });

    // Making buttons clickable
    const switchers = document.querySelectorAll('.button-switcher');

    switchers.forEach((switcher) => {
        switcher.addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON') {
                // Remove 'active' class from any button within this switcher
                const buttons = switcher.querySelectorAll('button');
                buttons.forEach(function (button) {
                    button.classList.remove('active');
                });

                // Add the 'active' class to the clicked button
                e.target.classList.add('active');
            }
        });
    });

    // Disabling sections based on download options
    const downloadOptionsSwitcher = document.querySelector('#download-options-switcher');
    const videoQualitySwitcher = document.querySelector('#video-quality-switcher');
    const videoFormatsSwitcher = document.querySelector('#video-formats-switcher');
    const audioFormatsSwitcher = document.querySelector('#audio-formats-switcher');
    const audioBitratesSwitcher = document.querySelector('#audio-bitrates-switcher');

    downloadOptionsSwitcher.addEventListener('click', (e) => {
        const audiovideo = e.target.classList.contains('audiovideo');
        const audioonly = e.target.classList.contains('audio');
        const videoonly = e.target.classList.contains('video');

        if (audioonly) {
            videoQualitySwitcher.classList.add('disabled');
            videoFormatsSwitcher.classList.add('disabled');
            audioFormatsSwitcher.classList.remove('disabled');
            audioBitratesSwitcher.classList.remove('disabled');
        }
        else if (videoonly) {
            audioFormatsSwitcher.classList.add('disabled');
            audioBitratesSwitcher.classList.add('disabled');
            videoQualitySwitcher.classList.remove('disabled');
            videoFormatsSwitcher.classList.remove('disabled');
        }
        else if (audiovideo) {
            audioFormatsSwitcher.classList.remove('disabled');
            audioBitratesSwitcher.classList.remove('disabled');
            videoQualitySwitcher.classList.remove('disabled');
            videoFormatsSwitcher.classList.remove('disabled');
        }
    });

    // Making the whole toggle container clickable
    const toggleContainer = document.querySelector('.toggle-container');
    const toggle = document.querySelector('#remove-metadata');

    toggleContainer.addEventListener('click', (e) => {
        toggle.checked = !toggle.checked;
    });

    // Prevent toggling when clicking directly on the checkbox
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
    });

});
