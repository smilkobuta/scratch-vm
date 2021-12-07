const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const http = require('https');

class Scratch3Nushima {
    constructor (runtime) {
        this.runtime = runtime;
    }

    statusMessage = '';

    getInfo () {
        return {
            id: 'nushima',
            name: '沼島汽船',
            blocks: [
                {
                    opcode: 'fetchKisenMessage',
                    blockType: BlockType.COMMAND,
                    text: 'メッセージ取得'
                },
                {
                    opcode: 'receivedKisenMessage',
                    blockType: BlockType.HAT,
                    text: 'メッセージを受け取った'
                },
                {
                    opcode: 'getKisenMessage',
                    blockType: BlockType.REPORTER,
                    text: 'メッセージ'
                }
            ],
            menus: {
            }
        };
    }

    fetchKisenMessage () {
        http.get('https://nushima-yoshijin.jp/kisen/status/message', resp => {
            let data = '';
        
            // A chunk of data has been received.
            resp.on('data', chunk => {
                data += chunk;
            });
        
            resp.on('end', () => {
                const kisenStatus = JSON.parse(data);
                log.log(kisenStatus);
                for (let status in kisenStatus) {
                    this.statusMessage = kisenStatus[status].message;
                }
            });
        
        }).on('error', err => {
            log.log(`Error: ${err.message}`);
        });
    }

    receivedKisenMessage () {
        return this.statusMessage !== '';
    }

    getKisenMessage () {
        let message = this.statusMessage;
        // 6便（13:20 沼島発、13:50 淡路島土生(はぶ)発）は通常通り運航の予定です。
        message = message.replace('便', 'びん');
        message = message.replace(/（(.+) 沼島発、(.+) .+）は/, 'は、$1に「ぬしま」をでて、$2に「はぶ」');
        message = message.replace('通常通り運航の予定です。', 'をしゅっぱつするにゃん');
        return message;
    }
}

module.exports = Scratch3Nushima;
