import { getAuthorizationHeader } from '../ApiService.js';
import { getAPIEndpoint, request, RequestMethod } from './VaultRequest.js';

const URL_DOC_TYPES = '/metadata/objects/documents/types';
const URL_DOC_ALL_FIELDS = '/metadata/objects/documents/properties';

/**
 * Retrieve all document types. These are the top-level of the document
 * type/subtype/classification hierarchy.
 * @returns DocumentTypesResponse, ResponseHeaders
 */
export async function retrieveAllDocumentTypes() {
    const url = getAPIEndpoint(URL_DOC_TYPES);

    const headers = await getAuthorizationHeader();
    const method = RequestMethod.GET;

    const requestOptions = {
        headers,
        method,
    };

    const retrieveAllDocumentTypesResponse = await request(url, requestOptions);
    const responseHeaders = retrieveAllDocumentTypesResponse?.headers;
    const response = await retrieveAllDocumentTypesResponse.json();

    return { response, responseHeaders };
}

/**
 * Retrieve all document fields. Retrieve all standard and custom document fields and field properties.
 * @returns DocumentFieldResponse, ResponseHeaders
 */
export async function retrieveAllDocumentFields() {
    const url = getAPIEndpoint(URL_DOC_ALL_FIELDS);

    const headers = await getAuthorizationHeader();
    const method = RequestMethod.GET;

    const requestOptions = {
        headers,
        method,
    };

    const retrieveAllDocumentFieldsResponse = await request(url, requestOptions);
    const responseHeaders = retrieveAllDocumentFieldsResponse?.headers;
    const response = await retrieveAllDocumentFieldsResponse.json();

    return { response, responseHeaders };
}
/**
 * Retrieve available lifecycle user actions for a specific document version
 * GET /api/{version}/objects/documents/{doc_id}/versions/{major_version}/{minor_version}/lifecycle_actions
 */
export async function retrieveDocumentUserActions(docId, majorVersion, minorVersion) {
    const url = getAPIEndpoint(
        `/objects/documents/${docId}/versions/${majorVersion}/${minorVersion}/lifecycle_actions`,
    );
    const headers = await getAuthorizationHeader();

    const rawResponse = await request(url, {
        headers,
        method: RequestMethod.GET,
    });
    const responseHeaders = rawResponse?.headers;
    const response = await rawResponse.json();

    return { response, responseHeaders };
}

/**
 * Execute a specific lifecycle user action on a document version
 * PUT /api/{version}/objects/documents/{doc_id}/versions/{major_version}/{minor_version}/lifecycle_actions/{action_name}
 */
export async function initiateDocumentUserAction(docId, majorVersion, minorVersion, actionName, payload = {}) {
    const url = getAPIEndpoint(
        `/objects/documents/${docId}/versions/${majorVersion}/${minorVersion}/lifecycle_actions/${actionName}`,
    );
    const headers = await getAuthorizationHeader();

    const rawResponse = await request(url, {
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
        method: RequestMethod.PUT,
        body: JSON.stringify(payload),
    });
    const responseHeaders = rawResponse?.headers;
    const response = await rawResponse.json();

    return { response, responseHeaders };
}

/**
 * Retrieve common lifecycle user actions across multiple documents
 * POST /api/{version}/objects/documents/lifecycle_actions
 */
export async function retrieveBulkDocumentUserActions(docIds) {
    const url = getAPIEndpoint('/objects/documents/lifecycle_actions');
    const headers = await getAuthorizationHeader();

    const formBody = new URLSearchParams();
    formBody.append('docIds', docIds.join(','));

    const rawResponse = await request(url, {
        headers: {
            ...headers,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: RequestMethod.POST,
        body: formBody.toString(),
    });
    const responseHeaders = rawResponse?.headers;
    const response = await rawResponse.json();

    return { response, responseHeaders };
}

/**
 * Execute a lifecycle user action in bulk across multiple documents
 * PUT /api/{version}/objects/documents/lifecycle_actions/{action_name}
 */
export async function initiateBulkDocumentUserAction(docIds, actionName) {
    const url = getAPIEndpoint(`/objects/documents/lifecycle_actions/${actionName}`);
    const headers = await getAuthorizationHeader();

    const formBody = new URLSearchParams();
    formBody.append('docIds', docIds.join(','));

    const rawResponse = await request(url, {
        headers: {
            ...headers,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: RequestMethod.PUT,
        body: formBody.toString(),
    });
    const responseHeaders = rawResponse?.headers;
    const response = await rawResponse.json();

    return { response, responseHeaders };
}