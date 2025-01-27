const fs = require("fs");
const path = require("path");
const docusign = require("docusign-esignature");

const DOCUSIGN_INTEGRATION_KEY = "67492a15-3a18-4392-a49f-e13c672aeab5";
const USER_ID = "180ec9a5-a684-4cb5-b51c-6c0cb0f8e696"; // Also known as API Username
const BASE_URI = "https://demo.docusign.net"; // Sandbox environment
const OAUTH_HOST = "account-d.docusign.com";
const PRIVATE_KEY_PATH = path.resolve("frontend/private.key"); // Path to your RSA private key

// DocuSign Account ID
const ACCOUNT_ID = "e4a33e8c-95ce-4f85-b07c-be1628f27be2"; // Found in the DocuSign Admin Console

// Step 1: Authenticate using JWT
async function authenticateWithJWT() {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BASE_URI);
  apiClient.setOAuthBasePath(OAUTH_HOST);

  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH);

  const jwtResult = await apiClient.requestJWTUserToken(
    DOCUSIGN_INTEGRATION_KEY,
    USER_ID,
    ["signature", "impersonation"],
    privateKey,
    3600
  );

  const { access_token } = jwtResult.body;
  apiClient.addDefaultHeader("Authorization", `Bearer ${access_token}`);
  return apiClient;
}

// Step 2: Send a Document for Signing
async function sendDocumentForSignature() {
  const apiClient = await authenticateWithJWT();

  const envelopesApi = new docusign.EnvelopesApi(apiClient);

  // Prepare the document
  const documentBytes = fs.readFileSync(path.resolve("sample_document.pdf"));
  const documentBase64 = Buffer.from(documentBytes).toString("base64");

  const document = {
    documentBase64: documentBase64,
    name: "Sample Contract", // Document name
    fileExtension: "pdf", // File extension
    documentId: "1", // Unique identifier
  };

  // Define the signer
  const signer = {
    email: "sourish.pasula@gmail.com", // Replace with the recipient's email
    name: "John Doe", // Replace with the recipient's name
    recipientId: "1",
    routingOrder: "1",
    tabs: {
      signHereTabs: [
        {
          anchorString: "/SignHere/", // Add this string to your document to position the signature
          anchorYOffset: "10",
          anchorXOffset: "20",
        },
      ],
    },
  };

  // Define the envelope
  const envelopeDefinition = {
    emailSubject: "Please sign this document",
    documents: [document],
    recipients: {
      signers: [signer],
    },
    status: "sent", // "sent" to send immediately or "created" to save as draft
  };

  // Send the envelope
  const results = await envelopesApi.createEnvelope(ACCOUNT_ID, {
    envelopeDefinition: envelopeDefinition,
  });

  console.log("Envelope sent! Envelope ID:", results.envelopeId);
}

// Run the script
sendDocumentForSignature()
  .then(() => console.log("Document sent for signing!"))
  .catch((error) => console.error("Error:", error));
