import { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { useArtworks } from '../hooks/useArtworks';
import type { Artwork } from '../hooks/useArtworks';

export const ArtworksTable = () => {
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 12,
        page: 1,
    });

    const { data, totalRecords, loading, error } = useArtworks(lazyParams.page);

    // Persistent Selection State: stores ALL selected artwork IDs across all pages
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Pending custom selection count: used to auto-select rows as user paginates
    const [pendingSelectionCount, setPendingSelectionCount] = useState<number>(0);

    // Overlay Panel ref for custom selection
    const overlayPanelRef = useRef<OverlayPanel>(null);
    const [customSelectCount, setCustomSelectCount] = useState<number | null>(null);

    const onPage = (event: DataTableStateEvent) => {
        setLazyParams({
            ...lazyParams,
            first: event.first,
            page: (event.page || 0) + 1,
            rows: event.rows,
        });
    };

    // Sync the `selectedIds` set into an array of objects for PrimeReact's `selection` prop
    // PrimeReact DataTable needs full row objects or at least objects with the `dataKey` to show checkboxes as selected.
    // We filter the current page's `data` to find which ones are in `selectedIds`.
    const selectedRows = data.filter((row) => selectedIds.has(row.id));

    const onSelectionChange = (e: any) => {
        // Determine if we are checking or unchecking
        // e.value contains the currently selected items on *this page* due to our selectedRows calculation
        // However, PrimeReact replaces the entire selection array matching the current view.
        const newPageSelection = e.value as Artwork[];

        setSelectedIds((prevSelectedIds) => {
            const updatedSet = new Set(prevSelectedIds);

            // Step 1: Remove all IDs from current page in the persistent set
            data.forEach(item => {
                updatedSet.delete(item.id);
            });

            // Step 2: Add back the ones that are actually selected now
            newPageSelection.forEach(item => {
                updatedSet.add(item.id);
            });

            return updatedSet;
        });
    };

    const submitCustomSelection = () => {
        if (!customSelectCount || customSelectCount <= 0) return;

        setPendingSelectionCount(customSelectCount);
        // When starting a new custom selection, we should probably clear existing selections
        // or keep them? The requirements just say "An Overlay panel which allows user to custom select n number of rows".
        // Usually, we replace the selection, but let's just add to them or start fresh? Let's start fresh for clarity.
        setSelectedIds(new Set());

        // Auto-select on current page immediately
        processPendingSelection(data, customSelectCount, new Set());

        if (overlayPanelRef.current) {
            overlayPanelRef.current.hide();
        }
    };

    // Triggers whenever data changes or pendingSelectionCount changes
    useEffect(() => {
        if (pendingSelectionCount > 0 && data.length > 0) {
            processPendingSelection(data, pendingSelectionCount, selectedIds);
        }
    }, [data, pendingSelectionCount]);

    const processPendingSelection = (currentData: Artwork[], pendingCount: number, currentSelectedIds: Set<number>) => {
        // Find how many rows on the current page are NOT already selected
        const unselectedRows = currentData.filter(row => !currentSelectedIds.has(row.id));

        if (unselectedRows.length === 0) return; // All already selected

        const rowsToSelect = unselectedRows.slice(0, pendingCount);

        setSelectedIds(prev => {
            const newSet = new Set(prev);
            rowsToSelect.forEach(row => newSet.add(row.id));
            return newSet;
        });

        setPendingSelectionCount(prev => prev - rowsToSelect.length);
    };

    const headerTemplate = () => {
        return (
            <div className="flex justify-between items-center bg-gray-50 p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 m-0">Art Institute of Chicago Gallery</h2>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        icon="pi pi-check-square"
                        label="Custom Select"
                        outlined
                        onClick={(e) => overlayPanelRef.current?.toggle(e)}
                    />
                    <OverlayPanel ref={overlayPanelRef} showCloseIcon className="p-4 shadow-xl border border-gray-200 rounded-lg">
                        <div className="flex flex-col gap-3 w-64">
                            <span className="font-semibold text-gray-700">Select N Rows</span>
                            <p className="text-sm text-gray-500 m-0">
                                Enter the number of rows to select. Navigation will automatically select rows until N is reached.
                            </p>
                            <InputNumber
                                value={customSelectCount}
                                onValueChange={(e) => setCustomSelectCount(e.value || 0)}
                                placeholder="Enter number..."
                                min={1}
                                className="w-full"
                            />
                            <Button label="Select" onClick={submitCustomSelection} disabled={!customSelectCount || customSelectCount <= 0} />
                        </div>
                    </OverlayPanel>
                </div>
            </div>
        );
    };

    if (error) {
        return <div className="text-red-500 p-4 bg-red-50 rounded-md border border-red-200 m-4">Error: {error}</div>;
    }

    return (
        <div className="shadow-lg rounded-xl overflow-hidden bg-white border border-gray-100">
            <DataTable
                value={data}
                lazy
                paginator
                first={lazyParams.first}
                rows={lazyParams.rows}
                totalRecords={totalRecords}
                onPage={onPage}
                loading={loading}
                dataKey="id"
                selection={selectedRows}
                selectionMode="multiple"
                onSelectionChange={onSelectionChange}
                selectAll={false} // Since we want page-level select all, we rely on the checkbox header.
                header={headerTemplate()}
                className="p-datatable-sm"
                stripedRows
                rowHover
                emptyMessage="No artworks found."
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="title" header="Title" sortable style={{ minWidth: '14rem' }}></Column>
                <Column field="place_of_origin" header="Place of Origin" sortable style={{ minWidth: '10rem' }}></Column>
                <Column field="artist_display" header="Artist" sortable style={{ minWidth: '14rem' }}></Column>
                <Column field="inscriptions" header="Inscriptions" style={{ minWidth: '10rem' }}></Column>
                <Column field="date_start" header="Start Date" sortable style={{ minWidth: '8rem' }}></Column>
                <Column field="date_end" header="End Date" sortable style={{ minWidth: '8rem' }}></Column>
            </DataTable>

            {/* Optional Debug info to verify requirements */}
            <div className="bg-gray-100 p-3 text-sm text-gray-600 border-t border-gray-200">
                <span className="font-semibold">Persistent Selections:</span> {selectedIds.size} rows selected.
                {pendingSelectionCount > 0 && <span className="ml-4 text-blue-600 font-semibold">Pending Auto-select: {pendingSelectionCount}</span>}
            </div>
        </div>
    );
};
