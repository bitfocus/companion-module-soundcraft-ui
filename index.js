var instance_skel = require('../../instance_skel');
var WebSocket     = require('websocket').client;

class instance extends instance_skel {

	/**
	 * Create an instance of a soundcraft-ui module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.COLOR_VAL = [
			{ label: 'Off',              id: '0' },
			{ label: 'Black',            id: '1' },
			{ label: 'Dark Red',         id: '2' },
			{ label: 'Red: ',            id: '3' },
			{ label: 'Orange',           id: '4' },
			{ label: 'Yellow',           id: '5' },
			{ label: 'Green',            id: '6' },
			{ label: 'Blue',             id: '7' },
			{ label: 'violett',          id: '8' },
			{ label: 'Gray',             id: '9' },
			{ label: 'White',            id: '10' },
			{ label: 'Pink',             id: '11' }
		];

		/*
		Official Calculation of the db value

		function ValueToDb(a) {
			var b = 2.676529517952372E-4 * Math.exp(a * (23.90844819639692 + a * (-26.23877598214595 + (12.195249692570245 - .4878099877028098 * a) * a))) * (.055 > a ? Math.sin(28.559933214452666 * a) : 1)
			.001 > a ? a = "- @ " : (b = (20 * Math.log(b) / Math.log(10) * 10 + .45 | 0) / 10, -20 >= b ? b = "" + (b | 0) : -1 == ("" + b).indexOf(".") && (b += ".0"), a = b + " dB", -120 > b && (this.text = "- @ "));
			return a
		}
		*/

		this.FADER_VAL = [
			{ label: '- ∞',        id: '0.0' },
			{ label: '-90 dB',     id: '0.0037'},
			{ label: '-80 dB',     id: '0.01'},
			{ label: '-70 dB',     id: '0.0235'},
			{ label: '-60 dB',     id: '0.0562'},
			{ label: '-50 dB',     id: '0.1140' },
			{ label: '-30 dB',     id: '0.2654' },
			{ label: '-20 dB',     id: '0.37' },
			{ label: '-18 dB',     id: '0.401' },
			{ label: '-15 dB',     id: '0.444' },
			{ label: '-12 dB',     id: '0.491' },
			{ label: '-9 dB',      id: '0.546' },
			{ label: '-6 dB',      id: '0.611' },
			{ label: '-3 dB',      id: '0.683' },
			{ label: '-2 dB',      id: '0.708' },
			{ label: '-1 dB',      id: '0.7365' },
			{ label: '0 dB',       id: '0.7653' },
			{ label: '+1 dB',      id: '0.7905' },
			{ label: '+2 dB',      id: '0.8188' },
			{ label: '+3 dB',      id: '0.844' },
			{ label: '+4 dB',      id: '0.8692' },
			{ label: '+5 dB',      id: '0.894' },
			{ label: '+6 dB',      id: '0.9156' },
			{ label: '+9 dB',      id: '0.98' },
			{ label: '+10 dB',     id: '1.0' }
		];

		this.FADER_TYPE = [
			{ id: 'i', label: 'Input' },
			{ id: 'l', label: 'Line Input' },
			{ id: 'p', label: 'Player' },
			{ id: 'f', label: 'FX' },
			{ id: 's', label: 'Sub Groups' },
			{ id: 'a', label: 'AUX Output' },
		];

