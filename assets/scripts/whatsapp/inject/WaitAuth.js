try {
	const GetUserID = () => window.Store?.Conn?.__x_wid?.user;

	function WaitFirstAuthentication() {
		return new Promise((resolve, reject) => {
			let check_first_auth_interval = setInterval(() => {
				const element_name = `[data-asset-intro-image-light="true"], [data-asset-intro-image-dark="true"]`;

				if (document.querySelector(element_name)) {
					clearInterval(check_first_auth_interval);
					resolve();
				}
			}, 500);
		});
	}

	WaitFirstAuthentication().then(() => {
		console.log("%c WaitAuth.js > First authentication! Injecting...", 'color: green; font-weight: bold;');

		window.main.send("authenticated");

		window.main.once("injected", () => {
			window.main.send("connected");
			window.main.send("user_id", GetUserID());

			window.Store.AppState.on('change:state', (_AppState, state) => {
				const ACCEPTED_STATES = ["CONNECTED", "PAIRING", "TIMEOUT"];

				if (state === "CONNECTED") {
					window.main.send("connected");
					window.main.send("user_id", GetUserID());
					if (window.messages_queue) window.messages_queue.resume();

					console.log("%c WaitAuth.js > Authenticated!", 'color: cyan; font-weight: bold;');
				} else if (!ACCEPTED_STATES.includes(state)) {
					window.main.send("disconnected");
					if (window.messages_queue) window.messages_queue.pause();

					console.log("%c WaitAuth.js > Deauthenticated!", 'color: cyan; font-weight: bold;');
				}
			});
		});
	});

	console.log("%c WaitAuth.js > Fully injected!", 'color: green; font-weight: bold;');
} catch (ex) {
	console.log("%c WaitAuth.js > Inject Error:", 'color: red; font-weight: bold;', ex);
}