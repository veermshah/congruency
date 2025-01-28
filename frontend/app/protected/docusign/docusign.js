const fs = require("fs");
const path = require("path");
const docusign = require("docusign-esign");

// Configuration
const DOCUSIGN_INTEGRATION_KEY = "67492a15-3a18-4392-a49f-e13c672aeab5";
const USER_ID = "180ec9a5-a684-4cb5-b51c-6c0cb0f8e696";
const ACCOUNT_ID = "e4a33e8c-95ce-4f85-b07c-be1628f27be2";
const BASE_PATH = "https://demo.docusign.net/restapi";
const PRIVATE_KEY_PATH = path.resolve("private.key");

/**
 * Generates the structure of an envelope with a document and signer
 * @param {Object} args - Parameters for the envelope creation
 * @returns {docusign.EnvelopeDefinition} The constructed envelope
 */
function makeEnvelope(args) {
  // Read the document file in binary format
  const docPdfBytes = fs.readFileSync(args.docFile);

  // Create an envelope definition instance
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = "Please review and sign this document";

  // Add the document to the envelope
  let doc1 = new docusign.Document();
  let doc1b64 = Buffer.from(docPdfBytes).toString("base64");
  doc1.documentBase64 = doc1b64;
  doc1.name = "Document for signing"; // The document's name
  doc1.fileExtension = "pdf";
  doc1.documentId = "1";

  env.documents = [doc1];

  // Define the signer with necessary information
  let signer1 = docusign.Signer.constructFromObject({
    email: args.signerEmail,
    name: args.signerName,
    clientUserId: args.signerClientId,
    recipientId: 1,
  });

  // Define where the signer should place their signature
  let signHere1 = docusign.SignHere.constructFromObject({
    anchorString: "/sn1/",
    anchorYOffset: "10",
    anchorUnits: "pixels",
    anchorXOffset: "20",
  });

  // Attach the signature fields to the signer
  let signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1],
  });
  signer1.tabs = signer1Tabs;

  // Assign the signer to the envelope
  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer1],
  });
  env.recipients = recipients;

  // Set the envelope's status to "sent"
  env.status = "sent";

  return env;
}

/**
 * Prepares the request for the embedded signing view
 * @param {Object} args - Parameters for the recipient view request
 * @returns {docusign.RecipientViewRequest} The recipient view setup
 */
function makeRecipientViewRequest(args) {
  let viewRequest = new docusign.RecipientViewRequest();

  // URL to redirect the signer to after completing the document signing
  viewRequest.returnUrl = args.dsReturnUrl;

  // Method used to authenticate the account (in this case, no additional method)
  viewRequest.authenticationMethod = "none";

  // Recipient's information, should match the signer data
  viewRequest.email = args.signerEmail;
  viewRequest.userName = args.signerName;
  viewRequest.clientUserId = args.signerClientId;

  // Optional setting to check for activity every 10 minutes
  viewRequest.pingFrequency = "600"; // seconds
  viewRequest.pingUrl = args.dsPingUrl;

  return viewRequest;
}

/**
 * Initiates the process to send the envelope for signing in an embedded view
 * @param {Object} args - Parameters needed for the envelope and signer view
 * @returns {Object} Result containing the envelope ID and URL for the embedded signing
 */
const sendEnvelopeForEmbeddedSigning = async (args) => {
  // Initialize the DocuSign API client
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader("Authorization", "Bearer " + args.accessToken);
  
  // Create an instance of the Envelopes API
  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  try {
    // Create the envelope
    let envelope = makeEnvelope(args.envelopeArgs);

    // Send the envelope to DocuSign
    const results = await envelopesApi.createEnvelope(args.accountId, {
      envelopeDefinition: envelope,
    });

    const envelopeId = results.envelopeId;
    console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

    // Prepare the recipient view request
    const viewRequest = makeRecipientViewRequest(args.envelopeArgs);

    // Create the recipient's embedded signing view
    const recipientView = await envelopesApi.createRecipientView(args.accountId, envelopeId, {
      recipientViewRequest: viewRequest,
    });

    return { envelopeId: envelopeId, redirectUrl: recipientView.url };
  } catch (error) {
    console.error("Error in sendEnvelopeForEmbeddedSigning:", error);
    throw error;
  }
};

// Example usage
(async () => {
  try {
    const args = {
      accessToken: "eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAYABwCAaPDDKT_dSAgAgPR2Cyo_3UgCAKXJDhiEprVMtRxsDLD45pYVAAEAAAAYAAEAAAAFAAAADQAkAAAANjc0OTJhMTUtM2ExOC00MzkyLWE0OWYtZTEzYzY3MmFlYWI1IgAkAAAANjc0OTJhMTUtM2ExOC00MzkyLWE0OWYtZTEzYzY3MmFlYWI1NwAxND1Hwiu3QKAo2spL7YfoMACAKq-eKD_dSA.Of3Ss9ucXRrVa8Me66pkC08Q-NAgfvuHtSTe9iaARH5PaCtTj7SeMkmHYw5Yy4gUF-Z_cvqyvBfA9O5Wp1Xxus2Ydlx896rsz6yewUPAIiEIb6WCRpQFJCRa6ZK9zkHEImtY7HMFjX1qbq5k8huXK01Orhgxo8iR0mFLeb1Is0onUNf6t9B3TPJLKQtysUo5nKZa5Ybu3wTXglDRgfI6jHfYht5v_MeAzu1xGDF0KbDDMqE5smJBhzVENueurzEdP1GTDphqoJnGvcPtuTzTRLs2HvjTIZhVf2wSOKyn3mayNP0abWPedCj6BmVj7GIbNHGwoOVohoLFy7z8yFkDhQ", // Replace with your actual access token
      accountId: ACCOUNT_ID,
      basePath: BASE_PATH,
      envelopeArgs: {
        signerEmail: "sourish.pasula@gmail.com",
        signerName: "Recipient Name",
        signerClientId: "1000",
        docFile: path.resolve("sample_doc.pdf"),
        dsReturnUrl: "http://localhost:3000/protected/docusign",
        dsPingUrl: "http://localhost:3000"
      }
    };

    const results = await sendEnvelopeForEmbeddedSigning(args);
    console.log("Success:", results);
  } catch (error) {
    console.error("Error:", error);
  }
})();
