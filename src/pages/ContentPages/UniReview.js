import InteractionArea from '../../components/Posts/InteractionArea.js';

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BASE_URL } from "../../API.js";
import '../../index.js';
import BookmarkDarkIcon from '../../images/icons/bookmark-grey-200.png'
import BookmarkSelectedIcon from '../../images/icons/bookmark-selected.png'
import BookmarkIcon from '../../images/icons/bookmark-black.png'

//For fetching icons
import { useGetIconByIdQuery } from '../../app/service/iconsAPI.js';

import { useGetUserDetailsQuery, useUpdateUserProfileMutation } from '../../app/service/usersAPI.js';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../app/features/authentication/AuthenticationReducer.js';

import LinkIcon from "../../images/icons/link.png";
import LocationIcon from "../../images/icons/locationPin.png";

// main export
function UniReview() {
    const { idUniversity } = useParams();
    const [university, setUniversity] = useState(null);
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { data: userDetails, refetch: refetchUserDetails } = useGetUserDetailsQuery();
    const [updateUserProfile] = useUpdateUserProfileMutation();
    const { data: starIconData, isError: isStarIconError, isLoading: isStarIconLoading } = useGetIconByIdQuery(12);

    const isLoggedIn = !!user;
    const isBookmarked = isLoggedIn && userDetails?.userUniversityLikes?.some(uni => uni.id === parseInt(idUniversity));

    // Debug logs
    console.log('Debug: isLoggedIn', isLoggedIn);
    console.log('Debug: idUniversity', idUniversity, typeof idUniversity);
    console.log('Debug: userDetails', userDetails);
    console.log('Debug: userUniversityLikes', userDetails?.userUniversityLikes);
    console.log('Debug: isBookmarked', isBookmarked);

    // Function to add bookmark
    const handleAddBookmark = async () => {
        if (!isLoggedIn) return;

        try {
            const updatedLikes = [...(userDetails.userUniversityLikes || []), { id: parseInt(idUniversity) }];
            const updatedUser = { ...userDetails, userUniversityLikes: updatedLikes };
            
            console.log('Debug: Adding bookmark', updatedLikes);
            await updateUserProfile(updatedUser).unwrap();
            dispatch(setCredentials(updatedUser));
            refetchUserDetails();
            console.log('Debug: Bookmark added, new userDetails', updatedUser);
        } catch (error) {
            console.error('Error adding university like:', error);
        }
    };

    // Function to remove bookmark
    const handleRemoveBookmark = async () => {
        if (!isLoggedIn) return;

        try {
            const updatedLikes = (userDetails.userUniversityLikes || []).filter(uni => uni.id !== parseInt(idUniversity));
            const updatedUser = { ...userDetails, userUniversityLikes: updatedLikes };
            
            console.log('Debug: Removing bookmark', updatedLikes);
            await updateUserProfile(updatedUser).unwrap();
            dispatch(setCredentials(updatedUser));
            refetchUserDetails();
            console.log('Debug: Bookmark removed, new userDetails', updatedUser);
        } catch (error) {
            console.error('Error removing university like:', error);
        }
    };
    
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}/api/university-pages/${idUniversity}
                    ?populate[universityLogo][fields][0]=name
                    &populate[universityLogo][fields][1]=alternativeText
                    &populate[universityLogo][fields][2]=formats
                    &populate[universityHeaderImage][fields][0]=name
                    &populate[universityHeaderImage][fields][1]=alternativeText
                    &populate[universityHeaderImage][fields][2]=formats
                    &populate[program_pages][fields][0]=programName
                    &populate[program_pages][fields][1]=programRating
                    &populate[subject_pages][fields][0]=subjectName
                    &populate[subject_pages][fields][1]=subjectRating
                    &populate[webpage][fields][0]=webpage
                    `);
                const responseData = await response.json();

                setUniversity(responseData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [idUniversity]);

    if (!university) {
        return <div>Loading...</div>;
    }

    if (isStarIconLoading) {
        return null;
    }

    if (isStarIconError) {
        return null;
    }

    return (
        <div className="w-screen h-screenc relative m-0 bg-white dark:bg-gray-900">
            <div className="relative">
                <UniTitleAndImg universityHeader={university.attributes} isLoggedIn={isLoggedIn} isBookmarked={isBookmarked} handleAddBookmark={handleAddBookmark}
                                handleRemoveBookmark={handleRemoveBookmark}/>
            </div>
            <div style={{ position: 'relative', zIndex: 0 }}>
                <UniBanner universityData={university.attributes.universityHeaderImage.data.attributes} />
            </div>
            
            <div className="relative">
                <div className="mt-[0%]">
                    {!isStarIconLoading && 
                        <ProgramAndSubject 
                            universityHeader={university} 
                            starIconURL={`${BASE_URL}${starIconData.data.attributes.image.data[0].attributes.formats.thumbnail.url}`}
                        />
                    }
                </div>
            </div>
            <InteractionArea interactionName={`university-pages/${idUniversity}`} />
        </div>
    );
}


function UniTitleAndImg({ universityHeader, isLoggedIn, isBookmarked, handleAddBookmark, handleRemoveBookmark }) {
    // Extract the university logo URL
    const universityLogoUrl = universityHeader.universityLogo?.data?.attributes?.formats?.thumbnail?.url;

    // Check if the logo is a placeholder
    const isPlaceholderIcon = universityLogoUrl?.includes("placeholder.png");

    return (
        <div className="h-full flex items-start justify-between sm:mt-2.5 ml-4 mr-4 mb-4">
            {/* Title, Location, and Bookmark */}
            <div className="flex flex-col items-start gap-1 w-full sm:w-4/5">
                {/* Title & Location */}
                <div className="flex items-start sm:items-center gap-x-4">
                    <h1 className="font-bold text-2xl sm:text-4xl 2xl:text-6xl text-black dark:text-gray-200 mb-2">
                        {universityHeader.universityName}
                    </h1>

                    {/* Bookmark Icon */}
                    {isLoggedIn && (
                        <button onClick={isBookmarked ? handleRemoveBookmark : handleAddBookmark}
                            aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                            className={"flex-shrink-0 mt-1 sm:mt-0"}>
                            <img
                                src={isBookmarked ? BookmarkSelectedIcon : BookmarkIcon}
                                alt={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                                className="sm:w-11 w-8 sm:h-11 h-8 dark:hidden"
                            />
                            <img
                                src={isBookmarked ? BookmarkSelectedIcon : BookmarkDarkIcon}
                                alt={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                                className="sm:w-11 w-8 sm:h-11 h-8 hidden dark:block"
                            />
                        </button>
                    )}
                </div>
                <div className="flex items-start flex-col sm:flex-row gap-x-10 mt-1">
                    <div className="flex items-center">
                        <img className="sm:w-7 w-6 sm:h-7 h-6 mr-1 sm:mr-2" src={LocationIcon} alt="Location pin icon"/>
                        <p className="font-bold text-lg sm:text-2xl 2xl:text-4xl text-gray-500 dark:text-gray-300 mt-1">
                            {universityHeader.universityLocation}
                        </p>
                    </div>

                    <div className="flex items-center mt-1">
                        <img className="sm:w-7 w-6 sm:h-7 h-6 mr-1 sm:mr-2" src={LinkIcon} alt="Link icon"/>
                        <a href={universityHeader.webpage} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-300 underline font-bold text-lg sm:text-2xl 2xl:text-4xl">
                            {universityHeader.webpage}
                        </a>
                    </div>
                </div>
            </div>

            {/* University Logo */}
            <div className="bg-gray-300 p-4 rounded-lg shadow-md place-items-center hidden sm:block">
                {!isPlaceholderIcon && universityLogoUrl && (
                    <img
                        src={BASE_URL + universityLogoUrl}
                        className="h-12 sm:h-16 2xl:h-20"
                        alt={universityHeader.universityLogo.data.attributes.alternativeText || "University Logo"}
                    />
                )}
            </div>
        </div>
    );
}



function ProgramAndSubject({ universityHeader, starIconURL }) {
    const sortedPrograms = universityHeader.attributes.program_pages.data.sort((a, b) => {
        const ratingA = a.attributes.programRating;
        const ratingB = b.attributes.programRating;

        if (ratingA === null) return 1;
        if (ratingB === null) return -1;

        return ratingB - ratingA;
    });

    const sortedSubjects = universityHeader.attributes.subject_pages.data.sort((a, b) => {
        const ratingA = a.attributes.subjectRating;
        const ratingB = b.attributes.subjectRating;

        if (ratingA === null) return 1;
        if (ratingB === null) return -1;

        return ratingB - ratingA;
    });

    return (
        <div className="h-full w-full mt-5">
            {universityHeader.attributes.program_pages.data.length > 0 && (
                <>
                    <h3 className="text-sc-red dark:text-gray-200 ml-6 sm:ml-5 2xl:ml-24 text-2xl sm:text-3xl font-bold sm:mb-3">Programs</h3>
                    <div className="sm:flex sm:justify-between w-[98%] m-auto">
                        {sortedPrograms.slice(0, 3).map((university) => (
                            <Link style={{ width: "32.5%" }}
                                to={`/universities/${universityHeader.id}/program/${university.id}`}>
                                <ShadowBox
                                    name={university.attributes.programName}
                                    rating={university.attributes.programRating !== null
                                        ? university.attributes.programRating
                                        : "-"}
                                    starIconURL={starIconURL} // Pass the dynamic star icon URL
                                />
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {universityHeader.attributes.subject_pages.data.length > 0 && (
                <>
                    <h3 className="text-sc-red dark:text-gray-200 ml-6 sm:ml-5 2xl:ml-24 text-2xl sm:text-3xl mt-4 font-bold sm:mb-3">Subjects</h3>
                    <div className="sm:flex sm:justify-between w-[98%] m-auto">
                        {sortedSubjects.slice(0, 3).map((university) => (
                            <Link style={{ width: "32.5%" }}
                                to={`/universities/${universityHeader.id}/subject/${university.id}`}>
                                <ShadowBox
                                    name={university.attributes.subjectName}
                                    rating={university.attributes.subjectRating !== null
                                        ? university.attributes.subjectRating
                                        : "-"}
                                    starIconURL={starIconURL} // Pass the dynamic star icon URL
                                />
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ShadowBox(args) {
    const { name, rating, starIconURL } = args;
    return (
        <div className="relative flex justify-center items-center h-16 w-full bg-white dark:bg-gray-600 drop-shadow-md rounded-md m-auto mb-4 sm:mb-0 sm:hover:drop-shadow-xl transition duration-300">
            <p className="text-gray-600 dark:text-gray-200 text-lg sm:text-xl px-10 sm:px-2 text-center font-bold">{name}</p>

            <div className="absolute flex items-center h-1/2 bottom-0 right-0">
                <p className="text-base text-gray-600 dark:text-gray-300 mr-1 font-bold">{rating}</p>
                {starIconURL ? (
                    <img src={starIconURL} className="h-3/5 mr-1" alt="Yellow star icon" />
                ) : (
                    <div className="h-3/5 mr-1" /> // Placeholder or loader if icon URL is not available
                )}
            </div>
        </div>
    )
}

function UniBanner({ universityData }) {
    // Extract the background image URL
    const backgroundImageUrl = universityData?.formats?.large?.url;

    // Check if the background image name is "placeholder.png"
    const isPlaceholderImage = backgroundImageUrl?.includes("placeholder");
    
    return (
        <div
            style={{
                width: "98%",
                height: isPlaceholderImage ? '17vh' : '60%', // Adjust height if it's a placeholder image
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
            }}
            className="bg-gray-100 dark:bg-gray-800 mx-auto mb-4" // Fallback background color
        >
            {/* Conditionally render the background image */}
            {!isPlaceholderImage && (
                <img
                    src={BASE_URL + backgroundImageUrl}
                    className="w-screen block object-cover h-[30vh] sm:h-[50vh]"
                    alt={universityData.alternativeText || "University Banner"}
                />
            )}
        </div>
    );
}

export default UniReview;