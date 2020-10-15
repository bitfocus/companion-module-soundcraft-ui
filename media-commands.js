class MediaCommands {
    constructor(instance) {
        this.instance = instance;
        
        /**
         * Media player actions
         */
        this.actions = {
            mediaswitchplist: {
                label: 'Media Player: Switch Playlist',
                options: [
                    {
                        type: 'textinput',
                        label: 'Playlist',
                        id: 'playlist',
                        regex: this.instance.REGEX_SOMETHING
                    }
                ]
            },
            mediaswitchtrack: {
                label: 'Media Player: Switch Track',
                options: [
                    {
                        type: 'textinput',
                        label: 'Playlist',
                        id: 'playlist',
                        default: '~all~',
                        regex: this.instance.REGEX_SOMETHING
                    },
                    {
                        type: 'textinput',
                        label: 'File',
                        id: 'file',
                        regex: this.instance.REGEX_SOMETHING
                    }
                ]
            },
            mediaplay: {
                label: 'Media Player: Play/Stop'
            },
            mediastop: {
                label: 'Media Player: Stop'
            },
            mediapause: {
                label: 'Media Player: Pause'
            },
            medianext: {
                label: 'Media Player: Next track'
            },
            mediaprev: {
                label: 'Media Player: Previous track'
            }
        };
    }

    /**
    * Load playlist into the media player
    * @param {string} playlist 
    */
    switchPlaylist(playlist) {
        this.instance.sendCommand(`3:::MEDIA_SWITCH_PLIST^${playlist}`);
    }

    /**
    * Load file into the media player from playlist
    * @param {string} playlist 
    * @param {string} file 
    */
    switchTrack(playlist, file) {
        this.instance.sendCommand(`3:::MEDIA_SWITCH_TRACK^${playlist}^${file}`);
    }

    /**
     * Start media player
     */    
    play() {
        this.instance.sendCommand('3:::MEDIA_PLAY');
    }

    /**
    * Stop media player
    */
    stop() {
        this.instance.sendCommand('3:::MEDIA_STOP');
    }

    /**
    * Pause media player
    */
    pause() {
        this.instance.sendCommand('3:::MEDIA_PAUSE');
    }

    /**
    * Jump to next track in the media player
    */
    next() {
        this.instance.sendCommand('3:::MEDIA_NEXT');
    }

    /**
    * Jump to previous track in the media player
    */
    prev() {
        this.instance.sendCommand('3:::MEDIA_PREV');
    }
}

exports = module.exports = MediaCommands;