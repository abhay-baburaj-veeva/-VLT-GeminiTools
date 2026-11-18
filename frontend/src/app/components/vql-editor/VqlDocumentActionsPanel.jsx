import React from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    Spinner,
    Stack,
    Text,
    Badge,
    NativeSelect,
} from '@chakra-ui/react';
import { LuPlay, LuRefreshCw, LuSquareCheck, LuSquare } from 'react-icons/lu';

export function VqlDocumentActionsPanel({
    records = [],
    mode = 'single',
    onSwitchMode,
    selectedDoc,
    onSelectDoc,
    bulkDocIds = [],
    onToggleBulkDocId,
    onSetAllBulkDocIds,
    actions,
    loadingActions,
    actionError,
    actionSuccess,
    onRunAction,
    onRunBulkAction,
}) {
    const hasRecords = Array.isArray(records) && records.length > 0;

    return (
        <Box p={4} height='100%' overflowY='auto'>
            {!hasRecords ? (
                <Text fontSize='sm' color='gray.500'>
                    Run a VQL query on <b>documents</b> (including <code>id</code>,{' '}
                    <code>major_version_number__v</code>, and <code>minor_version_number__v</code>) to inspect and
                    trigger live Vault lifecycle actions.
                </Text>
            ) : (
                <Stack gap={4}>
                    {/* Mode Switcher */}
                    <Flex justify='space-between' align='center' wrap='wrap' gap={2}>
                        <Flex gap={2}>
                            <Button
                                size='xs'
                                variant={mode === 'single' ? 'solid' : 'outline'}
                                colorPalette='orange'
                                onClick={() => onSwitchMode?.('single')}
                            >
                                Single Document
                            </Button>
                            <Button
                                size='xs'
                                variant={mode === 'bulk' ? 'solid' : 'outline'}
                                colorPalette='orange'
                                onClick={() => onSwitchMode?.('bulk')}
                            >
                                Bulk Actions ({bulkDocIds.length})
                            </Button>
                        </Flex>
                        <Text fontSize='xs' color='gray.500'>
                            {records.length} queried record(s) loaded
                        </Text>
                    </Flex>

                    {/* SINGLE DOCUMENT SELECTOR */}
                    {mode === 'single' && (
                        <Flex gap={3} alignItems='flex-end' wrap='wrap'>
                            <Box flex='1' minW='280px'>
                                <Text fontSize='xs' fontWeight='semibold' color='gray.500' mb={1}>
                                    SELECT QUERIED DOCUMENT
                                </Text>
                                <NativeSelect.Root size='sm'>
                                    <NativeSelect.Field
                                        value={selectedDoc?.id ?? ''}
                                        onChange={(e) => {
                                            const match = records.find(
                                                (r) => String(r.id) === String(e.target.value),
                                            );
                                            if (match) onSelectDoc(match);
                                        }}
                                    >
                                        <option value='' disabled>
                                            Choose a document from query results...
                                        </option>
                                        {records.map((doc, idx) => (
                                            <option key={`${doc.id}-${idx}`} value={doc.id}>
                                                {doc.id} — {doc.name__v || 'Untitled'} ({doc.status__v || 'Unknown'}) [v
                                                {doc.major_version_number__v ?? '?'}.{doc.minor_version_number__v ?? '?'}]
                                            </option>
                                        ))}
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>
                            </Box>

                            {selectedDoc && (
                                <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => onSelectDoc(selectedDoc)}
                                    disabled={loadingActions}
                                >
                                    <LuRefreshCw />
                                    Refresh Actions
                                </Button>
                            )}
                        </Flex>
                    )}

                    {/* BULK MULTI-SELECT LIST */}
                    {mode === 'bulk' && (
                        <Box borderWidth='1px' borderRadius='md' p={3}>
                            <Flex justify='space-between' align='center' mb={2}>
                                <Text fontSize='xs' fontWeight='semibold' color='gray.500'>
                                    SELECT DOCUMENTS FOR BULK ACTION ({bulkDocIds.length} SELECTED)
                                </Text>
                                <Flex gap={2}>
                                    <Button
                                        size='xs'
                                        variant='ghost'
                                        onClick={() => onSetAllBulkDocIds?.(records.map((r) => r.id))}
                                    >
                                        Select All ({records.length})
                                    </Button>
                                    <Button
                                        size='xs'
                                        variant='ghost'
                                        onClick={() => onSetAllBulkDocIds?.([])}
                                        disabled={bulkDocIds.length === 0}
                                    >
                                        Clear
                                    </Button>
                                </Flex>
                            </Flex>

                            <Box maxH='140px' overflowY='auto'>
                                <Stack gap={1}>
                                    {records.map((doc, idx) => {
                                        const isChecked = bulkDocIds.includes(String(doc.id));
                                        return (
                                            <Flex
                                                key={`${doc.id}-${idx}`}
                                                align='center'
                                                gap={2}
                                                px={2}
                                                py={1}
                                                borderRadius='sm'
                                                cursor='pointer'
                                                bg={isChecked ? 'orange.subtle' : 'transparent'}
                                                _hover={{ bg: 'whiteAlpha.100' }}
                                                onClick={() => onToggleBulkDocId?.(doc.id)}
                                            >
                                                {isChecked ? <LuSquareCheck /> : <LuSquare />}
                                                <Text fontSize='xs' fontWeight='medium'>
                                                    {doc.id}
                                                </Text>
                                                <Text fontSize='xs' truncate flex='1'>
                                                    {doc.name__v || 'Untitled'}
                                                </Text>
                                                {doc.status__v && (
                                                    <Badge size='xs' colorPalette='gray'>
                                                        {doc.status__v}
                                                    </Badge>
                                                )}
                                            </Flex>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </Box>
                    )}

                    {/* ACTIONS DISPLAY & EXECUTION */}
                    {((mode === 'single' && selectedDoc) || (mode === 'bulk' && bulkDocIds.length > 0)) && (
                        <Box p={3} borderWidth='1px' borderRadius='md'>
                            {mode === 'single' && selectedDoc && (
                                <Flex justify='space-between' align='center' wrap='wrap' gap={2} mb={3}>
                                    <Heading size='sm'>
                                        {selectedDoc.name__v || `Document #${selectedDoc.id}`}
                                    </Heading>
                                    <Flex gap={2} wrap='wrap'>
                                        <Badge colorPalette='blue'>ID: {selectedDoc.id}</Badge>
                                        {selectedDoc.major_version_number__v !== undefined && (
                                            <Badge colorPalette='purple'>
                                                v{selectedDoc.major_version_number__v}.
                                                {selectedDoc.minor_version_number__v}
                                            </Badge>
                                        )}
                                        {selectedDoc.status__v && (
                                            <Badge colorPalette='green'>{selectedDoc.status__v}</Badge>
                                        )}
                                    </Flex>
                                </Flex>
                            )}

                            {loadingActions && (
                                <Flex align='center' gap={2} py={2}>
                                    <Spinner size='sm' />
                                    <Text fontSize='sm' color='gray.500'>
                                        Fetching live Vault lifecycle actions...
                                    </Text>
                                </Flex>
                            )}

                            {actionError && (
                                <Box p={3} mb={3} borderRadius='md' bg='red.50' _dark={{ bg: 'red.950' }}>
                                    <Text fontSize='xs' color='red.600' _dark={{ color: 'red.300' }}>
                                        {actionError}
                                    </Text>
                                </Box>
                            )}

                            {actionSuccess && (
                                <Box p={3} mb={3} borderRadius='md' bg='green.50' _dark={{ bg: 'green.950' }}>
                                    <Text fontSize='xs' color='green.600' _dark={{ color: 'green.300' }}>
                                        {actionSuccess}
                                    </Text>
                                </Box>
                            )}

                            {!loadingActions && !actionError && actions.length === 0 && (
                                <Box p={3} borderRadius='md' bg='gray.50' _dark={{ bg: 'whiteAlpha.50' }}>
                                    <Text fontSize='sm' fontWeight='medium' color='gray.500'>
                                        No actions available
                                    </Text>
                                    <Text fontSize='xs' color='gray.500' mt={1}>
                                        {mode === 'single'
                                            ? `No lifecycle user actions are available for your user on Document #${selectedDoc.id} in its current "${selectedDoc.status__v || 'current'}" state.`
                                            : `No common lifecycle user actions are shared across all ${bulkDocIds.length} selected documents. Try selecting documents in the same lifecycle and state.`}
                                    </Text>
                                </Box>
                            )}

                            {!loadingActions && actions.length > 0 && (
                                <Box>
                                    <Text fontSize='xs' fontWeight='semibold' color='gray.500' mb={2}>
                                        {mode === 'single'
                                            ? `AVAILABLE LIFECYCLE ACTIONS (${actions.length})`
                                            : `COMMON BULK ACTIONS FOR ${bulkDocIds.length} DOCUMENT(S) (${actions.length})`}
                                    </Text>
                                    <Flex gap={2} wrap='wrap'>
                                        {actions.map((action) => (
                                            <Button
                                                key={action.name}
                                                size='sm'
                                                variant='outline'
                                                colorPalette='teal'
                                                onClick={() =>
                                                    mode === 'single'
                                                        ? onRunAction?.(action.name)
                                                        : onRunBulkAction?.(action.name)
                                                }
                                            >
                                                <LuPlay />
                                                {action.label || action.name}
                                                {mode === 'bulk' ? ` (${bulkDocIds.length})` : ''}
                                            </Button>
                                        ))}
                                    </Flex>
                                </Box>
                            )}
                        </Box>
                    )}
                </Stack>
            )}
        </Box>
    );
}
