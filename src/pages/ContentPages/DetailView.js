import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import InteractionArea from '../../components/Posts/InteractionArea';
import { BASE_URL } from "../../API";


import BookmarkSelectedIcon from '../../images/icons/bookmark-selected.png'
import BookmarkIcon from '../../images/icons/bookmark-grey-400.png'
import ChevronLight from '../../images/icons/ChevronLeft.png';
import ChevronDark from '../../images/icons/ChevronLeftDark.png';
import LinkIcon from '../../images/icons/link.png';


import { useGetUserDetailsQuery, useUpdateUserProfileMutation } from '../../app/service/usersAPI';
import { setCredentials } from '../../app/features/authentication/AuthenticationReducer';

function DetailView(args) {
    const { idUniversity, idDetail } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [detail, setDetail] = useState({});
    const [university, setUniversity] = useState({});
    const [type, setType] = useState('');


    const { user } = useSelector((state) => state.auth);
    const { data: userDetails, refetch: refetchUserDetails } = useGetUserDetailsQuery();
    const [updateUserProfile] = useUpdateUserProfileMutation();

    const isLoggedIn = !!user;


    const isBookmarked = isLoggedIn && userDetails && (
        (type === 'program' && userDetails.userProgramLikes?.some(item => item.id === parseInt(idDetail))) ||
        (type === 'subject' && userDetails.userSubjectLikes?.some(item => item.id === parseInt(idDetail)))
    );


    useEffect(() => {
        setType(location.pathname.includes('/program/') ? 'program' : 'subject');
    }, [location.pathname]);


    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                if (type === 'subject') {
                    const response = await fetch(
                        `${BASE_URL}/api/${type}-pages/${idDetail}?fields[0]=${type}Name&fields[1]=${type}Description&fields[2]=${type}GraduationLevel&fields[3]=webpage&fields[4]=subjectCode`
                    );
                    const responseData = await response.json();

                    setDetail(responseData.data);
                }
                else if (type === 'program'){
                    const response = await fetch(
                        `${BASE_URL}/api/${type}-pages/${idDetail}?fields[0]=${type}Name&fields[1]=${type}Description&fields[2]=${type}GraduationLevel&fields[3]=webpage&fields[4]=programAcronym`
                    );
                    const responseData = await response.json();

                    setDetail(responseData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [idDetail, type]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${BASE_URL}/api/university-pages/${idUniversity}?fields[0]=universityName`
                );
                const responseData = await response.json();

                setUniversity(responseData.data.attributes);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [idUniversity]);

    const handleBack = () => {
        navigate(`/universities/${idUniversity}`);
    };


    const handleAddBookmark = async () => {
        if (!isLoggedIn) return;

        try {
            const updatedUser = { ...userDetails };
            if (type === 'program') {
                updatedUser.userProgramLikes = [...(userDetails.userProgramLikes || []), { id: parseInt(idDetail) }];
            } else if (type === 'subject') {
                updatedUser.userSubjectLikes = [...(userDetails.userSubjectLikes || []), { id: parseInt(idDetail) }];
            }

            await updateUserProfile(updatedUser).unwrap();
            dispatch(setCredentials(updatedUser));
            refetchUserDetails();
        } catch (error) {
            console.error('Error adding bookmark:', error);
        }
    };


    const handleRemoveBookmark = async () => {
        if (!isLoggedIn) return;

        try {
            const updatedUser = { ...userDetails };
            if (type === 'program') {
                updatedUser.userProgramLikes = (userDetails.userProgramLikes || []).filter(item => item.id !== parseInt(idDetail));
            } else if (type === 'subject') {
                updatedUser.userSubjectLikes = (userDetails.userSubjectLikes || []).filter(item => item.id !== parseInt(idDetail));
            }

            await updateUserProfile(updatedUser).unwrap();
            dispatch(setCredentials(updatedUser));
            refetchUserDetails();
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow" style={{ margin: '0', width: '100vw', position: 'relative' }}>
                <div style={{ marginLeft: '2%', marginRight: '1%' }}>
                    {university && (
                        <div className="flex items-center sm:mt-2" onClick={handleBack}>
                            <img className="h-6 sm:h-10 cursor-pointer mr-1 block dark:hidden" src={ChevronLight} alt="Back arrow" />
                            <img className="h-6 sm:h-10 cursor-pointer mr-1 hidden dark:block" src={ChevronDark} alt="Back arrow" />
                            {/* University Name */}
                            <h1 className="w-full text-left text-2xl sm:text-3xl font-bold ml-2 text-sc-red dark:text-gray-300">{university.universityName}</h1>
                        </div>
                    )}

                    {detail.attributes && (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4">
                                <div className="flex items-start sm:items-center">
                                    {/* Subject/Program Name */}
                                    <h3 className="text-gray-400 text-xl sm:text-3xl font-bold">{detail.attributes[`${type}Name`]}</h3>
                                    {/* Bookmark Icon */}
                                    {isLoggedIn && (
                                        <button
                                            className="sm:ml-3 ml-1 sm:mt-2 mt-1 flex-shrink-0"
                                            onClick={isBookmarked ? handleRemoveBookmark : handleAddBookmark}
                                            aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                                        >
                                            <img
                                                src={isBookmarked ? BookmarkSelectedIcon : BookmarkIcon}
                                                alt={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                                                className="sm:w-9 w-7 sm:h-9 h-7"
                                            />
                                        </button>
                                    )}
                                </div>
                                {/* Subject Code/ Program Acronym */}
                                {detail.attributes && (
                                    <span className="text-gray-500 text-lg sm:text-3xl font-bold mr-10">
                                    {type === 'subject' ? detail.attributes.subjectCode : detail.attributes.programAcronym}
                                </span>
                                )}
                            </div>

                            {/* Graduation Level */}
                            <h4 className="text-gray-500 text-base sm:text-2xl mt-2">{detail.attributes[`${type}GraduationLevel`]}</h4>

                            {/* Webpage Link */}
                            {detail.attributes.webpage ? (
                                <div className="mt-3 flex items-center">
                                    <img className="w-6 h-6 mr-2" src={LinkIcon} alt="Link icon"/>
                                    <a href={detail.attributes.webpage} target="_blank" rel="noopener noreferrer" className="text-gray-500 underline text-base sm:text-xl">
                                        Visit the official university webpage for this {type}
                                    </a>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-base sm:text-2xl mt-1">
                                    Official website not available
                                </p>
                            )}
                        </>
                    )}
                </div>
                {detail.attributes && (
                    <InteractionArea interactionName={`${type}-pages/${detail.id}`} />
                )}
            </div>
        </div>
    );
}

export default DetailView;
