// InteractionArea.js

import { useEffect, useState, useCallback, useMemo } from 'react';
import { BASE_URL } from "../../API.js";

// Components
import ReviewCard from './ReviewCard.js';
import DropDownButton from '../Elements/DropDownButton.js';
import SortingDropdown from '../Elements/SortingDropDown.js';
import HelpfulLinksTable from './HelpfulLinksTable.js'; 
// Import Tailwind
import '../../input.css';
import { useDispatch, useSelector } from "react-redux";
import { setInteractionName, setSelectedButton, toggleUIState } from "../../app/features/ui/UIReducer.js";
import { useGetAllIconsQuery } from '../../app/service/iconsAPI.js';
import {
  useGetBlogDataQuery,
  useGetQnADataQuery,
  useGetReviewDataQuery,
  useGetHelpfulLinksDataQuery
} from '../../app/service/any-pagesAPI.js';

import '../../input.css';
import RatingAndDistribution from '../RatingAndDistribution/RatingAndDistribution';
import DeletePostPopup from './DeletePostPopup';

const HELPFUL_LINK_ICON_ID = 65;
const SHARE_ICON_ID = 33;
const HELPFUL_LINK_ICON_ID_WHITE = 67;

function InteractionArea({ interactionName }) {

  console.log(">>> [TEST] InteractionArea is rendering with 4 tabs <<<");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deletePopupProps, setDeletePopupProps] = useState({});
  const iconIds = {
    reviewSelected: 14,
    reviewDarkMode: 9,
    reviewLightMode: 13,
    commentSelected: 17,
    commentDarkMode: 18,
    commentLightMode: 19,
    FAQSelected: 7,
    FAQDarkMode: 20,
    FAQLightMode: 21,
    plusRed: 22,
    plusWhite: 23,

    helpfulLinksLight: HELPFUL_LINK_ICON_ID,
    helpfulLinksDark: HELPFUL_LINK_ICON_ID,
    helpfulLinksSelected: HELPFUL_LINK_ICON_ID_WHITE,

    shareLight: SHARE_ICON_ID,
    shareDark: SHARE_ICON_ID,
    shareSelected: SHARE_ICON_ID,
  };

  const { data: iconsData, isError: isIconsError, isLoading: isIconsLoading } = useGetAllIconsQuery();

  const getIconURL = useCallback((id) => {
    if (!iconsData || !iconsData.data || isIconsLoading || isIconsError) return '';
    const icon = iconsData.data.find(icon => icon.id === id);
    return icon ? `${BASE_URL}${icon.attributes.image.data[0].attributes.formats.thumbnail.url}` : '';
  }, [iconsData, isIconsLoading, isIconsError]);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedButton } = useSelector((state) => state.ui);

  useEffect(() => {
    dispatch(setInteractionName(interactionName));
  }, [dispatch, interactionName]);

  const { data: reviewsData, isLoading: reviewLoading, refetch: reviewRefetch } = useGetReviewDataQuery(interactionName);
  const { data: blogsData, isLoading: blogsLoading, refetch: blogsRefetch } = useGetBlogDataQuery(interactionName);
  const { data: qnasData, isLoading: qnasLoading, refetch: qnasRefetch } = useGetQnADataQuery(interactionName);
  const { data: helpfulData, isLoading: helpfulLoading, isError: helpfulError, refetch: helpfulRefetch } = useGetHelpfulLinksDataQuery(interactionName);

  useEffect(() => {
    reviewRefetch();
    blogsRefetch();
    qnasRefetch();
    helpfulRefetch();
  }, [reviewRefetch, blogsRefetch, qnasRefetch, helpfulRefetch]);

  const handleButtonClick = (id) => {
    dispatch(setSelectedButton(id));
  };

  const formatDate = useCallback((isoDate) => {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
  }, []);

  const [selectedStarFilters, setSelectedStarFilters] = useState([1, 2, 3, 4, 5]);

  const [sortOrder, setSortOrder] = useState('latest');

  const sortOptions = [
      { value: 'latest', label: 'Latest' },
      { value: 'oldest', label: 'Oldest' },
      { value: 'highest', label: 'Highest rating' },
      { value: 'lowest', label: 'Lowest rating' },
      { value: 'mostLiked', label: 'Most liked' },
  ];

  // ★ Helper function: Calculate average score and star rating statistics from reviewsData
  const getReviewStats = useCallback(() => {
    if (!reviewsData || !reviewsData.data?.attributes?.reviews.data) {
      return {
        averageScore: "No Reviews",
        ratingData: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        count: 0
      };
    }
    const reviewsArr = reviewsData.data.attributes.reviews.data;
    const count = reviewsArr.length;
    if (count === 0) {
      return {
        averageScore: "No Reviews",
        ratingData: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        count: 0
      };
    }
    const sum = reviewsArr.reduce((acc, r) => acc + r.attributes.reviewRating, 0);
    const averageScore = (sum / count).toFixed(1);

    const ratingData = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsArr.forEach(r => {
      const rating = r.attributes.reviewRating;
      if (ratingData[rating] !== undefined) {
        ratingData[rating]++;
      }
    });

    return { averageScore, ratingData, count };
    }, [reviewsData]); 
  
  const handleStarFilterChange = useCallback((selectedStars) => {
    console.log("Star filter change in InteractionArea:", selectedStars);

    if (Array.isArray(selectedStars) && selectedStars.length > 0) {
      setSelectedStarFilters(selectedStars);
    }
  }, []);

  const filteredReviews = useMemo(() => {
    if (reviewLoading || !reviewsData?.data?.attributes?.reviews?.data) {
      return [];
    }
    
    console.log("Applying filters for stars:", selectedStarFilters);
    
    return reviewsData.data.attributes.reviews.data.filter(review => 
      selectedStarFilters.includes(review.attributes.reviewRating)
    );
  }, [reviewLoading, reviewsData, selectedStarFilters]);


  // check if we have any reviews for this area
    const reviewContent = useMemo(() => {
      if (reviewLoading) {
        return <p className="text-center text-2xl">Loading data...</p>;
      }
      
      if (filteredReviews.length === 0) {
        return (
          <div>
            <p className="text-gray-500 text-center text-2xl">
              {selectedStarFilters.length === 0 
                ? "Please select at least one star rating to see reviews." 
                : "There are no reviews to show here. Be the first to post!"}
            </p>
          </div>
        );
      }
      
      // 对已经过滤的评论应用排序
      return (
        <div className="flex flex-col justify-evenly items-center">
          {[...filteredReviews]
            .sort((a, b) => {
              switch (sortOrder) {
                case 'latest':
                  return getLatestCommentTime(b) - getLatestCommentTime(a);
                case 'oldest':
                  return new Date(a.attributes.createdAt) - new Date(b.attributes.createdAt);
                case 'highest':
                  return b.attributes.reviewRating - a.attributes.reviewRating;
                case 'lowest':
                  return a.attributes.reviewRating - b.attributes.reviewRating;
                case 'mostLiked':
                  return b.attributes.review_likes.data.length - a.attributes.review_likes.data.length;
                default: // 默认按最新排序
                  return getLatestCommentTime(b) - getLatestCommentTime(a);
              }
            })
            .map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                posterId={review.attributes.users_permissions_user.data.id}
                name={review.attributes.users_permissions_user.data.attributes.username}
                avatar={review.attributes.users_permissions_user.data.attributes.avatar.data 
                  ? review.attributes.users_permissions_user.data.attributes.avatar.data.attributes.formats.thumbnail 
                  : null}
                like={review.attributes.review_likes.data}
                dislike={review.attributes.review_dislikes.data}
                desc={review.attributes.reviewText}
                posttime={formatDate(review.attributes.createdAt)}
                rating={review.attributes.reviewRating}
                replies={review.attributes.comments}
                isCurrentUser={review.attributes.users_permissions_user.data.id === user?.id}
                onRefresh={() => {
                  reviewRefetch();
                  blogsRefetch();
                  qnasRefetch();
                  helpfulRefetch();
                }}
                onShowDeletePopup={({ postId, postType }) => {
                  setDeletePopupProps({
                    postId,
                    postType,
                  });
                  setShowDeletePopup(true);
                }}
              />
            ))}
        </div>
      );
    }, [reviewLoading, filteredReviews, sortOrder, formatDate, selectedStarFilters]);

  const blogContent = blogsLoading ? (
    <p className="text-center text-2xl">Loading data...</p>
  ) : blogsData?.data.attributes.blogs.data.length > 0 ? (
    <div className="flex flex-col justify-evenly items-center">
      {[...blogsData.data.attributes.blogs.data]
        .sort((a, b) => getLatestCommentTime(b) - getLatestCommentTime(a))
        .map((blog) => (
          <ReviewCard
            key={blog.id}
            id={blog.id}
            posterId={blog.attributes.users_permissions_user.data.id}
            name={blog.attributes.users_permissions_user.data.attributes.username}
            avatar={
              blog.attributes.users_permissions_user.data.attributes.avatar.data
                ? blog.attributes.users_permissions_user.data.attributes.avatar.data.attributes.formats.thumbnail
                : null
            }
            like={blog.attributes.blog_likes.data}
            dislike={blog.attributes.blog_dislikes.data}
            desc={blog.attributes.blogText}
            posttime={formatDate(blog.attributes.createdAt)}
            replies={blog.attributes.comments}
            isCurrentUser={blog.attributes.users_permissions_user.data.id === user?.id}
            onRefresh={() => {
              reviewRefetch();
              blogsRefetch();
              qnasRefetch();
              helpfulRefetch();
            }}
            onShowDeletePopup={({ postId, postType }) => {
              setDeletePopupProps({
                postId,
                postType,
              });
              setShowDeletePopup(true);
            }}
          />
        ))}
    </div>
  ) : (
    <div>
      <p className="text-gray-500 text-center text-2xl">
        There are no blogs to show here. <br /> Be the first to post!
      </p>
    </div>
  );

  const qnaContent = qnasLoading ? (
    <p className="text-center text-2xl">Loading data...</p>
  ) : qnasData?.data.attributes.qnas.data.length > 0 ? (
    <div className="flex flex-col justify-evenly items-center">
      {[...qnasData.data.attributes.qnas.data]
        .sort((a, b) => getLatestCommentTime(b) - getLatestCommentTime(a))
        .map((qna) => (
          <ReviewCard
            key={qna.id}
            id={qna.id}
            posterId={qna.attributes.users_permissions_user.data.id}
            name={qna.attributes.users_permissions_user.data.attributes.username}
            avatar={
              qna.attributes.users_permissions_user.data.attributes.avatar.data
                ? qna.attributes.users_permissions_user.data.attributes.avatar.data.attributes.formats.thumbnail
                : null
            }
            like={qna.attributes.qna_likes.data}
            dislike={qna.attributes.qna_dislikes.data}
            desc={qna.attributes.qnaText}
            posttime={formatDate(qna.attributes.createdAt)}
            replies={qna.attributes.comments}
            isCurrentUser={qna.attributes.users_permissions_user.data.id === user?.id}
            onRefresh={() => {
              reviewRefetch();
              blogsRefetch();
              qnasRefetch();
              helpfulRefetch();
            }}
            onShowDeletePopup={({ postId, postType }) => {
              setDeletePopupProps({
                postId,
                postType,
              });
              setShowDeletePopup(true);
            }}
          />
        ))}
    </div>
  ) : (
    <div>
      <p className="text-gray-500 text-center text-2xl">
        There are no questions to show here. <br /> Be the first to ask a question!
      </p>
    </div>
  );

  // =============================
  // 4) Helpful Links
  // =============================
  const helpfulLinksContent = helpfulLoading ? (
    <p className="text-center text-2xl">Loading helpful links...</p>
  ) : helpfulError ? (
    <p className="text-center text-2xl text-red-500">Failed to load helpful links!</p>
  ) : helpfulData?.data.attributes.helpfulLinks?.data?.length > 0 ? (
    <HelpfulLinksTable
      helpfulLinks={helpfulData.data.attributes.helpfulLinks.data}
      getIconURL={getIconURL}
      shareIconId={iconIds.shareLight}
      onBookmarkChange={(linkId, isBookmarked) => {
        console.log(`Link ${linkId} is now ${isBookmarked ? 'bookmarked' : 'unbookmarked'}`);
        // Additional logic if needed
      }}
    />
  ) : (
    <div>
      <p className="text-gray-500 text-center text-2xl">
        No helpful links yet for this page.
      </p>
    </div>
  );
  
  const { averageScore, ratingData, count } = getReviewStats();
    
  return (
    <div className="mt-[3%] min-h-[300px] h-auto w-11/12 mx-auto rounded-md sm:p-4">

      <div className="mt-[20px] sm:hidden text-center">
        <DropDownButton onSelection={handleButtonClick} />
      </div>

      <div className="hidden sm:flex flex-wrap justify-around items-center w-full gap-2 mt-4">
        <ActionButton
          id="review"
          image={getIconURL(iconIds.reviewLightMode)}
          darkImage={getIconURL(iconIds.reviewDarkMode)}
          selectedImage={getIconURL(iconIds.reviewSelected)}
          text="Reviews"
          isSelected={selectedButton === 'review'}
          onClick={() => handleButtonClick('review')}
        />
        <ActionButton
          id="blog"
          image={getIconURL(iconIds.commentLightMode)}
          darkImage={getIconURL(iconIds.commentDarkMode)}
          selectedImage={getIconURL(iconIds.commentSelected)}
          text="Blog"
          isSelected={selectedButton === 'blog'}
          onClick={() => handleButtonClick('blog')}
        />
        <ActionButton
          id="qna"
          image={getIconURL(iconIds.FAQLightMode)}
          darkImage={getIconURL(iconIds.FAQDarkMode)}
          selectedImage={getIconURL(iconIds.FAQSelected)}
          text="Ask Questions"
          isSelected={selectedButton === 'qna'}
          onClick={() => handleButtonClick('qna')}
        />
        <ActionButton
          id="helpfulLinks"
          image={getIconURL(iconIds.helpfulLinksLight)}
          darkImage={getIconURL(iconIds.helpfulLinksSelected)}
          selectedImage={getIconURL(iconIds.helpfulLinksSelected)}
          text="Helpful Links"
          isSelected={selectedButton === 'helpfulLinks'}
          onClick={() => handleButtonClick('helpfulLinks')}
        />
      </div>

      <div className="h-[2px] bg-sc-red w-11/12 mx-auto mt-[5%] sm:w-[95%] sm:mt-[2%]" />

      <div
        className="group sm:hover:bg-sc-red bg-white dark:bg-gray-700 flex justify-between items-center w-full
                    ml-auto mr-auto sm:justify-evenly rounded-md sm:w-1/5 mt-3 sm:float-right
                    sm:mr-[4%] shadow-md p-4 sm:p-2 sm:hover:shadow-xl transition duration-300 cursor-pointer"
        onClick={() => {
          user
            ? dispatch(toggleUIState({ key: 'showCreatePost' }))
            : dispatch(toggleUIState({ key: 'showLoginPost' }))
        }}
      >
        <p id="postButton" className="group-hover:text-gray-200 text-rose-900 dark:text-gray-200 font-bold">
          Add Post
        </p>
        {!isIconsLoading && (
          <img
            src={getIconURL(iconIds.plusRed)}
            className="mr-2 w-[20%] sm:w-[25%] self-center h-auto group-hover:hidden dark:hidden transition duration-300"
            alt="Plus Icon"
          />
        )}
        {!isIconsLoading && (
          <img
            src={getIconURL(iconIds.plusWhite)}
            className="mr-2 w-[20%] sm:w-[25%] self-center h-auto hidden group-hover:block dark:block transition duration-300"
            alt="Plus Icon"
          />
        )}
      </div>

      <div id="showDiv" className="mt-[2%] sm:mt-[8%]">
        {selectedButton === 'review' && (
          <>
            {/* ★ When there are reviews, render the rating distribution */}
            {count > 0 && (
              <>
                <div className="relative w-full sm:w-[30%] max-w-full sm:max-w-[30%] min-w-[200px] ml-0 sm:ml-[4%] mt-0 sm:mt-[-7%] mb-5">
                  <RatingAndDistribution
                    averageScore={averageScore}
                    reviewCount={count}
                    ratingData={ratingData}
                    onFilterChange={handleStarFilterChange}
                  />
                </div>
                <div className="flex justify-end mb-4 pr-[4%] items-center gap-2 sm:mt-[-7%] sm:mb-[10%]">
                  <label className='text-sc-red dark:text-gray-200 font-bold'>Sort by:</label>
                  <SortingDropdown
                    options={sortOptions}
                    selectedValue={sortOrder}
                    onChange={(value) => setSortOrder(value)}
                  />
                </div>
              </>
            )}
            {reviewContent}
          </>
        )}
        {selectedButton === 'blog' && blogContent}
        {selectedButton === 'qna' && qnaContent}
        {selectedButton === 'helpfulLinks' && helpfulLinksContent}
      </div>
            {/* Render DeletePostPopup at the InteractionArea level */}
            {showDeletePopup && (
              <DeletePostPopup
                {...deletePopupProps}
                onDeleted={() => {}}
                onCancel={() => {
                  setShowDeletePopup(false);
                  reviewRefetch();
                  blogsRefetch();
                  qnasRefetch();
                  helpfulRefetch();
                }}
              />
            )}
    </div>
  );
}

