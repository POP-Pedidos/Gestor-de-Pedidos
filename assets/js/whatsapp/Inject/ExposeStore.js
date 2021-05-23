try {
    window.Store = window.mR.findModule('Chat')[0].default;
    window.Store.AppState = window.mR.findModule('STREAM')[0].default;
    window.Store.Conn = window.mR.findModule('Conn')[0].default;
    window.Store.CryptoLib = window.mR.findModule('decryptE2EMedia')[0];
    window.Store.Wap = window.mR.findModule('Wap')[0].default;
    window.Store.SendSeen = window.mR.findModule('sendSeen')[0];
    window.Store.SendClear = window.mR.findModule('sendClear')[0];
    window.Store.SendDelete = window.mR.findModule('sendDelete')[0];
    window.Store.genId = window.mR.findModule('randomId')[0].default;
    window.Store.SendMessage = window.mR.findModule('addAndSendMsgToChat')[0];
    window.Store.MsgKey = window.mR.findModule((module) => module.default && module.default.fromString)[0].default;
    window.Store.Invite = window.mR.findModule('sendJoinGroupViaInvite')[0];
    window.Store.OpaqueData = window.mR.findModule(module => module.default && module.default.createFromData)[0].default;
    window.Store.MediaPrep = window.mR.findModule('MediaPrep')[0];
    window.Store.MediaObject = window.mR.findModule('getOrCreateMediaObject')[0];
    window.Store.MediaUpload = window.mR.findModule('uploadMedia')[0];
    window.Store.Cmd = window.mR.findModule('Cmd')[0].default;
    window.Store.MediaTypes = window.mR.findModule('msgToMediaType')[0];
    window.Store.VCard = window.mR.findModule('vcardFromContactModel')[0];
    window.Store.UserConstructor = window.mR.findModule((module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null)[0].default;
    window.Store.Validators = window.mR.findModule('findLinks')[0];
    window.Store.WidFactory = window.mR.findModule('createWid')[0];
    window.Store.BlockContact = window.mR.findModule('blockContact')[0];
    window.Store.GroupMetadata = window.mR.findModule((module) => module.default && module.default.handlePendingInvite)[0].default;
    window.Store.Sticker = window.mR.findModule('Sticker')[0].default.Sticker;
    window.Store.UploadUtils = window.mR.findModule((module) => (module.default && module.default.encryptAndUpload) ? module.default : null)[0].default;
    window.Store.Label = window.mR.findModule('LabelCollection')[0].default;

    console.log("%c ExposeStore.js > Fully injected!", 'color: green; font-weight: bold;');
} catch (ex) {
    console.log("%c Functions.js > Inject Error:", 'color: red; font-weight: bold;', ex);
}
