﻿try {
    window.WWebJS = {};
    window.WWebJS.getNumberId = async (id) => {

        let result = await window.Store.Wap.queryExist(id);
        if (result.jid === undefined)
            throw 'The number provided is not a registered whatsapp user';
        return result.jid;
    };
    window.WWebJS.sendSeen = async (chatId) => {
        let chat = window.Store.Chat.get(chatId);
        if (chat !== undefined) {
            await window.Store.SendSeen.sendSeen(chat, false);
            return true;
        }
        return false;

    };
    window.WWebJS.sendMessage = async (chat, content, options = {}) => {
        let attOptions = {};
        if (options.attachment) {
            attOptions = await window.WWebJS.processMediaData(options.attachment, options.sendAudioAsVoice);
            content = attOptions.preview;
            delete options.attachment;
        }

        let quotedMsgOptions = {};
        if (options.quotedMessageId) {
            let quotedMessage = window.Store.Msg.get(options.quotedMessageId);
            if (quotedMessage.canReply()) {
                quotedMsgOptions = quotedMessage.msgContextInfo(chat);
            }
            delete options.quotedMessageId;
        }

        if (options.mentionedJidList) {
            options.mentionedJidList = options.mentionedJidList.map(cId => window.Store.Contact.get(cId).id);
        }

        let locationOptions = {};
        if (options.location) {
            locationOptions = {
                type: 'location',
                loc: options.location.description,
                lat: options.location.latitude,
                lng: options.location.longitude
            };
            delete options.location;
        }

        let vcardOptions = {};
        if (options.contactCard) {
            let contact = window.Store.Contact.get(options.contactCard);
            vcardOptions = {
                body: window.Store.VCard.vcardFromContactModel(contact).vcard,
                type: 'vcard',
                vcardFormattedName: contact.formattedName
            };
            delete options.contactCard;
        } else if (options.contactCardList) {
            let contacts = options.contactCardList.map(c => window.Store.Contact.get(c));
            let vcards = contacts.map(c => window.Store.VCard.vcardFromContactModel(c));
            vcardOptions = {
                type: 'multi_vcard',
                vcardList: vcards,
                body: undefined
            };
            delete options.contactCardList;
        } else if (options.parseVCards && typeof (content) === 'string' && content.startsWith('BEGIN:VCARD')) {
            delete options.parseVCards;
            try {
                const parsed = window.Store.VCard.parseVcard(content);
                if (parsed) {
                    vcardOptions = {
                        type: 'vcard',
                        vcardFormattedName: window.Store.VCard.vcardGetNameFromParsed(parsed)
                    };
                }
            } catch (_) {
                // not a vcard
            }
        }

        if (options.linkPreview) {
            delete options.linkPreview;
            const link = window.Store.Validators.findLink(content);
            if (link) {
                const preview = await window.Store.Wap.queryLinkPreview(link.url);
                preview.preview = true;
                preview.subtype = 'url';
                options = { ...options, ...preview };
            }
        }

        const newMsgId = new window.Store.MsgKey({
            fromMe: true,
            remote: chat.id,
            id: window.Store.genId(),
        });

        const message = {
            ...options,
            id: newMsgId,
            ack: 0,
            body: content,
            from: window.Store.Conn.wid,
            to: chat.id,
            local: true,
            self: 'out',
            t: parseInt(new Date().getTime() / 1000),
            isNewMsg: true,
            type: 'chat',
            ...locationOptions,
            ...attOptions,
            ...quotedMsgOptions,
            ...vcardOptions
        };

        await window.Store.SendMessage.addAndSendMsgToChat(chat, message);
        return window.Store.Msg.get(newMsgId._serialized);
    };

    window.WWebJS.processMediaData = async (mediaInfo, forceVoice) => {
        const file = window.WWebJS.mediaInfoToFile(mediaInfo);
        const mData = await window.Store.OpaqueData.createFromData(file, file.type);
        const mediaPrep = window.Store.MediaPrep.prepRawMedia(mData, {});
        const mediaData = await mediaPrep.waitForPrep();
        const mediaObject = window.Store.MediaObject.getOrCreateMediaObject(mediaData.filehash);

        const mediaType = window.Store.MediaTypes.msgToMediaType({
            type: mediaData.type,
            isGif: mediaData.isGif
        });

        if (forceVoice && mediaData.type === 'audio') {
            mediaData.type = 'ptt';
        }

        if (!(mediaData.mediaBlob instanceof window.Store.OpaqueData)) {
            mediaData.mediaBlob = await window.Store.OpaqueData.createFromData(mediaData.mediaBlob, mediaData.mediaBlob.type);
        }

        mediaData.renderableUrl = mediaData.mediaBlob.url();
        mediaObject.consolidate(mediaData.toJSON());
        mediaData.mediaBlob.autorelease();

        const uploadedMedia = await window.Store.MediaUpload.uploadMedia({
            mimetype: mediaData.mimetype,
            mediaObject,
            mediaType
        });

        const mediaEntry = uploadedMedia.mediaEntry;
        if (!mediaEntry) {
            throw new Error('upload failed: media entry was not created');
        }

        mediaData.set({
            clientUrl: mediaEntry.mmsUrl,
            directPath: mediaEntry.directPath,
            mediaKey: mediaEntry.mediaKey,
            mediaKeyTimestamp: mediaEntry.mediaKeyTimestamp,
            filehash: mediaObject.filehash,
            uploadhash: mediaEntry.uploadHash,
            size: mediaObject.size,
            streamingSidecar: mediaEntry.sidecar,
            firstFrameSidecar: mediaEntry.firstFrameSidecar
        });

        return mediaData;
    };

    window.WWebJS.getMessageModel = message => {
        const msg = message.serialize();
        msg.isStatusV3 = message.isStatusV3;
        if (msg.buttons) {
            msg.buttons = msg.buttons.serialize();
        }
        delete msg.pendingAckUpdate;
        return msg;
    };

    window.WWebJS.getChatModel = async chat => {
        let res = chat.serialize();
        res.isGroup = chat.isGroup;
        res.formattedTitle = chat.formattedTitle;
        res.isMuted = chat.mute && chat.mute.isMuted;

        if (chat.groupMetadata) {
            await window.Store.GroupMetadata.update(chat.id._serialized);
            res.groupMetadata = chat.groupMetadata.serialize();
        }

        delete res.msgs;

        return res;
    };

    window.WWebJS.getChat = async chatId => {
        const chat = window.Store.Chat.get(chatId);
        return await window.WWebJS.getChatModel(chat);
    };

    window.WWebJS.getChats = async () => {
        const chats = window.Store.Chat.models;

        const chatPromises = chats.map(chat => window.WWebJS.getChatModel(chat));
        return await Promise.all(chatPromises);
    };

    window.WWebJS.getContactModel = contact => {
        let res = contact.serialize();
        res.isBusiness = contact.isBusiness;

        if (contact.businessProfile) {
            res.businessProfile = contact.businessProfile.serialize();
        }

        res.isMe = contact.isMe;
        res.isUser = contact.isUser;
        res.isGroup = contact.isGroup;
        res.isWAContact = contact.isWAContact;
        res.isMyContact = contact.isMyContact;
        res.isBlocked = contact.isContactBlocked;
        res.userid = contact.userid;

        return res;
    };

    window.WWebJS.getContact = contactId => {
        const contact = window.Store.Contact.get(contactId);
        return window.WWebJS.getContactModel(contact);
    };

    window.WWebJS.getContacts = () => {
        const contacts = window.Store.Contact.models;
        return contacts.map(contact => window.WWebJS.getContactModel(contact));
    };

    window.WWebJS.mediaInfoToFile = ({ data, mimetype, filename }) => {
        const binaryData = atob(data);

        const buffer = new ArrayBuffer(binaryData.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < binaryData.length; i++) {
            view[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([buffer], { type: mimetype });
        return new File([blob], filename, {
            type: mimetype,
            lastModified: Date.now()
        });
    };

    window.WWebJS.downloadBuffer = (url) => {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function () {
                if (xhr.status == 200) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(null);
        });
    };

    window.WWebJS.readBlobAsync = (blob) => {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };

            reader.onerror = reject;

            reader.readAsDataURL(blob);
        });
    };

    window.WWebJS.sendClearChat = async (chatId) => {
        let chat = window.Store.Chat.get(chatId);
        if (chat !== undefined) {
            await window.Store.SendClear.sendClear(chat, false);
            return true;
        }
        return false;
    };

    window.WWebJS.sendDeleteChat = async (chatId) => {
        let chat = window.Store.Chat.get(chatId);
        if (chat !== undefined) {
            await window.Store.SendDelete.sendDelete(chat);
            return true;
        }
        return false;
    };

    window.WWebJS.sendChatstate = async (state, chatId) => {
        switch (state) {
        case 'typing':
            await window.Store.Wap.sendChatstateComposing(chatId);
            break;
        case 'recording':
            await window.Store.Wap.sendChatstateRecording(chatId);
            break;
        case 'stop':
            await window.Store.Wap.sendChatstatePaused(chatId);
            break;
        default:
            throw 'Invalid chatstate';
        }

        return true;
    };

    console.log("%c Utils.js > Fully injected!", 'color: green; font-weight: bold;');
} catch(ex) {
    console.log("%c Utils.js > Inject Error:", 'color: red; font-weight: bold;', ex);
}