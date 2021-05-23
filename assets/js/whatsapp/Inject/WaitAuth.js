let check_auth_interval = setInterval(() => {
	const element_name = `[data-asset-intro-image-light="true"], [data-asset-intro-image-dark="true"]`;

	if(document.querySelector(element_name)) {
		clearInterval(check_auth_interval);

		console.log("%c WaitAuth > Successfully authenticated! Injecting...", 'color: green; font-weight: bold;');

		window.main.send("authenticated");
	}
}, 500);

console.log("%c WaitAuth.js > Fully injected!!", 'color: green; font-weight: bold;');