		this.reconnecting = null;
		this.actions(system);
	}

	/**
	 * Setup the actions
	 * @param {Object} system - The brains of the operation
	 * @since 1.0.0
	 */
	actions(system) {
		this.setActions({
			'mute': {
				label: 'Set Mute',
				options: [{
						type: 	 'dropdown',
						label: 	 'Type',
						id: 	 'type',
						choices: this.FADER_TYPE,
						default: 'i'
					},
					{
						type:	 'textinput',
						label:	 'Channel Number of Input, Line Input, Player, FX, Sub Group or AUX Group',
						id:    	 'channel',
						regex:	 this.REGEX_NUMBER,
						default: '1'
					},
					{
						type:   'dropdown',
						label:  'Mute / Unmute',
						id:     'mute',
						choices: [
							{ id: '1', label: 'Mute' },
							{ id: '0', label: 'Unmute' }
						],
						default: '1'
					}
				]
			},
			'fade': {
				label: 'Set Fader Level',
				options: [
					{
						type: 	 'dropdown',
						label: 	 'Type',
						id: 	 'type',
						choices: this.FADER_TYPE,
						default: 'i'
					},
					{
						type:	'textinput',
						label:	'Channel Number of Input, Line Input, Player, FX, Sub Group or AUX Group',
						id:    	'channel',
						regex:	this.REGEX_NUMBER,
						default: '1'
					},
					{
						type: 	 'dropdown',
						label: 	 'Fader Level',
						id: 	 'level',
						choices: this.FADER_VAL,
						default: '0.7653'
					}
				]
			}
		});
	}

	/**
	 * Executes the provided action
	 * @param {Object} action - The action to be executed
	 * @since 1.0.0
	 */
	action(action) {
		var opt = action.options;

		switch (action.action) {
			case 'mute':
				this.mute(opt.type, opt.channel, opt.mute);
				break;
			case 'fade':
				this.fade(opt.type, opt.channel, opt.level);

		}
	}

	/**
	 * Configuration fields that can be used
	 * @returns {Array}
	 * @since 1.0.0
	 */
	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 12,
				regex: this.REGEX_IP
			}
		]
	}

	/**
	 * Main initialization
	 * @since 1.0.0
	 */
	init() {
		this.status(this.STATUS_UNKNOWN);
		if(this.config.host) {
			this.connect();
		}
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		var resetConnection = false;

		if (this.config.host != config.host)
		{
			resetConnection = true;
		}

		this.config = config;

		this.actions();

		if (resetConnection === true || this.socket === undefined) {
			this.reconnect();
		}
	}

	/**
	 * Initialize the websocket connection to the server
	 * @since 1.0.0
	 */
	connect() {
		this.log('info', 'Attempting to connect to switcher');
		if(this.reconnecting) { // existing reconnect attempt
			clearTimeout(this.reconnecting);
			this.reconnecting = null;
		}
		if(this.socket && this.socket.connected) {
			this.disconnect();
		}
		if(!this.config.host) {
			return;
		}

		this.socketClient = new WebSocket();
		this.socketClient
		.on('connect', webSocketConnection => {
			this.debug('Websocket connected');
			this.log('info', 'Switcher conected');
			this.status(this.STATUS_OK);

			this.socket = webSocketConnection;
			this.socket
			.on('message', message => {
				// this.log('debug', message.utf8Data);
			})
			.on('error', error => {
				this.debug(`Socket error: ${error}`);
			})
			.on('close', (reasonCode, description) => {
				this.debug(`Socket closed: [${reasonCode}]-${description}`);
				this.log('info', 'Disconnected from switcher');
				this.reconnect.bind(this, true);
			});

			setInterval(() => {
				this.keepAlive();
			}, 2000);
		})
		.on('connectFailed', error => {
			this.debug(`Websocket connection failed: ${error}`);
			this.log('warning', 'Connection to switcher failed');
			this.status(this.STATUS_ERROR);
		});

		var rnd = Math.random() * 10000;
		this.debug(`Random: ${rnd}`);
		this.socketClient.connect(`ws://${this.config.host}/socket.io/1/websocket/${rnd}`, null, `http://${this.config.host}`);
	}

	/**
	 * Attempt a reconnect on connection lost/logout
	 * @param {Boolean} retry_immediately - Immediately try reconnecting, useful if the session may have ended
	 * @since 1.0.0
	 */
	reconnect() {
		this.log('info', 'Attempting to reconnect to switcher');
		this.status(this.STATUS_ERROR);
		this.disconnect();
		this.connect();
	}

	/**
	 * Mute or unmute a defined channel (input/output/fx/aux/etc.)
	 * @param {char} type 
	 * @param {int} channel 
	 * @param {any} value 
	 */
	mute(type, channel, value) {
		var cmd = "3:::SETD^{type}.{channel}.mute^{flag}"
			.replace("{type}", type)
			.replace("{channel}", channel - 1)
			.replace("{flag}", value);
		this.sendCommand(cmd);
	}

	/**
	 * Set the level for a defined channel (input/output/fx/aux/etc.)
	 * @param {char} type 
	 * @param {int} channel 
	 * @param {any} value 
	 */
	fade(type, channel, value) {
		var cmd = "3:::SETD^{type}.{channel}.mix^{flag}"
			.replace("{type}", type)
			.replace("{channel}", channel - 1)
			.replace("{flag}", value);
		this.sendCommand(cmd);
	}

	/**
	 * Send keep alive to the device to prevent disconnects
	 */
	keepAlive() {
		this.sendCommand(`3:::ALIVE`);
	}

	/**
	 * Send a command to the device
	 * @param {string} command - The command to send
	 * @since 1.0.0
	 */
	sendCommand(command) {
		if(!this.socket || !this.socket.connected) {
			this.log('warning', 'Switcher not connected');
			this.reconnect.bind(this, true);
			return;
		}
		this.debug(`Sending command: ${command}`);
		this.socket.sendUTF(command);
	}

	/**
	 * Disconccect from device
	 * @since 1.0.0
	 */
	disconnect() {
		this.log('info', 'Disconnecting from switcher');
		this.status(this.STATUS_ERROR);
		if(this.socket && this.socket.connected) {
			this.socket.close();
		}
	}

	/**
	 * Ends session if disconnected
	 * @since 1.0.0
	 */
	destroy() {
		this.disconnect();
	}
}

exports = module.exports = instance;