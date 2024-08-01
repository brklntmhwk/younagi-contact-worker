import { EmailMessage } from "cloudflare:email";
import { createMimeMessage, Mailbox } from "mimetext/browser";

export default {
    async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
        try {
					const data = (await request.json()) as {
						name: string;
						email: string;
						message: string;
					};

            const name = data["name"];
            const email = data["email"];
            const message = data["message"];

            const textContent = `Name:\n${name}\n\n` +
                `Email:\n${email}\n\n`+
                `Message:\n${message}\n\n`;

            const mimeMessage = createMimeMessage();
            mimeMessage.setSender(env.SENDER);
            mimeMessage.setRecipient(env.RECIPIENT);
            mimeMessage.setSubject(`${env.SITE_NAME} got a new message from ${name}`);
            mimeMessage.addMessage({
                contentType: 'text/plain',
                data: textContent
            });
            mimeMessage.setHeader("Reply-To", new Mailbox({ name, addr: email }));

            await env.SEB.send(new EmailMessage(
                env.SENDER.addr,
                env.RECIPIENT.addr,
                mimeMessage.asRaw()
            ));

            return new Response("Email successfully sent.", { status: 200 });
				} catch (e) {
					if (e instanceof Error) {
						return new Response(`Failed to send email due to the error "${e.name}: ${e.message}"`, { status: 500 });
					}
					return new Response(`An unexpected error occurred.`, { status: 500 });
        }
    }
};
