import fetch from 'node-fetch';

import { API_ENDPOINT, MAX_EMBED_FIELD_CHARS, MAX_EMBED_FOOTER_CHARS } from "./helpers/discord-helpers.js";
import { createJwt, decodeJwt } from "./helpers/jwt-helpers.js";
import { getBan, isBlocked } from "./helpers/user-helpers.js";

export async function handler(event, context) {
    let payload;

    if (process.env.USE_NETLIFY_FORMS) {
        payload = JSON.parse(event.body).payload.data;
    } else {
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405
            };
        }

        const params = new URLSearchParams(event.body);
        payload = {
            age: params.get("age") || undefined,
            banReason: params.get("banReason") || undefined,
            appealText: params.get("appealText") || undefined,
            token: params.get("token") || undefined
        };
    }

    if (payload.age !== undefined &&
        payload.banReason !== undefined &&
        payload.appealText !== undefined &&
        payload.token !== undefined) {
        
        const userInfo = decodeJwt(payload.token);
        if (isBlocked(userInfo.id)) {
            return {
                statusCode: 303,
                headers: {
                    "Location": `/error?msg=${encodeURIComponent("Error!\n\nYou have been blocked from using the appeals form.")}`,
                },
            };
        }
        
        const message = {
            embed: {
                title: `[PENDING] Ban Appeal  -  ${userInfo.username}#${userInfo.discriminator}`,
                timestamp: new Date().toISOString(),
                color: 0xffff55,
                fields: [
                    {
                        name: "What is your username?",
                        value: `\`${userInfo.username}#${userInfo.discriminator}\``
                    },
                    {
                        name: "What is your user ID?",
                        value: `\`${userInfo.id}\``
                    },
                    {
                        name: "What is your email address?",
                        value: `\`${userInfo.email}\``
                    },
                    {
                        name: "What is your age?",
                        value: payload.age.slice(0, MAX_EMBED_FIELD_CHARS)
                    },
                    {
                        name: "Why were you banned?",
                        value: payload.banReason.slice(0, MAX_EMBED_FIELD_CHARS)
                    },
                    {
                        name: "In your own words, why should you be unbanned?",
                        value: payload.appealText.slice(0, MAX_EMBED_FIELD_CHARS)
                    }
                ]
            }
        }

        if (process.env.GUILD_ID) {
            if (!process.env.DISABLE_UNBAN_LINK) {
                const unbanUrl = new URL("/.netlify/functions/unban", DEPLOY_PRIME_URL);
                const unbanInfo = {
                    userId: userInfo.id
                };
    
                message.components = [{
                    type: 1,
                    components: [
                        /*{
                            type: 2,
                            style: 5,
                            label: "Approve Appeal",
                            url: `${unbanUrl.toString()}?token=${encodeURIComponent(createJwt(unbanInfo))}`
                        },*/
                        {
                            type: 2,
                            style: 3,
                            label: "Approve",
                            custom_id: "appeal_approve",
                            disabled: true
                        },
                        {
                            type: 2,
                            style: 4,
                            label: "Deny",
                            custom_id: "appeal_deny",
                            disabled: true
                        },
                        {
                            type: 2,
                            style: 1,
                            label: "Claim",
                            custom_id: "appeal_claim",
                            disabled: false
                        }
                    ]
                }];
            }
        }

        const result = await fetch(`${API_ENDPOINT}/channels/${encodeURIComponent(process.env.APPEALS_CHANNEL)}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
            },
            body: JSON.stringify(message)
        });

        if (result.ok) {
            if (process.env.USE_NETLIFY_FORMS) {
                return {
                    statusCode: 200
                };
            } else {
                return {
                    statusCode: 303,
                    headers: {
                        "Location": "/success"
                    }
                };
            }
        } else {
            console.log(JSON.stringify(await result.json()));
            throw new Error("Failed to submit message");
        }
    }

    return {
        statusCode: 400
    };
}
