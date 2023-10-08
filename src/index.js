const _ASSETS_URL = "https://raw.githubusercontent.com/AimadBahdir/contact_form_api/master/assets";

const sendMessageToDiscord = async (env, name, email, subject, message) => {
	return await fetch(
		env.WEBHOOK_URL,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(
				{
					"username": env.BOT_NAME ?? "Ridhab",
					"avatar_url": env.BOT_ICON ?? `${_ASSETS_URL}/ridhab.png`,
					"embeds": 
					[
						{
							"author": {
								"icon_url": `${_ASSETS_URL}/user_icon.gif`,
								"name": name
							},
							"title": subject,
							"description": message,
							"color": env.EMBED_COLOR ?? 16777215,
							"footer": {
								"text": email,
								"icon_url": `${_ASSETS_URL}/email_icon.gif`
							}
						}
					]
				}
			)
		}
	);
}

const _response = (env, status, message) => {
	return new Response(
		[101, 204, 205, 304].includes(status) ? null :
		JSON.stringify({
			status: status == 200 ? 'success' : 'error',
			message: message,
		}),
		{
			status: status,
			headers: {
				'content-type': 'application/json;charset=UTF-8',
				"Access-Control-Allow-Origin": env.ALLOWED_ORIGIN ?? "*",
				"Access-Control-Allow-Methods": "POST",
				"Access-Control-Max-Age": "86400",
			},
		},);
}

export default {
	async fetch(request, env, ctx) {
		if (!env.WEBHOOK_URL) {
			return _response(env, 500, 'Webhook URL is not defined');
		}
		if (request.method == 'POST') {
			const body = await request.json();
			if (body.name && body.email && body.subject && body.message) {
				try {
					const data = await sendMessageToDiscord(env, body.name, body.email, body.subject, body.message);
					return _response(env, data.status, data.statusText);
				}
				catch (e) {
					return _response(env, 500, e.message);
				}
			}
			else {
				return _response(env, 400, 'All fields are required');
			}
		}
		else {
			return Response.redirect(env.REDIRECTION ?? "https://www.ridhab.com", 301);
		}
	},
};
