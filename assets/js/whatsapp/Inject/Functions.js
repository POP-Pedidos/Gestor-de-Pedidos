try {
    class Queue {
        constructor(delay = 1000) {
            this.queue = [];
            this.loading = false;
            this.delay = delay || 1000;
        }

        next() {
            if (this.loading) return false;

            const queue_item = this.queue[0];
            this.queue = this.queue.filter(item => item !== queue_item);

            if (typeof queue_item !== "function") return next();

            this.loading = true;

            queue_item().finally(() => {
                setTimeout(() => {
                    this.loading = false;
                    this.next();
                }, this.delay);
            });
        }

        async add(fn) {
            const promise = new Promise((resolve, reject) => {
                this.queue.push(async () => {
                    try {
                        resolve(await fn());
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            this.next();

            return promise;
        }
    }

    const messages_queue = new Queue();

    async function getNumberId(number, with_server = false) {
        return new Promise((resolve, reject) => {
            if (!number.endsWith("@c.us")) number = `${number}@c.us`;

            window.WWebJS.getNumberId(number).then(numberId => {
                resolve(!!with_server ? numberId._serialized : numberId.user);
            }).catch(reject);
        });
    }

    async function isRegisteredUse(id) {
        const result = await window.Store.Wap.queryExist(id);
        return result.jid !== undefined;
    }

    window.main.send("user_id", window.Store?.Conn?.__x_wid?.user);

    window.main.on("sendMessage", (e, number, message, options = {}) => {
        messages_queue.add(async () => {
            if (!number || typeof number != "string") return;
            if (!message || typeof message != "string") return;

            const phone = await getNumberId(number, true);
            const chatWid = window.Store.WidFactory.createWid(phone);
            const chat = await window.Store.Chat.find(chatWid);

            if (message.includes("http://") || message.includes("https://")) options.linkPreview = true;

            const msg = await window.WWebJS.sendMessage(chat, message, options);

            return msg;
        });
    });

    window.Store.Msg.on('add', (msg) => {
        const message = window.WWebJS.getMessageModel(msg);
        const contact = window.WWebJS.getContact(msg.author || msg.from);

        window.main.send("onMessage", message, contact);
    });

    // window.Store.Msg.on('change:type', (msg) => {
    //     // message_deleted
    //     window.main.send("onChangeMessageTypeEvent", msg);
    // });

    // window.Store.Msg.on('change:ack', (msg, ack) => {
    //     /*
    //         == ACK VALUES ==
    //         ACK_ERROR: -1
    //         ACK_PENDING: 0
    //         ACK_SERVER: 1
    //         ACK_DEVICE: 2
    //         ACK_READ: 3
    //         ACK_PLAYED: 4
    //     */

    //     //Emitted when an ack event occurrs on message type.
    //     window.main.send("onMessageAckEvent", msg, ack);
    // });

    // window.Store.Msg.on('change:isUnsentMedia', (msg, unsent) => {
    //     //console.log("onMessageMediaUploadedEvent", msg);
    //     window.main.send("onMessageMediaUploadedEvent", msg);
    // });
    // window.Store.Msg.on('remove', (msg) => {
    //     //Emitted when a message is deleted by the current user.
    //     window.main.send("onRemoveMessageEvent", msg);
    // });
    // window.Store.AppState.on('change:state', (_AppState, state) => {
    //     //Emitted when the connection state changes
    //     window.main.send("onAppStateChangedEvent", state);
    // });
    // window.Store.Conn.on('change:battery', (state) => {
    //     window.main.send("onAppStateChangedEvent", state);
    // });

    console.log("%c Functions.js > Fully injected!", 'color: green; font-weight: bold;');
} catch (ex) {
    console.log("%c Functions.js > Inject Error:", 'color: red; font-weight: bold;', ex);
}