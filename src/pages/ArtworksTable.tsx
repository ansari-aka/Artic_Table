import { useEffect, useMemo, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import type {
    DataTablePageEvent,
    DataTableSelectionMultipleChangeEvent
} from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import type { PaginatorTemplate } from "primereact/paginator";

type Artwork = {
    id: number;
    title: string | null;
    place_of_origin: string | null;
    artist_display: string | null;
    inscriptions: string | null;
    date_start: number | null;
    date_end: number | null;
};

type ApiResponse = {
    data: Artwork[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
        next_url?: string | null;
    };
};

const paginatorTemplate: PaginatorTemplate = {
    layout:
        "CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown",
};


const ROWS_PER_PAGE = 12;

export default function ArtworksTable() {
    const [page, setPage] = useState<number>(1);
    const [rows, setRows] = useState<number>(ROWS_PER_PAGE);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const [pageRows, setPageRows] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());

    const opRef = useRef<OverlayPanel>(null);
    const [selectCount, setSelectCount] = useState<string>("");

    useEffect(() => {
        let cancelled = false;

        async function fetchPage() {
            setLoading(true);
            setError(null);
            try {
                const url = `https://api.artic.edu/api/v1/artworks?page=${page}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                const json: ApiResponse = await res.json();

                if (cancelled) return;

                setPageRows(json.data);
                setTotalRecords(json.pagination.total);
            } catch (e) {
                if (!cancelled) setError((e as Error).message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchPage();
        return () => {
            cancelled = true;
        };
    }, [page]);


    const currentPageSelection = useMemo(() => {
        if (pageRows.length === 0) return [];
        return pageRows.filter((r) => selectedIds.has(r.id));
    }, [pageRows, selectedIds]);


    const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
        const selectedOnThisPage = (e.value as Artwork[]) ?? [];
        const selectedOnThisPageIds = new Set(selectedOnThisPage.map((r) => r.id));

        setSelectedIds((prev) => {
            const next = new Set(prev);

            for (const id of selectedOnThisPageIds) next.add(id);

            for (const row of pageRows) {
                if (!selectedOnThisPageIds.has(row.id)) next.delete(row.id);
            }
            return next;
        });
    };

    const onPage = (e: DataTablePageEvent) => {
        const nextPage = (e.page ?? 0) + 1;
        setRows(e.rows);
        setPage(nextPage);
    };

    const applySelectN = () => {
        const n = Number.parseInt(selectCount, 10);

        if (!Number.isFinite(n) || n <= 0) {
            alert("Please enter a valid positive number.");
            return;
        }

        const toSelect = pageRows.slice(0, n);

        setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const row of toSelect) next.add(row.id);
            return next;
        });
        setSelectCount("");
        opRef.current?.hide();
    };

    const selectionHeader =
        (<div className="select-header">
            <button type="button" className="p-link select-arrow" onClick={(e) => opRef.current?.toggle(e)} aria-label="Open select rows panel" >
                <i className="pi pi-chevron-down" />
            </button>
        </div>);

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>

                <span>Selected (across visited pages): {selectedIds.size}</span>
            </div>

            <OverlayPanel ref={opRef}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 240 }}>
                    <label htmlFor="selectCount">Select first N rows (current page)</label>
                    <InputText
                        id="selectCount"
                        value={selectCount}
                        onChange={(e) => setSelectCount(e.target.value)}
                        placeholder="e.g. 5"
                        inputMode="numeric"
                    />
                    <Button type="button" label="Apply" onClick={applySelectN} />
                    <small>
                        Note: Only selects rows currently loaded on this page.
                    </small>
                </div>
            </OverlayPanel>

            {error && (
                <div style={{ marginBottom: 12, color: "crimson" }}>
                    Error: {error}
                </div>
            )}

            <DataTable
                value={pageRows}
                dataKey="id"
                className="artworks-table compact-table"
                loading={loading}
                paginator
                lazy
                rows={rows}
                first={(page - 1) * rows}
                totalRecords={totalRecords}
                onPage={onPage}
                selection={currentPageSelection}
                onSelectionChange={onSelectionChange}
                paginatorTemplate={paginatorTemplate}
                showGridlines
                tableStyle={{ minWidth: "50rem" }}

                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            >
                <Column selectionMode="multiple" header={selectionHeader} headerStyle={{ width: "3rem" }} />
                <Column field="title" header="Title" />
                <Column field="place_of_origin" header="Place of Origin" />
                <Column field="artist_display" header="Artist Display" />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Date Start" />
                <Column field="date_end" header="Date End" />
            </DataTable>
        </div>
    );
}
