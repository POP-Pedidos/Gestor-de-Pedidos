try {
	let wpp_authenticated = false;
	let last_user_id = undefined;

	const GetUserID = () => window.Store?.Conn?.__x_wid?.user;

	const StartCheckAuthentication = () => setInterval(() => {
		const user_id = GetUserID();

		if (wpp_authenticated === false && !!user_id) {
			wpp_authenticated = true;
			console.log("%c WaitAuth.js > Authenticated!", 'color: cyan; font-weight: bold;');

			window.main.send("user_id", user_id);
			if (window.messages_queue) window.messages_queue.resume();
		} else if (wpp_authenticated === true && !user_id) {
			wpp_authenticated = false;
			console.log("%c WaitAuth.js > Deauthenticated!", 'color: cyan; font-weight: bold;');

			if (window.messages_queue) window.messages_queue.pause();
		}

		if (last_user_id !== user_id) {
			window.main.send("user_id", user_id);
			last_user_id = user_id;
		}
	}, 1000);

	let check_first_auth_interval = setInterval(() => {
		const element_name = `[data-asset-intro-image-light="true"], [data-asset-intro-image-dark="true"]`;

		if (document.querySelector(element_name)) {
			clearInterval(check_first_auth_interval);

			console.log("%c WaitAuth.js > First authentication! Injecting...", 'color: green; font-weight: bold;');

			wpp_authenticated = true;
			window.main.send("authenticated");
			StartCheckAuthentication();
		}
	}, 500);

	console.log("%c WaitAuth.js > Fully injected!", 'color: green; font-weight: bold;');
} catch (ex) {
	console.log("%c WaitAuth.js > Inject Error:", 'color: red; font-weight: bold;', ex);
}