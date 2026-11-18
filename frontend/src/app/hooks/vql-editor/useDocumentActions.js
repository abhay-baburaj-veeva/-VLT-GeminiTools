import { useState, useCallback } from 'react';
import {
    retrieveDocumentUserActions,
    initiateDocumentUserAction,
    retrieveBulkDocumentUserActions,
    initiateBulkDocumentUserAction,
} from '../../services/vapil/DocumentRequest';

export function useDocumentActions() {
    const [mode, setMode] = useState('single'); // 'single' | 'bulk'
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [bulkDocIds, setBulkDocIds] = useState([]);
    const [actions, setActions] = useState([]);
    const [loadingActions, setLoadingActions] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);

    const switchMode = useCallback((nextMode) => {
        setMode(nextMode);
        setActions([]);
        setActionError(null);
        setActionSuccess(null);
    }, []);

    // Single-document action retrieval
    const loadActionsForDocument = useCallback(async (row) => {
        if (
            !row?.id ||
            row?.major_version_number__v === undefined ||
            row?.minor_version_number__v === undefined
        ) {
            setSelectedDoc(row);
            setActions([]);
            setActionError(
                'Include id, major_version_number__v, and minor_version_number__v in your VQL SELECT to load document actions.',
            );
            return;
        }

        setSelectedDoc(row);
        setLoadingActions(true);
        setActionError(null);
        setActionSuccess(null);

        try {
            const { response } = await retrieveDocumentUserActions(
                row.id,
                row.major_version_number__v,
                row.minor_version_number__v,
            );

            if (response?.responseStatus === 'FAILURE') {
                const msg = response?.errors?.[0]?.message || 'Vault returned an error retrieving actions.';
                setActionError(msg);
                setActions([]);
            } else {
                setActions(response?.lifecycle_actions || []);
            }
        } catch (err) {
            setActionError(err?.message || 'Failed to retrieve document actions.');
            setActions([]);
        } finally {
            setLoadingActions(false);
        }
    }, []);

    // Single-document action execution
    const runDocumentAction = useCallback(
        async (actionName) => {
            if (!selectedDoc) return;
            setLoadingActions(true);
            setActionError(null);
            setActionSuccess(null);

            try {
                const { response } = await initiateDocumentUserAction(
                    selectedDoc.id,
                    selectedDoc.major_version_number__v,
                    selectedDoc.minor_version_number__v,
                    actionName,
                );

                if (response?.responseStatus === 'FAILURE') {
                    const msg = response?.errors?.[0]?.message || `Failed to run action: ${actionName}`;
                    setActionError(msg);
                } else {
                    setActionSuccess(`Action "${actionName}" completed on Document #${selectedDoc.id}.`);
                    await loadActionsForDocument(selectedDoc);
                }
                return response;
            } catch (err) {
                setActionError(err?.message || `Failed to run action: ${actionName}`);
            } finally {
                setLoadingActions(false);
            }
        },
        [selectedDoc, loadActionsForDocument],
    );

    // Bulk action retrieval across selected document IDs
    const loadBulkActions = useCallback(async (ids) => {
        if (!ids || ids.length === 0) {
            setActions([]);
            setActionError(null);
            return;
        }

        setLoadingActions(true);
        setActionError(null);
        setActionSuccess(null);

        try {
            const { response } = await retrieveBulkDocumentUserActions(ids);

            if (response?.responseStatus === 'FAILURE') {
                const msg = response?.errors?.[0]?.message || 'Failed to retrieve bulk document actions.';
                setActionError(msg);
                setActions([]);
            } else {
                setActions(response?.lifecycle_actions || []);
            }
        } catch (err) {
            setActionError(err?.message || 'Failed to retrieve bulk document actions.');
            setActions([]);
        } finally {
            setLoadingActions(false);
        }
    }, []);

    const toggleBulkDocId = useCallback(
        (docId) => {
            const strId = String(docId);
            setBulkDocIds((prev) => {
                const next = prev.includes(strId) ? prev.filter((id) => id !== strId) : [...prev, strId];
                loadBulkActions(next);
                return next;
            });
        },
        [loadBulkActions],
    );

    const setAllBulkDocIds = useCallback(
        (ids) => {
            const strIds = ids.map(String);
            setBulkDocIds(strIds);
            loadBulkActions(strIds);
        },
        [loadBulkActions],
    );

    // Bulk action execution
    const runBulkAction = useCallback(
        async (actionName) => {
            if (!bulkDocIds.length) return;
            setLoadingActions(true);
            setActionError(null);
            setActionSuccess(null);

            try {
                const { response } = await initiateBulkDocumentUserAction(bulkDocIds, actionName);

                if (response?.responseStatus === 'FAILURE') {
                    const msg = response?.errors?.[0]?.message || `Bulk action "${actionName}" failed.`;
                    setActionError(msg);
                } else {
                    const successCount = response?.data?.filter((d) => d.responseStatus === 'SUCCESS').length;
                    const failCount = response?.data?.filter((d) => d.responseStatus !== 'SUCCESS').length;
                    setActionSuccess(
                        `Bulk action "${actionName}" executed on ${bulkDocIds.length} document(s)` +
                            (successCount !== undefined ? ` (${successCount} succeeded, ${failCount} failed).` : '.'),
                    );
                    await loadBulkActions(bulkDocIds);
                }
                return response;
            } catch (err) {
                setActionError(err?.message || `Bulk action "${actionName}" failed.`);
            } finally {
                setLoadingActions(false);
            }
        },
        [bulkDocIds, loadBulkActions],
    );

    const clearSelectedDocument = useCallback(() => {
        setSelectedDoc(null);
        setBulkDocIds([]);
        setActions([]);
        setActionError(null);
        setActionSuccess(null);
    }, []);

    return {
        mode,
        switchMode,
        selectedDoc,
        bulkDocIds,
        toggleBulkDocId,
        setAllBulkDocIds,
        actions,
        loadingActions,
        actionError,
        actionSuccess,
        loadActionsForDocument,
        runDocumentAction,
        loadBulkActions,
        runBulkAction,
        clearSelectedDocument,
    };
}
