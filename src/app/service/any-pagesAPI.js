// any-pagesAPI.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from './shared/apiBaseQuery';


export const anyPagesAPI = createApi({

  reducerPath: 'anyPagesAPI',
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getSearchResults: builder.query({
      query: ({ pageType, universityId, graduationLevel, fieldId, fieldComponentName, graduationLevelField }) => {
        let url = `/${pageType}-pages?populate[university_page][populate]=true&populate[${fieldComponentName}][populate]=true`;

        if (universityId) {
          url += `&filters[university_page][id][$eq]=${universityId}`;
        }
        if (graduationLevel) {
          url += `&filters[${graduationLevelField}][$eq]=${graduationLevel}`;
        }
        if (fieldId) {
          url += `&filters[${fieldComponentName}][id][$eq]=${fieldId}`;
        }

        return url;
      },
    }),

    getReviewData: builder.query({
      query: (interactionName) => `/${interactionName}
      ?populate[reviews][populate][users_permissions_user][populate][avatar]=true
      &populate[reviews][populate][users_permissions_user][fields][0]=username
      &populate[reviews][populate][comments][populate][users_permissions_user][populate][avatar]=true
      &populate[reviews][populate][comments][populate][users_permissions_user][fields][0]=username
      &populate[reviews][populate][comments][fields][0]=commentText
      &populate[reviews][populate][comments][fields][1]=commentLikes
      &populate[reviews][populate][comments][fields][2]=createdAt
      &populate[reviews][populate][review_likes][populate][users_permissions_user][populate][avatar]=true
      &populate[reviews][populate][review_likes][populate][users_permissions_user][fields][0]=username
      &populate[reviews][populate][review_likes][fields][0]=createdAt
      &populate[reviews][populate][review_dislikes][populate][users_permissions_user][populate][avatar]=true
      &populate[reviews][populate][review_dislikes][populate][users_permissions_user][fields][0]=username
      &populate[reviews][populate][review_dislikes][fields][0]=createdAt
      &populate[reviews][fields][0]=createdAt
      &populate[reviews][fields][1]=reviewLikes
      &populate[reviews][fields][2]=reviewDislikes
      &populate[reviews][fields][3]=reviewText
      &populate[reviews][fields][4]=updatedAt
      &populate[reviews][fields][5]=reviewRating
      &populate[reviews][fields][6]=id
      &sort[0]=updatedAt:desc`,
    }),

    getBlogData: builder.query({
      query: (interactionName) => `/${interactionName}
      ?populate[blogs][populate][users_permissions_user][populate][avatar]=true
      &populate[blogs][populate][users_permissions_user][fields][0]=username
      &populate[blogs][populate][comments][populate][users_permissions_user][populate][avatar]=true
      &populate[blogs][populate][comments][populate][users_permissions_user][fields][0]=username
      &populate[blogs][populate][comments][fields][0]=commentText
      &populate[blogs][populate][comments][fields][1]=commentLikes
      &populate[blogs][populate][comments][fields][2]=createdAt
      &populate[blogs][populate][blog_likes][populate][users_permissions_user][populate][avatar]=true
      &populate[blogs][populate][blog_likes][populate][users_permissions_user][fields][0]=username
      &populate[blogs][populate][blog_likes][fields][0]=createdAt
      &populate[blogs][populate][blog_dislikes][populate][users_permissions_user][populate][avatar]=true
      &populate[blogs][populate][blog_dislikes][populate][users_permissions_user][fields][0]=username
      &populate[blogs][populate][blog_dislikes][fields][0]=createdAt
      &populate[blogs][fields][0]=createdAt
      &populate[blogs][fields][1]=blogLikes
      &populate[blogs][fields][2]=blogDislikes
      &populate[blogs][fields][3]=blogText
      &populate[blogs][fields][4]=updatedAt
      &populate[blogs][fields][5]=id
      &sort[0]=updatedAt:desc`,
    }),

    getQnAData: builder.query({
      query: (interactionName) => `/${interactionName}
      ?populate[qnas][populate][users_permissions_user][populate][avatar]=true
      &populate[qnas][populate][users_permissions_user][fields][0]=username
      &populate[qnas][populate][comments][populate][users_permissions_user][populate][avatar]=true
      &populate[qnas][populate][comments][populate][users_permissions_user][fields][0]=username
      &populate[qnas][populate][comments][fields][0]=commentText
      &populate[qnas][populate][comments][fields][1]=commentLikes
      &populate[qnas][populate][comments][fields][2]=createdAt
      &populate[qnas][populate][qna_likes][populate][users_permissions_user][populate][avatar]=true
      &populate[qnas][populate][qna_likes][populate][users_permissions_user][fields][0]=username
      &populate[qnas][populate][qna_likes][fields][0]=createdAt
      &populate[qnas][populate][qna_dislikes][populate][users_permissions_user][populate][avatar]=true
      &populate[qnas][populate][qna_dislikes][populate][users_permissions_user][fields][0]=username
      &populate[qnas][populate][qna_dislikes][fields][0]=createdAt
      &populate[qnas][fields][0]=createdAt
      &populate[qnas][fields][1]=qnaLikes
      &populate[qnas][fields][2]=qnaDislikes
      &populate[qnas][fields][3]=qnaText
      &populate[qnas][fields][4]=updatedAt
      &populate[qnas][fields][5]=id
      &sort[0]=updatedAt:desc`,
    }),

    // >>> get helpful link <<<
    getHelpfulLinksData: builder.query({
      query: (interactionName) => `/${interactionName}
        ?populate[helpfulLinks][populate]=university_page,program_page,subject_page
        &sort[0]=updatedAt:desc`,
    }),
  }),
});

export const {
  useGetSearchResultsQuery,
  useGetReviewDataQuery,
  useGetBlogDataQuery,
  useGetQnADataQuery,
  useGetHelpfulLinksDataQuery,
} = anyPagesAPI;
