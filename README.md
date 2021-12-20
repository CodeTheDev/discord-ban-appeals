# WilburSoot Discord Ban Appeals Form
[![Netlify Status](https://api.netlify.com/api/v1/badges/af99b515-955a-47a3-964a-6076c444b2d1/deploy-status)](https://app.netlify.com/sites/hardcore-kalam-a47bd1/deploys)

A form app that allows banned users to appeal their bans from WilburSoot's Discord in an honest way. This form app integrates with Sootbot and uses Discord OAuth2 to ensure that users cannot create forged, faked or troll appeals.

Forked from [sylveon/discord-ban-appeals](https://github.com/sylveon/discord-ban-appeals).

## Blocking Users From The Form

***IMPORTANT: This is a good reminder on how to properly block spammers from using the form. Do not remove.***

Users that spam requests can be blocked by creating an environment variable called `BLOCKED_USERS`, which should contain a comma-separated list of quoted user IDs. To do this:

1. On your [Netlify dashboard](https://app.netlify.com), click **Deploys** and navigate to **Deploy settings**, and then to the **Environment** option.

2. Under **Environment variables**, click **Edit variables**.

3. Right click on any mention of the user you want to block, and click **Copy ID**. You need developer mode enabled for this option to show up, see instructions above.

4. Click **New variable**, and create an environment variable with `BLOCKED_USERS` as its key. For the value, paste in the user ID you copied in the previous step.
   ![](https://i.imgur.com/5hGRufC.png)

5. To add more IDs, add a comma after the first quoted ID, and then repeat these steps starting from step 3.
   ![](https://i.imgur.com/jNKgS2B.png)

6. Redeploy the site with **Deploys** -> **Trigger deploy** -> **Deploy site**.
