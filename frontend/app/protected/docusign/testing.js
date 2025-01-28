// server.js (Express.js)
const express = require('express');
const axios = require('axios');
const session = require('express-session');
const path = require("path");

const app = express();
const PRIVATE_KEY_PATH = path.resolve("private.key");

// Configure session middleware
app.use(session({
    secret:PRIVATE_KEY_PATH,
    resave: false,
    saveUninitialized: true
}));

const config = {
    integrationKey: '67492a15-3a18-4392-a49f-e13c672aeab5',
    secretKey: PRIVATE_KEY_PATH,
    redirectUri: 'http://localhost:3001/docusign/callback',
    authServer: 'account-d.docusign.com' // Use account.docusign.com for production
};

class DocuSignAuth {
    static getAuthorizationUrl() {
        const params = new URLSearchParams({
            response_type: 'code',
            scope: 'signature',
            client_id: config.integrationKey,
            redirect_uri: config.redirectUri,
            state: 'security_token'
        });

        return `https://${config.authServer}/oauth/auth?${params.toString()}`;
    }

    static async getAccessToken(authCode) {
        const tokenUrl = `https://${config.authServer}/oauth/token`;
        const authString = Buffer.from(`${config.integrationKey}:${config.secretKey}`).toString('base64');

        try {
            const response = await axios.post(tokenUrl, 
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: authCode,
                    redirect_uri: config.redirectUri
                }), {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Token error: ${error.response?.data || error.message}`);
        }
    }

    static async refreshToken(refreshToken) {
        const tokenUrl = `https://${config.authServer}/oauth/token`;
        const authString = Buffer.from(`${config.integrationKey}:${config.secretKey}`).toString('base64');

        try {
            const response = await axios.post(tokenUrl,
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                }), {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Refresh error: ${error.response?.data || error.message}`);
        }
    }
}

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (!req.session.docusignToken) {
        return res.redirect('/docusign/auth');
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.send(`
        <h1>DocuSign Integration Example</h1>
        <a href="/docusign/auth">Connect with DocuSign</a>
    `);
});

app.get('/docusign/auth', (req, res) => {
    const authUrl = DocuSignAuth.getAuthorizationUrl();
    res.redirect(authUrl);
});

app.get('/docusign/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.send(`Authorization failed: ${error}`);
    }

    if (!code) {
        return res.send('No authorization code received');
    }

    try {
        const tokenResponse = await DocuSignAuth.getAccessToken(code);
        req.session.docusignToken = {
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresIn: tokenResponse.expires_in
        };
        res.redirect('/dashboard');
    } catch (error) {
        res.send(`Error getting token: ${error.message}`);
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    const token = req.session.docusignToken;
    res.send(`
        <h1>Dashboard</h1>
        <p>Successfully authenticated with DocuSign!</p>
        <p>Access Token: ${token.accessToken.substring(0, 10)}...</p>
        <p>Token expires in: ${token.expiresIn} seconds</p>
        <a href="/docusign/logout">Logout</a>
    `);
});

app.get('/docusign/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Client-side implementation for browser
const clientScript = `
    // client.js
    class DocuSignClient {
        static async makeAuthenticatedRequest(endpoint, accessToken) {
            try {
                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': \`Bearer \${accessToken}\`,
                        'Content-Type': 'application/json'
                    }
                });
                return await response.json();
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        }

        // Example method to use the access token
        static async getUserInfo(accessToken) {
            return await this.makeAuthenticatedRequest(
                \`https://\${config.authServer}/oauth/userinfo\`,
                accessToken
            );
        }
    }
`;

app.get('/client.js', (req, res) => {
    res.type('application/javascript').send(clientScript);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});