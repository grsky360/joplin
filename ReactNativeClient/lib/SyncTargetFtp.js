const BaseSyncTarget = require('lib/BaseSyncTarget');
const { _ } = require('lib/locale.js');
const Setting = require('lib/models/Setting.js');
const { FileApi } = require('lib/file-api.js');
const { FileApiDriverFtp } = require('lib/file-api-driver-ftp.js');
const { Synchronizer } = require('lib/synchronizer.js');

class SyncTargetFtp extends BaseSyncTarget {
	static id() {
		return 8;
	}

	static targetName() {
		return 'ftp';
	}

	static label() {
		return _('FTP/SFTP');
	}

	static unsupportedPlatforms() {
		return [];
	}

	async isAuthenticated() {
		return true;
	}

	static supportsConfigCheck() {
		return true;
	}

	static async newApiInstance(options) {
		const fileApi = new FileApi('', new FileApiDriverFtp(options));
		fileApi.setSyncTargetId(SyncTargetFtp.id());
		return fileApi;
	}

	static async checkConfig(options) {
		const fileApi = await SyncTargetFtp.newApiInstance(options);
		fileApi.requestRepeatCount_ = 0;

		const output = {
			ok: false,
			errorMessage: '',
		};

		try {
			const result = await fileApi.stat('');
			if (!result) {
				throw new Error(`FTP/SFTP directory not fount: ${options.path()}`);
			}
			output.ok = true;
		} catch (error) {
			output.errorMessage = error.message;
			if (error.code) {
				output.errorMessage += ` (Code ${error.code})`;
			}
		}
		return output;
	}

	async initFileApi() {
		const options = {
			protocol: () => Setting.value('sync.8.protocol'),
			host: () => Setting.value('sync.8.host'),
			port: () => Setting.value('sync.8.port'),
			username: () => Setting.value('sync.8.username'),
			password: () => Setting.value('sync.8.password'),
			path: () => Setting.value('sync.8.path'),
		};
		const fileApi = await SyncTargetFtp.newApiInstance(options);
		fileApi.setLogger(this.logger());
		return fileApi;
	}

	async initSynchronizer() {
		return new Synchronizer(this.db(), await this.fileApi(), Setting.value('appType'));
	}

}

module.exports = SyncTargetFtp;
