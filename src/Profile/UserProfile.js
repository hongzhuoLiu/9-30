// UserProfile.js
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserProfileBar from "../components/UserProfileComponents/UserProfileBar";
import BookmarkGrid from "../components/UserProfileComponents/BookmarkComponents/BookmarkGrid";
import UserProfileDetail from "../components/UserProfileComponents/UserProfileDetail";
import ActivityGrid from "../components/UserProfileComponents/ActivityComponents/ActivityGrid";
import ComparePopup from "../components/UserProfileComponents/CompareComponents/ComparePopup";
import CompareSidebar from "../components/UserProfileComponents/CompareComponents/CompareSidebar";

import  CategoryFilter  from "../components/UserProfileComponents/BookmarkComponents/CategoryFilter";
import HelpfulLinksTable from "../components/Posts/HelpfulLinksTable";
import { BASE_URL } from "../API";
import { useGetUserDetailsQuery, useLazyGetUserDetailsQuery, useUpdateUserProfileMutation } from "../app/service/usersAPI";
import { setCredentials } from "../app/features/authentication/AuthenticationReducer";

import { useGetAllUniversitiesQuery } from "../app/service/university-pagesAPI";
import { toggleUIState } from "../app/features/ui/UIReducer";
import { facilitiesApi } from "../app/service/facilitiesApi";
import DeletePostPopup from '../components/Posts/DeletePostPopup.js';

function UserProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("bookmarks");
  const { user } = useSelector((state) => state.auth);



  const { loginMethod } = useSelector((state) => state.auth);

  const [triggerGetUserDetails, {
    data: lazyUserDetails,
    isLoading: isLazyUserLoading,
    error: lazyUserError,
  }] = useLazyGetUserDetailsQuery();

  const [updateUserProfile] = useUpdateUserProfileMutation();

  const {
    data: userDetails,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUserDetails,
  } = useGetUserDetailsQuery();


  const {
    data: allUniversities,
    isLoading: isUniversitiesLoading,
    error: universitiesError,
  } = useGetAllUniversitiesQuery();

  const [userHelpfulLinkBookmarks, setUserHelpfulLinkBookmarks] = useState([]);
  const [userDestinationLikes, setUserDestinationLikes] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userQnas, setUserQnas] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [userUniversityLikes, setUserUniversityLikes] = useState([]);
  const [userFacilityBookmarks, setUserFacilityBookmarks] = useState([]);


  const [userProgramLikes, setUserProgramLikes] = useState([]);
  const [userSubjectLikes, setUserSubjectLikes] = useState([]);

  const [compareType, setCompareType] = useState(null);


  const [compareList, setCompareList] = useState([]);
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [showCompareSidebar, setShowCompareSidebar] = useState(false);


  const [activeCategory, setActiveCategory] = useState('universities');

  // GOOGLE LOGIN PROFILE LOADING ERROR FIXED HERE-------------------
  useEffect(() => {
    if (!loginMethod || userDetails) return;

    const shouldDelay = ['google', 'facebook'].includes(loginMethod);

    if (shouldDelay) {
      const timeout = setTimeout(() => {
        triggerGetUserDetails();
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      triggerGetUserDetails();
    }
  }, [loginMethod, triggerGetUserDetails, userDetails]);

   //------------------------------------------------------------ 


  // GOOGLE LOGIN PROFILE LOADING ERROR FIXED HERE-------------------
  useEffect(() => {
    if (!loginMethod || userDetails) return;

    const shouldDelay = ['google', 'facebook'].includes(loginMethod);

    if (shouldDelay) {
      const timeout = setTimeout(() => {
        triggerGetUserDetails();
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      triggerGetUserDetails();
    }
  }, [loginMethod, triggerGetUserDetails, userDetails]);

   //------------------------------------------------------------ 


  useEffect(() => {
    const fetchReviewDetails = async () => {
      if (userDetails && Array.isArray(userDetails.reviews)) {
        const reviewPromises = userDetails.reviews.map((review) =>
          fetch(`${BASE_URL}/api/reviews/${review.id}?populate=*`).then(
            (response) => response.json()
          )
        );
        try {
          const reviewsData = await Promise.all(reviewPromises);
          setUserReviews(
            reviewsData.map((review) => ({ ...review.data, type: "review" }))
          );
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      }
    };

    const fetchBlogDetails = async () => {
      if (userDetails && Array.isArray(userDetails.blogs)) {
        const blogPromises = userDetails.blogs.map((blog) =>
          fetch(`${BASE_URL}/api/blogs/${blog.id}?populate=*`).then(
            (response) => response.json()
          )
        );
        try {
          const blogsData = await Promise.all(blogPromises);
          setUserBlogs(
            blogsData.map((blog) => ({ ...blog.data, type: "blog" }))
          );
        } catch (error) {
          console.error("Error fetching blogs:", error);
        }
      }
    };

    const fetchQnaDetails = async () => {
      if (userDetails && Array.isArray(userDetails.qnas)) {
        const qnaPromises = userDetails.qnas.map((qna) =>
          fetch(`${BASE_URL}/api/qnas/${qna.id}?populate=*`).then((response) =>
            response.json()
          )
        );
        try {
          const qnasData = await Promise.all(qnaPromises);
          setUserQnas(qnasData.map((qna) => ({ ...qna.data, type: "qna" })));
        } catch (error) {
          console.error("Error fetching Q&As:", error);
        }
      }
    };

    const fetchUniversityLikes = () => {
      if (
        userDetails &&
        Array.isArray(userDetails.userUniversityLikes) &&
        allUniversities
      ) {
        const likedUniversities = userDetails.userUniversityLikes
          .map((like) => {
            const university = allUniversities.data.find(
              (uni) => uni.id === like.id
            );
            return university
              ? {
                  id: university.id,
                  attributes: {
                    universityName: university.attributes.universityName,
                    // Add other attributes as needed
                  },
                }
              : null;
          })
          .filter(Boolean); // Remove any null values

        setUserUniversityLikes(likedUniversities);
        console.log("Fetched userUniversityLikes:", likedUniversities);
      } else {
        console.log(
          "Unable to fetch university likes. User details or university data missing."
        );
      }
    };

    const fetchFacilityLikes = async () => {
      if (userDetails && Array.isArray(userDetails.userFacilityBookmarks)) {
        // const dispatch = useDispatch();
        try {
          const facilityPromises = userDetails.userFacilityBookmarks.map(
            (like) =>
              dispatch(
                facilitiesApi.endpoints.getFacilityById.initiate(like.id)
              ).unwrap()
          );

          const facilitiesData = await Promise.all(facilityPromises);

          const likedFacilities = facilitiesData.map((facility) => ({
            id: facility.id,
            facilityName: facility.attributes.facilityName,
            facilityType: facility.attributes.facilityType,
            facilityDescription: facility.attributes.facilityDescription,
            facilityLocation: facility.attributes.facilityLocation,
            facilityRating: facility.attributes.facilityRating,
            facilityLinks: facility.attributes.facilityLinks,
            universityPageId:
              facility.attributes.university_page?.data?.id ?? null,
            universityPageTitle:
              facility.attributes.university_page?.data?.attributes
                ?.universityName ?? null,
          }));

          setUserFacilityBookmarks(likedFacilities);
          console.log("Fetched userFacilityBookmarks:", likedFacilities);
        } catch (error) {
          console.error("Error fetching facility likes:", error);
        }
      } else {
        console.log("Unable to fetch facility likes. User details missing.");
      }
    };


    const fetchProgramLikes = async () => {
      if (userDetails && Array.isArray(userDetails.userProgramLikes)) {
        const programPromises = userDetails.userProgramLikes.map((like) =>
          fetch(
            `${BASE_URL}/api/program-pages/${like.id}?fields[0]=programName&populate[university_page][fields][0]=id`
          ).then((response) => response.json())
        );
        try {
          const programsData = await Promise.all(programPromises);
          const likedPrograms = programsData.map((program) => ({
            id: program.data.id,
            attributes: {
              programName: program.data.attributes.programName,
              universityId: program.data.attributes.university_page?.data?.id,
            },
          }));
          setUserProgramLikes(likedPrograms);
          console.log("Fetched userProgramLikes:", likedPrograms);
        } catch (error) {
          console.error("Error fetching program likes:", error);
        }
      } else {
        console.log("Unable to fetch program likes. User details missing.");
      }
    };

    const fetchSubjectLikes = async () => {
      if (userDetails && Array.isArray(userDetails.userSubjectLikes)) {
        const subjectPromises = userDetails.userSubjectLikes.map((like) =>
          fetch(
            `${BASE_URL}/api/subject-pages/${like.id}?fields[0]=subjectName&populate[university_page][fields][0]=id`
          ).then((response) => response.json())
        );
        try {
          const subjectsData = await Promise.all(subjectPromises);
          const likedSubjects = subjectsData.map((subject) => ({
            id: subject.data.id,
            attributes: {
              subjectName: subject.data.attributes.subjectName,
              universityId: subject.data.attributes.university_page?.data?.id, 
            },
          }));
          setUserSubjectLikes(likedSubjects);
          console.log("Fetched userSubjectLikes:", likedSubjects);
        } catch (error) {
          console.error("Error fetching subject likes:", error);
        }
      } else {
        console.log("Unable to fetch subject likes. User details missing.");
      }
    };

    const fetchHelpfulLinkBookmarks = async () => {
      try {
        if (userDetails?.userHelpfulLinkBookmarks) {
          console.log(
            "Found helpful link bookmarks:",
            userDetails.userHelpfulLinkBookmarks
          );
          setUserHelpfulLinkBookmarks(userDetails.userHelpfulLinkBookmarks);
        } else {
          console.log("No helpful link bookmarks found in user details");
          setUserHelpfulLinkBookmarks([]);
        }
      } catch (error) {
        console.error("Error fetching helpful link bookmarks:", error);
        setUserHelpfulLinkBookmarks([]);
      }
    };
    const fetchDestinationLikes = () => {
      const raw = userDetails?.userDestinationLikes;
      if (!Array.isArray(raw)) return;

      const mapped = raw.map((item) => ({
        id: item.id,
        attributes: {
          destinationName: item.destinationName,
        },
      }));
      setUserDestinationLikes(mapped);
      console.log("Fetched Destinations:", mapped);
    };

    const fetchAll = async () => {
      await Promise.all([
        fetchReviewDetails(),
        fetchBlogDetails(),
        fetchQnaDetails(),
      ]);
      fetchUniversityLikes();
      fetchProgramLikes();
      fetchSubjectLikes();
      fetchHelpfulLinkBookmarks();
      fetchFacilityLikes();
      fetchDestinationLikes();
    };

    fetchAll();
  }, [userDetails, allUniversities]);

    useEffect(() => {
        const combinedPosts = [...userReviews, ...userBlogs, ...userQnas].filter(post => post && post.attributes);;

        if (userReviews.length || userBlogs.length || userQnas.length) {
            // Sort by createdAt descending
            combinedPosts.sort((a, b) => new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt));

            console.log("Sorted Posts:", combinedPosts); // Debugging
        }

        setSortedPosts(combinedPosts);

    }, [userReviews, userBlogs, userQnas]);

  const handleHelpfulLinkBookmarkChange = async (linkId, isBookmarked) => {
    if (!isBookmarked) {
      try {
        // Remove the bookmark in the same way as DetailView.js
        const updatedUser = { ...userDetails };
        updatedUser.userHelpfulLinkBookmarks = (
          userDetails.userHelpfulLinkBookmarks || []
        ).filter((bookmark) => bookmark.id !== linkId);

        // Update user in Redux and database
        await updateUserProfile(updatedUser).unwrap();
        dispatch(setCredentials(updatedUser));
        refetchUserDetails();

        // Update local state to reflect changes immediately
        setUserHelpfulLinkBookmarks((prevBookmarks) =>
          prevBookmarks.filter((bookmark) => bookmark.id !== linkId)
        );
      } catch (error) {
        console.error("Error removing link bookmark:", error);
      }
    }
  };

  const handleButtonClick = (button) => {
    setActiveTab(button);
  };

  const handleAddToCompare = (itemId, itemType) => {
    setCompareList((prevList) => {
     
      const pluralMap = {
        university: "universities",
        program: "programs",
        subject: "subjects",
      };

      if (compareType && compareType !== itemType) {
        alert(
          `You can only compare ${pluralMap[compareType] || compareType + "s"}.`
        );
        return prevList;
      }


      const isInList = prevList.some(
        (item) => item.id === itemId && item.type === itemType
      );

      let newList;
      if (isInList) {
        newList = prevList.filter(
          (item) => !(item.id === itemId && item.type === itemType)
        );

        if (newList.length === 0) {
          setCompareType(null);
        }
      } else {
        if (prevList.length < 3) {
          newList = [...prevList, { id: itemId, type: itemType }];
          setCompareType(itemType);
        } else {
          newList = [...prevList.slice(1), { id: itemId, type: itemType }];
        }
      }

      setShowCompareSidebar(newList.length > 0);
      return newList;
    });
  };

  const handleRemoveFromCompare = (itemId, itemType) => {
    setCompareList((prevList) => {
      const newList = prevList.filter(
        (item) => !(item.id === itemId && item.type === itemType)
      );
      if (newList.length === 0) {
        setCompareType(null);
      }
      setShowCompareSidebar(newList.length > 0);
      return newList;
    });
  };

  const handleCompare = () => {
    if (compareList.length >= 2) {
      setShowComparePopup(true);
    }
  };

  const handleUniversityClick = (id) => {
    navigate(`/universities/${id}`);
    dispatch(toggleUIState({ key: "showProfile" }));
  };


  const handleProgramClick = (universityId, programId) => {
    navigate(`/universities/${universityId}/program/${programId}`);
    dispatch(toggleUIState({ key: "showProfile" }));
  };

  const handleSubjectClick = (universityId, subjectId) => {
    navigate(`/universities/${universityId}/subject/${subjectId}`);
    dispatch(toggleUIState({ key: "showProfile" }));
  };

  const handleFacilityClick = (facilityId) => {
    navigate(`/facility/${facilityId}`);
    dispatch(toggleUIState({ key: "showProfile" }));
  };



  const handleItemClick = (itemId, itemType, universityId) => {
    if (itemType === "university") {
      handleUniversityClick(itemId);
    } else if (itemType === "program") {
      handleProgramClick(universityId, itemId);
    } else if (itemType === "subject") {
      handleSubjectClick(universityId, itemId);
    }
    else if (itemType === "destination") {            
    navigate(`/destination/${itemId}`);
    dispatch(toggleUIState({ key: "showProfile" }));

  } else if (
    ["accommodation", "health", "fitness", "eateries", "clubs", "culture"].includes(itemType)
  ) {                                                 
    navigate(`/facility/${itemId}`);
    dispatch(toggleUIState({ key: "showProfile" }));
  }
  };

  const handleDestinationClick = (destinationId) => {
    navigate(`/destination/${destinationId}`);
    dispatch(toggleUIState({ key: "showProfile" }));
  };    //Delete the specific post
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [selectedPostType, setSelectedPostType] = useState(null);

    const collectionMapping = {
        review: 'reviews',
        blog: 'blogs',
        qna: 'qnas'
    };
    
    const handleDeletePost = (id,selectedButton) => {
        setSelectedPostId(id);
        setSelectedPostType(collectionMapping[selectedButton] || selectedButton);
        setShowDeletePopup(true);
    };

    const handleRefresh = (postId,postType) => {
        switch (postType) {
            case 'reviews':
                setUserReviews(prev => prev.filter(post => post.id !== postId));
                break;
            case 'blogs':
                setUserBlogs(prev => prev.filter(post => post.id !== postId));
                break;
            default:
                setUserQnas(prev => prev.filter(post => post.id !== postId));
        }
    };


  const renderContent = () => {
    switch (activeTab) {
      // case "home":
      case "activity":
        return <ActivityGrid posts={sortedPosts}  onDelete = {handleDeletePost} />;
      case "bookmarks":
        return (
          <>
            <CategoryFilter
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
            {activeCategory === "links" ? (
              <div className="w-11/12 mx-auto">
                <HelpfulLinksTable
                  helpfulLinks={userHelpfulLinkBookmarks}
                  isProfileView={true}
                  onBookmarkChange={handleHelpfulLinkBookmarkChange}
                />
              </div>
            ) : (
              <BookmarkGrid
                userUniversityLikes={userUniversityLikes}
                userProgramLikes={userProgramLikes}
                userSubjectLikes={userSubjectLikes}
                userFacilityBookmarks={userFacilityBookmarks}
                userDestinationLikes={userDestinationLikes}
                activeCategory={activeCategory} 
                onAddToCompare={handleAddToCompare}
                compareList={compareList}
                compareType={compareType}
                onUniversityClick={handleUniversityClick}
                onProgramClick={handleProgramClick}
                onSubjectClick={handleSubjectClick}
                onFacilityClick={handleFacilityClick}
                onDestinationClick={handleDestinationClick}
              />
            )}
            {showCompareSidebar && (
              <CompareSidebar
                compareList={compareList}
                compareType={compareType}
                //allUniversities={allUniversities}
                onRemove={handleRemoveFromCompare}
                onCompare={handleCompare}
                onClose={() => setShowCompareSidebar(false)}
                //onUniversityClick={handleUniversityClick}
                onItemClick={handleItemClick}
              />
            )}
          </>
        );
      case "profile":
        return <UserProfileDetail user={user} />;
      default:
        return <ActivityGrid posts={sortedPosts} />;
    }
  };

  if (isUserLoading || isUniversitiesLoading) {
    return <div>Loading...</div>;
  }

  if (userError || universitiesError) {
    return <div>Error loading data</div>;
  }

  return (
    <div>
      <UserProfileBar active={activeTab} onButtonClick={handleButtonClick} />
      {renderContent()}
      {showComparePopup && (
        <ComparePopup
          compareList={compareList}
          // allUniversities={allUniversities}
          compareType={compareType}
          onClose={() => setShowComparePopup(false)}
        />
      )}
            {showDeletePopup && (
                <DeletePostPopup 
                    postId={selectedPostId} 
                    postType={selectedPostType} 
                    onDeleted={() => {
                        handleRefresh(selectedPostId,selectedPostType);
                    }}
                    onCancel={() => {
                        setShowDeletePopup(false);  // Close the Popup if cancelled.
                    }}
                />
            )}
    </div>
  );
}

export default UserProfile;
