import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from './shared/apiBaseQuery';

export const universityPagesAPI = createApi({
    reducerPath: 'universityPagesAPI',
    baseQuery: customBaseQuery,
    
    endpoints: (builder) => ({
        getAllUniversities: builder.query({
            query: () => '/university-pages',
        }),
        getAllUniversityNames: builder.query({
            query: () => '/university-pages?fields[0]=universityName',
        }),
        getAllUniversityImages: builder.query({
            query: () => {
                const populateLogo = 'populate[universityLogo][fields][0]=alternativeText&populate[universityLogo][fields][1]=formats';
                const populateHeaderImage = 'populate[universityHeaderImage][fields][0]=alternativeText&populate[universityHeaderImage][fields][1]=formats';
                const sort = 'sort[0]=universityRating:desc';

                return `/university-pages?${populateLogo}&${populateHeaderImage}&${sort}`;
            },
        }),
        getAllUniversityLogos: builder.query({
            query: () => '/university-pages' +
                '?populate[universityLogo][fields][0]=alternativeText' +
                '&populate[universityLogo][fields][1]=formats',
        }),
        getUniversityById: builder.query({
            query: (id) => `/university-pages/${id}`,
        }),
    }),
});

export const {
    useGetAllUniversitiesQuery,
    useGetAllUniversityNamesQuery,
    useGetAllUniversityImagesQuery,
    useGetAllUniversityLogosQuery,
    useGetUniversityByIdQuery
} = universityPagesAPI;