function ActionButton({ id, image, darkImage, selectedImage, text, isSelected, onClick, placeholderText }) {
  const textCol = isSelected ? 'text-white' : 'text-rose-900 dark:text-white';
  const bgColor = isSelected ? 'bg-sc-red' : 'bg-white dark:bg-gray-700';

  return (
    <div
      className={`
        h-14 w-[20%] flex items-center justify-center
        ${bgColor} drop-shadow-md rounded-md px-2 py-2
        ${textCol} transition duration-300 sm:hover:drop-shadow-xl cursor-pointer
      `}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        <h3 className="font-bold text-sm sm:text-base">{text}</h3>
        {placeholderText ? (
          <span className="block dark:block text-xs sm:text-sm">
            {placeholderText}
          </span>
        ) : (
          <>
            <img
              src={isSelected ? selectedImage : image}
              className="h-5 w-5 block dark:hidden"
              alt="light icon"
            />
            <img
              src={isSelected ? selectedImage : darkImage}
              className="h-5 w-5 hidden dark:block"
              alt="dark icon"
            />
          </>
        )}
      </div>
    </div>
  );
}

// Helper function: Get the latest comment time for a post (if no comments, use the post's creation time)
function getLatestCommentTime(post) {
  const comments = post.attributes.comments?.data || [];
  if (comments.length === 0) {
    return new Date(post.attributes.createdAt);
  }
  // Find the latest createdAt among comments
  const latestComment = comments.reduce((latest, curr) => {
    const currDate = new Date(curr.attributes.createdAt);
    return currDate > latest ? currDate : latest;
  }, new Date(post.attributes.createdAt));
  return latestComment;
}

export default InteractionArea;