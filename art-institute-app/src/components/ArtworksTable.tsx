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

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [rowsRemaining, setRowsRemaining] = useState<number>(0);
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

    const selectedRows = data.filter((row) => selectedIds.has(row.id));

    const onSelectionChange = (e: any) => {
        const newPageSelection = e.value as Artwork[];

        setSelectedIds((prevSelectedIds) => {
            const updatedSet = new Set(prevSelectedIds);

            data.forEach(item => {
                updatedSet.delete(item.id);
            });

            newPageSelection.forEach(item => {
                updatedSet.add(item.id);
            });

            return updatedSet;
        });
    };

    const handleSelectSubmit = () => {
        if (!customSelectCount || customSelectCount <= 0) return;

        setRowsRemaining(customSelectCount);
        setSelectedIds(new Set());
        checkSelectionQueue(data, customSelectCount, new Set());

        if (overlayPanelRef.current) {
            overlayPanelRef.current.hide();
        }
    };

    useEffect(() => {
        if (rowsRemaining > 0 && data.length > 0) {
            checkSelectionQueue(data, rowsRemaining, selectedIds);
        }
    }, [data, rowsRemaining]);

    const checkSelectionQueue = (currentData: Artwork[], pendingCount: number, currentSelectedIds: Set<number>) => {
        const unselectedRows = currentData.filter(row => !currentSelectedIds.has(row.id));

        if (unselectedRows.length === 0) return;

        const rowsToSelect = unselectedRows.slice(0, pendingCount);

        setSelectedIds(prev => {
            const newSet = new Set(prev);
            rowsToSelect.forEach(row => newSet.add(row.id));
            return newSet;
        });

        setRowsRemaining(prev => prev - rowsToSelect.length);
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
                            <Button label="Select" onClick={handleSelectSubmit} disabled={!customSelectCount || customSelectCount <= 0} />
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

        </div>
    );
};
