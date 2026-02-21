import { useState, useEffect } from 'react';

export interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

export interface ApiResponse {
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
    };
    data: Artwork[];
}

export const useArtworks = (page: number) => {
    const [data, setData] = useState<Artwork[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch artworks data');
                }
                const result: ApiResponse = await response.json();
                setData(result.data);
                setTotalRecords(result.pagination.total);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page]);

    return { data, totalRecords, loading, error };
};
